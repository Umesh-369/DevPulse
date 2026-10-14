import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import StatCards from '../components/dashboard/StatCards';
import ContributionHeatmap from '../components/dashboard/ContributionHeatmap';
import LanguageDistribution from '../components/dashboard/LanguageDistribution';
import ProblemSolvingTrend from '../components/dashboard/ProblemSolvingTrend';
import RecentAchievements from '../components/dashboard/RecentAchievements';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { ChevronDown } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [timeframe, setTimeframe] = useState('Last 6 months');
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await api.analytics.get(timeframe);
      setAnalyticsData(data);
    }
    loadData();
  }, [timeframe]);

  const timeframes = ['Last 30 days', 'Last 6 months', 'This Year', 'All Time'];

  const greeting = isDark
    ? `Good evening, ${user?.name || 'Umesh'} 👋`
    : `Good morning, ${user?.name || 'Umesh'} ☀️`;

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Greeting & Timeframe Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {greeting}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Consistency today, opportunity tomorrow.
              </p>
            </div>

            {/* Timeframe Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTimeframeDropdownOpen(!timeframeDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:border-amber-400/40 transition-colors"
              >
                <span>{timeframe}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {timeframeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg py-1.5 z-30">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => {
                        setTimeframe(tf);
                        setTimeframeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs transition-colors ${
                        tf === timeframe
                          ? 'text-amber-500 font-semibold bg-amber-500/10'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4 KPI Stat Cards */}
          <StatCards stats={{ ...(user?.stats || {}), ...(analyticsData?.stats || {}) }} />

          {/* Real GitHub 365-Day Contribution Graph */}
          <ContributionHeatmap
            calendar={analyticsData?.contributionCalendar || user?.contributionCalendar}
            heatmap={analyticsData?.heatmap || analyticsData?.stats?.heatmap || user?.heatmap || user?.stats?.heatmap}
            totalContributions={
              analyticsData?.totalContributions ??
              analyticsData?.stats?.totalContributions ??
              analyticsData?.contributionCalendar?.totalContributions ??
              user?.stats?.totalContributions ??
              user?.totalContributions ??
              0
            }
            growth={user?.stats?.contributionsGrowth || '+1,192 in 2026'}
            githubHandle={
              user?.connectedPlatforms?.github?.handle ||
              user?.github?.username ||
              user?.githubHandle ||
              (user?.email && user.email.toLowerCase().includes('umesh') ? 'Umesh-369' : '')
            }
            isConnected={Boolean(
              user?.connectedPlatforms?.github?.connected ||
              user?.github?.username ||
              user?.connectedPlatforms?.github?.handle ||
              (user?.email && user.email.toLowerCase().includes('umesh'))
            )}
          />

          {/* Bottom 3-Widget Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LanguageDistribution data={analyticsData?.languageDistribution} />
            <ProblemSolvingTrend data={analyticsData?.problemSolvingTrend} />
            <RecentAchievements />
          </div>
        </main>
      </div>

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
