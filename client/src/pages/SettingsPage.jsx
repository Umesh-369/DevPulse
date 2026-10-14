import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import confetti from 'canvas-confetti';
import {
  Settings,
  User,
  Link as LinkIcon,
  Moon,
  Sun,
  Bell,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import {
  GitHubIcon,
  LeetCodeIcon,
  CodeChefIcon,
  HackerRankIcon,
  GeeksforGeeksIcon,
  AtCoderIcon
} from '../components/common/PlatformIcons';
import { API_BASE } from '../services/api';

const API_URL = API_BASE;

export default function SettingsPage() {
  const { user, updateUser, connectPlatform } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState({});
  const [platformErrors, setPlatformErrors] = useState({});
  const [platformSuccess, setPlatformSuccess] = useState({});

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Full Stack Developer',
    college: user?.college || '',
    bio: user?.bio || '',
    targetRole: user?.targetRole || 'Senior Full Stack Engineer'
  });

  const [handles, setHandles] = useState({
    github: user?.connectedPlatforms?.github?.handle || '',
    leetcode: user?.connectedPlatforms?.leetcode?.handle || '',
    codechef: user?.connectedPlatforms?.codechef?.handle || '',
    hackerrank: user?.connectedPlatforms?.hackerrank?.handle || '',
    geeksforgeeks: user?.connectedPlatforms?.geeksforgeeks?.handle || '',
    atcoder: user?.connectedPlatforms?.atcoder?.handle || '',
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateUser(formData);
    setSavedSuccess(true);
    confetti({ particleCount: 40, spread: 50 });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveHandle = async (platform) => {
    setSyncingPlatform(prev => ({ ...prev, [platform]: true }));
    setPlatformErrors(prev => ({ ...prev, [platform]: '' }));
    setPlatformSuccess(prev => ({ ...prev, [platform]: '' }));

    try {
      const res = await connectPlatform(platform, handles[platform]);
      if (res && res.success === false) {
        throw new Error(res.message || 'Sync failed');
      }
      setPlatformSuccess(prev => ({ ...prev, [platform]: res?.message || 'Synced successfully!' }));
      confetti({ particleCount: 35, spread: 45 });
      setTimeout(() => {
        setPlatformSuccess(prev => ({ ...prev, [platform]: '' }));
      }, 3000);
    } catch (err) {
      setPlatformErrors(prev => ({ ...prev, [platform]: err.message || 'Failed to sync platform' }));
    } finally {
      setSyncingPlatform(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleConnectGitHubOAuth = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  const tabs = ['Profile', 'Connected Accounts', 'Appearance', 'Notifications'];

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Settings</span>
              <Settings className="w-6 h-6 text-amber-500" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal information, connected handles, and workspace preferences.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-amber-500/15 text-[#C58B43] dark:text-[#E5A952] border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Profile Details */}
          {activeTab === 'Profile' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xs">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Professional Headline</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">College / Institution</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  {savedSuccess ? (
                    <span className="text-xs text-emerald-500 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Settings updated successfully!
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl hover:opacity-90 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Connected Coding Accounts */}
          {activeTab === 'Connected Accounts' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Platform Handles & Sync</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Connect public profiles and sync real-time telemetry from LeetCode GraphQL and GitHub.
                </p>
              </div>

              {[
                { key: 'github', name: 'GitHub', icon: GitHubIcon, note: 'Syncs public repos & stars or connect via OAuth' },
                { key: 'leetcode', name: 'LeetCode', icon: LeetCodeIcon, note: 'Direct GraphQL sync of solved DSA problems' },
                { key: 'codechef', name: 'CodeChef', icon: CodeChefIcon, note: 'Competitive programming contest rating' },
                { key: 'hackerrank', name: 'HackerRank', icon: HackerRankIcon, note: 'Practice badges & track skills' },
                { key: 'geeksforgeeks', name: 'GeeksforGeeks', icon: GeeksforGeeksIcon, note: 'Practice score & solved problems' },
                { key: 'atcoder', name: 'AtCoder', icon: AtCoderIcon, note: 'Japanese contest rank & algorithmic rating' },
              ].map(p => {
                const Icon = p.icon;
                const isSyncing = syncingPlatform[p.key];
                const error = platformErrors[p.key];
                const successMsg = platformSuccess[p.key];
                const pData = user?.connectedPlatforms?.[p.key];

                let statSummary = '';
                if (p.key === 'leetcode' && pData?.solved) {
                  statSummary = `${pData.solved} Solved (E:${pData.easySolved || 0} M:${pData.mediumSolved || 0} H:${pData.hardSolved || 0})`;
                } else if (p.key === 'github' && pData?.repos) {
                  statSummary = `${pData.repos} Repositories • ${pData.contributions || 0} Contributions`;
                }

                return (
                  <div key={p.key} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-white/10 shadow-xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                            {pData?.connected && (
                              <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{p.note}</p>
                          {statSummary && (
                            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                              {statSummary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.key === 'github' && (
                          <button
                            type="button"
                            onClick={handleConnectGitHubOAuth}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-black dark:bg-[#1C212D] dark:hover:bg-[#252C3D] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <GitHubIcon className="w-3.5 h-3.5" />
                            <span>OAuth</span>
                          </button>
                        )}

                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">@</span>
                          <input
                            type="text"
                            value={handles[p.key]}
                            onChange={(e) => setHandles({ ...handles, [p.key]: e.target.value })}
                            className="pl-6 pr-2.5 py-1.5 text-xs bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-36"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => handleSaveHandle(p.key)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        >
                          {isSyncing && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{successMsg}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 3: Appearance */}
          {activeTab === 'Appearance' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => { if (isDark) toggleTheme(); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    !isDark ? 'border-amber-500 bg-amber-500/10 shadow-sm' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5'
                  }`}
                >
                  <Sun className="w-6 h-6 text-amber-500 mb-2" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Warm Alabaster Light Mode</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">High clarity with soft parchment surfaces</p>
                </div>
                <div
                  onClick={() => { if (!isDark) toggleTheme(); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isDark ? 'border-[#E5A952] bg-amber-500/15 shadow-sm' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5'
                  }`}
                >
                  <Moon className="w-6 h-6 text-[#E5A952] mb-2" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Cosmic Obsidian Dark Mode</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Deep black with golden amber highlights</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Notifications */}
          {activeTab === 'Notifications' && (
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Alerts</h3>
              {[
                { title: 'Streak Risk Alert', desc: 'Get notified if you have not committed or solved a problem by 8 PM' },
                { title: 'Leaderboard Movement', desc: 'Alert when a college peer passes your ranking' },
                { title: 'AI Daily Recommendations', desc: 'Morning summary of recommended DSA problems' }
              ].map(item => (
                <div key={item.title} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
