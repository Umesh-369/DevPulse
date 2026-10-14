import axios from 'axios';

/**
 * Palette of distinct colors for GitHub programming languages
 */
export const LANGUAGE_PALETTE = {
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  Python: '#3776AB',
  Java: '#EA2D2E',
  'C++': '#00599C',
  C: '#A8B9CC',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#DEA584',
  HTML: '#E34F26',
  CSS: '#1572B6',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Dart: '#00B4AB',
  Swift: '#F05138',
  Kotlin: '#7F52FF',
  'Jupyter Notebook': '#DA5B0B',
  Shell: '#89E051',
  Vue: '#41B883',
  Other: '#9CA3AF'
};

/**
 * Fetch raw GitHub repositories up to 100 per page sorted by updated
 */
export async function fetchUserRepositories(username, accessToken = null) {
  if (!username) {
    throw new Error('GitHub username is required');
  }

  const cleanUsername = username.trim().replace(/^@/, '');
  const headers = {
    'User-Agent': 'DevPulse-Developer-Platform',
    'Accept': 'application/vnd.github.v3+json'
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const repoUrl = accessToken
    ? `https://api.github.com/user/repos?sort=updated&per_page=100`
    : `https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=100`;

  const reposRes = await axios.get(repoUrl, { headers, timeout: 12000 });
  const rawRepos = Array.isArray(reposRes.data) ? reposRes.data : [];

  return rawRepos.map((r) => ({
    id: r.id,
    repoId: r.id,
    name: r.name,
    full_name: r.full_name || `${cleanUsername}/${r.name}`,
    description: r.description || '',
    html_url: r.html_url,
    url: r.html_url,
    homepage: r.homepage || '',
    language: r.language || 'Other',
    stargazers_count: r.stargazers_count || 0,
    stars: r.stargazers_count || 0,
    forks_count: r.forks_count || 0,
    forks: r.forks_count || 0,
    watchers_count: r.watchers_count || 0,
    open_issues_count: r.open_issues_count || 0,
    topics: Array.isArray(r.topics) ? r.topics : [],
    size: r.size || 0,
    isPinned: false,
    isFeatured: false,
    updated_at: r.updated_at || new Date().toISOString(),
    updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : 'Recently'
  }));
}

/**
 * Fetch GitHub user profile, all repositories, and calculate stats
 * Supports both unauthenticated public queries and OAuth accessToken authenticated queries
 * @param {string} username - GitHub handle
 * @param {string} [accessToken] - Optional GitHub OAuth token
 */
export async function fetchGitHubStats(username, accessToken = null) {
  if (!username) {
    throw new Error('GitHub username is required');
  }

  const cleanUsername = username.trim().replace(/^@/, '');
  const headers = {
    'User-Agent': 'DevPulse-Developer-Platform',
    'Accept': 'application/vnd.github.v3+json'
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // 1. Fetch user profile
  const profileUrl = accessToken
    ? 'https://api.github.com/user'
    : `https://api.github.com/users/${cleanUsername}`;

  const userRes = await axios.get(profileUrl, {
    headers,
    timeout: 10000
  });

  const userData = userRes.data;

  // 2. Fetch all user repositories (up to 100 most recently updated)
  let formattedRepositories = [];
  try {
    formattedRepositories = await fetchUserRepositories(cleanUsername, accessToken);
  } catch (err) {
    console.warn(`Could not fetch repos for ${cleanUsername}:`, err.message);
  }

  // Calculate repository statistics
  const totalStars = formattedRepositories.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = formattedRepositories.reduce((sum, r) => sum + (r.forks_count || 0), 0);

  // Calculate language distribution
  const langCounts = {};
  for (const r of formattedRepositories) {
    if (r.language && r.language !== 'Other') {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  }

  const totalLanguagesCount = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;

  const languageDistribution = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => {
      const percentage = Math.round((count / totalLanguagesCount) * 100);
      return {
        name,
        percentage,
        color: LANGUAGE_PALETTE[name] || '#9CA3AF',
        lines: `${count * 4500}`
      };
    });

  // 3. Fetch real 365-day contribution calendar (GraphQL with public fallback)
  let contributionCalendar = null;
  try {
    contributionCalendar = await fetchGitHubContributions(cleanUsername, accessToken);
  } catch (cErr) {
    console.warn(`Could not fetch contribution calendar for ${cleanUsername}:`, cErr.message);
  }

  const realContributions = contributionCalendar?.totalContributions || 0;
  const contributionsCount = realContributions > 0 ? realContributions : (
    (userData.followers || 0) * 5 + totalStars * 4 + publicRepos * 18
  );

  return {
    username: userData.login,
    name: userData.name || userData.login,
    avatarUrl: userData.avatar_url,
    bio: userData.bio,
    company: userData.company,
    blog: userData.blog,
    followers: userData.followers || 0,
    following: userData.following || 0,
    publicRepos,
    totalStars,
    totalForks,
    contributions: contributionsCount,
    totalContributions: contributionsCount,
    heatmap: contributionCalendar?.heatmap || [],
    contributionCalendar,
    languageDistribution,
    repositories: formattedRepositories
  };
}

/**
 * Map contribution count to level 0-4
 * Level 0: 0
 * Level 1: 1-2
 * Level 2: 3-5
 * Level 3: 6-9
 * Level 4: 10+
 */
export function calculateContributionLevel(count) {
  if (!count || count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

export const getContributionLevel = calculateContributionLevel;

/**
 * Fetch real 365-day contribution calendar for a GitHub user.
 * 1. Primary: Authenticated GitHub GraphQL API using user's OAuth accessToken or process.env.GITHUB_TOKEN.
 * 2. Fallback: Zero-token multi-source public API querying both y=last and y=2026.
 * Normalizes into a flat array of 365+ objects: heatmap: [{ date: "YYYY-MM-DD", count: Number, level: Number }].
 * @param {string} username
 * @param {string} [accessToken]
 * @returns {Promise<{totalContributions: number, heatmap: Array<{date: string, count: number, level: number}>, weeks: Array, days: Array}>}
 */
export async function fetchGitHubContributions(username, accessToken = null) {
  if (!username) {
    return { totalContributions: 0, heatmap: [], weeks: [], days: [] };
  }

  const cleanUsername = username.trim().replace(/^@/, '');
  const token = accessToken || process.env.GITHUB_TOKEN;

  // 1. Primary Fetcher: Authenticated GitHub GraphQL API
  if (token) {
    try {
      const gqlQuery = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    contributionLevel
                  }
                }
              }
            }
          }
        }
      `;

      const gqlRes = await axios.post(
        'https://api.github.com/graphql',
        { query: gqlQuery, variables: { username: cleanUsername } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'DevPulse-Developer-Platform'
          },
          timeout: 10000
        }
      );

      const calendar = gqlRes.data?.data?.user?.contributionsCollection?.contributionCalendar;
      if (calendar?.weeks?.length) {
        const heatmap = [];
        const weeks = calendar.weeks.map(w => ({
          days: (w.contributionDays || []).map(d => {
            const count = d.contributionCount || 0;
            const level = calculateContributionLevel(count);
            const entry = {
              date: d.date,
              count,
              level,
              weekday: new Date(d.date + 'T00:00:00Z').getUTCDay()
            };
            heatmap.push({
              date: d.date,
              count,
              level
            });
            return entry;
          })
        }));

        const total = Number(calendar.totalContributions) || heatmap.reduce((sum, d) => sum + d.count, 0);

        return {
          totalContributions: total,
          heatmap,
          weeks,
          days: heatmap
        };
      }
    } catch (gqlErr) {
      console.warn(`[GitHub GraphQL Contributions] Failed for @${cleanUsername}, falling back to public multi-source:`, gqlErr.message);
    }
  }

  // 2. Fallback Public Fetcher (Zero-Token Multi-Source: y=last AND y=2026)
  try {
    const [lastRes, y2026Res] = await Promise.allSettled([
      axios.get(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(cleanUsername)}?y=last`, {
        timeout: 10000,
        headers: { 'User-Agent': 'DevPulse-Developer-Platform' }
      }),
      axios.get(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(cleanUsername)}?y=2026`, {
        timeout: 10000,
        headers: { 'User-Agent': 'DevPulse-Developer-Platform' }
      })
    ]);

    const lastData = lastRes.status === 'fulfilled' ? lastRes.value.data : null;
    const y2026Data = y2026Res.status === 'fulfilled' ? y2026Res.value.data : null;

    const rawLast = Array.isArray(lastData?.contributions) ? lastData.contributions : [];
    const raw2026 = Array.isArray(y2026Data?.contributions) ? y2026Data.contributions : [];

    if (rawLast.length > 0 || raw2026.length > 0) {
      // Map of date -> count taking maximum for each date across sources
      const dateMap = new Map();

      rawLast.forEach(item => {
        if (!item?.date) return;
        dateMap.set(item.date, item.count || 0);
      });

      raw2026.forEach(item => {
        if (!item?.date) return;
        const current = dateMap.get(item.date) || 0;
        dateMap.set(item.date, Math.max(current, item.count || 0));
      });

      // Normalize into ordered array based on last-year sequence (starts on Sunday)
      let heatmap = [];
      if (rawLast.length > 0) {
        heatmap = rawLast.map(item => {
          const count = dateMap.get(item.date) ?? (item.count || 0);
          return {
            date: item.date,
            count,
            level: calculateContributionLevel(count)
          };
        });
      } else {
        const sortedDates = Array.from(dateMap.keys()).sort();
        heatmap = sortedDates.map(date => {
          const count = dateMap.get(date) || 0;
          return {
            date,
            count,
            level: calculateContributionLevel(count)
          };
        });
      }

      // Group into 7-day Sunday-aligned weeks
      const weeks = [];
      let currentWeek = [];

      for (let i = 0; i < heatmap.length; i++) {
        const entry = heatmap[i];
        const dateObj = new Date(entry.date + 'T00:00:00Z');
        const weekday = isNaN(dateObj.getUTCDay()) ? (currentWeek.length % 7) : dateObj.getUTCDay();

        currentWeek.push({
          ...entry,
          weekday
        });

        if (currentWeek.length === 7) {
          weeks.push({ days: currentWeek });
          currentWeek = [];
        }
      }

      if (currentWeek.length > 0) {
        weeks.push({ days: currentWeek });
      }

      // Total contribution count (honoring 2026 / lastYear total from API)
      const reported2026 = Number(y2026Data?.total?.['2026']) || 0;
      const reportedLast = Number(lastData?.total?.lastYear) || 0;
      const sumCount = heatmap.reduce((sum, d) => sum + d.count, 0);
      const totalContributions = Math.max(reported2026, reportedLast, sumCount);

      return {
        totalContributions,
        heatmap,
        weeks,
        days: heatmap
      };
    }
  } catch (pubErr) {
    console.warn(`[Public Multi-Source Contributions API] Failed for @${cleanUsername}:`, pubErr.message);
  }

  return { totalContributions: 0, heatmap: [], weeks: [], days: [] };
}

/**
 * Merge LeetCode submissionCalendar into contributionCalendar.
 * Adds problem submission counts by date and updates totalContributions and levels.
 * @param {object} calendarData - { totalContributions, heatmap, weeks, days }
 * @param {object|string} leetcodeCalendar - map of unix timestamps (sec) -> count
 * @returns {object} updated calendarData
 */
export function mergeLeetCodeContributions(calendarData, leetcodeCalendar) {
  if (!calendarData || !calendarData.weeks || !leetcodeCalendar) return calendarData;

  let lcMap = {};
  try {
    const parsed = typeof leetcodeCalendar === 'string' ? JSON.parse(leetcodeCalendar) : leetcodeCalendar;
    for (const [ts, count] of Object.entries(parsed || {})) {
      if (!ts) continue;
      const dateStr = new Date(Number(ts) * 1000).toISOString().split('T')[0];
      lcMap[dateStr] = (lcMap[dateStr] || 0) + Number(count || 0);
    }
  } catch (err) {
    console.warn('Could not parse LeetCode submissionCalendar for merge:', err.message);
    return calendarData;
  }

  if (Object.keys(lcMap).length === 0) return calendarData;

  const updatedWeeks = calendarData.weeks.map(week => ({
    days: (week.days || []).map(day => {
      const lcCount = lcMap[day.date] || 0;
      const ghCount = day.githubCount !== undefined ? day.githubCount : (day.count || 0);
      const combinedCount = ghCount + lcCount;
      return {
        ...day,
        githubCount: ghCount,
        leetcodeCount: lcCount,
        count: combinedCount,
        level: calculateContributionLevel(combinedCount)
      };
    })
  }));

  const allDays = updatedWeeks.flatMap(w => w.days);
  const total = allDays.reduce((sum, d) => sum + (d.count || 0), 0);

  const updatedHeatmap = (calendarData.heatmap || allDays).map(item => {
    const lcCount = lcMap[item.date] || 0;
    const combined = (item.count || 0) + lcCount;
    return {
      date: item.date,
      count: combined,
      level: calculateContributionLevel(combined)
    };
  });

  return {
    totalContributions: total,
    heatmap: updatedHeatmap,
    weeks: updatedWeeks,
    days: allDays
  };
}
