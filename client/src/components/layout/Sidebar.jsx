import React from 'react';
import { NavLink } from 'react-router-dom';
import DevPulseLogo from '../common/DevPulseLogo';
import {
  LayoutDashboard,
  BarChart3,
  CheckSquare,
  GitBranch,
  Sparkles,
  Trophy,
  User,
  Target,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ className = '' }) {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Problems', href: '/problems', icon: CheckSquare },
    { name: 'Repositories', href: '/repositories', icon: GitBranch },
    { name: 'AI Insights', href: '/ai-insights', icon: Sparkles },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Portfolio', href: '/portfolio', icon: User },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 flex-shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-white/5 bg-[#FAF8F5] dark:bg-[#0B0D11] min-h-screen transition-colors ${className}`}
    >
      <div className="p-5">
        {/* Top Logo */}
        <div className="pb-6 mb-2 border-b border-slate-200/60 dark:border-white/5">
          <DevPulseLogo size="md" />
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-amber-500/10 text-[#C58B43] dark:text-[#E5A952] dark:bg-[#151922] font-semibold border border-amber-500/20 dark:border-amber-400/20 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-[#C58B43] dark:text-[#E5A952]'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E5A952] shadow-[0_0_8px_#E5A952]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Summary Card */}
      <div className="p-4 m-3 rounded-2xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs">
        <NavLink
          to="/portfolio"
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/25">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#151922] rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-500 transition-colors">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {user.targetRole || 'Full Stack Dev'}
            </p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </NavLink>
      </div>
    </aside>
  );
}
