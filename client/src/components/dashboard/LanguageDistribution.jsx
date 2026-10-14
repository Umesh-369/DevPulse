import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function LanguageDistribution({ data }) {
  const chartData = data || [
    { name: 'JavaScript', value: 32, color: '#F7DF1E' },
    { name: 'Python', value: 24, color: '#3776AB' },
    { name: 'Java', value: 18, color: '#EA2D2E' },
    { name: 'TypeScript', value: 14, color: '#3178C6' },
    { name: 'Others', value: 12, color: '#9CA3AF' }
  ];

  return (
    <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Language Distribution
        </h3>
        <span className="text-[11px] text-slate-400">Total Lines: 132K</span>
      </div>

      <div className="flex items-center justify-between gap-4 flex-1">
        {/* Donut Chart */}
        <div className="w-36 h-36 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded shadow-lg">
                        {item.name}: {item.value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                innerRadius={36}
                outerRadius={56}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {item.name}
                </span>
              </div>
              <span className="text-slate-900 dark:text-white font-semibold">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
