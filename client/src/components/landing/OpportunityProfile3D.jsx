import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Star,
  GitPullRequest,
  Award,
  Sparkles,
  Terminal,
  Code
} from 'lucide-react';
import {
  GitHubIcon,
  LeetCodeIcon,
  CodeChefIcon,
  HackerRankIcon
} from '../common/PlatformIcons';

export default function OpportunityProfile3D({ mousePos = { x: 0, y: 0 } }) {
  const skills = [
    { name: 'TypeScript / React', level: 96, color: 'bg-blue-500' },
    { name: 'Python / PyTorch', level: 92, color: 'bg-amber-500' },
    { name: 'System Design & Distributed', level: 88, color: 'bg-purple-500' },
    { name: 'Algorithms (LeetCode Top 4%)', level: 95, color: 'bg-emerald-500' }
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto perspective-container select-none">
      {/* Background Golden Ribbon Trail */}
      <svg
        className="absolute -top-12 -left-12 w-80 h-80 pointer-events-none opacity-30 dark:opacity-50 -z-10 filter blur-xs"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M 350 50 C 250 150, 100 80, 50 220 C 10 320, 160 380, 280 320 C 380 270, 320 180, 200 140"
          stroke="url(#oppRibbonGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="oppRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5A952" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main 3D Profile Tablet */}
      <div
        className="w-full rounded-2xl p-2 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] border border-white/60 dark:border-white/10 transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${10 - mousePos.y * 0.5}deg) rotateY(${-6 + mousePos.x * 0.5}deg) rotateZ(1deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Screen Bezel */}
        <div className="rounded-xl overflow-hidden bg-[#FAF8F5] dark:bg-[#0B0D11] border border-slate-300/80 dark:border-slate-800 p-4 space-y-3.5 shadow-inner">
          {/* Header Profile Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-[#C58B43] dark:text-[#E5A952] font-bold text-sm flex items-center justify-center border border-amber-500/30 shadow-xs">
                  U
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B0D11]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Umesh Chandra
                  </span>
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-semibold border border-amber-500/20">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Verified</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  @umesh.codes • Full Stack & AI Engineer
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] text-slate-400 block">DevPulse Rating</span>
              <span className="text-xs font-extrabold text-amber-500 font-mono">1,940 Top 2%</span>
            </div>
          </div>

          {/* Verified Platform Badges */}
          <div className="grid grid-cols-4 gap-1.5 text-[9px]">
            <div className="p-1.5 rounded-lg bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 flex items-center gap-1.5 shadow-xs">
              <LeetCodeIcon className="w-3.5 h-3.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">1,284</p>
                <p className="text-[8px] text-slate-400">LeetCode</p>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 flex items-center gap-1.5 shadow-xs">
              <GitHubIcon className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">3.2k</p>
                <p className="text-[8px] text-slate-400">Commits</p>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 flex items-center gap-1.5 shadow-xs">
              <CodeChefIcon className="w-3.5 h-3.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">4★</p>
                <p className="text-[8px] text-slate-400">CodeChef</p>
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 flex items-center gap-1.5 shadow-xs">
              <HackerRankIcon className="w-3.5 h-3.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">5★</p>
                <p className="text-[8px] text-slate-400">HackerRank</p>
              </div>
            </div>
          </div>

          {/* Activity Matrix Snapshot */}
          <div className="p-2 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-1">
            <div className="flex justify-between items-center text-[9px]">
              <span className="font-bold text-slate-700 dark:text-slate-300">Verified Telemetry Graph</span>
              <span className="text-emerald-500 font-semibold">100% Authenticated</span>
            </div>
            <div className="grid grid-cols-20 gap-1 pt-0.5">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-xs ${
                    i % 3 === 0
                      ? 'bg-[#E5A952]'
                      : i % 4 === 0
                      ? 'bg-emerald-500'
                      : i % 7 === 0
                      ? 'bg-[#F59E0B]'
                      : 'bg-slate-200 dark:bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs space-y-2">
            <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Skill Benchmarks
            </span>
            <div className="space-y-1.5">
              {skills.map((s) => (
                <div key={s.name} className="space-y-0.5">
                  <div className="flex justify-between text-[9px] text-slate-600 dark:text-slate-400">
                    <span>{s.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{s.level}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Verified Footer */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Verified Public Profile
            </span>
            <span className="font-mono text-amber-500">devpulse.io/u/umesh</span>
          </div>
        </div>
      </div>
    </div>
  );
}
