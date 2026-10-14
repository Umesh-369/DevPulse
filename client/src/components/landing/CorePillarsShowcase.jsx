import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  Trophy,
  Globe,
  ArrowRight
} from 'lucide-react';

export default function CorePillarsShowcase() {
  const pillars = [
    {
      number: '01',
      title: 'Unified Developer Dashboard',
      description:
        'Connect GitHub, LeetCode, and supported coding profiles to view coding activity, problem-solving statistics, repository growth, and programming languages in one place.',
      icon: LayoutDashboard,
      route: '/dashboard',
      actionLabel: 'Launch Dashboard',
      tag: 'Unified Presence'
    },
    {
      number: '02',
      title: 'Developer Growth Analytics',
      description:
        'Daily contribution heatmaps, historical comparisons, coding streaks, monthly velocity reports, and progress toward personal goals.',
      icon: TrendingUp,
      route: '/analytics',
      actionLabel: 'Explore Analytics',
      tag: 'Heatmaps & Velocity'
    },
    {
      number: '03',
      title: 'AI Career Coach',
      description:
        'Identify skill gaps, analyze coding activity via OpenRouter intelligence, recommend areas to improve, and generate personalized weekly learning plans.',
      icon: Sparkles,
      route: '/ai-insights',
      actionLabel: 'Open AI Coach',
      tag: 'OpenRouter Intelligence'
    },
    {
      number: '04',
      title: 'Friends & College Leaderboard',
      description:
        'Compare opted-in student profiles, organize coding challenges, and rank participants using transparent metrics.',
      icon: Trophy,
      route: '/leaderboard',
      actionLabel: 'View Leaderboard',
      tag: 'Competitive Ranks'
    },
    {
      number: '05',
      title: 'Shareable Developer Portfolio',
      description:
        'Generate a public recruiter-ready profile containing featured projects, GitHub statistics, coding achievements, skills, and growth trends.',
      icon: Globe,
      route: '/portfolio',
      actionLabel: 'Build Portfolio',
      tag: 'Recruiter-Ready'
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-28 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[11px] font-bold tracking-widest uppercase text-[#C58B43] dark:text-[#E5A952]"
          >
            <span>CORE PLATFORM ARCHITECTURE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-impact font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            5 Pillars of DevPulse
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed"
          >
            Engineered from the ground up to unify your developer presence, quantify engineering consistency, and accelerate career trajectories.
          </motion.p>
        </div>

        {/* 5 Pillars Grid: Top 3 + Bottom 2 */}
        <div className="space-y-6">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.slice(0, 3).map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col justify-between p-7 rounded-3xl bg-white/75 dark:bg-[#151922]/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/[0.04] transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Top Row: Number Badge & Tag */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-[#E5A952] border border-amber-500/25">
                        {pillar.number}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                        {pillar.tag}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="space-y-3 pt-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {pillar.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Navigation Link CTA */}
                  <div className="pt-6 border-t border-slate-100 dark:border-white/5 mt-5">
                    <Link
                      to={pillar.route}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-[#E5A952] transition-colors"
                    >
                      <span>{pillar.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Row 2: 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
            {pillars.slice(3, 5).map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col justify-between p-7 rounded-3xl bg-white/75 dark:bg-[#151922]/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/[0.04] transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Top Row: Number Badge & Tag */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-[#E5A952] border border-amber-500/25">
                        {pillar.number}
                      </span>
                      <span className="text-[10px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                        {pillar.tag}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="space-y-3 pt-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {pillar.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Navigation Link CTA */}
                  <div className="pt-6 border-t border-slate-100 dark:border-white/5 mt-5">
                    <Link
                      to={pillar.route}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-[#E5A952] transition-colors"
                    >
                      <span>{pillar.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
