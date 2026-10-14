import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Brain,
  Code2,
  Layers,
  Flame,
  ArrowRight,
  Key,
  AlertTriangle,
  X,
  Check,
  Target,
  Clock,
  Compass,
  Cpu,
  Database,
  Globe
} from 'lucide-react';
import { GitHubIcon } from '../components/common/PlatformIcons';

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRoadId, setSelectedRoadId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [missingKey, setMissingKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadReport = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.ai.getInsights();
      if (res.report) {
        setReport(res.report);
        if (res.report.roadmap?.length > 0) {
          setSelectedRoadId(res.report.roadmap[0].id);
        }
      }
      if (res.apiKeyConfigured === false) {
        setMissingKey(true);
      }
    } catch (err) {
      console.error('Failed to load AI report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  // Generate / Refresh AI Insights via OpenRouter
  const handleGenerate = async (explicitKey = null) => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await api.ai.generate(explicitKey);
      if (res.success && res.report) {
        setReport(res.report);
        setMissingKey(false);
        if (res.report.roadmap?.length > 0) {
          setSelectedRoadId(res.report.roadmap[0].id);
        }
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        showToast('Fresh career intelligence generated via OpenRouter!');
      } else if (res.missingApiKey) {
        setMissingKey(true);
        setIsKeyModalOpen(true);
      }
    } catch (err) {
      const errText = err.response?.data?.message || err.message || 'Failed to generate AI report';
      if (errText.toLowerCase().includes('api key')) {
        setMissingKey(true);
      }
      setErrorMessage(errText);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Task Completion in Roadmap Milestone
  const handleToggleTask = async (roadId, taskId) => {
    // Optimistic UI update
    setReport(prev => {
      if (!prev || !prev.roadmap) return prev;
      const nextRoadmap = prev.roadmap.map(road => {
        if (road.id === roadId) {
          const nextTasks = road.tasks.map(t => (t.id === taskId ? { ...t, done: !t.done } : t));
          return { ...road, tasks: nextTasks };
        }
        return road;
      });
      return { ...prev, roadmap: nextRoadmap };
    });

    try {
      await api.ai.toggleTask(roadId, taskId);
    } catch (err) {
      console.warn('Failed to persist task toggle:', err.message);
    }
  };

  // Save API Key Modal
  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setIsSavingKey(true);
    try {
      await api.ai.saveApiKey(apiKeyInput.trim());
      setIsKeyModalOpen(false);
      setMissingKey(false);
      showToast('OpenRouter API Key saved! Generating analysis...');
      handleGenerate(apiKeyInput.trim());
      setApiKeyInput('');
    } catch (err) {
      alert(err.message || 'Failed to save OpenRouter API key');
    } finally {
      setIsSavingKey(false);
    }
  };

  const tabs = ['Overview', 'Skill Analysis', 'Roadmap', 'Recommendations'];

  // Normalize skillAnalysis
  const skillList = report?.skillAnalysis || (report?.skills || []).map(s => ({
    skill: s.name || s.skill,
    score: s.level ?? s.score ?? 75,
    level: (s.level ?? s.score) >= 80 ? 'Advanced' : (s.level ?? s.score) >= 65 ? 'Intermediate' : 'Developing',
    feedback: s.details || s.feedback || 'Consistent progress demonstrated across challenges.'
  }));

  const roadmapList = report?.roadmap || [];
  const recommendationsList = report?.recommendations || [];
  const activeRoadmap = roadmapList.find(r => r.id === selectedRoadId) || roadmapList[0] || null;

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-medium text-xs shadow-2xl animate-in slide-in-from-bottom-3">
              <Check className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Missing API Key Alert Banner */}
          {missingKey && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold block">OpenRouter API Key Required:</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Set <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">OPENROUTER_API_KEY</code> in <code className="font-mono bg-amber-500/20 px-1 py-0.5 rounded">server/.env</code> or enter your key to unlock live AI analysis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 shrink-0 self-start sm:self-auto"
              >
                Enter API Key
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>AI Career Insights</span>
                <Sparkles className="w-6 h-6 text-amber-500" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Deep telemetry analysis powered by OpenRouter intelligence.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsKeyModalOpen(true)}
                title="Configure OpenRouter Key"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-amber-400/40 transition-colors"
              >
                <Key className="w-4 h-4 text-amber-500" />
              </button>

              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] shadow-xs hover:opacity-90 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Synthesizing with OpenRouter...' : 'Generate / Refresh AI Insights'}</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-amber-500/15 text-[#C58B43] dark:text-[#E5A952] border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Loading Skeleton */}
          {isGenerating ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-44 bg-slate-200 dark:bg-white/5 rounded-3xl" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-slate-200 dark:bg-white/5 rounded-3xl" />
                <div className="h-64 bg-slate-200 dark:bg-white/5 rounded-3xl" />
              </div>
            </div>
          ) : (
            <>
              {/* ==================================================== */}
              {/* TAB 1: OVERVIEW                                      */}
              {/* ==================================================== */}
              {activeTab === 'Overview' && (
                <div className="space-y-6">
                  {/* Executive Summary Card */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/25 p-6 rounded-3xl relative overflow-hidden">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0 mt-0.5">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          Executive Assessment Summary
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed max-w-4xl">
                          {report?.summary || 'Demonstrates strong technical competence with an active code trajectory across distributed full-stack architecture and competitive problem solving.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top Row: Score + Roadmap Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Overall Radial Score & Skills Preview (5 Cols) */}
                    <div className="lg:col-span-5 bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
                          Developer Competency Score
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          {/* Circular Radial Gauge */}
                          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                className="stroke-slate-100 dark:stroke-white/5"
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="url(#scoreGrad)"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 40}
                                strokeDashoffset={2 * Math.PI * 40 * (1 - (report?.overallScore || 78) / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                              />
                              <defs>
                                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#10B981" />
                                  <stop offset="100%" stopColor="#06B6D4" />
                                </linearGradient>
                              </defs>
                            </svg>

                            <div className="absolute flex flex-col items-center justify-center text-center">
                              <span className="text-3xl font-black text-slate-900 dark:text-white">
                                {report?.overallScore || 78}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">Score / 100</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-center sm:text-left">
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block">
                              {(report?.overallScore || 78) >= 80 ? 'Top 10% Candidate' : 'High Growth Candidate'}
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              Evaluated across algorithms, full-stack design, codebase maintainability, and delivery.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Skill Bars */}
                      <div className="space-y-3 mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                        {skillList.slice(0, 4).map((s) => (
                          <div key={s.skill} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-800 dark:text-slate-200">{s.skill}</span>
                              <span className="text-slate-900 dark:text-white">{s.score}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                  width: `${s.score}%`,
                                  backgroundColor: s.score >= 80 ? '#10B981' : s.score >= 65 ? '#3B82F6' : '#F59E0B'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Active Roadmap Preview (7 Cols) */}
                    <div className="lg:col-span-7 bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                              Personalized Roadmap Milestone
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {activeRoadmap?.title || 'Current Learning Milestone'}
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveTab('Roadmap')}
                            className="text-xs text-amber-500 font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>View All Milestones</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {activeRoadmap && (
                          <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-between text-xs">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {activeRoadmap.subtitle || 'Focus Area'}
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Duration: {activeRoadmap.duration}
                                </span>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                {activeRoadmap.status}
                              </span>
                            </div>

                            {/* Checklist */}
                            <div className="space-y-2 pt-2">
                              {activeRoadmap.tasks.map((task) => (
                                <button
                                  key={task.id}
                                  type="button"
                                  onClick={() => handleToggleTask(activeRoadmap.id, task.id)}
                                  className="w-full flex items-start gap-2.5 text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                                >
                                  {task.done ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-400 group-hover:text-amber-500 shrink-0 mt-0.5" />
                                  )}
                                  <span className={`text-xs ${task.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                                    {task.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs text-slate-400">
                        <span>Check off daily tasks to persist completion</span>
                        <span className="font-semibold text-amber-500">
                          {activeRoadmap?.tasks.filter(t => t.done).length || 0} of {activeRoadmap?.tasks.length || 0} Done
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations Row */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        AI High-Impact Recommendations
                      </h2>
                      <button
                        onClick={() => setActiveTab('Recommendations')}
                        className="text-xs text-amber-500 font-semibold hover:underline"
                      >
                        See All ({recommendationsList.length}) →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendationsList.slice(0, 3).map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-400/40 transition-colors"
                        >
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                              {rec.category}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {rec.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                              {rec.description}
                            </p>
                          </div>

                          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/5">
                            <a
                              href={rec.actionUrl}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              <span>Take Action</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 2: SKILL ANALYSIS                                */}
              {/* ==================================================== */}
              {activeTab === 'Skill Analysis' && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-xs">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      Comprehensive Competency Evaluation
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                      Detailed strengths and growth vectors generated from your telemetry.
                    </p>

                    <div className="space-y-6">
                      {skillList.map((skill) => {
                        const levelColor =
                          skill.level === 'Advanced'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : skill.level === 'Intermediate'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20';

                        const barColor =
                          skill.score >= 80 ? '#10B981' : skill.score >= 65 ? '#3B82F6' : '#F59E0B';

                        return (
                          <div
                            key={skill.skill}
                            className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {skill.skill}
                                </h3>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${levelColor}`}>
                                  {skill.level}
                                </span>
                              </div>
                              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {skill.score} / 100
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${skill.score}%`, backgroundColor: barColor }}
                              />
                            </div>

                            {/* Detailed Feedback */}
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                              {skill.feedback}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 3: ROADMAP                                       */}
              {/* ==================================================== */}
              {activeTab === 'Roadmap' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Personalized Career Sprint Roadmap
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Check off completed daily tasks to record your learning momentum in MongoDB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roadmapList.map((road, idx) => {
                      const completedCount = road.tasks.filter(t => t.done).length;
                      const totalCount = road.tasks.length;
                      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                      return (
                        <div
                          key={road.id || idx}
                          className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">
                                  Milestone {idx + 1} • {road.duration}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                  {road.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {road.subtitle}
                                </p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                                {road.status}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-medium text-slate-400">
                                <span>Sprint Progress</span>
                                <span>{completedCount} of {totalCount} Tasks ({percent}%)</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            {/* Task Checklist */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                              {road.tasks.map((task) => (
                                <button
                                  key={task.id}
                                  type="button"
                                  onClick={() => handleToggleTask(road.id, task.id)}
                                  className="w-full flex items-start gap-2.5 text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                                >
                                  {task.done ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-400 group-hover:text-amber-500 shrink-0 mt-0.5" />
                                  )}
                                  <span className={`text-xs ${task.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                                    {task.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 4: RECOMMENDATIONS                               */}
              {/* ==================================================== */}
              {activeTab === 'Recommendations' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Strategic AI Recommendations
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Targeted recommendations to optimize your interview clearance, coding velocity, and portfolio.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendationsList.map((rec) => {
                      const isCoding = rec.category === 'Coding';
                      const isProject = rec.category === 'Project';
                      const isExternal = rec.actionUrl?.startsWith('http');

                      return (
                        <div
                          key={rec.id}
                          className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-amber-400/40 transition-all"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                isCoding
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : isProject
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-emerald-500/10 text-emerald-500'
                              }`}>
                                {rec.category}
                              </span>
                              {isCoding ? <Code2 className="w-4 h-4 text-blue-500" /> : isProject ? <Layers className="w-4 h-4 text-amber-500" /> : <GitHubIcon className="w-4 h-4 text-emerald-500" />}
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              {rec.title}
                            </h3>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {rec.description}
                            </p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                            <a
                              href={rec.actionUrl}
                              target={isExternal ? '_blank' : '_self'}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              <span>Take Action</span>
                              {isExternal ? <ExternalLink className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick API Key Modal */}
          {isKeyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      OpenRouter API Key
                    </h3>
                  </div>
                  <button onClick={() => setIsKeyModalOpen(false)}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enter your OpenRouter key to generate personalized AI insights and roadmap telemetry. You can obtain a key at{' '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-amber-500 font-semibold underline">
                    openrouter.ai/keys
                  </a>.
                </p>

                <form onSubmit={handleSaveApiKey} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">API Key</label>
                    <input
                      type="password"
                      required
                      placeholder="sk-or-v1-..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                    Or configure directly in backend <code className="font-mono text-amber-500">server/.env</code>:
                    <br />
                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                      OPENROUTER_API_KEY=sk-or-v1-...
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsKeyModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingKey}
                      className="px-5 py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl disabled:opacity-50"
                    >
                      {isSavingKey ? 'Saving...' : 'Save & Analyze'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
