import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { User } from '../models/User.js';
import { PlatformStats } from '../models/PlatformStats.js';
import { Repository } from '../models/Repository.js';
import { AIReport } from '../models/AIReport.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

function parseJsonSafely(text) {
  if (!text) throw new Error('Empty response from AI model');
  let cleaned = text.trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      // continue to fallback
    }
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

export function calculateDeterministicCompetency(stats = {}, repos = [], languages = []) {
  // LeetCode solved (up to 45 pts)
  const easy = Number(stats.easySolved || 0);
  const med = Number(stats.mediumSolved || 0);
  const hard = Number(stats.hardSolved || 0);
  const solved = Number(stats.problemsSolved || stats.leetcodeProblems || (easy + med + hard) || 0);
  const lcPoints = Math.min(45, (easy * 0.4) + (med * 1.4) + (hard * 3.2) + (solved > 0 && (easy + med + hard === 0) ? Math.min(30, solved * 0.6) : 0));

  // GitHub Repos & Stars (up to 25 pts)
  const repoCount = Number(repos.length || stats.totalRepositories || 0);
  const totalStars = repos.reduce((acc, r) => acc + Number(r.stargazers_count || r.stars || 0), 0);
  const ghPoints = Math.min(25, (repoCount * 2.2) + (totalStars * 2.5));

  // Streak & Contributions (up to 20 pts)
  const streak = Number(stats.currentStreak || 0);
  const contributions = Number(stats.totalContributions || 0);
  const activityPoints = Math.min(20, Math.min(10, streak * 0.8) + Math.min(10, Math.floor(contributions / 25)));

  // Language Variety (up to 10 pts)
  const langCount = Array.isArray(languages) ? languages.length : 0;
  const langPoints = Math.min(10, langCount * 2.5);

  const baseline = Math.round(35 + lcPoints + ghPoints + activityPoints + langPoints);
  return Math.min(96, Math.max(25, baseline));
}

/**
 * GET /api/ai-insights
 * Retrieve the latest saved AI Report for the authenticated user
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const apiKeyConfigured = Boolean(process.env.OPENROUTER_API_KEY || req.user?.openRouterApiKey);

    let baselineScore = 75;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const dbUser = await User.findById(userId).lean();
      const repos = await Repository.find({ userId }).lean().catch(() => []);
      const ghStats = await PlatformStats.findOne({ userId, platform: 'github' }).lean().catch(() => null);

      if (dbUser) {
        baselineScore = calculateDeterministicCompetency(
          {
            ...dbUser.stats,
            easySolved: dbUser.connectedPlatforms?.leetcode?.easySolved,
            mediumSolved: dbUser.connectedPlatforms?.leetcode?.mediumSolved,
            hardSolved: dbUser.connectedPlatforms?.leetcode?.hardSolved
          },
          repos,
          ghStats?.stats?.languageDistribution || []
        );
      }

      const latestReport = await AIReport.findOne({ userId }).sort({ createdAt: -1 }).lean();
      if (latestReport) {
        const finalScore = (latestReport.overallScore && latestReport.overallScore !== 82)
          ? latestReport.overallScore
          : baselineScore;

        return res.json({
          success: true,
          report: {
            ...latestReport,
            overallScore: finalScore
          },
          apiKeyConfigured
        });
      }
    } else {
      const current = req.app.locals.currentUser;
      baselineScore = calculateDeterministicCompetency(
        {
          ...current?.stats,
          easySolved: current?.connectedPlatforms?.leetcode?.easySolved,
          mediumSolved: current?.connectedPlatforms?.leetcode?.mediumSolved,
          hardSolved: current?.connectedPlatforms?.leetcode?.hardSolved
        },
        req.app.locals.repositories || [],
        req.app.locals.languageDistribution || []
      );
    }

    // In-memory or initial fallback with dynamic baseline score
    const memCoach = req.app.locals.aiCoach;
    const finalMemScore = (memCoach?.overallScore && memCoach.overallScore !== 82)
      ? memCoach.overallScore
      : baselineScore;

    return res.json({
      success: true,
      report: {
        ...memCoach,
        overallScore: finalMemScore
      },
      apiKeyConfigured
    });
  } catch (err) {
    console.error('GET /api/ai-insights error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/ai-insights/generate
 * Gather real user telemetry from MongoDB and query OpenRouter API for career analysis
 */
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let apiKey = process.env.OPENROUTER_API_KEY || req.body?.apiKey;
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

    let user = null;
    let ghStats = null;
    let lcStats = null;
    let repos = [];

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
      if (!apiKey && user?.openRouterApiKey) {
        apiKey = user.openRouterApiKey;
      }

      ghStats = await PlatformStats.findOne({ userId, platform: 'github' });
      lcStats = await PlatformStats.findOne({ userId, platform: 'leetcode' });
      repos = await Repository.find({ userId }).limit(30).lean();
    } else {
      user = req.app.locals.currentUser;
      repos = req.app.locals.repositories || [];
    }

    // Check if OpenRouter key is available
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({
        success: false,
        missingApiKey: true,
        message: 'OpenRouter API Key is missing. Please set OPENROUTER_API_KEY in server/.env or provide your key.'
      });
    }

    // Build rich developer profile telemetry payload for the LLM
    const leetcodeSolved = user?.stats?.leetcodeProblems || user?.connectedPlatforms?.leetcode?.solved || lcStats?.stats?.solved || 0;
    const easySolved = user?.connectedPlatforms?.leetcode?.easySolved || lcStats?.stats?.easySolved || 0;
    const mediumSolved = user?.connectedPlatforms?.leetcode?.mediumSolved || lcStats?.stats?.mediumSolved || 0;
    const hardSolved = user?.connectedPlatforms?.leetcode?.hardSolved || lcStats?.stats?.hardSolved || 0;
    const currentStreak = user?.stats?.currentStreak || lcStats?.stats?.currentStreak || 0;
    const totalRepos = repos.length || user?.stats?.totalRepositories || 0;
    const targetRole = user?.targetRole || 'Senior Full Stack & AI Engineer';

    const repoSummaries = repos.slice(0, 15).map(r => ({
      name: r.name,
      description: r.description || '',
      language: r.language,
      stars: r.stargazers_count || r.stars || 0,
      forks: r.forks_count || r.forks || 0,
      topics: r.topics || []
    }));

    const languages = ghStats?.stats?.languageDistribution || [];

    // Calculate deterministic baseline score from user's real MongoDB stats
    const deterministicBaselineScore = calculateDeterministicCompetency(
      {
        ...user?.stats,
        easySolved,
        mediumSolved,
        hardSolved,
        problemsSolved: leetcodeSolved,
        currentStreak,
        totalRepositories: totalRepos
      },
      repos,
      languages
    );

    const systemPrompt = `You are DevPulse AI, an elite developer career intelligence coach.
Analyze the provided developer telemetry and output strictly valid JSON matching this exact structure:
{
  "overallScore": <calculated_score_0_to_100>,
  "summary": "Personalized 2-sentence executive summary of the developer's current profile.",
  "skillAnalysis": [
    { "skill": "Data Structures", "score": <calculated_score_0_to_100>, "level": "Advanced | Intermediate | Developing", "feedback": "Detailed feedback on DSA mastery..." },
    { "skill": "Algorithms", "score": <calculated_score_0_to_100>, "level": "Advanced | Intermediate | Developing", "feedback": "Detailed feedback on algorithmic thinking..." },
    { "skill": "System Design", "score": <calculated_score_0_to_100>, "level": "Advanced | Intermediate | Developing", "feedback": "Detailed feedback on architectural concepts..." },
    { "skill": "Web Development", "score": <calculated_score_0_to_100>, "level": "Advanced | Intermediate | Developing", "feedback": "Detailed feedback on full stack skills..." },
    { "skill": "Machine Learning / AI", "score": <calculated_score_0_to_100>, "level": "Advanced | Intermediate | Developing", "feedback": "Detailed feedback on AI/ML readiness..." }
  ],
  "roadmap": [
    {
      "title": "Master Distributed Systems & Caching",
      "subtitle": "Deepen backend scalability skills",
      "duration": "2-3 weeks",
      "status": "In Progress",
      "tasks": [
        "Day 1-2: Implement Redis cache-aside with pub/sub",
        "Day 3-4: Build a distributed rate limiter using token bucket",
        "Day 5-7: Benchmark database read replicas and query indexing"
      ]
    },
    {
      "title": "Advanced Algorithmic Patterns",
      "subtitle": "Excel in Medium/Hard interview challenges",
      "duration": "3-4 weeks",
      "status": "Upcoming",
      "tasks": [
        "Day 1-3: Graph shortest paths and Topological sorting",
        "Day 4-6: Dynamic Programming on Trees and Bitmasking",
        "Day 7-10: Monotonic queues and Segment Tree optimizations"
      ]
    }
  ],
  "recommendations": [
    {
      "title": "Solve 2 Medium LeetCode Problems Daily",
      "description": "Reinforce dynamic programming and graph traversals to increase interview readiness.",
      "category": "Coding",
      "actionUrl": "/problems"
    },
    {
      "title": "Publish Live Demo for Top Repositories",
      "description": "Deploy frontends to Vercel/Render and attach live demo links on your portfolio.",
      "category": "Project",
      "actionUrl": "/repositories"
    },
    {
      "title": "Contribute to Trending TypeScript Repos",
      "description": "Fork and submit PRs to production open source repositories to build public visibility.",
      "category": "OpenSource",
      "actionUrl": "https://github.com/trending"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the pure JSON object.
2. DO NOT output markdown code blocks (\`\`\`json or \`\`\`).
3. Ensure skill scores are numbers between 0 and 100.
4. Customize the assessment accurately to the developer's real telemetry and target role.`;

    const userPrompt = `Developer Profile Telemetry:
- Developer Name: ${user?.name || 'Developer'}
- Target Role: ${targetRole}
- Total GitHub Repositories: ${totalRepos}
- Top Languages: ${JSON.stringify(languages)}
- Sample Projects/Repositories: ${JSON.stringify(repoSummaries)}
- LeetCode Solved Total: ${leetcodeSolved} (Easy: ${easySolved}, Medium: ${mediumSolved}, Hard: ${hardSolved})
- Active Streak: ${currentStreak} days
- Total Contributions: ${user?.stats?.totalContributions || 0}
- Current Rating: ${user?.stats?.rating || 0}
- Telemetry-Derived Baseline Developer Competency Score: ${deterministicBaselineScore}/100 (Calibrate your overallScore and individual skill scores around this real activity baseline).

Provide an actionable, realistic, high-value career intelligence assessment based on this real data.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
          'X-Title': 'DevPulse Developer Intelligence',
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const rawContent = response.data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('OpenRouter returned an empty response');
    }

    const parsedJson = parseJsonSafely(rawContent);

    // Format tasks into objects with id, text, done
    const formattedRoadmap = (parsedJson.roadmap || []).map((road, rIdx) => {
      const roadId = `road_${rIdx + 1}`;
      const tasks = (road.tasks || []).map((taskItem, tIdx) => {
        const taskId = `t_${rIdx + 1}_${tIdx + 1}`;
        if (typeof taskItem === 'string') {
          return { id: taskId, text: taskItem, done: false };
        }
        return {
          id: taskItem.id || taskId,
          text: taskItem.text || String(taskItem),
          done: Boolean(taskItem.done)
        };
      });

      return {
        id: roadId,
        title: road.title || `Milestone ${rIdx + 1}`,
        subtitle: road.subtitle || '',
        duration: road.duration || '2-3 weeks',
        status: road.status || (rIdx === 0 ? 'In Progress' : 'Upcoming'),
        tasks
      };
    });

    const formattedRecommendations = (parsedJson.recommendations || []).map((rec, idx) => ({
      id: `rec_${idx + 1}`,
      title: rec.title,
      description: rec.description || rec.subtitle || '',
      category: ['Coding', 'Project', 'OpenSource'].includes(rec.category) ? rec.category : 'Coding',
      actionUrl: rec.actionUrl || rec.link || '/problems'
    }));

    let calculatedOverall = Number(parsedJson.overallScore);
    if (!calculatedOverall || isNaN(calculatedOverall) || calculatedOverall === 82 || calculatedOverall === 78) {
      if (parsedJson.skillAnalysis?.length) {
        calculatedOverall = Math.round(parsedJson.skillAnalysis.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / parsedJson.skillAnalysis.length);
      } else {
        calculatedOverall = deterministicBaselineScore;
      }
    }

    const reportData = {
      overallScore: calculatedOverall,
      summary: parsedJson.summary || 'Solid full stack competency with high growth trajectory in algorithmic problem solving.',
      skillAnalysis: parsedJson.skillAnalysis || [],
      roadmap: formattedRoadmap,
      recommendations: formattedRecommendations,
      modelUsed: model
    };

    let savedReport = null;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      savedReport = await AIReport.create({
        userId,
        ...reportData
      });
    }

    // Update in-memory fallback
    req.app.locals.aiCoach = {
      ...reportData,
      skills: (reportData.skillAnalysis || []).map(s => ({
        name: s.skill,
        level: s.score,
        color: s.score >= 80 ? '#10B981' : s.score >= 65 ? '#3B82F6' : '#F59E0B',
        details: s.feedback
      }))
    };

    return res.json({
      success: true,
      message: 'AI Insights generated successfully via OpenRouter',
      report: savedReport || reportData
    });
  } catch (err) {
    console.error('POST /api/ai-insights/generate error:', err.response?.data || err.message);
    const msg = err.response?.data?.error?.message || err.message || 'Failed to generate AI insights from OpenRouter';
    return res.status(500).json({
      success: false,
      message: msg
    });
  }
});

/**
 * POST /api/ai-insights/toggle-task
 * Check off individual task inside a roadmap milestone and persist to MongoDB
 */
router.post('/toggle-task', optionalAuth, async (req, res) => {
  try {
    const { roadId, taskId } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      const report = await AIReport.findOne({ userId }).sort({ createdAt: -1 });
      if (report && report.roadmap?.length) {
        let matched = false;
        for (const road of report.roadmap) {
          if (road.id === roadId || !roadId) {
            for (const task of road.tasks) {
              if (task.id === taskId) {
                task.done = !task.done;
                matched = true;
                break;
              }
            }
          }
          if (matched) break;
        }

        if (matched) {
          report.markModified('roadmap');
          await report.save();
          return res.json({
            success: true,
            message: 'Task toggled successfully',
            report
          });
        }
      }
    }

    // In-memory fallback
    const memCoach = req.app.locals.aiCoach;
    if (memCoach?.roadmap?.length) {
      for (const road of memCoach.roadmap) {
        if (road.id === roadId || !roadId) {
          const task = road.tasks.find(t => t.id === taskId);
          if (task) {
            task.done = !task.done;
            return res.json({ success: true, task, report: memCoach });
          }
        }
      }
    }

    return res.status(404).json({ success: false, message: 'Roadmap task not found' });
  } catch (err) {
    console.error('Toggle task error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/ai-insights/api-key
 * Store user's OpenRouter API key
 */
router.post('/api-key', optionalAuth, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, message: 'API key is required' });
    }

    const userId = req.user?._id || req.user?.id;
    if (mongoose.connection.readyState === 1 && userId && mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, { openRouterApiKey: apiKey.trim() });
    }

    return res.json({
      success: true,
      message: 'OpenRouter API Key saved successfully'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
