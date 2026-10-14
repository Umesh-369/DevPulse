import express from 'express';
import mongoose from 'mongoose';
import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';
import { PlatformStats } from '../models/PlatformStats.js';
import { fetchLeetCodeStats, formatRelativeTime } from '../services/leetcodeService.js';
import { mergeLeetCodeContributions } from '../services/githubService.js';
import { optionalAuth } from '../middleware/auth.js';
import { calculateRating } from '../utils/rating.js';

const router = express.Router();

/**
 * GET /api/problems
 * Fetch synced & logged problems for the user, with real solved breakdown stats
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { difficulty, platform, search } = req.query;
    const userId = req.user?._id || req.user?.id;

    let problems = [];
    let stats = {
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0
    };

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const dbUser = await User.findById(userId).lean();
      if (dbUser) {
        const lcPlatform = dbUser.connectedPlatforms?.leetcode;
        stats.totalSolved = dbUser.stats?.problemsSolved || lcPlatform?.solved || 0;
        stats.easySolved = lcPlatform?.easySolved || 0;
        stats.mediumSolved = lcPlatform?.mediumSolved || 0;
        stats.hardSolved = lcPlatform?.hardSolved || 0;
      }

      let query = {
        userId,
        $and: [
          {
            $or: [
              { title: { $nin: ['Two Sum', 'LRU Cache Implementation', 'Reverse Linked List', 'Valid Parentheses'] } },
              { isCustom: true }
            ]
          },
          { problemId: { $nin: ['p1', 'p2', 'p3', 'p4'] } }
        ]
      };
      if (difficulty && difficulty !== 'All') {
        query.difficulty = new RegExp(`^${difficulty}$`, 'i');
      }
      if (platform && platform !== 'All') {
        query.platform = new RegExp(`^${platform}$`, 'i');
      }

      problems = await Problem.find(query).sort({ solvedAt: -1, createdAt: -1 }).lean();

      // If user has zero problems saved but has a connected LeetCode handle, auto-sync now
      if (!problems.length && dbUser?.connectedPlatforms?.leetcode?.handle) {
        try {
          const lcHandle = dbUser.connectedPlatforms.leetcode.handle;
          const lcData = await fetchLeetCodeStats(lcHandle);
          if (lcData.recentSubmissions?.length) {
            const bulkOps = lcData.recentSubmissions.map(sub => ({
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
            await Problem.bulkWrite(bulkOps);
            problems = await Problem.find(query).sort({ solvedAt: -1, createdAt: -1 }).lean();
          }
        } catch (autoSyncErr) {
          console.warn('Auto-sync LeetCode problems notice:', autoSyncErr.message);
        }
      }
    }

    // In-memory fallback if no DB or empty
    if (!problems.length && req.app.locals.problems?.length) {
      let filtered = [...req.app.locals.problems];
      if (difficulty && difficulty !== 'All') {
        filtered = filtered.filter(p => p.difficulty?.toLowerCase() === difficulty.toLowerCase());
      }
      if (platform && platform !== 'All') {
        filtered = filtered.filter(p => p.platform?.toLowerCase() === platform.toLowerCase());
      }
      problems = filtered;

      const current = req.app.locals.currentUser;
      const lc = current?.connectedPlatforms?.leetcode;
      stats.totalSolved = current?.stats?.problemsSolved || lc?.solved || problems.length;
      stats.easySolved = lc?.easySolved || problems.filter(p => p.difficulty === 'Easy').length;
      stats.mediumSolved = lc?.mediumSolved || problems.filter(p => p.difficulty === 'Medium').length;
      stats.hardSolved = lc?.hardSolved || problems.filter(p => p.difficulty === 'Hard').length;
    }

    const fallbackTitles = ['Two Sum', 'LRU Cache Implementation', 'Reverse Linked List', 'Valid Parentheses'];
    const cleanList = problems.filter(p => !fallbackTitles.includes(p.title) || p.isCustom);

    // Format relative time for all problems
    const formattedProblems = cleanList.map(p => ({
      ...p,
      id: p._id ? String(p._id) : (p.id || p.problemId),
      date: formatRelativeTime(p.solvedAt || p.timestamp || p.createdAt),
      url: p.url || (p.titleSlug ? `https://leetcode.com/problems/${p.titleSlug}` : '')
    }));

    // If stats are still 0 but problems exist, calculate from problem set
    if (!stats.totalSolved && formattedProblems.length) {
      stats.totalSolved = formattedProblems.length;
      stats.easySolved = formattedProblems.filter(p => p.difficulty === 'Easy').length;
      stats.mediumSolved = formattedProblems.filter(p => p.difficulty === 'Medium').length;
      stats.hardSolved = formattedProblems.filter(p => p.difficulty === 'Hard').length;
    }

    return res.json({
      success: true,
      problems: formattedProblems,
      stats
    });
  } catch (err) {
    console.error('GET /api/problems error:', err.message);
    return res.status(500).json({ success: false, message: err.message, problems: [], stats: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 } });
  }
});

/**
 * POST /api/problems/sync
 * Sync up to 50 real recent accepted submissions from LeetCode GraphQL
 */
router.post('/sync', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let username = req.body?.username;

    let dbUser = null;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      dbUser = await User.findById(userId);
      if (!username) {
        username = dbUser?.connectedPlatforms?.leetcode?.handle || dbUser?.leetcodeUrl?.split('/').filter(Boolean).pop();
      }
    }

    if (!username) {
      const current = req.app.locals.currentUser;
      username = current?.connectedPlatforms?.leetcode?.handle;
    }

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'No LeetCode handle connected. Please connect your LeetCode profile first or provide a username.'
      });
    }

    // Fetch up to 50 real accepted submissions and stats from LeetCode
    const lcData = await fetchLeetCodeStats(username);
    const recentList = lcData.recentSubmissions || [];

    let savedProblems = [];

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      if (recentList.length > 0) {
        const bulkOps = recentList.map(sub => ({
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
        await Problem.bulkWrite(bulkOps);
      }

      // Update user platform stats and rating
      if (dbUser) {
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

        if (dbUser.contributionCalendar && lcData.submissionCalendar) {
          dbUser.contributionCalendar = mergeLeetCodeContributions(
            dbUser.contributionCalendar,
            lcData.submissionCalendar
          );
          dbUser.stats.totalContributions = dbUser.contributionCalendar.totalContributions;
        }

        await dbUser.save();

        await PlatformStats.findOneAndUpdate(
          { userId, platform: 'leetcode' },
          {
            userId,
            platform: 'leetcode',
            handle: lcData.username,
            stats: lcData,
            lastSynced: new Date()
          },
          { upsert: true }
        );
      }

      savedProblems = await Problem.find({
        userId,
        $or: [
          { title: { $nin: ['Two Sum', 'LRU Cache Implementation', 'Reverse Linked List', 'Valid Parentheses'] } },
          { isCustom: true }
        ]
      }).sort({ solvedAt: -1 }).lean();
    } else {
      // In-memory fallback
      req.app.locals.problems = recentList;
      savedProblems = recentList;

      const current = req.app.locals.currentUser;
      if (current.contributionCalendar && lcData.submissionCalendar) {
        current.contributionCalendar = mergeLeetCodeContributions(
          current.contributionCalendar,
          lcData.submissionCalendar
        );
        current.stats.totalContributions = current.contributionCalendar.totalContributions;
      }
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
      req.app.locals.currentUser = current;
    }

    const formatted = savedProblems.map(p => ({
      ...p,
      id: p._id ? String(p._id) : (p.id || p.problemId),
      date: formatRelativeTime(p.solvedAt || p.timestamp),
      url: p.url || `https://leetcode.com/problems/${p.titleSlug}`
    }));

    return res.json({
      success: true,
      message: `Successfully synchronized ${recentList.length} recent accepted submissions for @${lcData.username}`,
      problems: formatted,
      stats: {
        totalSolved: lcData.solved,
        easySolved: lcData.easySolved,
        mediumSolved: lcData.mediumSolved,
        hardSolved: lcData.hardSolved
      }
    });
  } catch (err) {
    console.error('POST /api/problems/sync error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/problems
 * Manually log a solved problem directly to MongoDB
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { title, difficulty = 'Medium', platform = 'LeetCode', category = 'Algorithms', url, date } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Problem title is required' });
    }

    const userId = req.user?._id || req.user?.id;
    const cleanTitle = title.trim();
    const titleSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cleanUrl = url?.trim() || (platform.toLowerCase() === 'leetcode' ? `https://leetcode.com/problems/${titleSlug}` : '');

    let saved = null;
    const problemPayload = {
      problemId: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: cleanTitle,
      titleSlug,
      difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
      platform: platform || 'Other',
      category: category ? category.trim() : 'Algorithms',
      topicTags: category ? category.split(',').map(s => s.trim()).filter(Boolean) : ['Algorithms'],
      solved: true,
      solvedAt: date ? new Date(date) : new Date(),
      url: cleanUrl,
      isCustom: true
    };

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      saved = await Problem.create({
        ...problemPayload,
        userId
      });

      // Increment user solved count
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.problemsSolved': 1 }
      });
    } else {
      saved = {
        id: `prob_${Date.now()}`,
        ...problemPayload
      };
      if (!req.app.locals.problems) req.app.locals.problems = [];
      req.app.locals.problems.unshift(saved);
      req.app.locals.currentUser.stats.problemsSolved = (req.app.locals.currentUser.stats.problemsSolved || 0) + 1;
    }

    return res.status(201).json({
      success: true,
      message: 'Problem logged successfully',
      problem: {
        ...problemPayload,
        id: saved._id ? String(saved._id) : saved.id,
        date: formatRelativeTime(saved.solvedAt)
      }
    });
  } catch (err) {
    console.error('POST /api/problems error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
