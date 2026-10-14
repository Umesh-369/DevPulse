import mongoose from 'mongoose';

const platformStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    platform: {
      type: String,
      required: true,
      index: true,
      enum: ['leetcode', 'github', 'codechef', 'hackerrank', 'geeksforgeeks', 'atcoder']
    },
    handle: {
      type: String,
      required: true
    },
    totalContributions: {
      type: Number,
      default: 0
    },
    heatmap: [
      {
        date: { type: String, required: true },
        count: { type: Number, default: 0 },
        level: { type: Number, default: 0 }
      }
    ],
    stats: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    lastSynced: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

platformStatsSchema.index({ userId: 1, platform: 1 }, { unique: true });

export const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema);
