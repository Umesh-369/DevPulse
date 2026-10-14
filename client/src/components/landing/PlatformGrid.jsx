import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import {
  GitHubIcon,
  LeetCodeIcon,
  CodeChefIcon,
  HackerRankIcon,
  GeeksforGeeksIcon,
  AtCoderIcon
} from '../common/PlatformIcons';

export default function PlatformGrid() {
  const platforms = [
    {
      name: 'GitHub',
      icon: GitHubIcon,
      color: 'text-slate-900 dark:text-white',
      desc: 'Commits & PRs'
    },
    {
      name: 'LeetCode',
      icon: LeetCodeIcon,
      color: 'text-[#FFA116]',
      desc: 'Problems & Contests'
    },
    {
      name: 'CodeChef',
      icon: CodeChefIcon,
      color: 'text-[#5B4638] dark:text-[#FFA500]',
      desc: 'Division & Stars'
    },
    {
      name: 'HackerRank',
      icon: HackerRankIcon,
      color: 'text-[#00EA64]',
      desc: 'Verified Badges'
    },
    {
      name: 'GeeksforGeeks',
      icon: GeeksforGeeksIcon,
      color: 'text-[#2F8D46]',
      desc: 'Coding Score'
    },
    {
      name: 'AtCoder',
      icon: AtCoderIcon,
      color: 'text-[#00C0C0]',
      desc: 'Algorithmic Rating'
    },
    {
      name: 'More',
      isMore: true,
      desc: 'Kaggle & Gitlab'
    }
  ];

  return (
    <section id="integrations" className="py-12 sm:py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Connect Your World
          </p>
        </div>

        {/* 7 Cards Responsive Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {platforms.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
              >
                <Link
                  to="/onboarding/connect"
                  className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white/80 dark:bg-[#151922]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 hover:border-amber-400/50 hover:shadow-lg dark:hover:shadow-glow-gold/15 hover:-translate-y-1.5 transition-all duration-300 text-center h-28"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    {p.isMore ? (
                      <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors">
                    {p.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
