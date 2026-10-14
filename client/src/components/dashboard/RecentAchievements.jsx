import React from 'react';
import { Trophy, Flame, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecentAchievements() {
  const achievements = [
    {
      id: 1,
      title: '1000 Problems Solved',
      desc: 'Reached your first 1000 problems',
      icon: Trophy,
      badgeColor: 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
    },
    {
      id: 2,
      title: '30 Day Streak',
      desc: 'Solved problems for 30 consecutive days',
      icon: Flame,
      badgeColor: 'bg-orange-500/15 text-orange-500 border border-orange-500/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Recent Achievements
        </h3>
        <Link
          to="/portfolio"
          className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center"
        >
          View all
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {achievements.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-[#1C212D]/60 border border-slate-100 dark:border-white/5 hover:border-amber-400/30 transition-colors"
            >
              <div className={`p-2.5 rounded-xl ${item.badgeColor} flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
