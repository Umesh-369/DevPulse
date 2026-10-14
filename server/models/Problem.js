import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    problemId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    titleSlug: {
      type: String,
      trim: true,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    platform: {
      type: String,
      enum: ['LeetCode', 'CodeChef', 'GeeksforGeeks', 'HackerRank', 'AtCoder', 'Custom', 'Other'],
      default: 'LeetCode'
    },
    category: {
      type: String,
      default: 'Algorithms'
    },
    topicTags: {
      type: [String],
      default: []
    },
    solved: {
      type: Boolean,
      default: true
    },
    solvedAt: {
      type: Date,
      default: Date.now
    },
    url: {
      type: String,
      default: ''
    },
    accuracy: {
      type: String,
      default: '100%'
    },
    isCustom: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate entries per user & problem
problemSchema.index({ userId: 1, problemId: 1, platform: 1 }, { unique: true });
problemSchema.index({ userId: 1, titleSlug: 1, platform: 1 });

export const Problem = mongoose.model('Problem', problemSchema);
