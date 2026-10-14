import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AnimatedCounter from '../common/AnimatedCounter';
import { TrendingUp, Info } from 'lucide-react';

export default function ContributionHeatmap({ totalContributions = 3214, growth = '+18% from last period' }) {
  const { isDark } = useTheme();
  const [hoveredCell, setHoveredCell] = useState(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Mon', 'Wed', 'Fri'];

  // Generate 52 weeks x 7 days pseudo heatmap with higher density towards recent months
  const weeks = Array.from({ length: 48 }, (_, wIdx) => {
    return Array.from({ length: 7 }, (_, dIdx) => {
      // Deterministic pseudo-random generation with active clusters
      const seed = (wIdx * 7 + dIdx * 13) % 100;
      let level = 0;
      if (seed > 85) level = 4;
      else if (seed > 65) level = 3;
      else if (seed > 40) level = 2;
      else if (seed > 18) level = 1;
      else level = 0;

      const dateStr = `Week ${wIdx + 1}, Day ${dIdx + 1}`;
      const count = level === 4 ? 12 : level === 3 ? 7 : level === 2 ? 4 : level === 1 ? 2 : 0;

      return {
        id: `${wIdx}-${dIdx}`,
        level,
        count,
        date: dateStr,
        breakdown: `${count} contributions (GitHub, LeetCode)`
      };
    });
  });

  // Color classes for light vs dark mode
  const getCellColor = (level) => {
    if (isDark) {
      switch (level) {
        case 4: return 'bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]';
        case 3: return 'bg-[#D97706]';
        case 2: return 'bg-[#92400E]';
        case 1: return 'bg-[#451A03]';
        default: return 'bg-[#1C212D]/60 border border-white/5';
      }
    } else {
      switch (level) {
        case 4: return 'bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.4)]';
        case 3: return 'bg-[#34D399]';
        case 2: return 'bg-[#6EE7B7]';
        case 1: return 'bg-[#A7F3D0]';
        default: return 'bg-[#F3EFEA] border border-[#EAE6DF]';
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Heatmap Grid */}
        <div className="flex-1 w-full overflow-x-auto pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Contribution Heatmap</span>
              <span className="text-[11px] font-normal text-slate-400">Past 12 Months</span>
            </h3>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div key={lvl} className={`w-2.5 h-2.5 rounded-xs ${getCellColor(lvl)}`} />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* Month Labels */}
          <div className="flex justify-between text-[11px] text-slate-400 mb-2 px-1">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="relative">
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.id}
                      onMouseEnter={() => setHoveredCell(day)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs cursor-pointer transition-transform hover:scale-130 hover:z-20 ${getCellColor(
                        day.level
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Hover Tooltip */}
            {hoveredCell && (
              <div className="absolute -top-10 left-1/3 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-md shadow-lg pointer-events-none z-30 whitespace-nowrap">
                {hoveredCell.breakdown}
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Metric */}
        <div className="lg:w-56 w-full flex-shrink-0 flex flex-col justify-center lg:border-l border-slate-200 dark:border-white/5 lg:pl-6 pt-4 lg:pt-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Contributions
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={totalContributions} />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{growth}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
