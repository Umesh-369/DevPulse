import express from 'express';
import mongoose from 'mongoose';
import { Repository } from '../models/Repository.js';
import { User } from '../models/User.js';
import { PlatformStats } from '../models/PlatformStats.js';
import { fetchGitHubStats } from '../services/githubService.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/repositories
 * Fetch all synced repositories for the logged-in user
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      let dbRepos = await Repository.find({ userId }).sort({ isFeatured: -1, stargazers_count: -1, updated_at: -1 }).lean();

      // If no repos saved yet, but user has connected GitHub handle, auto-sync
      if (!dbRepos.length) {
        const user = await User.findById(userId);
        const ghHandle = user?.connectedPlatforms?.github?.handle || user?.github?.username;
        const ghToken = user?.github?.accessToken;

        if (ghHandle) {
          try {
            const stats = await fetchGitHubStats(ghHandle, ghToken);
            if (stats?.repositories?.length) {
              const bulkOps = stats.repositories.map((r) => ({
                updateOne: {
                  filter: { userId, repoId: r.id },
                  update: {
                    $set: {
                      userId,
                      repoId: r.id,
                      name: r.name,
                      full_name: r.full_name,
                      description: r.description || '',
                      html_url: r.html_url,
                      homepage: r.homepage || '',
                      language: r.language || 'Other',
                      stargazers_count: r.stargazers_count || 0,
                      forks_count: r.forks_count || 0,
                      watchers_count: r.watchers_count || 0,
                      open_issues_count: r.open_issues_count || 0,
                      topics: r.topics || [],
                      size: r.size || 0,
                      updated_at: r.updated_at
                    },
                    $setOnInsert: {
                      isPinned: false,
                      isFeatured: false
                    }
                  },
                  upsert: true
                }
              }));

              await Repository.bulkWrite(bulkOps);
              dbRepos = await Repository.find({ userId }).sort({ isFeatured: -1, stargazers_count: -1, updated_at: -1 }).lean();
            }
          } catch (syncErr) {
            console.warn('Auto-sync GitHub repos warning:', syncErr.message);
          }
        }
      }

      if (dbRepos.length) {
        return res.json({
          success: true,
          repositories: dbRepos.map((r) => ({
            ...r,
            id: r.repoId || r._id,
            stars: r.stargazers_count,
            forks: r.forks_count,
            url: r.html_url,
            updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : 'Recently'
          }))
        });
      }
    }

    // In-memory or zero fallback
    const memRepos = req.app.locals.repositories || [];
    return res.json({
      success: true,
      repositories: memRepos.map((r) => ({
        ...r,
        id: r.id || r.repoId,
        stars: r.stargazers_count ?? r.stars ?? 0,
        forks: r.forks_count ?? r.forks ?? 0,
        url: r.html_url || r.url || '',
        updated: r.updated || (r.updated_at ? new Date(r.updated_at).toLocaleDateString() : 'Recently')
      }))
    });
  } catch (err) {
    console.error('GET /api/repositories error:', err.message);
    return res.status(500).json({ success: false, message: err.message, repositories: [] });
  }
});

/**
 * POST /api/repositories/sync
 * Trigger fresh GitHub repositories synchronization
 */
router.post('/sync', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let username = req.body?.username;
    let accessToken = null;

    let dbUser = null;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      dbUser = await User.findById(userId);
      if (!username && dbUser) {
        username = dbUser.connectedPlatforms?.github?.handle || dbUser.github?.username;
        accessToken = dbUser.github?.accessToken;
      }
    }

    if (!username) {
      const current = req.app.locals.currentUser;
      username = current?.connectedPlatforms?.github?.handle;
    }

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'No GitHub username connected. Please connect your GitHub account first.'
      });
    }

    const cleanUsername = username.trim().replace(/^@/, '');
    const ghStats = await fetchGitHubStats(cleanUsername, accessToken);

    let savedRepos = [];

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      if (ghStats.repositories?.length) {
        const bulkOps = ghStats.repositories.map((r) => ({
          updateOne: {
            filter: { userId, repoId: r.id },
            update: {
              $set: {
                userId,
                repoId: r.id,
                name: r.name,
                full_name: r.full_name,
                description: r.description || '',
                html_url: r.html_url,
                homepage: r.homepage || '',
                language: r.language || 'Other',
                stargazers_count: r.stargazers_count || 0,
                forks_count: r.forks_count || 0,
                watchers_count: r.watchers_count || 0,
                open_issues_count: r.open_issues_count || 0,
                topics: r.topics || [],
                size: r.size || 0,
                updated_at: r.updated_at
              },
              $setOnInsert: {
                isPinned: false,
                isFeatured: false
              }
            },
            upsert: true
          }
        }));

        await Repository.bulkWrite(bulkOps);
      }

      // Update User & PlatformStats
      if (dbUser) {
        dbUser.connectedPlatforms.github = {
          connected: true,
          handle: cleanUsername,
          verified: true,
          contributions: ghStats.contributions,
          repos: ghStats.publicRepos,
          lastSynced: new Date()
        };
        dbUser.stats.totalRepositories = ghStats.publicRepos;
        dbUser.stats.totalContributions = ghStats.contributions;
        dbUser.stats.followers = ghStats.followers;
        dbUser.stats.following = ghStats.following;
        if (!dbUser.githubUrl) {
          dbUser.githubUrl = `https://github.com/${cleanUsername}`;
        }
        await dbUser.save();
      }

      await PlatformStats.findOneAndUpdate(
        { userId, platform: 'github' },
        {
          userId,
          platform: 'github',
          handle: cleanUsername,
          stats: ghStats,
          lastSynced: new Date()
        },
        { upsert: true, new: true }
      );

      savedRepos = await Repository.find({ userId }).sort({ isFeatured: -1, stargazers_count: -1, updated_at: -1 }).lean();
    } else {
      req.app.locals.repositories = ghStats.repositories;
      savedRepos = ghStats.repositories;
    }

    return res.json({
      success: true,
      message: `Successfully synchronized ${ghStats.repositories.length} repositories from GitHub @${cleanUsername}`,
      repositories: savedRepos.map((r) => ({
        ...r,
        id: r.repoId || r.id || r._id,
        stars: r.stargazers_count ?? r.stars ?? 0,
        forks: r.forks_count ?? r.forks ?? 0,
        url: r.html_url || r.url || '',
        updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : 'Recently'
      })),
      stats: ghStats
    });
  } catch (err) {
    console.error('POST /api/repositories/sync error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to synchronize repositories'
    });
  }
});

/**
 * POST /api/repositories/:id/toggle-feature
 * Toggle feature/pin status for a repository on the portfolio
 */
router.post('/:id/toggle-feature', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const numericId = Number(id);
      const query = {
        userId,
        $or: [
          ...(numericId ? [{ repoId: numericId }] : []),
          ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
        ]
      };

      const repo = await Repository.findOne(query);
      if (repo) {
        repo.isFeatured = !repo.isFeatured;
        repo.isPinned = repo.isFeatured;
        await repo.save();

        return res.json({
          success: true,
          message: repo.isFeatured ? 'Repository featured on portfolio' : 'Repository unfeatured from portfolio',
          isFeatured: repo.isFeatured,
          isPinned: repo.isPinned,
          repo
        });
      }
    }

    // In-memory fallback
    const memRepos = req.app.locals.repositories || [];
    const target = memRepos.find((r) => String(r.id) === String(id) || String(r.repoId) === String(id));
    if (target) {
      target.isFeatured = !target.isFeatured;
      target.isPinned = target.isFeatured;
      return res.json({
        success: true,
        message: target.isFeatured ? 'Repository featured on portfolio' : 'Repository unfeatured from portfolio',
        isFeatured: target.isFeatured,
        isPinned: target.isPinned,
        repo: target
      });
    }

    return res.status(404).json({ success: false, message: 'Repository not found' });
  } catch (err) {
    console.error('Toggle feature error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
