export const initialUserData = {
  id: 'usr_default',
  name: 'Developer',
  email: '',
  role: 'Full Stack & AI Developer',
  college: '',
  bio: '',
  verified: false,
  targetRole: 'Software Engineer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
  stats: {
    problemsSolved: 0,
    problemsGrowth: '+0%',
    currentStreak: 0,
    streakGrowth: '+0 days',
    totalRepositories: 0,
    reposGrowth: '+0 this month',
    achievementsCount: 0,
    achievementsGrowth: '+0 new',
    totalContributions: 0,
    contributionsGrowth: '+0%',
    rating: 0,
    followers: 0,
    following: 0,
    leetcodeProblems: 0,
    acceptanceRate: 0,
    activeDays: 0,
    pullRequests: 0
  },
  connectedPlatforms: {}
};

// No mock projects
export const initialProjectsData = [];

// No demo leaderboard users
export const leaderboardInitialData = [];

export const aiCoachInitialData = {
  overallScore: 80,
  skills: [
    { name: 'Data Structures', level: 85, color: '#10B981', details: 'Core foundations in Trees, Graphs, Hash Tables' },
    { name: 'Algorithms', level: 75, color: '#3B82F6', details: 'Proficient in DP, Greedy, Binary Search' },
    { name: 'System Design', level: 65, color: '#F59E0B', details: 'Scalability, Caching, and RESTful APIs' },
    { name: 'Web Development', level: 90, color: '#8B5CF6', details: 'React, Node, Express, Next.js' }
  ],
  roadmap: [
    {
      id: 'road_1',
      title: 'Master Advanced DSA',
      subtitle: 'Focus on Graphs and DP',
      duration: '2-3 weeks',
      status: 'in-progress',
      tasks: [
        { id: 't1', text: 'Graph Representations & BFS/DFS traversal patterns', done: true },
        { id: 't2', text: 'Dijkstra & Bellman-Ford Shortest Path algorithms', done: false },
        { id: 't3', text: 'Minimum Spanning Trees (Kruskal & Prim)', done: false },
        { id: 't4', text: 'Dynamic Programming Foundations & Memoization', done: true },
        { id: 't5', text: '2D Grid & Knapsack DP Patterns', done: false }
      ]
    },
    {
      id: 'road_2',
      title: 'Learn System Design',
      subtitle: 'Start with fundamental concepts',
      duration: '4-6 weeks',
      status: 'upcoming',
      tasks: [
        { id: 't6', text: 'Horizontal vs Vertical scaling & Load Balancers', done: true },
        { id: 't7', text: 'Database Sharding, Replication & CAP Theorem', done: false },
        { id: 't8', text: 'Caching Strategies (Redis / Memcached)', done: false }
      ]
    }
  ],
  recommendations: [
    {
      id: 'rec_1',
      title: 'Practice Daily Coding',
      subtitle: 'Solve at least 1 problem every day to maintain consistency.',
      tag: 'DSA Consistency',
      type: 'practice',
      link: '/problems'
    },
    {
      id: 'rec_2',
      title: 'Sync Developer Accounts',
      subtitle: 'Connect your GitHub and LeetCode to unlock automated portfolio telemetry.',
      tag: 'Portfolio Sync',
      type: 'learning',
      link: '/settings'
    }
  ]
};

export const languageDistributionData = [
  { name: 'JavaScript', percentage: 40, color: '#F7DF1E', lines: '12,000' },
  { name: 'Python', percentage: 35, color: '#3776AB', lines: '10,500' },
  { name: 'TypeScript', percentage: 25, color: '#3178C6', lines: '7,500' }
];

export const problemSolvingTrendData = [
  { month: 'Jan', solved: 20, target: 30 },
  { month: 'Feb', solved: 35, target: 40 },
  { month: 'Mar', solved: 50, target: 50 },
  { month: 'Apr', solved: 75, target: 60 },
  { month: 'May', solved: 110, target: 80 },
  { month: 'Jun', solved: 152, target: 100 }
];

export const platformBarChartData = [
  { month: 'Jan', LeetCode: 15, CodeChef: 5, HackerRank: 0, GFG: 0 },
  { month: 'Feb', LeetCode: 30, CodeChef: 10, HackerRank: 0, GFG: 0 },
  { month: 'Mar', LeetCode: 45, CodeChef: 15, HackerRank: 0, GFG: 0 },
  { month: 'Apr', LeetCode: 70, CodeChef: 20, HackerRank: 0, GFG: 0 },
  { month: 'May', LeetCode: 105, CodeChef: 25, HackerRank: 0, GFG: 0 },
  { month: 'Jun', LeetCode: 152, CodeChef: 30, HackerRank: 0, GFG: 0 }
];

export const achievementsData = [];

export const sampleProblemsData = [
  { id: 'p1', title: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode', category: 'Array / Hash Table', solved: true, date: 'Recent', accuracy: '89%' },
  { id: 'p2', title: 'LRU Cache Implementation', difficulty: 'Medium', platform: 'LeetCode', category: 'Design / Linked List', solved: true, date: 'Recent', accuracy: '74%' },
  { id: 'p3', title: 'Valid Parentheses', difficulty: 'Easy', platform: 'LeetCode', category: 'Stack', solved: true, date: 'Recent', accuracy: '91%' }
];

export const sampleRepositoriesData = [];

export const sampleGoalsData = [
  { id: 'g1', title: 'Solve 200 Problems on LeetCode', current: 0, target: 200, unit: 'Problems', deadline: 'Dec 2026', category: 'DSA', progress: 0 },
  { id: 'g2', title: 'Maintain 30-Day Streak', current: 0, target: 30, unit: 'Days', deadline: 'Dec 2026', category: 'Consistency', progress: 0 }
];
