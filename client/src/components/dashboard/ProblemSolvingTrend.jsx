import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function ProblemSolvingTrend({ data }) {
  const { isDark } = useTheme();

  const trendData = data || [
    { month: 'Jan', solved: 140 },
    { month: 'Feb', solved: 185 },
    { month: 'Mar', solved: 160 },
    { month: 'Apr', solved: 210 },
    { month: 'May', solved: 240 },
    { month: 'Jun', solved: 275 }
  ];

  return (
    <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Problem Solving Trend
        </h3>
        <span className="text-[11px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
          +32% Velocity
        </span>
      </div>

      <div className="h-40 w-full relative">
        {/* Floating marker callout badge '240' */}
        <div className="absolute top-2 right-12 z-10 bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
          <span>240</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? '#E5A952' : '#3B82F6'} stopOpacity={0.4} />
                <stop offset="95%" stopColor={isDark ? '#E5A952' : '#3B82F6'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                      <p className="font-semibold">{payload[0].payload.month}</p>
                      <p className="text-amber-400">{payload[0].value} problems solved</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="solved"
              stroke={isDark ? '#E5A952' : '#3B82F6'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
