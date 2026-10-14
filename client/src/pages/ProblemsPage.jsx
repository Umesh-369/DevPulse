import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { api } from '../services/api';
import { CheckSquare, Search, ExternalLink, Filter } from 'lucide-react';

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    async function loadProblems() {
      const res = await api.problems.get();
      setProblems(res.problems || []);
    }
    loadProblems();
  }, []);

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const platforms = ['All', 'LeetCode', 'CodeChef', 'HackerRank', 'GeeksforGeeks', 'AtCoder'];

  const filtered = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchDiff = selectedDifficulty === 'All' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchPlat = selectedPlatform === 'All' || p.platform.toLowerCase() === selectedPlatform.toLowerCase();
    return matchSearch && matchDiff && matchPlat;
  });

  const getDiffBadge = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
      case 'Hard': return 'text-red-500 bg-red-500/10 border border-red-500/20';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Problem Solving Tracker</span>
              <CheckSquare className="w-6 h-6 text-amber-500" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Synchronized log of competitive problems solved across all 6 linked coding platforms.
            </p>
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
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">Difficulty:</span>
              {difficulties.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedDifficulty === d
                      ? 'bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11]'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {d}
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
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {p.title}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">
                      {p.platform}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {p.category}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getDiffBadge(p.difficulty)}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400 font-mono text-[11px]">
                      {p.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
