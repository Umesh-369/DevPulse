import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, RefreshCw, LogOut, User, Settings, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HeaderBar({ onOpenSearch }) {
  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncNotice(true);
      setTimeout(() => setSyncNotice(false), 2500);
    }, 900);
  };

  const notifications = [
    { id: 1, title: 'Platform synchronized', text: 'Telemetry synced successfully across connected accounts.', time: 'Just now' },
    { id: 2, title: 'Leaderboard active', text: 'Your rank and rating are computed live from verified stats.', time: '1h ago' },
    { id: 3, title: 'AI Recommendation ready', text: 'New curated practice problems available.', time: '3h ago' },
  ];

  return (
    <header className="h-16 px-6 border-b border-slate-200/80 dark:border-white/5 bg-[#FAF8F5]/80 dark:bg-[#0B0D11]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-xl hover:border-amber-400/50 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Search anything...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sync Button */}
        <div className="relative">
          <button
            onClick={handleSync}
            title="Sync all platforms"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-[#E5A952]' : ''}`} />
          </button>
          {syncNotice && (
            <div className="absolute top-10 right-0 whitespace-nowrap bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All 6 platforms synced!</span>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-[#0B0D11]" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl py-3 px-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</span>
                <span className="text-[10px] text-amber-500 font-medium">3 unread</span>
              </div>
              <div className="mt-2 space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="text-left text-xs p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.text}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs hover:ring-2 hover:ring-amber-400/50 transition-all focus:outline-none cursor-pointer border border-amber-500/25"
            title={user?.name || 'User Profile'}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { navigate('/portfolio'); setProfileMenuOpen(false); }}
                  className="w-full px-4 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Your Profile</span>
                </button>
                <button
                  onClick={() => { navigate('/settings'); setProfileMenuOpen(false); }}
                  className="w-full px-4 py-2 text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); setProfileMenuOpen(false); }}
                  className="w-full px-4 py-2 text-xs flex items-center gap-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
