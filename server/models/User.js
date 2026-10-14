import mongoose from 'mongoose';

const projectSubSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    stars: {
      type: Number,
      default: 0
    },
    forks: {
      type: Number,
      default: 0
    },
    demoUrl: {
      type: String,
      default: ''
    },
    githubUrl: {
      type: String,
      default: ''
    },
    featured: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Developer',
      trim: true
    },
    username: {
      type: String,
      trim: true,
      sparse: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
    },
    role: {
      type: String,
      default: 'Full Stack & AI Developer'
    },
    college: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    githubUrl: {
      type: String,
      default: ''
    },
    leetcodeUrl: {
      type: String,
      default: ''
    },
    linkedinUrl: {
      type: String,
      default: ''
    },
    targetRole: {
      type: String,
      default: 'Senior Full Stack & AI Engineer'
    },
    theme: {
      type: String,
      default: 'dark'
    },
    openRouterApiKey: {
      type: String,
      default: ''
    },
    verified: {
      type: Boolean,
      default: false
    },
    isNewUser: {
      type: Boolean,
      default: false
    },
    google: {
      id: { type: String },
      email: { type: String },
      accessToken: { type: String }
    },
    github: {
      id: { type: String },
      username: { type: String },
      accessToken: { type: String },
      profileUrl: { type: String }
    },
    projects: {
      type: [projectSubSchema],
      default: []
    },
    stats: {
      problemsSolved: { type: Number, default: 0 },
      problemsGrowth: { type: String, default: '+0%' },
      currentStreak: { type: Number, default: 0 },
      streakGrowth: { type: String, default: '+0 days' },
      totalRepositories: { type: Number, default: 0 },
      reposGrowth: { type: String, default: '+0 this month' },
      achievementsCount: { type: Number, default: 0 },
      achievementsGrowth: { type: String, default: '+0 new' },
      totalContributions: { type: Number, default: 0 },
      contributionsGrowth: { type: String, default: '+0%' },
      rating: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
      leetcodeProblems: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      activeDays: { type: Number, default: 0 },
      pullRequests: { type: Number, default: 0 }
    },
    connectedPlatforms: {
      github: {
        connected: { type: Boolean, default: false },
        handle: { type: String, default: '' },
        verified: { type: Boolean, default: false },
        contributions: { type: Number, default: 0 },
        repos: { type: Number, default: 0 },
        lastSynced: { type: Date }
      },
      leetcode: {
        connected: { type: Boolean, default: false },
        handle: { type: String, default: '' },
        verified: { type: Boolean, default: false },
        solved: { type: Number, default: 0 },
        easySolved: { type: Number, default: 0 },
        mediumSolved: { type: Number, default: 0 },
        hardSolved: { type: Number, default: 0 },
        ranking: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        lastSynced: { type: Date }
      },
      codechef: {
        connected: { type: Boolean, default: false },
        handle: { type: String, default: '' },
        verified: { type: Boolean, default: false },
        stars: { type: String, default: '' },
        rating: { type: Number, default: 0 },
        lastSynced: { type: Date }
      },
      hackerrank: {
        connected: { type: Boolean, default: false },
        handle: { type: String, default: '' },
        verified: { type: Boolean, default: false },
        badges: { type: Number, default: 0 },
        stars: { type: Number, default: 0 },
        lastSynced: { type: Date }
      },
      geeksforgeeks: {
        connected: { type: Boolean, default: false },
        handle: { type: String, default: '' },
        verified: { type: Boolean, default: false },
        score: { type: Number, default: 0 },
        solved: { type: Number, default: 0 },
        lastSynced: { type: Date }
      },
      atcoder: {
        connected: { type: Boolean, default: false },
        handle: { type: String, default: '' },
        verified: { type: Boolean, default: false },
        rating: { type: Number, default: 0 },
        rank: { type: String, default: '' },
        lastSynced: { type: Date }
      }
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model('User', userSchema);
