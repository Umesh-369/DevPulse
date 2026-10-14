import axios from 'axios';

/**
 * Fetch public LeetCode stats via GraphQL endpoint
 * @param {string} username - LeetCode handle
 * @returns {Promise<object>} Structured stats from LeetCode
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
      timeout: 12000
    }
  );

  const matchedUser = response.data?.data?.matchedUser;
  if (!matchedUser) {
    throw new Error(`LeetCode profile not found for username "${cleanUsername}"`);
  }

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
    
    // Check if solved today or yesterday
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
    tagProblemCounts: matchedUser.tagProblemCounts || {}
  };
}
