import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, BarChart3, CheckSquare, GitBranch, Sparkles, Trophy, User, Target, Settings, X } from 'lucide-react';

export default function CommandSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    { title: 'Dashboard', desc: 'Overview, KPIs & streak heatmap', icon: LayoutDashboard, href: '/dashboard' },
    { title: 'Growth Analytics', desc: 'Acceptance rates & multi-platform chart', icon: BarChart3, href: '/analytics' },
    { title: 'Problem Tracker', desc: 'LeetCode, CodeChef & GFG problems', icon: CheckSquare, href: '/problems' },
    { title: 'Repositories', desc: 'GitHub repositories, stars & forks', icon: GitBranch, href: '/repositories' },
    { title: 'AI Career Coach', desc: 'Skill scores, 7-day roadmaps & tips', icon: Sparkles, href: '/ai-insights' },
    { title: 'Leaderboard', desc: 'College, global & friends rankings', icon: Trophy, href: '/leaderboard' },
    { title: 'Developer Portfolio', desc: 'Public profile, achievements & projects', icon: User, href: '/portfolio' },
    { title: 'Goals & Targets', desc: 'Track your annual milestones', icon: Target, href: '/goals' },
    { title: 'Settings', desc: 'Theme, handles & profile configuration', icon: Settings, href: '/settings' },
  ];

  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/10">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-amber-500/10 text-slate-600 dark:text-slate-300 group-hover:text-amber-500 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found for "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0B0D11] border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with ⌘K</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
