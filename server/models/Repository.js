import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    repoId: {
      type: Number,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    full_name: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    html_url: {
      type: String,
      required: true
    },
    homepage: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'Other'
    },
    stargazers_count: {
      type: Number,
      default: 0
    },
    forks_count: {
      type: Number,
      default: 0
    },
    watchers_count: {
      type: Number,
      default: 0
    },
    open_issues_count: {
      type: Number,
      default: 0
    },
    topics: {
      type: [String],
      default: []
    },
    size: {
      type: Number,
      default: 0
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index so a user cannot have duplicate repos
repositorySchema.index({ userId: 1, repoId: 1 }, { unique: true });

export const Repository = mongoose.model('Repository', repositorySchema);
