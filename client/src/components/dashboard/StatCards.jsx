import React from 'react';
import AnimatedCounter from '../common/AnimatedCounter';
import { Code2, Flame, FolderGit2, Star, TrendingUp } from 'lucide-react';

export default function StatCards({ stats }) {
  const cards = [
    {
      title: 'Problems Solved',
      value: stats?.problemsSolved ?? 0,
      change: stats?.problemsGrowth || '+0%',
      icon: Code2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Current Streak',
      value: stats?.currentStreak ?? 0,
      unit: 'days',
      change: stats?.streakGrowth || '+0 days',
      icon: Flame,
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Total Repositories',
      value: stats?.totalRepositories ?? 0,
      change: stats?.reposGrowth || '+0 this month',
      icon: FolderGit2,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Achievements',
      value: stats?.achievementsCount ?? 0,
      change: stats?.achievementsGrowth || '+0 new',
      icon: Star,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs hover:border-amber-400/30 transition-all hover:translate-y-[-2px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                <AnimatedCounter value={card.value} />
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${card.badgeBg}`}>
                {card.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
