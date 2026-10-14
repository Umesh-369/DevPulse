import mongoose from 'mongoose';

const taskSubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    done: { type: Boolean, default: false }
  },
  { _id: false }
);

const roadmapSubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    duration: { type: String, default: '2-3 weeks' },
    status: { type: String, default: 'In Progress' },
    tasks: { type: [taskSubSchema], default: [] }
  },
  { _id: false }
);

const skillAnalysisSubSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    score: { type: Number, default: 70 },
    level: { type: String, default: 'Intermediate' },
    feedback: { type: String, default: '' }
  },
  { _id: false }
);

const recommendationSubSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, enum: ['Coding', 'Project', 'OpenSource'], default: 'Coding' },
    actionUrl: { type: String, default: '/problems' }
  },
  { _id: false }
);

const aiReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    overallScore: {
      type: Number,
      default: 75
    },
    summary: {
      type: String,
      default: ''
    },
    skillAnalysis: {
      type: [skillAnalysisSubSchema],
      default: []
    },
    roadmap: {
      type: [roadmapSubSchema],
      default: []
    },
    recommendations: {
      type: [recommendationSubSchema],
      default: []
    },
    modelUsed: {
      type: String,
      default: 'openai/gpt-4o-mini'
    }
  },
  {
    timestamps: true
  }
);

aiReportSchema.index({ userId: 1, createdAt: -1 });

export const AIReport = mongoose.model('AIReport', aiReportSchema);
