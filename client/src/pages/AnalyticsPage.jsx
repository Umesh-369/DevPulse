import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Code2,
  CheckCircle2,
  Calendar,
  GitPullRequest,
  ChevronDown,
  Filter
} from 'lucide-react';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeframe, setTimeframe] = useState('Last 6 months');
  const [timeframeOpen, setTimeframeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Platform visibility filters for the chart
  const [platformsVisible, setPlatformsVisible] = useState({
    LeetCode: true,
    CodeChef: true,
    HackerRank: true,
    GFG: true
  });

  useEffect(() => {
    async function loadData() {
      const data = await api.analytics.get(timeframe);
      setAnalytics(data);
    }
    loadData();
  }, [timeframe]);

  const togglePlatform = (name) => {
    setPlatformsVisible(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const tabs = ['Overview', 'Languages', 'Platforms', 'Activity', 'Comparison'];

  const kpis = [
    {
      title: 'Total Problems',
      value: analytics?.stats?.problemsSolved ?? 0,
      change: analytics?.stats?.problemsGrowth || '+0%',
      icon: Code2,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Acceptance Rate',
      value: `${analytics?.stats?.acceptanceRate ?? 0}%`,
      change: '+0%',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Active Days',
      value: analytics?.stats?.activeDays ?? 156,
      change: '+12%',
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Pull Requests',
      value: analytics?.stats?.pullRequests ?? 42,
      change: '+40%',
      icon: GitPullRequest,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Detailed insights into your coding journey.
              </p>
            </div>

            {/* Timeframe dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTimeframeOpen(!timeframeOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:border-amber-400/40"
              >
                <span>{timeframe}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {timeframeOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg py-1 z-30">
                  {['Last 30 days', 'Last 6 months', 'This Year'].map(tf => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => { setTimeframe(tf); setTimeframeOpen(false); }}
                      className="w-full text-left px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4 Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.title}
                  className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.title}</span>
                    <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {typeof kpi.value === 'number' ? <AnimatedCounter value={kpi.value} /> : kpi.value}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${kpi.bg} ${kpi.color}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-amber-500/15 text-[#C58B43] dark:text-[#E5A952] border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Main Chart Container */}
          {activeTab === 'Overview' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Problems Solved by Platform</h2>

                {/* Interactive Platform Legend / Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'LeetCode', color: '#FFA116' },
                    { key: 'CodeChef', color: '#5B4638' },
                    { key: 'HackerRank', color: '#00EA64' },
                    { key: 'GFG', color: '#2F8D46' }
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => togglePlatform(p.key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        platformsVisible[p.key]
                          ? 'border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'
                          : 'border-transparent text-slate-400 opacity-50 line-through'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>{p.key}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.platformBarChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.1)" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl space-y-1">
                              <p className="font-bold text-slate-300 mb-1">{payload[0].payload.month}</p>
                              {payload.map((entry) => (
                                <div key={entry.name} className="flex justify-between gap-4">
                                  <span style={{ color: entry.color }}>{entry.name}:</span>
                                  <span className="font-semibold">{entry.value}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {platformsVisible.LeetCode && <Bar dataKey="LeetCode" fill="#FFA116" radius={[4, 4, 0, 0]} />}
                    {platformsVisible.CodeChef && <Bar dataKey="CodeChef" fill="#5B4638" radius={[4, 4, 0, 0]} />}
                    {platformsVisible.HackerRank && <Bar dataKey="HackerRank" fill="#00EA64" radius={[4, 4, 0, 0]} />}
                    {platformsVisible.GFG && <Bar dataKey="GFG" fill="#2F8D46" radius={[4, 4, 0, 0]} />}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'Languages' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Deep Language Breakdown</h3>
              <div className="space-y-4">
                {[
                  { lang: 'JavaScript', pct: '32%', lines: '42,400', color: 'bg-yellow-400' },
                  { lang: 'Python', pct: '24%', lines: '31,800', color: 'bg-blue-500' },
                  { lang: 'Java', pct: '18%', lines: '23,850', color: 'bg-red-500' },
                  { lang: 'TypeScript', pct: '14%', lines: '18,550', color: 'bg-cyan-500' },
                  { lang: 'Others (C++, Go, Rust)', pct: '12%', lines: '15,900', color: 'bg-slate-400' },
                ].map((item) => (
                  <div key={item.lang} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-800 dark:text-slate-200">{item.lang}</span>
                      <span className="text-slate-500">{item.lines} lines ({item.pct})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Platforms' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-5 rounded-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Platform Activity Shares</h4>
                <p className="text-xs text-slate-500 mt-1">LeetCode accounts for 54% of your competitive problem volume.</p>
              </div>
              <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-5 rounded-2xl">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Contest Performance</h4>
                <p className="text-xs text-slate-500 mt-1">Calculated developer rating at {(analytics?.stats?.rating || 0).toLocaleString()} across active telemetry.</p>
              </div>
            </div>
          )}

          {activeTab === 'Activity' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Hourly & Daily Activity Density</h3>
              <p className="text-xs text-slate-500">Most active between 9:00 PM and 1:00 AM IST (Evening coding session peak).</p>
            </div>
          )}

          {activeTab === 'Comparison' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Cohort Comparison</h3>
              <p className="text-xs text-slate-500">You are in the <strong>top competitive bracket</strong> among registered developer peers.</p>
            </div>
          )}
        </main>
      </div>

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
