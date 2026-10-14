import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
  Search,
  RefreshCw,
  Sparkles,
  Bookmark,
  Check,
  Code2,
  FolderGit2,
  Globe,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { GitHubIcon } from '../components/common/PlatformIcons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LANGUAGE_COLORS = {
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  Python: '#3776AB',
  Java: '#EA2D2E',
  'C++': '#00599C',
  C: '#A8B9CC',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#DEA584',
  HTML: '#E34F26',
  CSS: '#1572B6',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Dart: '#00B4AB',
  Swift: '#F05138',
  Kotlin: '#7F52FF',
  'Jupyter Notebook': '#DA5B0B',
  Shell: '#89E051',
  Vue: '#41B883',
  Other: '#9CA3AF'
};

export default function RepositoriesPage() {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('All');
  const [sortBy, setSortBy] = useState('Most Stars');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [githubInput, setGithubInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadRepos = async () => {
    setIsLoading(true);
    try {
      const res = await api.repositories.get();
      if (res && Array.isArray(res.repositories)) {
        setRepos(res.repositories);
      }
    } catch (err) {
      console.error('Failed to load repositories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
  }, []);

  // Sync Repositories Handler
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const ghUsername = user?.connectedPlatforms?.github?.handle || user?.github?.username;
      const res = await api.repositories.sync(ghUsername);
      if (res.success && Array.isArray(res.repositories)) {
        setRepos(res.repositories);
        confetti({ particleCount: 50, spread: 60 });
        showToast(res.message || 'Repositories successfully synchronized!');
      } else {
        showToast(res.message || 'No repositories found to sync.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to sync repositories.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Feature / Pin on Portfolio Handler
  const handleToggleFeature = async (repoId, repoName, e) => {
    e.stopPropagation();
    try {
      const res = await api.repositories.toggleFeature(repoId);
      if (res.success) {
        setRepos(prev =>
          prev.map(r => {
            if (String(r.id) === String(repoId) || String(r.repoId) === String(repoId)) {
              return { ...r, isFeatured: res.isFeatured, isPinned: res.isPinned };
            }
            return r;
          })
        );
        showToast(res.isFeatured ? `Pinned "${repoName}" to Portfolio!` : `Unpinned "${repoName}" from Portfolio.`);
        if (res.isFeatured) {
          confetti({ particleCount: 30, spread: 50 });
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle feature flag.');
    }
  };

  // Connect GitHub Handle on Empty State
  const handleConnectGitHub = async (e) => {
    e.preventDefault();
    if (!githubInput.trim()) return;
    setIsConnecting(true);
    try {
      await api.platforms.connectGitHub(githubInput.trim());
      const syncRes = await api.repositories.sync(githubInput.trim());
      if (syncRes.repositories) {
        setRepos(syncRes.repositories);
      }
      setGithubInput('');
      confetti({ particleCount: 60, spread: 60 });
      showToast(`Connected GitHub @${githubInput.trim()} and imported repositories!`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      showToast(err.message || 'Failed to connect GitHub account.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Dynamic Languages extracted from actual repos
  const availableLanguages = useMemo(() => {
    const set = new Set();
    repos.forEach(r => {
      if (r.language && r.language !== 'Other') {
        set.add(r.language);
      }
    });
    return ['All', ...Array.from(set).sort()];
  }, [repos]);

  // KPI Calculations
  const totalRepos = repos.length;
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? r.stars ?? 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count ?? r.forks ?? 0), 0);

  const topLanguage = useMemo(() => {
    const counts = {};
    repos.forEach(r => {
      if (r.language && r.language !== 'Other') {
        counts[r.language] = (counts[r.language] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'N/A';
  }, [repos]);

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    const result = repos.filter(r => {
      const name = (r.name || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      const query = search.toLowerCase();
      const matchesSearch = name.includes(query) || desc.includes(query);
      const matchesLang = selectedLang === 'All' || r.language === selectedLang;
      return matchesSearch && matchesLang;
    });

    result.sort((a, b) => {
      if (sortBy === 'Most Stars') {
        return (b.stargazers_count ?? b.stars ?? 0) - (a.stargazers_count ?? a.stars ?? 0);
      }
      if (sortBy === 'Most Forks') {
        return (b.forks_count ?? b.forks ?? 0) - (a.forks_count ?? a.forks ?? 0);
      }
      if (sortBy === 'Alphabetical') {
        return (a.name || '').localeCompare(b.name || '');
      }
      // Recently Updated
      const dateA = new Date(a.updated_at || a.updated || 0).getTime();
      const dateB = new Date(b.updated_at || b.updated || 0).getTime();
      return dateB - dateA;
    });

    return result;
  }, [repos, search, selectedLang, sortBy]);

  const connectedGhHandle = user?.connectedPlatforms?.github?.handle || user?.github?.username;

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

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Code Repositories</span>
                <GitBranch className="w-6 h-6 text-amber-500" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {connectedGhHandle
                  ? `Live codebases synchronized from @${connectedGhHandle} on GitHub.`
                  : 'Connect GitHub to sync repositories, inspect languages, and feature code on your portfolio.'}
              </p>
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] shadow-xs hover:opacity-90 disabled:opacity-50 transition-all self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing GitHub...' : 'Sync GitHub Repositories'}</span>
            </button>
          </div>

          {/* Summary KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Repositories</span>
                <FolderGit2 className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {isLoading ? '...' : totalRepos}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Synced from GitHub</span>
            </div>

            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Stars Earned</span>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {isLoading ? '...' : totalStars}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Community Stargazers</span>
            </div>

            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Forks</span>
                <GitFork className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {isLoading ? '...' : totalForks}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Downstream Forks</span>
            </div>

            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Top Primary Language</span>
                <Code2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {topLanguage !== 'N/A' && (
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: LANGUAGE_COLORS[topLanguage] || '#9CA3AF' }}
                  />
                )}
                <p className="text-xl font-black text-slate-900 dark:text-white truncate">
                  {isLoading ? '...' : topLanguage}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Most frequent codebase tech</span>
            </div>
          </div>

          {/* Search, Filter & Sort Controls Row */}
          <div className="bg-white dark:bg-[#151922] p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search repository by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            {/* Language and Sort Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Language filter dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Lang:</span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang} className="bg-white dark:bg-[#151922]">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Most Stars" className="bg-white dark:bg-[#151922]">Most Stars</option>
                  <option value="Recently Updated" className="bg-white dark:bg-[#151922]">Recently Updated</option>
                  <option value="Most Forks" className="bg-white dark:bg-[#151922]">Most Forks</option>
                  <option value="Alphabetical" className="bg-white dark:bg-[#151922]">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Repositories Grid or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-44 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : repos.length === 0 ? (
            /* Empty State: Not Connected */
            <div className="bg-white dark:bg-[#151922] border border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-10 text-center space-y-5 max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <GitHubIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No GitHub repositories synced yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  Connect your public GitHub username or log in via GitHub OAuth to instantly synchronize your repositories, languages, and star statistics.
                </p>
              </div>

              <form onSubmit={handleConnectGitHub} className="flex items-center gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  required
                  placeholder="Enter GitHub username (e.g. torvalds)"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-4 py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
                  <span>Connect</span>
                </button>
              </form>

              <div className="pt-2">
                <a
                  href={`${API_URL}/api/auth/github`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
                >
                  <GitHubIcon className="w-4 h-4" />
                  <span>Or authenticate with GitHub OAuth →</span>
                </a>
              </div>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            /* No search results */
            <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No repositories match your current filter.
              </p>
              <button
                onClick={() => { setSearch(''); setSelectedLang('All'); }}
                className="text-xs text-amber-500 font-medium hover:underline"
              >
                Reset search & filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndSorted.map(repo => {
                const repoId = repo.repoId || repo.id || repo._id;
                const repoUrl = repo.html_url || repo.url || `https://github.com/${connectedGhHandle || 'developer'}/${repo.name}`;
                const isFeatured = Boolean(repo.isFeatured || repo.isPinned);
                const langColor = LANGUAGE_COLORS[repo.language] || '#9CA3AF';
                const updatedStr = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : (repo.updated || 'Recently');

                return (
                  <div
                    key={repoId}
                    className={`bg-white dark:bg-[#151922] border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                      isFeatured
                        ? 'border-amber-400/60 shadow-amber-500/5'
                        : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                    }`}
                  >
                    <div>
                      {/* Top Row: Title, public badge, Feature toggle */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-slate-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 transition-colors truncate block"
                            >
                              {repo.name}
                            </a>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 shrink-0">
                              Public
                            </span>
                          </div>
                          {repo.full_name && (
                            <p className="text-[11px] font-mono text-slate-400 truncate">
                              {repo.full_name}
                            </p>
                          )}
                        </div>

                        {/* Feature on Portfolio Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFeature(repoId, repo.name, e)}
                          title={isFeatured ? 'Featured on Portfolio (Click to unpin)' : 'Feature on Portfolio'}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all shrink-0 ${
                            isFeatured
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/10'
                          }`}
                        >
                          <Sparkles className={`w-3 h-3 ${isFeatured ? 'text-amber-500 fill-amber-500' : ''}`} />
                          <span>{isFeatured ? 'Featured' : 'Feature'}</span>
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                        {repo.description || 'Public GitHub repository codebase.'}
                      </p>

                      {/* Topics / Tags */}
                      {Array.isArray(repo.topics) && repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {repo.topics.slice(0, 4).map(topic => (
                            <span
                              key={topic}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                            >
                              #{topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Links Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-white/5 text-xs text-slate-400 gap-2.5">
                      <div className="flex items-center gap-4">
                        {/* Language */}
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }} />
                          {repo.language || 'Code'}
                        </span>

                        {/* Stars */}
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                          <span>{repo.stargazers_count ?? repo.stars ?? 0}</span>
                        </span>

                        {/* Forks */}
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5" />
                          <span>{repo.forks_count ?? repo.forks ?? 0}</span>
                        </span>

                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          Updated {updatedStr}
                        </span>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {repo.homepage && (
                          <a
                            href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Demo</span>
                          </a>
                        )}

                        <a
                          href={repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C58B43] dark:text-[#E5A952] hover:underline"
                        >
                          <span>View on GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
