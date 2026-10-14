export const initialUser = {
  id: 'usr_default',
  name: 'Developer',
  email: 'developer@devpulse.local',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
  role: 'Full Stack & AI Developer',
  college: '',
  bio: '',
  verified: false,
  targetRole: 'Software Engineer',
  theme: 'dark',
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

// No hardcoded mock projects
export const initialProjects = [];

// No hardcoded demo leaderboard developers
export const leaderboardData = [];

export const aiCoachData = {
  overallScore: null,
  skills: [
    { name: 'Data Structures', level: 88, color: '#10B981', details: 'Mastery in Heaps, Tries, Segment Trees' },
    { name: 'Algorithms', level: 76, color: '#3B82F6', details: 'Proficient in DP, Greedy, Shortest Paths' },
    { name: 'System Design', level: 64, color: '#F59E0B', details: 'Needs focus on Distributed Consensus and Sharding' },
    { name: 'Web Development', level: 92, color: '#8B5CF6', details: 'Elite competency in React, Node, REST, Next.js' },
    { name: 'Machine Learning', level: 70, color: '#EC4899', details: 'Strong fundamentals in PyTorch, RAG, Transformers' }
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
        { id: 't2', text: 'Dijkstra & Bellman-Ford Shortest Path algorithms', done: true },
        { id: 't3', text: 'Minimum Spanning Trees (Kruskal & Prim)', done: false },
        { id: 't4', text: 'Topological Sort & Tarjan Strongly Connected Components', done: false },
        { id: 't5', text: '1D Dynamic Programming Foundations & Memoization', done: true },
        { id: 't6', text: '2D Grid & 0/1 Knapsack DP Patterns', done: false },
        { id: 't7', text: 'DP on Trees & Bitmask DP Practice', done: false }
      ]
    },
    {
      id: 'road_2',
      title: 'Learn System Design',
      subtitle: 'Start with basic concepts',
      duration: '4-6 weeks',
      status: 'upcoming',
      tasks: [
        { id: 't8', text: 'Horizontal vs Vertical scaling & Load Balancers (L4/L7)', done: true },
        { id: 't9', text: 'Database Sharding, Replication & CAP Theorem', done: false },
        { id: 't10', text: 'Caching Strategies (Redis / Memcached, Cache-Aside)', done: false },
        { id: 't11', text: 'Message Queues & Event-Driven Architecture (Kafka)', done: false },
        { id: 't12', text: 'Designing a Scalable Rate Limiter & URL Shortener', done: false }
      ]
    },
    {
      id: 'road_3',
      title: 'Build Real-world Projects',
      subtitle: 'Apply your skills in projects',
      duration: 'Ongoing',
      status: 'active',
      tasks: [
        { id: 't13', text: 'Architect End-to-End Microservices with Docker & Kubernetes', done: true },
        { id: 't14', text: 'Implement Real-Time WebSockets & Prometheus Observability', done: false },
        { id: 't15', text: 'Deploy CI/CD pipelines with GitHub Actions & AWS Cloud', done: false }
      ]
    }
  ],
  recommendations: [
    {
      id: 'rec_1',
      title: 'Practice 2 problems daily',
      subtitle: 'Maintain your streak and build muscle memory for interview rounds.',
      tag: 'DSA Consistency',
      type: 'practice',
      link: '/problems'
    },
    {
      id: 'rec_2',
      title: 'Explore Modern Frameworks',
      subtitle: 'Deepen full-stack proficiency with Next.js, Node.js, and serverless architectures.',
      tag: 'Framework Skillup',
      type: 'learning',
      link: 'https://nextjs.org/docs'
    },
    {
      id: 'rec_3',
      title: 'Contribute to Open Source',
      subtitle: 'Boost your GitHub profile and showcase collaboration in production codebases.',
      tag: 'GitHub Visibility',
      type: 'contribution',
      link: '/repositories'
    }
  ]
};

export const languageDistribution = [
  { name: 'JavaScript', percentage: 35, color: '#F7DF1E', lines: '24,000' },
  { name: 'Python', percentage: 30, color: '#3776AB', lines: '20,000' },
  { name: 'TypeScript', percentage: 20, color: '#3178C6', lines: '14,000' },
  { name: 'Java', percentage: 15, color: '#EA2D2E', lines: '10,000' }
];

export const problemSolvingTrend = [
  { month: 'Jan', solved: 20, target: 30, label: 'Jan' },
  { month: 'Feb', solved: 35, target: 40, label: 'Feb' },
  { month: 'Mar', solved: 50, target: 50, label: 'Mar' },
  { month: 'Apr', solved: 75, target: 60, label: 'Apr' },
  { month: 'May', solved: 110, target: 80, label: 'May' },
  { month: 'Jun', solved: 152, target: 100, label: 'Jun' }
];

export const platformBarChart = [
  { month: 'Jan', LeetCode: 15, CodeChef: 5, HackerRank: 0, GFG: 0 },
  { month: 'Feb', LeetCode: 30, CodeChef: 10, HackerRank: 0, GFG: 0 },
  { month: 'Mar', LeetCode: 45, CodeChef: 15, HackerRank: 0, GFG: 0 },
  { month: 'Apr', LeetCode: 70, CodeChef: 20, HackerRank: 0, GFG: 0 },
  { month: 'May', LeetCode: 105, CodeChef: 25, HackerRank: 0, GFG: 0 },
  { month: 'Jun', LeetCode: 152, CodeChef: 30, HackerRank: 0, GFG: 0 }
];

export const achievementsList = [];

export const sampleProblems = [];

export const sampleRepositories = [];

export const sampleGoals = [
  { id: 'g1', title: 'Solve 200 Problems on LeetCode', current: 0, target: 200, unit: 'Problems', deadline: 'Dec 2026', category: 'DSA', progress: 0 },
  { id: 'g2', title: 'Maintain 30-Day Streak', current: 0, target: 30, unit: 'Days', deadline: 'Dec 2026', category: 'Consistency', progress: 0 }
];
