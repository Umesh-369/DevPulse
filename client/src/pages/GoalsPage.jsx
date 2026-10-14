import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { Target, Plus, CheckCircle2, X } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: 100,
    unit: 'Problems',
    deadline: 'Dec 2026',
    category: 'DSA'
  });

  useEffect(() => {
    async function loadGoals() {
      const res = await api.goals.get();
      setGoals(res.goals || []);
    }
    loadGoals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await api.goals.create(newGoal);
    if (res.goal) {
      setGoals([res.goal, ...goals]);
      setIsModalOpen(false);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Targets & Coding Goals</span>
                <Target className="w-6 h-6 text-amber-500" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Set milestones, monitor completion percentages, and stay accountable.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100)) || g.progress || 0;
              return (
                <div
                  key={g.id}
                  className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                        {g.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {g.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Target: {g.deadline}</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress: {g.current} / {g.target} {g.unit}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Target Milestone</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Goal Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Dynamic Programming Patterns"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Target Number</label>
                  <input
                    type="number"
                    required
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Unit</label>
                  <input
                    type="text"
                    required
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Target Deadline</label>
                <input
                  type="text"
                  placeholder="e.g. Nov 2026"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
