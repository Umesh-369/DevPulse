import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { PlatformStats } from '../models/PlatformStats.js';
import { fetchGitHubStats } from '../services/githubService.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';
const getServerUrl = () => process.env.SERVER_URL || 'http://localhost:5000';
const getJwtSecret = () => process.env.JWT_SECRET || 'devpulse_super_secret_jwt_key_2026';

const getGoogleCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.Cliend_Id;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.Client_secret;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${getServerUrl()}/api/auth/google/callback`;
  return { clientId, clientSecret, callbackUrl };
};

const getGithubCredentials = () => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL || `${getServerUrl()}/api/auth/github/callback`;
  return { clientId, clientSecret, callbackUrl };
};

// Check OAuth configuration status
router.get('/status', (req, res) => {
  const google = getGoogleCredentials();
  const github = getGithubCredentials();

  return res.json({
    success: true,
    google: {
      configured: Boolean(google.clientId && google.clientSecret)
    },
    github: {
      configured: Boolean(github.clientId && github.clientSecret)
    }
  });
});

// Traditional Email/Password Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user;

    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name: name || 'DevPulse Developer',
        email: normalizedEmail,
        password: hashedPassword,
        isNewUser: true
      });
    } else {
      // In-Memory store
      user = {
        ...req.app.locals.currentUser,
        id: `usr_${Date.now()}`,
        name: name || req.app.locals.currentUser.name,
        email: normalizedEmail,
        isNewUser: true
      };
      req.app.locals.currentUser = user;
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Traditional Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      }
    } else {
      user = {
        ...req.app.locals.currentUser,
        email: normalizedEmail
      };
      req.app.locals.currentUser = user;
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get Current User Profile (Token Authenticated)
router.get('/me', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      return res.json({
        success: true,
        user: req.user
      });
    }

    return res.json({
      success: true,
      user: req.app.locals.currentUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 1. GOOGLE OAUTH 2.0 FLOW
// ==========================================

// Initiate Google OAuth Redirect
router.get('/google', (req, res) => {
  const { clientId, clientSecret, callbackUrl } = getGoogleCredentials();
  const clientUrl = getClientUrl();

  if (!clientId || !clientSecret) {
    return res.redirect(`${clientUrl}/login?error=Google%20OAuth%20keys%20are%20missing%20in%20server/.env.%20Please%20set%20GOOGLE_CLIENT_ID%20and%20GOOGLE_CLIENT_SECRET.`);
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid profile email');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  return res.redirect(googleAuthUrl.toString());
});

// Google OAuth Callback
router.get('/google/callback', async (req, res) => {
  const clientUrl = getClientUrl();
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(`Google authentication error: ${error}`)}`);
  }

  if (!code) {
    return res.redirect(`${clientUrl}/login?error=No%20authorization%20code%20provided%20by%20Google`);
  }

  try {
    const { clientId, clientSecret, callbackUrl } = getGoogleCredentials();

    // 1. Exchange authorization code for access token
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: String(code),
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );

    const accessToken = tokenRes.data.access_token;

    // 2. Fetch Google profile
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000
    });

    const googleUser = profileRes.data; // { id, email, name, picture, given_name, family_name }
    const normalizedEmail = (googleUser.email || '').toLowerCase().trim();

    let user;
    let isNewUser = false;

    if (mongoose.connection.readyState === 1) {
      // Find user by Google ID or by email
      user = await User.findOne({
        $or: [{ 'google.id': googleUser.id }, { email: normalizedEmail }]
      });

      if (user) {
        user.google = {
          id: googleUser.id,
          email: normalizedEmail,
          accessToken
        };
        if (!user.avatar && googleUser.picture) user.avatar = googleUser.picture;
        if (!user.name && googleUser.name) user.name = googleUser.name;
        await user.save();
      } else {
        isNewUser = true;
        user = await User.create({
          name: googleUser.name || 'Google Developer',
          email: normalizedEmail,
          avatar: googleUser.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
          isNewUser: true,
          google: {
            id: googleUser.id,
            email: normalizedEmail,
            accessToken
          }
        });
      }
    } else {
      // Fallback in-memory
      isNewUser = !req.app.locals.currentUser || req.app.locals.currentUser.email !== normalizedEmail;
      user = {
        ...req.app.locals.currentUser,
        id: req.app.locals.currentUser?.id || `usr_google_${Date.now()}`,
        name: googleUser.name || req.app.locals.currentUser.name,
        email: normalizedEmail,
        avatar: googleUser.picture || req.app.locals.currentUser.avatar,
        google: {
          id: googleUser.id,
          email: normalizedEmail,
          accessToken
        },
        isNewUser
      };
      req.app.locals.currentUser = user;
    }

    // 3. Generate signed JWT token
    const jwtToken = jwt.sign(
      { id: user._id || user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    // 4. Redirect to frontend /oauth-success
    return res.redirect(`${clientUrl}/oauth-success?token=${jwtToken}&isNewUser=${isNewUser}`);
  } catch (err) {
    console.error('Google OAuth Callback Error:', err.response?.data || err.message);
    const msg = err.response?.data?.error_description || err.message || 'Google OAuth exchange failed';
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(msg)}`);
  }
});

// ==========================================
// 2. GITHUB OAUTH 2.0 FLOW
// ==========================================

// Initiate GitHub OAuth Redirect
router.get('/github', (req, res) => {
  const { clientId, clientSecret, callbackUrl } = getGithubCredentials();
  const clientUrl = getClientUrl();

  if (!clientId || !clientSecret) {
    return res.redirect(`${clientUrl}/login?error=GitHub%20OAuth%20keys%20are%20missing%20in%20server/.env.%20Please%20set%20GITHUB_CLIENT_ID%20and%20GITHUB_CLIENT_SECRET.`);
  }

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email repo');

  return res.redirect(githubAuthUrl.toString());
});

// GitHub OAuth Callback
router.get('/github/callback', async (req, res) => {
  const clientUrl = getClientUrl();
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(`GitHub authentication error: ${error}`)}`);
  }

  if (!code) {
    return res.redirect(`${clientUrl}/login?error=No%20authorization%20code%20provided%20by%20GitHub`);
  }

  try {
    const { clientId, clientSecret, callbackUrl } = getGithubCredentials();

    // 1. Exchange authorization code for GitHub access token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code: String(code),
        redirect_uri: callbackUrl
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      const errorMsg = tokenRes.data.error_description || tokenRes.data.error || 'Failed to obtain access token from GitHub';
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(errorMsg)}`);
    }

    // 2. Fetch authenticated GitHub user
    const ghUserRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'DevPulse-Developer-Platform'
      },
      timeout: 10000
    });

    const ghUser = ghUserRes.data;
    let userEmail = ghUser.email;

    // If email is not public on GitHub, fetch emails list
    if (!userEmail) {
      try {
        const emailsRes = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'DevPulse-Developer-Platform'
          },
          timeout: 10000
        });
        const primaryEmail = emailsRes.data.find(e => e.primary && e.verified) || emailsRes.data[0];
        if (primaryEmail) userEmail = primaryEmail.email;
      } catch (err) {
        console.warn('Could not fetch GitHub user private emails:', err.message);
      }
    }

    const normalizedEmail = (userEmail || `${ghUser.login}@github.devpulse.com`).toLowerCase().trim();

    // 3. Immediately trigger initial fetch of real GitHub repositories, stars, commits & languages
    let ghStats = null;
    try {
      ghStats = await fetchGitHubStats(ghUser.login, accessToken);
    } catch (err) {
      console.warn('Failed initial fetch of GitHub repositories/stats:', err.message);
    }

    let user;
    let isNewUser = false;

    if (mongoose.connection.readyState === 1) {
      // Find or create user
      user = await User.findOne({
        $or: [{ 'github.id': String(ghUser.id) }, { email: normalizedEmail }]
      });

      if (user) {
        user.github = {
          id: String(ghUser.id),
          username: ghUser.login,
          accessToken,
          profileUrl: ghUser.html_url
        };
        user.connectedPlatforms.github = {
          connected: true,
          handle: ghUser.login,
          verified: true,
          contributions: ghStats?.contributions || user.connectedPlatforms.github?.contributions || 0,
          repos: ghStats?.publicRepos || user.connectedPlatforms.github?.repos || ghUser.public_repos || 0,
          lastSynced: new Date()
        };
        if (ghStats) {
          user.stats.totalRepositories = ghStats.publicRepos;
          user.stats.totalContributions = ghStats.contributions;
          user.stats.followers = ghStats.followers;
          user.stats.following = ghStats.following;
        }
        if (!user.avatar && ghUser.avatar_url) user.avatar = ghUser.avatar_url;
        await user.save();
      } else {
        isNewUser = true;
        user = await User.create({
          name: ghUser.name || ghUser.login,
          email: normalizedEmail,
          avatar: ghUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
          bio: ghUser.bio || 'Developer on DevPulse',
          isNewUser: true,
          github: {
            id: String(ghUser.id),
            username: ghUser.login,
            accessToken,
            profileUrl: ghUser.html_url
          },
          connectedPlatforms: {
            github: {
              connected: true,
              handle: ghUser.login,
              verified: true,
              contributions: ghStats?.contributions || 0,
              repos: ghStats?.publicRepos || ghUser.public_repos || 0,
              lastSynced: new Date()
            }
          },
          stats: {
            totalRepositories: ghStats?.publicRepos || ghUser.public_repos || 0,
            totalContributions: ghStats?.contributions || 0,
            followers: ghStats?.followers || ghUser.followers || 0,
            following: ghStats?.following || ghUser.following || 0
          }
        });
      }

      // Save to PlatformStats
      if (ghStats) {
        await PlatformStats.findOneAndUpdate(
          { userId: user._id, platform: 'github' },
          {
            userId: user._id,
            platform: 'github',
            handle: ghUser.login,
            stats: ghStats,
            lastSynced: new Date()
          },
          { upsert: true, new: true }
        );
      }
    } else {
      // Fallback in-memory
      isNewUser = !req.app.locals.currentUser || req.app.locals.currentUser.email !== normalizedEmail;
      user = {
        ...req.app.locals.currentUser,
        id: req.app.locals.currentUser?.id || `usr_gh_${Date.now()}`,
        name: ghUser.name || ghUser.login,
        email: normalizedEmail,
        avatar: ghUser.avatar_url || req.app.locals.currentUser?.avatar,
        github: {
          id: String(ghUser.id),
          username: ghUser.login,
          accessToken,
          profileUrl: ghUser.html_url
        },
        connectedPlatforms: {
          ...req.app.locals.currentUser?.connectedPlatforms,
          github: {
            connected: true,
            handle: ghUser.login,
            verified: true,
            contributions: ghStats?.contributions || 0,
            repos: ghStats?.publicRepos || ghUser.public_repos || 0,
            lastSynced: new Date()
          }
        },
        stats: {
          ...req.app.locals.currentUser?.stats,
          totalRepositories: ghStats?.publicRepos || 0,
          totalContributions: ghStats?.contributions || 0,
          followers: ghStats?.followers || 0,
          following: ghStats?.following || 0
        },
        isNewUser
      };
      req.app.locals.currentUser = user;

      // Update repositories list with real repos if fetched
      if (ghStats?.repositories?.length) {
        req.app.locals.repositories = ghStats.repositories;
      }
    }

    // 4. Generate signed JWT token
    const jwtToken = jwt.sign(
      { id: user._id || user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    // 5. Redirect to frontend /oauth-success
    return res.redirect(`${clientUrl}/oauth-success?token=${jwtToken}&isNewUser=${isNewUser}`);
  } catch (err) {
    console.error('GitHub OAuth Callback Error:', err.response?.data || err.message);
    const msg = err.response?.data?.error_description || err.message || 'GitHub OAuth exchange failed';
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(msg)}`);
  }
});

export default router;
