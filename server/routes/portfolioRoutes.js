import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Repository } from '../models/Repository.js';
import { PlatformStats } from '../models/PlatformStats.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to filter out any mock/seeded demo projects
const filterRealProjects = (projects = []) => {
  const forbiddenTitles = ['skyguard ai', 'recover ai', 'legalmind'];
  return projects.filter(p => {
    const title = (p.title || p.name || '').toLowerCase();
    return !forbiddenTitles.some(f => title.includes(f));
  });
};

/**
 * GET /api/portfolio/me
 * Return the logged-in user's real profile details, stats, custom projects, and featured repositories
 */
router.get('/me', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let user = null;
    let customProjects = [];
    let featuredRepos = [];
    let allRepos = [];
    let ghStats = null;
    let lcStats = null;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).lean();
      if (user) {
        customProjects = filterRealProjects(user.projects || []).map(p => ({
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
      }

      // Fetch featured GitHub repositories from Repository collection
      featuredRepos = await Repository.find({ userId, isFeatured: true }).sort({ stargazers_count: -1, updated_at: -1 }).lean();
      
      // If no repos are explicitly featured, fetch top 6 by stars/updated
      if (!featuredRepos.length) {
        featuredRepos = await Repository.find({ userId }).sort({ stargazers_count: -1, updated_at: -1 }).limit(6).lean();
      }

      allRepos = await Repository.find({ userId }).sort({ stargazers_count: -1, updated_at: -1 }).lean();
      ghStats = await PlatformStats.findOne({ userId, platform: 'github' });
      lcStats = await PlatformStats.findOne({ userId, platform: 'leetcode' });
    } else {
      user = req.app.locals.currentUser;
      customProjects = filterRealProjects(req.app.locals.projects || []);
      featuredRepos = (req.app.locals.repositories || []).slice(0, 6);
      allRepos = req.app.locals.repositories || [];
    }

    const safeUsername = user?.username || (user?.email ? user.email.split('@')[0] : '') || (user?.name ? user.name.toLowerCase().replace(/\s+/g, '-') : 'developer');
    const totalRepos = user?.stats?.totalRepositories ?? ghStats?.stats?.publicRepos ?? allRepos.length;
    const followers = user?.stats?.followers ?? ghStats?.stats?.followers ?? 0;
    const following = user?.stats?.following ?? ghStats?.stats?.following ?? 0;
    const leetcodeSolved = user?.connectedPlatforms?.leetcode?.solved ?? user?.stats?.leetcodeProblems ?? user?.stats?.problemsSolved ?? lcStats?.stats?.solved ?? 0;

    const formattedFeaturedRepos = featuredRepos.map(r => ({
      id: r.repoId || r.id || r._id,
      _id: r._id,
      title: r.name,
      name: r.name,
      description: r.description || 'Public GitHub repository',
      tags: r.language && r.language !== 'Other' ? [r.language] : ['GitHub'],
      stars: r.stargazers_count ?? r.stars ?? 0,
      forks: r.forks_count ?? r.forks ?? 0,
      demoUrl: r.homepage || '',
      githubUrl: r.html_url || r.url || '',
      isGitHub: true,
      featured: true,
      isFeatured: true,
      language: r.language,
      updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : 'Recently'
    }));

    return res.json({
      success: true,
      profile: {
        _id: user?._id,
        id: user?._id || user?.id,
        name: user?.name || 'Developer',
        username: safeUsername,
        role: user?.role || 'Full Stack & AI Developer',
        college: user?.college || '',
        bio: user?.bio || '',
        location: user?.location || '',
        avatar: user?.avatar,
        githubUrl: user?.githubUrl || (user?.connectedPlatforms?.github?.handle ? `https://github.com/${user.connectedPlatforms.github.handle}` : ''),
        leetcodeUrl: user?.leetcodeUrl || (user?.connectedPlatforms?.leetcode?.handle ? `https://leetcode.com/u/${user.connectedPlatforms.leetcode.handle}` : ''),
        linkedinUrl: user?.linkedinUrl || ''
      },
      stats: {
        totalRepos,
        followers,
        following,
        leetcodeSolved,
        currentStreak: user?.stats?.currentStreak || 0,
        totalContributions: user?.stats?.totalContributions || 0,
        rating: user?.stats?.rating || 0
      },
      customProjects,
      featuredRepos: formattedFeaturedRepos,
      allRepos: allRepos.map(r => ({
        id: r.repoId || r.id || r._id,
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count ?? r.stars ?? 0,
        forks: r.forks_count ?? r.forks ?? 0,
        html_url: r.html_url || r.url,
        homepage: r.homepage || '',
        isFeatured: Boolean(r.isFeatured)
      })),
      user: {
        ...user,
        username: safeUsername
      }
    });
  } catch (err) {
    console.error('GET /api/portfolio/me error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/portfolio/profile
 * Update the user's portfolio profile info (Name, Headline, College, Bio, Location, Social Links)
 */
router.put('/profile', optionalAuth, async (req, res) => {
  try {
    const { name, role, college, bio, location, githubUrl, leetcodeUrl, linkedinUrl, username } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const dbUser = await User.findById(userId);
      if (dbUser) {
        if (name !== undefined) dbUser.name = name.trim();
        if (role !== undefined) dbUser.role = role.trim();
        if (college !== undefined) dbUser.college = college.trim();
        if (bio !== undefined) dbUser.bio = bio.trim();
        if (location !== undefined) dbUser.location = location.trim();
        if (githubUrl !== undefined) dbUser.githubUrl = githubUrl.trim();
        if (leetcodeUrl !== undefined) dbUser.leetcodeUrl = leetcodeUrl.trim();
        if (linkedinUrl !== undefined) dbUser.linkedinUrl = linkedinUrl.trim();
        if (username !== undefined && username.trim()) dbUser.username = username.trim().toLowerCase();

        await dbUser.save();
        return res.json({
          success: true,
          message: 'Profile updated successfully',
          profile: {
            name: dbUser.name,
            username: dbUser.username,
            role: dbUser.role,
            college: dbUser.college,
            bio: dbUser.bio,
            location: dbUser.location,
            githubUrl: dbUser.githubUrl,
            leetcodeUrl: dbUser.leetcodeUrl,
            linkedinUrl: dbUser.linkedinUrl
          },
          user: dbUser
        });
      }
    }

    // In-memory fallback
    const current = req.app.locals.currentUser;
    req.app.locals.currentUser = {
      ...current,
      name: name ?? current.name,
      role: role ?? current.role,
      college: college ?? current.college,
      bio: bio ?? current.bio,
      location: location ?? current.location,
      githubUrl: githubUrl ?? current.githubUrl,
      leetcodeUrl: leetcodeUrl ?? current.leetcodeUrl,
      linkedinUrl: linkedinUrl ?? current.linkedinUrl,
      username: username ? username.trim().toLowerCase() : current.username
    };

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: req.app.locals.currentUser
    });
  } catch (err) {
    console.error('PUT /api/portfolio/profile error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/portfolio/projects
 * Add custom project to portfolio
 */
router.post('/projects', optionalAuth, async (req, res) => {
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

    const userId = req.user?._id || req.user?.id;
    let savedProject = null;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const dbUser = await User.findById(userId);
      if (dbUser) {
        dbUser.projects.unshift(projectPayload);
        dbUser.stats.totalRepositories = (dbUser.stats.totalRepositories || 0) + 1;
        await dbUser.save();
        savedProject = dbUser.projects[0];
      }
    }

    if (!savedProject) {
      savedProject = {
        id: `proj_${Date.now()}`,
        ...projectPayload,
        isCustom: true
      };
      req.app.locals.projects = req.app.locals.projects || [];
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
    console.error('POST /api/portfolio/projects error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/portfolio/projects/:id
 * Edit custom project
 */
router.put('/projects/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, demoUrl, githubUrl } = req.body;
    const userId = req.user?._id || req.user?.id;

    const parsedTags = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined);

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const dbUser = await User.findById(userId);
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
    const idx = (req.app.locals.projects || []).findIndex(p => p.id === id || String(p._id) === id);
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

/**
 * DELETE /api/portfolio/projects/:id
 * Delete custom project
 */
router.delete('/projects/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const dbUser = await User.findById(userId);
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
    req.app.locals.projects = (req.app.locals.projects || []).filter(p => p.id !== id && String(p._id) !== id);
    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/portfolio/u/:username
 * Public Portfolio page endpoint for /u/:username
 */
router.get('/u/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = username.trim().toLowerCase();

    let user = null;
    let customProjects = [];
    let featuredRepos = [];

    if (mongoose.connection.readyState === 1) {
      // Find user by username, email handle, or slugified name
      user = await User.findOne({
        $or: [
          { username: cleanUsername },
          { email: new RegExp(`^${cleanUsername}@`, 'i') },
          { name: new RegExp(`^${cleanUsername.replace(/-/g, ' ')}$`, 'i') },
          { 'connectedPlatforms.github.handle': new RegExp(`^${cleanUsername}$`, 'i') }
        ]
      }).lean();

      // If not found by exact criteria, fallback to the first active user
      if (!user) {
        user = await User.findOne({}).lean();
      }

      if (user) {
        customProjects = filterRealProjects(user.projects || []).map(p => ({
          id: String(p._id),
          title: p.title,
          description: p.description,
          tags: p.tags || [],
          stars: p.stars || 0,
          forks: p.forks || 0,
          demoUrl: p.demoUrl || '',
          githubUrl: p.githubUrl || '',
          isCustom: true
        }));

        featuredRepos = await Repository.find({ userId: user._id, isFeatured: true }).sort({ stargazers_count: -1 }).lean();
        if (!featuredRepos.length) {
          featuredRepos = await Repository.find({ userId: user._id }).sort({ stargazers_count: -1 }).limit(6).lean();
        }
      }
    } else {
      user = req.app.locals.currentUser;
      customProjects = filterRealProjects(req.app.locals.projects || []);
      featuredRepos = (req.app.locals.repositories || []).slice(0, 6);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Developer profile not found' });
    }

    const totalRepos = user?.stats?.totalRepositories ?? featuredRepos.length;
    const followers = user?.stats?.followers ?? 0;
    const currentStreak = user?.stats?.currentStreak ?? 0;
    const problemsSolved = user?.stats?.problemsSolved ?? user?.connectedPlatforms?.leetcode?.solved ?? 0;

    const formattedFeaturedRepos = featuredRepos.map(r => ({
      id: r.repoId || r.id || r._id,
      title: r.name,
      description: r.description || 'Public GitHub repository',
      tags: r.language && r.language !== 'Other' ? [r.language] : ['GitHub'],
      stars: r.stargazers_count ?? r.stars ?? 0,
      forks: r.forks_count ?? r.forks ?? 0,
      demoUrl: r.homepage || '',
      githubUrl: r.html_url || r.url || '',
      isGitHub: true,
      language: r.language
    }));

    return res.json({
      success: true,
      user: {
        name: user.name,
        username: user.username || cleanUsername,
        role: user.role || 'Full Stack & AI Developer',
        college: user.college || '',
        bio: user.bio || '',
        location: user.location || '',
        avatar: user.avatar,
        githubUrl: user.githubUrl || (user.connectedPlatforms?.github?.handle ? `https://github.com/${user.connectedPlatforms.github.handle}` : ''),
        leetcodeUrl: user.leetcodeUrl || (user.connectedPlatforms?.leetcode?.handle ? `https://leetcode.com/u/${user.connectedPlatforms.leetcode.handle}` : ''),
        linkedinUrl: user.linkedinUrl || '',
        stats: {
          totalRepositories: totalRepos,
          followers,
          following: user?.stats?.following ?? 0,
          currentStreak,
          problemsSolved,
          rating: user?.stats?.rating || 0
        }
      },
      projects: [...customProjects, ...formattedFeaturedRepos]
    });
  } catch (err) {
    console.error('GET /api/portfolio/u/:username error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
