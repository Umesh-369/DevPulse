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
