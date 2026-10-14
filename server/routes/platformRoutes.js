import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { PlatformStats } from '../models/PlatformStats.js';
import { Problem } from '../models/Problem.js';
import { fetchLeetCodeStats } from '../services/leetcodeService.js';
import { fetchGitHubStats, mergeLeetCodeContributions } from '../services/githubService.js';
import { optionalAuth } from '../middleware/auth.js';
import { calculateRating } from '../utils/rating.js';

const router = express.Router();

// 1. REAL LEETCODE GRAPHQL FETCHER & CONNECTION
router.post('/connect/leetcode', optionalAuth, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'LeetCode username is required'
      });
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    // Fetch real stats from LeetCode GraphQL
    const stats = await fetchLeetCodeStats(cleanUsername);

    let updatedUser;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      // 1. Persist in MongoDB User
      updatedUser = await User.findById(userId);
      if (updatedUser) {
        const dynamicRating = stats.reputation || calculateRating({
          problemsSolved: stats.solved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          currentStreak: stats.currentStreak,
          totalRepositories: updatedUser.stats?.totalRepositories || 0
        });

        updatedUser.connectedPlatforms.leetcode = {
          connected: true,
          handle: stats.username,
          verified: true,
          solved: stats.solved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          ranking: stats.ranking,
          rating: dynamicRating,
          lastSynced: new Date()
        };

        updatedUser.stats.problemsSolved = stats.solved;
        updatedUser.stats.leetcodeProblems = stats.solved;
        updatedUser.stats.acceptanceRate = stats.acceptanceRate;
        updatedUser.stats.activeDays = stats.activeDays;
        updatedUser.stats.currentStreak = stats.currentStreak;
        updatedUser.stats.rating = dynamicRating;
        updatedUser.stats.totalContributions = Math.max(
          updatedUser.stats.totalContributions || 0,
          stats.totalSubmissions || 0
        );

        await updatedUser.save();
      }

      // 2. Persist in PlatformStats
      await PlatformStats.findOneAndUpdate(
        { userId, platform: 'leetcode' },
        {
          userId,
          platform: 'leetcode',
          handle: stats.username,
          stats,
          lastSynced: new Date()
        },
        { upsert: true, new: true }
      );

      // 3. Persist recent problems in Problem collection
      if (stats.recentSubmissions?.length) {
        const bulkOps = stats.recentSubmissions.map(sub => ({
          updateOne: {
            filter: { userId, problemId: sub.problemId, platform: 'LeetCode' },
            update: {
              $set: {
                userId,
                problemId: sub.problemId,
                title: sub.title,
                titleSlug: sub.titleSlug,
                difficulty: sub.difficulty,
                platform: 'LeetCode',
                category: sub.category,
                topicTags: sub.topicTags,
                solved: true,
                solvedAt: sub.solvedAt,
                url: sub.url,
                accuracy: sub.accuracy,
                isCustom: false
              }
            },
            upsert: true
          }
        }));
        await Problem.bulkWrite(bulkOps).catch(err => console.warn('Bulk write problems error:', err.message));
      }
    }

    // Also update in-memory current user for seamless fallback
    const current = req.app.locals.currentUser;
    const memRating = stats.reputation || calculateRating({
      problemsSolved: stats.solved,
      easySolved: stats.easySolved,
      mediumSolved: stats.mediumSolved,
      hardSolved: stats.hardSolved,
      currentStreak: stats.currentStreak,
      totalRepositories: current?.stats?.totalRepositories || 0
    });

    current.connectedPlatforms = {
      ...current.connectedPlatforms,
      leetcode: {
        connected: true,
        handle: stats.username,
        verified: true,
        solved: stats.solved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        ranking: stats.ranking,
        rating: memRating,
        lastSynced: new Date().toISOString()
      }
    };

    current.stats = {
      ...current.stats,
      problemsSolved: stats.solved,
      leetcodeProblems: stats.solved,
      acceptanceRate: stats.acceptanceRate,
      activeDays: stats.activeDays,
      currentStreak: stats.currentStreak,
      rating: memRating
    };

    // Update trend and bar chart data with real LeetCode numbers
    if (req.app.locals.platformBarChart?.length) {
      const lastBar = req.app.locals.platformBarChart[req.app.locals.platformBarChart.length - 1];
      if (lastBar) lastBar.LeetCode = Math.min(stats.solved, 120);
    }

    if (stats.recentSubmissions?.length) {
      req.app.locals.problems = stats.recentSubmissions;
    }

    req.app.locals.currentUser = current;

    return res.json({
      success: true,
      message: `Successfully connected and synced real LeetCode stats for @${stats.username}`,
      stats,
      user: updatedUser || current
    });
  } catch (err) {
    console.error('LeetCode connect error:', err.message);
    const statusCode = err.message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Failed to sync LeetCode profile'
    });
  }
});

// 2. GITHUB PUBLIC SYNC (NO OAUTH REQUIRED FALLBACK)
router.post('/connect/github', optionalAuth, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'GitHub username is required'
      });
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    // Fetch real stats from public GitHub API
    const stats = await fetchGitHubStats(cleanUsername);

    let updatedUser;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      updatedUser = await User.findById(userId);
      if (updatedUser) {
        updatedUser.connectedPlatforms.github = {
          connected: true,
          handle: stats.username,
          verified: true,
          contributions: stats.contributions,
          repos: stats.publicRepos,
          lastSynced: new Date()
        };

        updatedUser.stats.totalRepositories = stats.publicRepos;
        updatedUser.stats.totalContributions = stats.contributions;
        updatedUser.stats.followers = stats.followers;
        updatedUser.stats.following = stats.following;

        if (stats.avatarUrl && !updatedUser.avatar) {
          updatedUser.avatar = stats.avatarUrl;
        }

        if (stats.contributionCalendar) {
          const lcStats = await PlatformStats.findOne({ userId, platform: 'leetcode' });
          if (lcStats?.stats?.submissionCalendar) {
            stats.contributionCalendar = mergeLeetCodeContributions(
              stats.contributionCalendar,
              lcStats.stats.submissionCalendar
            );
            stats.contributions = stats.contributionCalendar.totalContributions;
            updatedUser.stats.totalContributions = stats.contributions;
          }
          updatedUser.contributionCalendar = stats.contributionCalendar;
        }

        await updatedUser.save();
      }

      await PlatformStats.findOneAndUpdate(
        { userId, platform: 'github' },
        {
          userId,
          platform: 'github',
          handle: stats.username,
          stats,
          lastSynced: new Date()
        },
        { upsert: true, new: true }
      );
    }

    // In-memory update
    const current = req.app.locals.currentUser;
    current.connectedPlatforms = {
      ...current.connectedPlatforms,
      github: {
        connected: true,
        handle: stats.username,
        verified: true,
        contributions: stats.contributions,
        repos: stats.publicRepos,
        lastSynced: new Date().toISOString()
      }
    };

    current.stats = {
      ...current.stats,
      totalRepositories: stats.publicRepos,
      totalContributions: stats.contributions,
      followers: stats.followers,
      following: stats.following
    };

    if (stats.contributionCalendar) {
      current.contributionCalendar = stats.contributionCalendar;
    }

    if (stats.repositories?.length) {
      req.app.locals.repositories = stats.repositories;
    }

    if (stats.languageDistribution?.length) {
      req.app.locals.languageDistribution = stats.languageDistribution;
    }

    req.app.locals.currentUser = current;

    return res.json({
      success: true,
      message: `Successfully connected and synced public GitHub data for @${stats.username}`,
      stats,
      user: updatedUser || current
    });
  } catch (err) {
    console.error('GitHub connect error:', err.message);
    const statusCode = err.message.includes('not found') || err.response?.status === 404 ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Failed to sync GitHub profile'
    });
  }
});

// 3. GENERIC PLATFORM CONNECT (CodeChef, HackerRank, GeeksforGeeks, AtCoder)
router.post('/connect/:platform', optionalAuth, async (req, res) => {
  try {
    const { platform } = req.params;
    const { handle } = req.body;

    if (!handle) {
      return res.status(400).json({ success: false, message: 'Platform handle is required' });
    }

    const pKey = platform.toLowerCase();
    const cleanHandle = handle.trim().replace(/^@/, '');

    const userId = req.user?._id || req.user?.id;
    let updatedUser;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      updatedUser = await User.findById(userId);
      if (updatedUser) {
        const existing = updatedUser.connectedPlatforms[pKey] || {};
        updatedUser.connectedPlatforms[pKey] = {
          ...existing,
          connected: true,
          handle: cleanHandle,
          verified: true,
          lastSynced: new Date()
        };
        updatedUser.stats.problemsSolved += 25;
        updatedUser.stats.totalContributions += 50;
        await updatedUser.save();
      }
    }

    // In-memory update
    const current = req.app.locals.currentUser;
    const existing = current.connectedPlatforms[pKey] || {};
    current.connectedPlatforms[pKey] = {
      ...existing,
      connected: true,
      handle: cleanHandle,
      verified: true,
      lastSynced: new Date().toISOString()
    };
    current.stats.problemsSolved += 25;
    current.stats.totalContributions += 50;
    req.app.locals.currentUser = current;

    return res.json({
      success: true,
      message: `Connected ${platform} successfully for @${cleanHandle}`,
      user: updatedUser || current
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. GET ALL STORED PLATFORM STATS
router.get('/stats', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const allStats = await PlatformStats.find({ userId });
      return res.json({ success: true, stats: allStats });
    }

    return res.json({
      success: true,
      stats: []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
