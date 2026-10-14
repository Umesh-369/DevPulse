import axios from 'axios';

// Cache question details (difficulty and topic tags) to minimize duplicate requests
const questionDetailsCache = new Map();

/**
 * Format timestamp (seconds or ms or ISO) into user-friendly relative time or date
 * @param {number|string} ts
 * @returns {string} e.g. "15m ago", "2h ago", "Yesterday", "3d ago", "Oct 12, 2026"
 */
export function formatRelativeTime(ts) {
  if (!ts) return 'Recent';
  const timeMs = (typeof ts === 'number' && ts < 10000000000) ? ts * 1000 : new Date(ts).getTime();
  if (isNaN(timeMs)) return 'Recent';
  const diffSec = Math.floor((Date.now() - timeMs) / 1000);
  if (diffSec < 0) return 'Just now';
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  const d = new Date(timeMs);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Helper to fetch question difficulty & topicTags for a specific titleSlug
 * @param {string} titleSlug
 * @returns {Promise<{difficulty: string, topicTags: string[]}>}
 */
async function fetchQuestionDetails(titleSlug) {
  if (!titleSlug) return { difficulty: 'Medium', topicTags: ['Algorithms'] };
  if (questionDetailsCache.has(titleSlug)) {
    return questionDetailsCache.get(titleSlug);
  }

  try {
    const res = await axios.post(
      'https://leetcode.com/graphql',
      {
        query: `query getQuestion($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            difficulty
            topicTags {
              name
            }
          }
        }`,
        variables: { titleSlug }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (DevPulse Developer Intelligence Agent)'
        },
        timeout: 4000
      }
    );

    const q = res.data?.data?.question;
    const details = {
      difficulty: q?.difficulty || 'Medium',
      topicTags: (q?.topicTags || []).map(t => t.name)
    };
    questionDetailsCache.set(titleSlug, details);
    return details;
  } catch (err) {
    const fallback = { difficulty: 'Medium', topicTags: ['Algorithms'] };
    questionDetailsCache.set(titleSlug, fallback);
    return fallback;
  }
}

/**
 * Concurrently fetch details in chunks to prevent socket starvation
 */
async function batchFetchQuestionDetails(slugs, chunkSize = 5) {
  const map = new Map();
  for (let i = 0; i < slugs.length; i += chunkSize) {
    const chunk = slugs.slice(i, i + chunkSize);
    const results = await Promise.all(
      chunk.map(async (slug) => {
        const details = await fetchQuestionDetails(slug);
        return { slug, details };
      })
    );
    for (const { slug, details } of results) {
      map.set(slug, details);
    }
  }
  return map;
}

/**
 * Fetch public LeetCode stats via GraphQL endpoint
 * @param {string} username - LeetCode handle
 * @returns {Promise<object>} Structured stats from LeetCode including recentAcSubmissionList
 */
export async function fetchLeetCodeStats(username) {
  if (!username || typeof username !== 'string') {
    throw new Error('LeetCode username is required');
  }

  const cleanUsername = username.trim().replace(/^@/, '');

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        githubUrl
        profile {
          ranking
          reputation
          starRating
          realName
          userAvatar
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        submissionCalendar
        tagProblemCounts {
          advanced {
            tagName
            problemsSolved
          }
          intermediate {
            tagName
            problemsSolved
          }
          fundamental {
            tagName
            problemsSolved
          }
        }
      }
      recentAcSubmissionList(username: $username, limit: 50) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  const response = await axios.post(
    'https://leetcode.com/graphql',
    {
      query,
      variables: { username: cleanUsername }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (DevPulse Developer Intelligence Agent)'
      },
      timeout: 15000
    }
  );

  const matchedUser = response.data?.data?.matchedUser;
  if (!matchedUser) {
    throw new Error(`LeetCode profile not found for username "${cleanUsername}"`);
  }

  const rawRecent = response.data?.data?.recentAcSubmissionList || [];

  const submissions = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
  const allSolved = submissions.find(s => s.difficulty === 'All')?.count || 0;
  const easySolved = submissions.find(s => s.difficulty === 'Easy')?.count || 0;
  const mediumSolved = submissions.find(s => s.difficulty === 'Medium')?.count || 0;
  const hardSolved = submissions.find(s => s.difficulty === 'Hard')?.count || 0;

  const totalSubmissions = submissions.find(s => s.difficulty === 'All')?.submissions || 0;
  const acceptanceRate = totalSubmissions > 0
    ? Math.round((allSolved / totalSubmissions) * 100)
    : 68;

  // Parse submission calendar
  let calendarMap = {};
  let activeDays = 0;
  let totalSubmissionsCount = 0;
  try {
    if (matchedUser.submissionCalendar) {
      calendarMap = typeof matchedUser.submissionCalendar === 'string'
        ? JSON.parse(matchedUser.submissionCalendar)
        : matchedUser.submissionCalendar;
      
      const timestamps = Object.keys(calendarMap);
      activeDays = timestamps.length;
      totalSubmissionsCount = Object.values(calendarMap).reduce((acc, curr) => acc + Number(curr || 0), 0);
    }
  } catch (err) {
    console.warn('Could not parse LeetCode submissionCalendar:', err.message);
  }

  // Calculate streak from calendar
  let currentStreak = 0;
  if (Object.keys(calendarMap).length > 0) {
    const sortedDays = Object.keys(calendarMap)
      .map(t => new Date(Number(t) * 1000).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);

    const today = new Date().setHours(0, 0, 0, 0);
    const oneDay = 86400000;
    
    let checkDay = today;
    if (!sortedDays.includes(today)) {
      checkDay = today - oneDay;
    }

    if (sortedDays.includes(checkDay)) {
      let dayPointer = checkDay;
      while (sortedDays.includes(dayPointer)) {
        currentStreak++;
        dayPointer -= oneDay;
      }
    }
  }

  // Fetch difficulty and topic tags for recent submissions
  const uniqueSlugs = [...new Set(rawRecent.map(r => r.titleSlug).filter(Boolean))];
  const questionDetailsMap = await batchFetchQuestionDetails(uniqueSlugs);

  // Map raw recent submissions into rich problem objects
  const recentSubmissions = rawRecent.map((sub, index) => {
    const details = questionDetailsMap.get(sub.titleSlug) || {
      difficulty: 'Medium',
      topicTags: ['Algorithms']
    };
    const category = details.topicTags?.length
      ? details.topicTags.join(', ')
      : 'Algorithms';

    return {
      id: sub.id || `lc_${sub.titleSlug}_${index}`,
      problemId: sub.id || `${sub.titleSlug}_${sub.timestamp}`,
      title: sub.title,
      titleSlug: sub.titleSlug,
      url: `https://leetcode.com/problems/${sub.titleSlug}`,
      difficulty: details.difficulty || 'Medium',
      category,
      topicTags: details.topicTags || ['Algorithms'],
      platform: 'LeetCode',
      solved: true,
      timestamp: sub.timestamp ? Number(sub.timestamp) : Math.floor(Date.now() / 1000),
      date: formatRelativeTime(sub.timestamp),
      solvedAt: sub.timestamp ? new Date(Number(sub.timestamp) * 1000) : new Date(),
      accuracy: '100%'
    };
  });

  return {
    username: matchedUser.username,
    profile: matchedUser.profile || {},
    ranking: matchedUser.profile?.ranking || 0,
    reputation: matchedUser.profile?.reputation || 0,
    solved: allSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    acceptanceRate,
    activeDays: Math.max(activeDays, 1),
    currentStreak: Math.max(currentStreak, 1),
    totalSubmissions: totalSubmissionsCount,
    submissionCalendar: calendarMap,
    tagProblemCounts: matchedUser.tagProblemCounts || {},
    recentSubmissions
  };
}
