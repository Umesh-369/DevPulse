import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Search,
  ExternalLink,
  RefreshCw,
  Plus,
  X,
  Check,
  AlertCircle,
  Code2,
  Flame,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ProblemsPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  });
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form state for logging problem
  const [logForm, setLogForm] = useState({
    title: '',
    difficulty: 'Medium',
    platform: 'LeetCode',
    category: '',
    url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadProblems = async () => {
    try {
      const res = await api.problems.get();
      const rawList = res.problems || [];
      const fallbackTitles = ['Two Sum', 'LRU Cache Implementation', 'Reverse Linked List', 'Valid Parentheses'];
      const cleanList = rawList.filter(p => !fallbackTitles.includes(p.title) || p.isCustom);
      setProblems(cleanList);
      if (res.stats) {
        setStats(res.stats);
      } else if (cleanList.length) {
        setStats({
          totalSolved: cleanList.length,
          easySolved: cleanList.filter(p => p.difficulty === 'Easy').length,
          mediumSolved: cleanList.filter(p => p.difficulty === 'Medium').length,
          hardSolved: cleanList.filter(p => p.difficulty === 'Hard').length
        });
      }
    } catch (err) {
      console.warn('Failed to load problems:', err);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  // Sync Latest Submissions
  const handleSync = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const lcHandle = user?.connectedPlatforms?.leetcode?.handle;
      const res = await api.problems.sync(lcHandle);
      if (res.success) {
        const rawList = res.problems || [];
        const fallbackTitles = ['Two Sum', 'LRU Cache Implementation', 'Reverse Linked List', 'Valid Parentheses'];
        const cleanList = rawList.filter(p => !fallbackTitles.includes(p.title) || p.isCustom);
        setProblems(cleanList);
        if (res.stats) setStats(res.stats);
        showToast(res.message || 'Successfully synced latest submissions!');
      } else {
        setErrorMessage(res.message || 'Sync failed. Please verify your connected platform handle.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to sync submissions';
      setErrorMessage(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit Logged Problem
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logForm.title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.problems.log(logForm);
      if (res.success && res.problem) {
        setProblems(prev => [res.problem, ...prev]);
        setStats(prev => ({
          ...prev,
          totalSolved: (prev.totalSolved || 0) + 1,
          easySolved: logForm.difficulty === 'Easy' ? (prev.easySolved || 0) + 1 : prev.easySolved,
          mediumSolved: logForm.difficulty === 'Medium' ? (prev.mediumSolved || 0) + 1 : prev.mediumSolved,
          hardSolved: logForm.difficulty === 'Hard' ? (prev.hardSolved || 0) + 1 : prev.hardSolved
        }));
        setIsLogModalOpen(false);
        setLogForm({ title: '', difficulty: 'Medium', platform: 'LeetCode', category: '', url: '' });
        showToast('Problem successfully logged to your tracker!');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to log problem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const platforms = ['All', 'LeetCode', 'CodeChef', 'HackerRank', 'GeeksforGeeks', 'AtCoder'];

  const filtered = problems.filter(p => {
    const titleMatch = (p.title || '').toLowerCase().includes(search.toLowerCase());
    const catMatch = (p.category || '').toLowerCase().includes(search.toLowerCase());
    const matchSearch = titleMatch || catMatch;
    const matchDiff = selectedDifficulty === 'All' || (p.difficulty || '').toLowerCase() === selectedDifficulty.toLowerCase();
    const matchPlat = selectedPlatform === 'All' || (p.platform || '').toLowerCase() === selectedPlatform.toLowerCase();
    return matchSearch && matchDiff && matchPlat;
  });

  const getDiffBadge = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
      case 'Medium':
        return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
      case 'Hard':
        return 'text-rose-500 bg-rose-500/10 border border-rose-500/20';
      default:
        return 'text-slate-500 bg-slate-100';
    }
  };

  const openProblemUrl = (p) => {
    const targetUrl = p.url || (p.titleSlug ? `https://leetcode.com/problems/${p.titleSlug}` : null);
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-medium text-xs shadow-2xl animate-in slide-in-from-bottom-3">
              <Check className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="p-1 hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Problem Solving Tracker</span>
                <CheckSquare className="w-6 h-6 text-amber-500" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Synchronized real submissions from LeetCode, CodeChef, and linked coding profiles.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#151922] hover:border-amber-400/50 shadow-xs hover:shadow-sm disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Latest Submissions'}</span>
              </button>

              <button
                onClick={() => setIsLogModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] hover:opacity-90 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Log Solved Problem</span>
              </button>
            </div>
          </div>

          {/* Real Total Solved Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Total Solved</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {stats.totalSolved}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Easy Solved</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-500">
                  {stats.easySolved}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Medium Solved</p>
                <p className="text-xl sm:text-2xl font-black text-amber-500">
                  {stats.mediumSolved}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/5 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Hard Solved</p>
                <p className="text-xl sm:text-2xl font-black text-rose-500">
                  {stats.hardSolved}
                </p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#151922] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xs">
            {/* Search input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search problem title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">Difficulty:</span>
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    selectedDifficulty === d
                      ? 'bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11]'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {d}
                </button>
              ))}

              <span className="text-xs text-slate-400 ml-2">Platform:</span>
              {platforms.slice(0, 4).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    selectedPlatform === p
                      ? 'bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11]'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Problems Table */}
          <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Problem</th>
                  <th className="py-3.5 px-6">Platform</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6 text-center">Difficulty</th>
                  <th className="py-3.5 px-6 text-right">Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-medium">No problems found</p>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Click "Sync Latest Submissions" to import your recent LeetCode solutions or click "+ Log Solved Problem" to record problems manually.
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 cursor-pointer"
                          >
                            {isSyncing ? 'Syncing...' : 'Sync Submissions'}
                          </button>
                          <button
                            onClick={() => setIsLogModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                          >
                            + Log Problem
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const hasLink = Boolean(p.url || p.titleSlug);
                    return (
                      <tr
                        key={p.id}
                        onClick={() => openProblemUrl(p)}
                        className={`group transition-colors ${
                          hasLink ? 'cursor-pointer hover:bg-amber-500/[0.04] dark:hover:bg-amber-500/[0.06]' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                        }`}
                        title={hasLink ? 'Click to open problem in a new tab' : ''}
                      >
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span>{p.title}</span>
                            {hasLink && (
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0 opacity-70 group-hover:opacity-100" />
                            )}
                            {p.isCustom && (
                              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {p.platform || 'LeetCode'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                          {p.category || 'Algorithms'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getDiffBadge(p.difficulty)}`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-400 font-mono text-[11px]">
                          {p.date || 'Recent'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal: Log Solved Problem Directly */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Log Solved Problem
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trapping Rain Water"
                  value={logForm.title}
                  onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Platform
                  </label>
                  <select
                    value={logForm.platform}
                    onChange={(e) => setLogForm({ ...logForm, platform: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#111315] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="AtCoder">AtCoder</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={logForm.difficulty}
                    onChange={(e) => setLogForm({ ...logForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#111315] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category / Topic Tags
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dynamic Programming, Two Pointers"
                  value={logForm.category}
                  onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Problem URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={logForm.url}
                  onChange={(e) => setLogForm({ ...logForm, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
