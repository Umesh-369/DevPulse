import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Sparkles,
  Trophy,
  LayoutGrid,
  ArrowRight
} from 'lucide-react';

export default function FeaturesRow() {
  const features = [
    {
      title: 'Unified Analytics',
      desc: 'Visualize your coding activity across multiple platforms in one beautiful dashboard.',
      icon: BarChart3,
      iconBg: 'bg-amber-500/15 text-amber-500',
      glowColor: 'group-hover:border-amber-400/50',
      link: '/analytics'
    },
    {
      title: 'AI-Powered Insights',
      desc: 'Get personalized recommendations and roadmaps to grow faster.',
      icon: Sparkles,
      iconBg: 'bg-purple-500/15 text-purple-400',
      glowColor: 'group-hover:border-purple-400/50',
      link: '/ai-insights'
    },
    {
      title: 'Leaderboards',
      desc: 'Compete and grow with developers from your college and around the world.',
      icon: Trophy,
      iconBg: 'bg-amber-500/15 text-[#E5A952]',
      glowColor: 'group-hover:border-amber-400/50',
      link: '/leaderboard'
    },
    {
      title: 'Beautiful Portfolio',
      desc: 'Create a stunning profile to showcase your skills, projects and achievements.',
      icon: LayoutGrid,
      iconBg: 'bg-orange-500/15 text-orange-400',
      glowColor: 'group-hover:border-orange-400/50',
      link: '/portfolio'
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#C58B43] dark:text-[#E5A952]">
            FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-impact font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything You Need to Grow as a Developer
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Powerful tools and insights to track progress, build skills and achieve your goals.
          </p>
        </div>

        {/* 4 Cards Responsive Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Link
                  to={feat.link}
                  className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white/75 dark:bg-[#151922]/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 ${feat.glowColor} hover:shadow-xl dark:hover:shadow-glow-gold/10 hover:-translate-y-2 transition-all duration-300 h-full min-h-[240px]`}
                >
                  <div className="space-y-4">
                    {/* Icon container */}
                    <div className={`w-12 h-12 rounded-2xl ${feat.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {feat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  {/* Bottom Right Arrow */}
                  <div className="pt-4 flex justify-end items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
