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

  // Calculate estimated contributions / pull requests
  const publicRepos = userData.public_repos ?? formattedRepositories.length;
  const estimatedContributions = Math.max(
    (userData.followers || 0) * 5 + totalStars * 4 + publicRepos * 18,
    350
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
    contributions: estimatedContributions,
    languageDistribution,
    repositories: formattedRepositories
  };
}
