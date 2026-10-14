import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, getDBStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import repositoryRoutes from './routes/repositoryRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import { optionalAuth, requireAuth } from './middleware/auth.js';
import { User } from './models/User.js';
import { PlatformStats } from './models/PlatformStats.js';
import { purgeMockData } from './scripts/cleanupDatabase.js';
import { fetchGitHubStats, fetchGitHubContributions, mergeLeetCodeContributions } from './services/githubService.js';
import { fetchLeetCodeStats } from './services/leetcodeService.js';
import {
  initialUser,
  initialProjects,
  leaderboardData,
  aiCoachData,
  languageDistribution,
  problemSolvingTrend,
  platformBarChart,
  achievementsList,
  sampleProblems,
  sampleRepositories,
  sampleGoals
} from './seed/seedData.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
  ...clientUrls
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, Postman, server-to-server, Render health checks)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      allowedOrigins.some(ao => ao && ao.toLowerCase() === cleanOrigin.toLowerCase())
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Initialize app locals with clean zero-default values
app.locals.currentUser = { ...initialUser };
app.locals.projects = [...initialProjects];
app.locals.leaderboards = [...leaderboardData];
app.locals.aiCoach = JSON.parse(JSON.stringify(aiCoachData));
app.locals.problems = [...sampleProblems];
app.locals.repositories = [...sampleRepositories];
app.locals.goals = [...sampleGoals];
app.locals.languageDistribution = [...languageDistribution];
app.locals.platformBarChart = [...platformBarChart];

// Developer Rating Calculation Helper
export function calculateRating(stats = {}) {
  const solved = stats.problemsSolved ?? stats.solved ?? (
    (stats.easySolved || 0) + (stats.mediumSolved || 0) + (stats.hardSolved || 0)
  ) ?? 0;

  const repos = stats.totalRepositories ?? stats.publicRepos ?? 0;
  if (!solved && !repos) {
    return 0;
  }

  if (stats.leetcodeRating && stats.leetcodeRating > 0) return stats.leetcodeRating;
  if (stats.reputation && stats.reputation > 0) return stats.reputation;
  if (stats.contestRating && stats.contestRating > 0) return stats.contestRating;

  const easy = stats.easySolved || Math.round(solved * 0.55);
  const med = stats.mediumSolved || Math.round(solved * 0.4);
  const hard = stats.hardSolved || Math.max(0, solved - easy - med);
  const streak = stats.currentStreak || 0;

  return Math.round(easy * 8 + med * 18 + hard * 35 + Math.min(streak * 5, 200) + Math.min(repos * 8, 250));
}

function getBadgeTitle(rating, problems) {
  if (rating >= 2400 || problems >= 1000) return 'Grandmaster';
  if (rating >= 2000 || problems >= 500) return 'Master';
  if (rating >= 1800 || problems >= 250) return 'Expert';
  if (rating >= 1400 || problems >= 100) return 'Specialist';
  if (problems >= 10) return 'Pupil';
  return 'Newbie';
}

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/ai-insights', aiRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/problems', problemRoutes);

// --- USER & PROFILE ROUTES ---
app.get('/api/user/profile', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const dbUser = await User.findById(userId);
      if (dbUser) return res.json({ success: true, user: dbUser });
    }
    return res.json({
      success: true,
      user: req.app.locals.currentUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/user/profile', optionalAuth, async (req, res) => {
  try {
    const { name, role, college, bio, targetRole, theme } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const dbUser = await User.findById(userId);
      if (dbUser) {
        if (name !== undefined) dbUser.name = name;
        if (role !== undefined) dbUser.role = role;
        if (college !== undefined) dbUser.college = college;
        if (bio !== undefined) dbUser.bio = bio;
        if (targetRole !== undefined) dbUser.targetRole = targetRole;
        if (theme !== undefined) dbUser.theme = theme;
        await dbUser.save();
        return res.json({ success: true, message: 'Profile updated', user: dbUser });
      }
    }

    const current = req.app.locals.currentUser;
    req.app.locals.currentUser = {
      ...current,
      name: name ?? current.name,
      role: role ?? current.role,
      college: college ?? current.college,
      bio: bio ?? current.bio,
      targetRole: targetRole ?? current.targetRole,
      theme: theme ?? current.theme
    };

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: req.app.locals.currentUser
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/user/connect-platform', optionalAuth, async (req, res) => {
  const { platform, handle } = req.body;
  if (!platform || !handle) {
    return res.status(400).json({ success: false, message: 'Platform and handle required' });
  }

  const pKey = platform.toLowerCase();
  const userId = req.user?._id || req.user?.id;

  if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
    const dbUser = await User.findById(userId);
    if (dbUser) {
      dbUser.connectedPlatforms[pKey] = {
        ...(dbUser.connectedPlatforms?.[pKey] || {}),
        connected: true,
        handle,
        verified: true,
        lastSynced: new Date()
      };

      if (pKey === 'github') {
        try {
          const ghStats = await fetchGitHubStats(handle, dbUser.github?.accessToken);
          if (ghStats?.contributionCalendar) {
            dbUser.contributionCalendar = ghStats.contributionCalendar;
            dbUser.stats.totalContributions = ghStats.contributions;
            dbUser.stats.totalRepositories = ghStats.publicRepos;
          }
        } catch (e) {
          console.warn('Connect platform dbUser github stats warning:', e.message);
        }
      }

      await dbUser.save();
      return res.json({
        success: true,
        message: `Connected ${platform} successfully for @${handle}`,
        connectedPlatforms: dbUser.connectedPlatforms,
        stats: dbUser.stats,
        user: dbUser
      });
    }
  }

  const current = req.app.locals.currentUser;
  const currentPlatform = current.connectedPlatforms?.[pKey] || {};

  current.connectedPlatforms[pKey] = {
    ...currentPlatform,
    connected: true,
    handle,
    verified: true,
    lastSynced: new Date().toISOString()
  };

  if (pKey === 'github') {
    try {
      const ghStats = await fetchGitHubStats(handle);
      if (ghStats?.contributionCalendar) {
        current.contributionCalendar = ghStats.contributionCalendar;
        current.stats.totalContributions = ghStats.contributions;
        current.stats.totalRepositories = ghStats.publicRepos;
      }
    } catch (e) {
      console.warn('Connect platform current user github stats warning:', e.message);
    }
  }

  req.app.locals.currentUser = current;

  return res.json({
    success: true,
    message: `Connected ${platform} successfully for @${handle}`,
    connectedPlatforms: current.connectedPlatforms,
    stats: current.stats,
    user: current
  });
});

// --- PROJECTS ROUTES (100% Dynamic: Custom + Connected GitHub Repos) ---
app.get('/api/projects', optionalAuth, async (req, res) => {
  try {
    let userId = req.user?._id || req.user?.id;
    let customProjects = [];
    let githubRepos = [];

    if (mongoose.connection.readyState === 1) {
      let dbUser = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        dbUser = await User.findById(userId);
      }
      if (!dbUser) {
        dbUser = await User.findOne();
      }
      if (dbUser) {
        userId = dbUser._id;
        customProjects = (dbUser.projects || []).map(p => ({
          id: p._id ? String(p._id) : `proj_${Date.now()}`,
          _id: p._id,
          title: p.title,
          description: p.description,
          tags: p.tags || [],
          stars: p.stars || 0,
          forks: p.forks || 0,
          demoUrl: p.demoUrl || '',
          githubUrl: p.githubUrl || '',
          featured: p.featured !== false,
          isCustom: true,
          updatedAt: p.updatedAt
        }));

        // Fetch user's real GitHub repositories from PlatformStats
        const ghStats = await PlatformStats.findOne({ userId, platform: 'github' });
        if (ghStats?.stats?.repositories?.length) {
          githubRepos = ghStats.stats.repositories.map(r => ({
            id: r.id || `gh_${r.name}`,
            title: r.name,
            name: r.name,
            description: r.description || 'Public GitHub repository',
            tags: r.language && r.language !== 'Code' ? [r.language] : ['GitHub'],
            stars: r.stars || 0,
            forks: r.forks || 0,
            demoUrl: '',
            githubUrl: r.url || `https://github.com/${ghStats.handle}/${r.name}`,
            isGitHub: true,
            featured: true,
            language: r.language,
            updated: r.updated
          }));
        }
      }
    } else {
      // In-memory fallback
      customProjects = req.app.locals.projects || [];
      if (req.app.locals.repositories?.length) {
        githubRepos = req.app.locals.repositories.map(r => ({
          id: r.id,
          title: r.name,
          name: r.name,
          description: r.description,
          tags: [r.language || 'Code'],
          stars: r.stars || 0,
          forks: r.forks || 0,
          demoUrl: '',
          githubUrl: r.url || '',
          isGitHub: true,
          featured: true,
          language: r.language,
          updated: r.updated
        }));
      }
    }

    // Merge: Custom projects first, followed by GitHub repositories
    const combinedProjects = [...customProjects, ...githubRepos];

    return res.json({
      success: true,
      projects: combinedProjects,
      customProjects,
      githubRepos
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, projects: [] });
  }
});

// Add a new custom project
app.post('/api/projects', optionalAuth, async (req, res) => {
  try {
    const { title, description, tags, demoUrl, githubUrl } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    const projectPayload = {
      title: title.trim(),
      description: description ? description.trim() : '',
      tags: parsedTags,
      stars: 0,
      forks: 0,
      demoUrl: demoUrl ? demoUrl.trim() : '',
      githubUrl: githubUrl ? githubUrl.trim() : '',
      featured: true
    };

    let userId = req.user?._id || req.user?.id;
    let savedProject = null;

    if (mongoose.connection.readyState === 1) {
      let dbUser = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        dbUser = await User.findById(userId);
      }
      if (!dbUser) {
        dbUser = await User.findOne();
      }
      if (dbUser) {
        dbUser.projects.unshift(projectPayload);
        dbUser.stats.totalRepositories = (dbUser.stats.totalRepositories || 0) + 1;
        await dbUser.save();
        savedProject = dbUser.projects[0];
      }
    }

    if (!savedProject) {
      // In-memory fallback
      savedProject = {
        id: `proj_${Date.now()}`,
        ...projectPayload,
        isCustom: true
      };
      req.app.locals.projects.unshift(savedProject);
    }

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: {
        id: savedProject._id ? String(savedProject._id) : savedProject.id,
        _id: savedProject._id,
        ...projectPayload,
        isCustom: true
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Edit an existing custom project
app.put('/api/projects/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, demoUrl, githubUrl } = req.body;
    let userId = req.user?._id || req.user?.id;

    const parsedTags = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined);

    if (mongoose.connection.readyState === 1) {
      let dbUser = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        dbUser = await User.findById(userId);
      }
      if (!dbUser) {
        dbUser = await User.findOne();
      }
      if (dbUser) {
        const project = dbUser.projects.id(id);
        if (project) {
          if (title !== undefined) project.title = title.trim();
          if (description !== undefined) project.description = description.trim();
          if (parsedTags !== undefined) project.tags = parsedTags;
          if (demoUrl !== undefined) project.demoUrl = demoUrl.trim();
          if (githubUrl !== undefined) project.githubUrl = githubUrl.trim();
          await dbUser.save();
          return res.json({
            success: true,
            message: 'Project updated successfully',
            project: {
              id: String(project._id),
              _id: project._id,
              title: project.title,
              description: project.description,
              tags: project.tags,
              stars: project.stars,
              forks: project.forks,
              demoUrl: project.demoUrl,
              githubUrl: project.githubUrl,
              isCustom: true
            }
          });
        }
      }
    }

    // In-memory fallback
    const idx = req.app.locals.projects.findIndex(p => p.id === id || String(p._id) === id);
    if (idx !== -1) {
      req.app.locals.projects[idx] = {
        ...req.app.locals.projects[idx],
        title: title || req.app.locals.projects[idx].title,
        description: description ?? req.app.locals.projects[idx].description,
        tags: parsedTags || req.app.locals.projects[idx].tags,
        demoUrl: demoUrl ?? req.app.locals.projects[idx].demoUrl,
        githubUrl: githubUrl ?? req.app.locals.projects[idx].githubUrl
      };
      return res.json({ success: true, project: req.app.locals.projects[idx] });
    }

    return res.status(404).json({ success: false, message: 'Project not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a custom project
app.delete('/api/projects/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1) {
      let dbUser = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        dbUser = await User.findById(userId);
      }
      if (!dbUser) {
        dbUser = await User.findOne();
      }
      if (dbUser) {
        dbUser.projects.pull({ _id: id });
        if (dbUser.stats.totalRepositories > 0) {
          dbUser.stats.totalRepositories -= 1;
        }
        await dbUser.save();
        return res.json({ success: true, message: 'Project deleted successfully' });
      }
    }

    // In-memory fallback
    req.app.locals.projects = req.app.locals.projects.filter(p => p.id !== id && String(p._id) !== id);
    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- ANALYTICS ROUTES ---
app.get('/api/analytics', optionalAuth, async (req, res) => {
  const { timeframe = '6m' } = req.query;
  const userId = req.user?._id || req.user?.id;
  let stats = req.app.locals.currentUser.stats;
  let userLangDist = req.app.locals.languageDistribution;
  let calendar = req.app.locals.currentUser?.contributionCalendar || null;

  let dbUser = null;
  if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
    dbUser = await User.findById(userId);
    if (dbUser?.stats) stats = dbUser.stats;

    const ghStats = await PlatformStats.findOne({ userId, platform: 'github' });
    if (ghStats?.stats?.languageDistribution?.length) {
      userLangDist = ghStats.stats.languageDistribution;
    }

    calendar = dbUser?.contributionCalendar || ghStats?.stats?.contributionCalendar || null;
    let heatmap = calendar?.heatmap || dbUser?.heatmap || [];
    let totalContrib = calendar?.totalContributions ?? dbUser?.totalContributions ?? stats?.totalContributions ?? 0;

    // If no calendar/heatmap stored yet but user has connected GitHub, auto-fetch real 365-day calendar now
    if ((!heatmap.length || totalContrib === 0) && (dbUser?.connectedPlatforms?.github?.handle || dbUser?.github?.username)) {
      try {
        const ghHandle = dbUser.connectedPlatforms?.github?.handle || dbUser.github?.username;
        const freshGhStats = await fetchGitHubStats(ghHandle, dbUser.github?.accessToken);
        if (freshGhStats?.contributionCalendar) {
          calendar = freshGhStats.contributionCalendar;
          const lcStats = await PlatformStats.findOne({ userId, platform: 'leetcode' });
          if (lcStats?.stats?.submissionCalendar) {
            calendar = mergeLeetCodeContributions(calendar, lcStats.stats.submissionCalendar);
          }
          heatmap = calendar.heatmap || freshGhStats.heatmap || [];
          totalContrib = calendar.totalContributions || freshGhStats.totalContributions || 0;
          dbUser.contributionCalendar = calendar;
          dbUser.heatmap = heatmap;
          dbUser.totalContributions = totalContrib;
          dbUser.stats.totalContributions = totalContrib;
          dbUser.stats.heatmap = heatmap;
          await dbUser.save();
        }
      } catch (calErr) {
        console.warn('Auto-fetch contributions notice in /api/analytics:', calErr.message);
      }
    }
  }

  const finalHeatmap = calendar?.heatmap || dbUser?.heatmap || req.app.locals.currentUser?.heatmap || [];
  const finalTotal = calendar?.totalContributions ?? dbUser?.totalContributions ?? stats?.totalContributions ?? 0;

  return res.json({
    success: true,
    timeframe,
    stats: {
      ...stats,
      totalContributions: finalTotal,
      heatmap: finalHeatmap
    },
    totalContributions: finalTotal,
    heatmap: finalHeatmap,
    languageDistribution: userLangDist,
    problemSolvingTrend,
    platformBarChart: req.app.locals.platformBarChart,
    achievements: achievementsList,
    contributionCalendar: calendar
  });
});

// --- STATS SYNC ROUTE (POST /api/stats/sync) ---
app.post('/api/stats/sync', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let dbUser = null;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      dbUser = await User.findById(userId);
    }
    const current = req.app.locals.currentUser;

    const ghHandle = dbUser?.connectedPlatforms?.github?.handle || dbUser?.github?.username || current?.connectedPlatforms?.github?.handle;
    const lcHandle = dbUser?.connectedPlatforms?.leetcode?.handle || current?.connectedPlatforms?.leetcode?.handle;
    const ghToken = dbUser?.github?.accessToken;

    let ghStats = null;
    let lcData = null;

    if (ghHandle) {
      try {
        ghStats = await fetchGitHubStats(ghHandle, ghToken);
      } catch (e) {
        console.warn('Sync GitHub in /api/stats/sync warning:', e.message);
      }
    }

    if (lcHandle) {
      try {
        lcData = await fetchLeetCodeStats(lcHandle);
      } catch (e) {
        console.warn('Sync LeetCode in /api/stats/sync warning:', e.message);
      }
    }

    // Merge contributions if both available
    if (ghStats?.contributionCalendar && lcData?.submissionCalendar) {
      ghStats.contributionCalendar = mergeLeetCodeContributions(
        ghStats.contributionCalendar,
        lcData.submissionCalendar
      );
      ghStats.contributions = ghStats.contributionCalendar.totalContributions;
      ghStats.totalContributions = ghStats.contributions;
      ghStats.heatmap = ghStats.contributionCalendar.heatmap;
    }

    // Persist updates to DB if available
    if (dbUser) {
      if (ghStats) {
        dbUser.connectedPlatforms.github = {
          connected: true,
          handle: ghStats.username,
          verified: true,
          contributions: ghStats.contributions,
          repos: ghStats.publicRepos,
          lastSynced: new Date()
        };
        dbUser.stats.totalRepositories = ghStats.publicRepos;
        dbUser.stats.totalContributions = ghStats.contributions;
        dbUser.stats.followers = ghStats.followers;
        dbUser.stats.following = ghStats.following;
        dbUser.totalContributions = ghStats.contributions;
        dbUser.heatmap = ghStats.heatmap || [];
        dbUser.stats.heatmap = dbUser.heatmap;
        if (ghStats.contributionCalendar) {
          dbUser.contributionCalendar = ghStats.contributionCalendar;
        }

        await PlatformStats.findOneAndUpdate(
          { userId, platform: 'github' },
          {
            userId,
            platform: 'github',
            handle: ghStats.username,
            totalContributions: ghStats.contributions,
            heatmap: ghStats.heatmap || [],
            stats: ghStats,
            lastSynced: new Date()
          },
          { upsert: true, new: true }
        );
      }

      if (lcData) {
        const dynamicRating = lcData.reputation || calculateRating({
          problemsSolved: lcData.solved,
          easySolved: lcData.easySolved,
          mediumSolved: lcData.mediumSolved,
          hardSolved: lcData.hardSolved,
          currentStreak: lcData.currentStreak,
          totalRepositories: dbUser.stats?.totalRepositories || 0
        });

        dbUser.connectedPlatforms.leetcode = {
          connected: true,
          handle: lcData.username,
          verified: true,
          solved: lcData.solved,
          easySolved: lcData.easySolved,
          mediumSolved: lcData.mediumSolved,
          hardSolved: lcData.hardSolved,
          ranking: lcData.ranking,
          rating: dynamicRating,
          lastSynced: new Date()
        };
        dbUser.stats.problemsSolved = lcData.solved;
        dbUser.stats.leetcodeProblems = lcData.solved;
        dbUser.stats.acceptanceRate = lcData.acceptanceRate;
        dbUser.stats.activeDays = lcData.activeDays;
        dbUser.stats.currentStreak = lcData.currentStreak;
        dbUser.stats.rating = dynamicRating;
      }

      await dbUser.save();
    }

    // Also update in-memory current user
    if (ghStats) {
      current.connectedPlatforms.github = {
        connected: true,
        handle: ghStats.username,
        verified: true,
        contributions: ghStats.contributions,
        repos: ghStats.publicRepos,
        lastSynced: new Date().toISOString()
      };
      current.stats.totalRepositories = ghStats.publicRepos;
      current.stats.totalContributions = ghStats.contributions;
      current.totalContributions = ghStats.contributions;
      current.heatmap = ghStats.heatmap || [];
      current.stats.heatmap = ghStats.heatmap || [];
      if (ghStats.contributionCalendar) {
        current.contributionCalendar = ghStats.contributionCalendar;
      }
    }

    if (lcData) {
      current.connectedPlatforms.leetcode = {
        connected: true,
        handle: lcData.username,
        verified: true,
        solved: lcData.solved,
        easySolved: lcData.easySolved,
        mediumSolved: lcData.mediumSolved,
        hardSolved: lcData.hardSolved,
        ranking: lcData.ranking,
        rating: lcData.ranking || 1650,
        lastSynced: new Date().toISOString()
      };
      current.stats.problemsSolved = lcData.solved;
      current.stats.leetcodeProblems = lcData.solved;
      current.stats.currentStreak = lcData.currentStreak;
    }
    req.app.locals.currentUser = current;

    const finalUser = dbUser || current;
    return res.json({
      success: true,
      message: 'All platform statistics and contribution calendar synchronized successfully',
      user: finalUser,
      stats: finalUser.stats,
      totalContributions: finalUser.totalContributions || finalUser.stats?.totalContributions || 0,
      heatmap: finalUser.heatmap || finalUser.stats?.heatmap || [],
      contributionCalendar: finalUser.contributionCalendar
    });
  } catch (err) {
    console.error('POST /api/stats/sync error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// --- LEADERBOARD ROUTES (Strictly Real Registered Users from MongoDB) ---
app.get('/api/leaderboard', optionalAuth, async (req, res) => {
  try {
    const { scope = 'global', timeframe = 'month' } = req.query;
    const currentUserId = req.user?._id || req.user?.id;
    const currentUserEmail = req.user?.email;

    let users = [];
    if (mongoose.connection.readyState === 1) {
      users = await User.find({}).lean();
    } else {
      users = req.app.locals.currentUser ? [req.app.locals.currentUser] : [];
    }

    // Strict filter to permanently eliminate any mock/demo user records
    const mockNames = ['Aditya Sharma', 'Priya Verma', 'Rohan Mehta', 'Ananya Rao', 'Karan Singh', 'Neha Patel'];
    const mockEmails = ['umesh@example.com', 'aditya@example.com', 'priya@example.com'];
    users = users.filter(u => {
      if (mockNames.includes(u.name)) return false;
      if (mockEmails.includes(u.email)) return false;
      return true;
    });

    let list = users.map(u => {
      const pSolved = u.stats?.problemsSolved ?? u.connectedPlatforms?.leetcode?.solved ?? 0;
      const streak = u.stats?.currentStreak ?? 0;

      let rating = u.stats?.rating ?? 0;
      if (rating === 1845 && pSolved !== 1284) {
        rating = calculateRating(u.stats || {});
      } else if (pSolved === 0 && streak === 0 && (!u.stats?.totalRepositories || u.stats.totalRepositories === 0)) {
        rating = 0;
      }

      const isCurrentUser = Boolean(
        (currentUserId && String(u._id) === String(currentUserId)) ||
        (currentUserEmail && u.email?.toLowerCase() === currentUserEmail.toLowerCase())
      );

      return {
        _id: u._id,
        id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        problems: pSolved,
        streak: streak,
        rating: rating,
        college: u.college || 'Developer',
        isCurrentUser,
        badge: getBadgeTitle(rating, pSolved)
      };
    });

    // Sort strictly by Rating DESC, then Problems DESC, then Streak DESC
    list.sort((a, b) => b.rating - a.rating || b.problems - a.problems || b.streak - a.streak);

    // Assign dynamic 1-based ranks
    list = list.map((dev, idx) => ({
      ...dev,
      rank: idx + 1
    }));

    // Filter by college if scope === 'college'
    if (scope === 'college') {
      const userCollege = req.user?.college;
      if (userCollege && userCollege.trim()) {
        list = list.filter(item => item.college && item.college.toLowerCase().includes(userCollege.toLowerCase()));
      }
    }

    return res.json({
      success: true,
      scope,
      timeframe,
      leaderboard: list
    });
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    return res.status(500).json({ success: false, message: err.message, leaderboard: [] });
  }
});

// --- GOALS ---

app.get('/api/goals', (req, res) => {
  return res.json({ success: true, goals: req.app.locals.goals });
});

app.post('/api/goals', (req, res) => {
  const { title, target, unit, deadline, category } = req.body;
  const newGoal = {
    id: `g_${Date.now()}`,
    title: title || 'New Coding Goal',
    target: Number(target) || 100,
    current: 0,
    unit: unit || 'Tasks',
    deadline: deadline || 'Dec 2026',
    category: category || 'General',
    progress: 0
  };
  req.app.locals.goals.unshift(newGoal);
  return res.status(201).json({ success: true, goal: newGoal });
});

// Health check (Render & uptime monitoring)
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    appName: 'DevPulse API',
    mongoConnected: getDBStatus(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`DevPulse Server running on http://localhost:${PORT}`);
  await connectDB();
  // Run startup purge to ensure database never has mock/seeded demo users
  try {
    await purgeMockData();
  } catch (err) {
    console.warn('Startup database purge warning:', err.message);
  }
});
