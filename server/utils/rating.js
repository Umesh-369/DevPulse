/**
 * DevPulse Developer Rating & Badge Calculator
 * Strictly calculated from real synced telemetry, defaulting to 0.
 */
export function calculateRating(stats = {}) {
  const solved = stats.problemsSolved ?? stats.solved ?? (
    (stats.easySolved || 0) + (stats.mediumSolved || 0) + (stats.hardSolved || 0)
  ) ?? 0;

  const repos = stats.totalRepositories ?? stats.publicRepos ?? stats.repos ?? 0;
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

export function getBadgeTitle(rating, problems) {
  if (rating >= 2400 || problems >= 1000) return 'Grandmaster';
  if (rating >= 2000 || problems >= 500) return 'Master';
  if (rating >= 1800 || problems >= 250) return 'Expert';
  if (rating >= 1400 || problems >= 100) return 'Specialist';
  if (problems >= 10) return 'Pupil';
  return 'Newbie';
}
