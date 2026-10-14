import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  Code2,
  BarChart2,
  Sparkles,
  Trophy,
  Layers,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HeroDashboard3D({ mousePos = { x: 0, y: 0 } }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Dynamic values based on authentication status
  const userSolved = user?.stats?.problemsSolved ?? user?.connectedPlatforms?.leetcode?.solved ?? 0;
  const userStreak = user?.stats?.currentStreak ?? 0;
  const userRepos = user?.stats?.totalRepositories ?? 0;
  const userRating = user?.stats?.rating || 0;
  const userContributions = user?.stats?.totalContributions || userSolved || 0;
  const userNameInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Realistic contribution heatmap matrix (28 columns x 5 rows)
  const heatmapData = [
    [1, 2, 0, 3, 4, 2, 1, 0, 2, 4, 3, 2, 1, 3, 4, 2, 0, 1, 3, 2, 4, 3, 1, 2, 0, 3, 4, 2],
    [2, 0, 1, 4, 3, 1, 2, 3, 1, 2, 4, 1, 0, 2, 3, 4, 1, 2, 0, 3, 2, 4, 1, 3, 2, 1, 3, 4],
    [3, 4, 2, 1, 0, 3, 4, 2, 3, 1, 0, 4, 2, 1, 2, 3, 4, 0, 1, 2, 3, 1, 4, 2, 3, 4, 1, 3],
    [0, 1, 3, 2, 4, 2, 1, 4, 0, 3, 2, 1, 3, 4, 1, 0, 2, 3, 4, 1, 0, 2, 3, 4, 1, 2, 3, 4],
    [1, 3, 4, 0, 2, 3, 1, 2, 4, 1, 3, 2, 0, 1, 4, 3, 2, 1, 3, 4, 2, 0, 1, 3, 2, 4, 2, 3]
  ];

  const getColorClass = (val) => {
    switch (val) {
      case 4:
        return 'bg-[#E5A952] dark:bg-[#E5A952] shadow-[0_0_6px_rgba(229,169,82,0.6)]';
      case 3:
        return 'bg-[#F59E0B] dark:bg-[#D97706]';
      case 2:
        return 'bg-[#10B981] dark:bg-[#059669]';
      case 1:
        return 'bg-emerald-300 dark:bg-emerald-900/60';
      default:
        return 'bg-slate-200/80 dark:bg-white/5';
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto perspective-container select-none">
      {/* Background Golden Ribbon Trail */}
      <svg
        className="absolute -top-16 -right-12 w-96 h-96 pointer-events-none opacity-40 dark:opacity-60 -z-10 filter blur-xs"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M 50 150 C 150 50, 300 80, 360 220 C 400 320, 250 380, 120 320 C 20 280, 40 180, 160 140"
          stroke="url(#heroRibbonGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 80 180 C 180 80, 320 110, 380 250"
          stroke="url(#heroRibbonGrad2)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        <defs>
          <linearGradient id="heroRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#E5A952" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="heroRibbonGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E5A952" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Growth / Telemetry Card */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          x: [0, 4, 0]
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          transform: `translate3d(${mousePos.x * 2.2 - 20}px, ${mousePos.y * 2.2 + 10}px, 60px)`
        }}
        className="absolute -bottom-6 -left-4 sm:-left-8 z-30 w-52 sm:w-60 rounded-2xl bg-white/95 dark:bg-[#151922]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-4 shadow-2xl shadow-black/20 dark:shadow-black/70"
      >
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {isAuthenticated ? 'Your Growth' : 'Growth Engine'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isAuthenticated ? 'Activity Velocity' : 'Telemetry Stream'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            {isAuthenticated ? `+${Math.min(userStreak || 12, 100)}%` : 'Real-time'}
          </span>
        </div>

        {/* Area Wave Chart */}
        <div className="h-14 w-full pt-1 relative">
          <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="growthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E5A952" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#E5A952" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 45 C 30 40, 50 48, 80 30 C 110 12, 140 28, 170 14 C 185 8, 195 10, 200 6 L 200 60 L 0 60 Z"
              fill="url(#growthAreaGrad)"
            />
            <path
              d="M 0 45 C 30 40, 50 48, 80 30 C 110 12, 140 28, 170 14 C 185 8, 195 10, 200 6"
              fill="none"
              stroke="#E5A952"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="200" cy="6" r="4" fill="#E5A952" className="animate-ping" opacity="0.75" />
            <circle cx="200" cy="6" r="3.5" fill="#FFFFFF" stroke="#E5A952" strokeWidth="2" />
          </svg>
        </div>

        <div className="flex justify-between items-center text-[9px] text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
          <span>Q1</span>
          <span>Q2</span>
          <span>Q3</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {isAuthenticated ? 'Current' : 'Live Sync'}
          </span>
        </div>
      </motion.div>

      {/* Main 3D Laptop Shell */}
      <div
        className="w-full rounded-2xl p-2 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] border border-white/60 dark:border-white/10 transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${10 - mousePos.y * 0.7}deg) rotateY(${-8 + mousePos.x * 0.7}deg) rotateZ(1deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Screen Outer Bezel */}
        <div className="rounded-xl overflow-hidden bg-[#FAF8F5] dark:bg-[#0B0D11] border border-slate-300/80 dark:border-slate-800 relative shadow-inner">
          {/* Top Bezel Camera Dot */}
          <div className="h-5 bg-slate-100/90 dark:bg-[#111315] flex items-center justify-between px-3 border-b border-slate-200/80 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400/80 inline-block" />
              <span className="w-2 h-2 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-2 h-2 rounded-full bg-emerald-400/80 inline-block" />
            </div>
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px]">live sync</span>
            </div>
          </div>

          {/* Interior DevPulse Application Workspace */}
          <div className="flex h-[340px] sm:h-[370px] overflow-hidden text-[10px]">
            {/* Slim Left Sidebar */}
            <div className="w-11 sm:w-12 bg-white/70 dark:bg-[#11141C] border-r border-slate-200/80 dark:border-white/5 flex flex-col items-center py-3 gap-4 shrink-0">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col gap-2.5 text-slate-400 dark:text-slate-500">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <BarChart2 className="w-3.5 h-3.5" />
                </div>
                <div className="p-1.5 rounded-lg hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="p-1.5 rounded-lg hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div className="p-1.5 rounded-lg hover:text-slate-800 dark:hover:text-white transition-colors">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-3 overflow-hidden bg-slate-50/50 dark:bg-[#0B0D11]/60">
              {/* App Header Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    DevPulse Dashboard
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold tracking-wide">
                    {isAuthenticated ? 'LIVE SYNC' : 'TELEMETRY ACTIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 text-[9px] w-24 sm:w-32">
                    <Search className="w-2.5 h-2.5" />
                    <span className="truncate">Search stats...</span>
                  </div>
                  {isAuthenticated ? (
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-bold flex items-center justify-center border border-amber-500/30">
                      {userNameInitial}
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 text-[9px] flex items-center justify-center border border-amber-500/30">
                      <Activity className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* 4 Mini Metric Cards */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <p className="text-[9px] text-slate-400">
                    {isAuthenticated ? 'Solved' : 'Problem Tracker'}
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isAuthenticated ? userSolved : '6 Platforms'}
                  </p>
                  <span className="text-[8px] text-emerald-500 font-bold">
                    {isAuthenticated ? 'Synced' : 'Unified Sync'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <p className="text-[9px] text-slate-400">
                    {isAuthenticated ? 'Streak' : 'Streak Tracker'}
                  </p>
                  <p className="text-sm font-extrabold text-amber-500">
                    {isAuthenticated ? `${userStreak}d` : 'Daily Sync'}
                  </p>
                  <span className="text-[8px] text-amber-500 font-bold">
                    {isAuthenticated ? '🔥 Active' : 'Multi-Source'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <p className="text-[9px] text-slate-400">
                    {isAuthenticated ? 'Repos' : 'Repositories'}
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isAuthenticated ? userRepos : 'GitHub API'}
                  </p>
                  <span className="text-[8px] text-blue-500 font-bold">
                    {isAuthenticated ? 'Verified' : 'Auto-Sync'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <p className="text-[9px] text-slate-400">
                    {isAuthenticated ? 'Rating' : 'AI Intelligence'}
                  </p>
                  <p className="text-sm font-extrabold text-emerald-500">
                    {isAuthenticated ? (userRating > 0 ? userRating : 'Active') : 'OpenRouter'}
                  </p>
                  <span className="text-[8px] text-slate-400">
                    {isAuthenticated ? 'DevPulse Rank' : 'Career Coach'}
                  </span>
                </div>
              </div>

              {/* Multi-Platform Activity Heatmap Grid */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[10px] text-slate-800 dark:text-slate-200">
                      Contributions Matrix
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {isAuthenticated ? `(${userContributions} total)` : '(Multi-Platform Telemetry)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-slate-400">
                    <span>Less</span>
                    <span className="w-1.5 h-1.5 rounded-xs bg-slate-200 dark:bg-white/10" />
                    <span className="w-1.5 h-1.5 rounded-xs bg-emerald-400" />
                    <span className="w-1.5 h-1.5 rounded-xs bg-[#E5A952]" />
                    <span>More</span>
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-28 gap-1 pt-0.5">
                  {heatmapData.map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onMouseEnter={() => setHoveredCell(`${val * 3 + 1} submissions`)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-2 sm:h-2.5 rounded-xs cursor-pointer transition-transform hover:scale-125 ${getColorClass(
                          val
                        )}`}
                      />
                    ))
                  )}
                </div>
                {hoveredCell && (
                  <p className="text-[8px] text-amber-500 font-mono text-right">{hoveredCell}</p>
                )}
              </div>

              {/* Velocity Line Chart */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[10px] text-slate-800 dark:text-slate-200">
                    Coding Velocity Curve
                  </span>
                  <span className="text-[9px] text-emerald-500 font-semibold">
                    {isAuthenticated ? 'Real-time Velocity' : 'Multi-Source Telemetry'}
                  </span>
                </div>
                <div className="h-10 w-full">
                  <svg viewBox="0 0 300 45" className="w-full h-full">
                    <path
                      d="M 0 35 Q 40 38, 80 20 T 160 22 T 240 10 T 300 5"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <path
                      d="M 0 40 Q 50 30, 100 28 T 200 18 T 300 8"
                      fill="none"
                      stroke="#E5A952"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
