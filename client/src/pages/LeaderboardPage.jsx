import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import HeaderBar from '../components/layout/HeaderBar';
import CommandSearchModal from '../components/layout/CommandSearchModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Medal,
  Flame,
  Star,
  ChevronDown,
  Plus,
  X,
  Swords,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState('Global');
  const [timeframe, setTimeframe] = useState('This Month');
  const [timeframeOpen, setTimeframeOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // New challenge form state
  const [challengeForm, setChallengeForm] = useState({
    title: 'Weekly Algorithm Sprint',
    targetProblems: 15,
    duration: '7 Days',
    invitedPeer: ''
  });
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  useEffect(() => {
    async function loadLeaderboard() {
      setIsLoading(true);
      try {
        const scopeKey = scope === 'My College' ? 'college' : scope.toLowerCase();
        const res = await api.leaderboard.get(scopeKey, timeframe);
        const list = Array.isArray(res.leaderboard) ? res.leaderboard : [];
        setLeaderboard(list);

        // Pre-select first eligible peer for challenge if none selected
        const peers = list.filter(p => !p.isCurrentUser && p.email !== user?.email);
        if (peers.length > 0) {
          setChallengeForm(prev => ({
            ...prev,
            invitedPeer: prev.invitedPeer || peers[0].name
          }));
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadLeaderboard();
  }, [scope, timeframe, user]);

  const handleCreateChallenge = (e) => {
    e.preventDefault();
    confetti({ particleCount: 60, spread: 60 });
    setChallengeSuccess(true);
    setTimeout(() => {
      setChallengeSuccess(false);
      setIsChallengeModalOpen(false);
    }, 1500);
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/40 flex items-center justify-center font-bold text-xs shadow-xs">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-300/20 text-slate-400 border border-slate-300/40 flex items-center justify-center font-bold text-xs shadow-xs">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-600 border border-amber-700/40 flex items-center justify-center font-bold text-xs shadow-xs">
          🥉
        </div>
      );
    }
    return (
      <span className="w-7 text-center font-bold text-xs text-slate-400">
        {rank}
      </span>
    );
  };

  const myEntry = leaderboard.find(dev =>
    dev.isCurrentUser ||
    (user && (
      (dev._id && user._id && String(dev._id) === String(user._id)) ||
      (dev.email && user.email && dev.email.toLowerCase() === user.email.toLowerCase()) ||
      (dev.name && user.name && dev.name.toLowerCase() === user.name.toLowerCase())
    ))
  );

  const availablePeers = leaderboard.filter(dev => {
    const isMe = dev.isCurrentUser ||
      (user && (
        (dev._id && user._id && String(dev._id) === String(user._id)) ||
        (dev.email && user.email && dev.email.toLowerCase() === user.email.toLowerCase()) ||
        (dev.name && user.name && dev.name.toLowerCase() === user.name.toLowerCase())
      ));
    return !isMe;
  });

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] transition-colors">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Leaderboard</span>
                <Trophy className="w-6 h-6 text-amber-500" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-time competitive ranking computed from verified developer statistics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Timeframe Dropdown */}
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
                    {['This Month', 'This Week', 'All Time'].map(tf => (
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

              {/* Create Challenge Button */}
              <button
                onClick={() => setIsChallengeModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] shadow-xs hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Challenge</span>
              </button>
            </div>
          </div>

          {/* Scope Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            {['Global', 'My College', 'Friends'].map((tab) => (
              <button
                key={tab}
                onClick={() => setScope(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  scope === tab
                    ? 'bg-amber-500/15 text-[#C58B43] dark:text-[#E5A952] border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Leaderboard Table Card */}
          <div className="bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6 w-16">#</th>
                    <th className="py-3.5 px-6">Developer</th>
                    <th className="py-3.5 px-6 text-center">Problems</th>
                    <th className="py-3.5 px-6 text-center">Streak</th>
                    <th className="py-3.5 px-6 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No registered developers found</p>
                        <p className="text-xs text-slate-400 mt-1">Connect your accounts or register to establish the leaderboard.</p>
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((dev) => {
                      const isMe = dev.isCurrentUser ||
                        (user && (
                          (dev._id && user._id && String(dev._id) === String(user._id)) ||
                          (dev.email && user.email && dev.email.toLowerCase() === user.email.toLowerCase()) ||
                          (dev.name && user.name && dev.name.toLowerCase() === user.name.toLowerCase())
                        ));

                      const problemsCount = isMe
                        ? (user?.stats?.problemsSolved ?? dev.problems ?? 0)
                        : (dev.problems ?? 0);

                      const streakCount = isMe
                        ? (user?.stats?.currentStreak ?? dev.streak ?? 0)
                        : (dev.streak ?? 0);

                      const ratingScore = isMe
                        ? (user?.stats?.rating ?? dev.rating ?? 0)
                        : (dev.rating ?? 0);

                      return (
                        <tr
                          key={dev.rank || dev._id || dev.id}
                          onClick={() => !isMe && setSelectedUser(dev)}
                          className={`transition-colors ${
                            isMe
                              ? 'bg-amber-500/10 dark:bg-amber-500/15 font-semibold border-l-4 border-l-[#E5A952]'
                              : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                          }`}
                        >
                          <td className="py-4 px-6">{getRankBadge(dev.rank)}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isMe
                                    ? 'bg-[#E5A952] text-black font-extrabold shadow-xs'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                                }`}
                              >
                                {dev.avatar ? (
                                  <img src={dev.avatar} alt={dev.name} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                  dev.name ? dev.name.charAt(0).toUpperCase() : 'D'
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isMe ? 'text-[#C58B43] dark:text-[#E5A952]' : 'text-slate-900 dark:text-white'}`}>
                                    {dev.name || 'Developer'}
                                  </span>
                                  {isMe && (
                                    <span className="text-[10px] bg-[#E5A952] text-black px-1.5 py-0.5 rounded-full font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {dev.college || 'Developer'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-slate-800 dark:text-slate-200">
                            {problemsCount.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400">
                              <Flame className="w-3.5 h-3.5 fill-orange-500/20" />
                              {streakCount}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-extrabold text-slate-900 dark:text-white">
                            {ratingScore.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Side-by-Side Comparison Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Head-to-Head Comparison</h3>
              </div>
              <button onClick={() => setSelectedUser(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Current User */}
              <div className="bg-amber-500/10 dark:bg-amber-500/15 p-4 rounded-2xl border border-amber-500/30 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#E5A952] text-black font-extrabold text-base flex items-center justify-center mx-auto shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h4 className="text-sm font-bold text-[#C58B43] dark:text-[#E5A952]">{user?.name || 'You'} (You)</h4>
                <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300 pt-2 border-t border-amber-500/20">
                  <p>Rank: <strong>#{myEntry?.rank ?? 1}</strong></p>
                  <p>Problems: <strong>{(user?.stats?.problemsSolved ?? myEntry?.problems ?? 0).toLocaleString()}</strong></p>
                  <p>Streak: <strong className="text-orange-500">{user?.stats?.currentStreak ?? myEntry?.streak ?? 0} Days</strong></p>
                  <p>Rating: <strong>{(user?.stats?.rating ?? myEntry?.rating ?? 0).toLocaleString()}</strong></p>
                </div>
              </div>

              {/* Selected Peer */}
              <div className="bg-slate-50 dark:bg-[#1C212D] p-4 rounded-2xl border border-slate-200 dark:border-white/10 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-base flex items-center justify-center mx-auto border border-slate-300 dark:border-white/15">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/10">
                  <p>Rank: <strong>#{selectedUser.rank}</strong></p>
                  <p>Problems: <strong>{(selectedUser.problems || 0).toLocaleString()}</strong></p>
                  <p>Streak: <strong>{selectedUser.streak || 0} Days</strong></p>
                  <p>Rating: <strong>{(selectedUser.rating || 0).toLocaleString()}</strong></p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const peerName = selectedUser.name;
                setSelectedUser(null);
                setChallengeForm({ ...challengeForm, invitedPeer: peerName });
                setIsChallengeModalOpen(true);
              }}
              className="w-full py-2.5 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl hover:opacity-90"
            >
              Challenge {selectedUser.name} to a 7-Day Sprint →
            </button>
          </div>
        </div>
      )}

      {/* Create Coding Challenge Modal */}
      {isChallengeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Coding Challenge</h3>
              <button onClick={() => setIsChallengeModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            {challengeSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Challenge Sent!</p>
                <p className="text-xs text-slate-500">{challengeForm.invitedPeer || 'Peer'} received your challenge invite.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateChallenge} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Challenge Title</label>
                  <input
                    type="text"
                    required
                    value={challengeForm.title}
                    onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Target Problems to Solve</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={challengeForm.targetProblems}
                    onChange={(e) => setChallengeForm({ ...challengeForm, targetProblems: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Challenge Peer</label>
                  <select
                    value={challengeForm.invitedPeer}
                    onChange={(e) => setChallengeForm({ ...challengeForm, invitedPeer: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  >
                    {availablePeers.length > 0 ? (
                      availablePeers.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No other developers on leaderboard yet</option>
                    )}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsChallengeModalOpen(false)} className="px-4 py-2 text-xs text-slate-500">Cancel</button>
                  <button
                    type="submit"
                    disabled={availablePeers.length === 0}
                    className="px-5 py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl disabled:opacity-50"
                  >
                    Launch Challenge
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
