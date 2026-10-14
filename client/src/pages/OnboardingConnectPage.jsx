import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DevPulseLogo from '../components/common/DevPulseLogo';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle
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

export default function OnboardingConnectPage() {
  const { user, connectPlatform } = useAuth();
  const navigate = useNavigate();

  const [activePlatformModal, setActivePlatformModal] = useState(null);
  const [handleInput, setHandleInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Platform card definitions
  const platforms = [
    {
      key: 'github',
      name: 'GitHub',
      desc: 'Connect your repositories, stars, and code commits.',
      icon: GitHubIcon,
      defaultHandle: 'umesh-dev',
      supportsOAuth: true
    },
    {
      key: 'leetcode',
      name: 'LeetCode',
      desc: 'Live GraphQL sync of Easy/Medium/Hard problems & streaks.',
      icon: LeetCodeIcon,
      defaultHandle: 'neal_wu',
      supportsOAuth: false
    },
    {
      key: 'codechef',
      name: 'CodeChef',
      desc: 'Showcase your competitive programming rating & stars.',
      icon: CodeChefIcon,
      defaultHandle: 'umesh_cc',
      supportsOAuth: false
    },
    {
      key: 'hackerrank',
      name: 'HackerRank',
      desc: 'Add your problem badges and skill certifications.',
      icon: HackerRankIcon,
      defaultHandle: 'umesh_hr',
      supportsOAuth: false
    },
    {
      key: 'geeksforgeeks',
      name: 'GeeksforGeeks',
      desc: 'Track practice problems, score, and coding rank.',
      icon: GeeksforGeeksIcon,
      defaultHandle: 'umesh_gfg',
      supportsOAuth: false
    },
    {
      key: 'atcoder',
      name: 'AtCoder',
      desc: 'Show your contest performance and algorithmic rank.',
      icon: AtCoderIcon,
      defaultHandle: 'umesh_atc',
      supportsOAuth: false
    },
  ];

  const handleOpenConnect = (platform) => {
    setActivePlatformModal(platform);
    setModalError('');
    setModalSuccess('');
    setHandleInput(user?.connectedPlatforms?.[platform.key]?.handle || platform.defaultHandle);
  };

  const handleConfirmConnect = async (e) => {
    e.preventDefault();
    if (!activePlatformModal || !handleInput.trim()) return;

    setConnecting(true);
    setModalError('');
    setModalSuccess('');

    try {
      const res = await connectPlatform(activePlatformModal.key, handleInput.trim());
      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to sync platform');
      }

      setModalSuccess(res?.message || `Connected @${handleInput.trim()} successfully!`);
      confetti({ particleCount: 50, spread: 60 });

      setTimeout(() => {
        setConnecting(false);
        setActivePlatformModal(null);
      }, 900);
    } catch (err) {
      setConnecting(false);
      setModalError(err.message || 'Verification failed. Please verify the handle is correct.');
    }
  };

  const handleOAuthConnectGitHub = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  const handleFinish = () => {
    confetti({ particleCount: 80, spread: 70 });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] text-slate-800 dark:text-slate-100 transition-colors py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6">
        <DevPulseLogo size="md" />
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full space-y-8 my-auto py-6">
        {/* Step Indicator & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#C58B43] dark:text-[#E5A952] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 2 of 4 • Coding Profiles</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Connect your coding profiles
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Sync your real-time problem-solving milestones, contest ratings, and contribution heatmaps.
          </p>
        </div>

        {/* 6 Integration Cards (3x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const platformData = user?.connectedPlatforms?.[platform.key];
            const isConnected = platformData?.connected;

            let extraInfo = '';
            if (isConnected) {
              if (platform.key === 'leetcode' && platformData.solved) {
                extraInfo = `${platformData.solved} solved • #${platformData.ranking ? Math.round(platformData.ranking / 1000) + 'k' : 'Ranked'}`;
              } else if (platform.key === 'github' && platformData.repos) {
                extraInfo = `${platformData.repos} repos • ${platformData.contributions || 0} contribs`;
              } else if (platformData.handle) {
                extraInfo = `@${platformData.handle}`;
              }
            }

            return (
              <div
                key={platform.key}
                className={`bg-white dark:bg-[#151922] border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isConnected
                    ? 'border-emerald-500/40 dark:border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-white/5 hover:border-amber-400/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5">
                      <Icon className="w-6 h-6" />
                    </div>

                    {isConnected ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {platform.supportsOAuth ? 'OAuth or Username' : 'Direct Sync'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {platform.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {platform.desc}
                    </p>
                    {extraInfo && (
                      <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-2">
                        {extraInfo}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => handleOpenConnect(platform)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isConnected
                        ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-amber-500/15 hover:text-[#C58B43] dark:hover:text-[#E5A952]'
                    }`}
                  >
                    <span>{isConnected ? `Re-sync (@${platformData?.handle})` : `Connect ${platform.name} ->`}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={handleFinish}
            className="px-5 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold bg-[#111315] text-white hover:bg-black dark:bg-[#E5A952] dark:text-[#0B0D11] dark:hover:bg-[#dfa048] shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Modal to connect platform */}
      {activePlatformModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <activePlatformModal.icon className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Connect {activePlatformModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePlatformModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error & Success notices */}
            {modalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}
            {modalSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* If GitHub: Dual connection options */}
            {activePlatformModal.key === 'github' && (
              <div className="space-y-3 pb-2">
                <button
                  type="button"
                  onClick={handleOAuthConnectGitHub}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#111315] text-white hover:bg-black dark:bg-[#1C212D] dark:hover:bg-[#252C3D] border border-transparent dark:border-white/10 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <GitHubIcon className="w-4 h-4" />
                  <span>Connect with GitHub OAuth (Recommended)</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                  <span className="bg-white dark:bg-[#151922] px-2.5 text-[10px] text-slate-400 uppercase tracking-wider absolute">
                    or sync public username
                  </span>
                </div>
              </div>
            )}

            {/* LeetCode explanation notice */}
            {activePlatformModal.key === 'leetcode' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Real-Time LeetCode GraphQL Sync
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                  DevPulse connects directly to LeetCode's public GraphQL endpoint. We will fetch your real solved problem distribution (Easy, Medium, Hard), global ranking, and heatmap submission activity.
                </p>
              </div>
            )}

            <form onSubmit={handleConfirmConnect} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {activePlatformModal.name} Username / Handle
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">@</span>
                  <input
                    type="text"
                    required
                    placeholder="your-handle"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your public username without special symbols.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePlatformModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{connecting ? 'Syncing Profile...' : 'Sync & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-slate-400 pt-4">
        DevPulse Developer Intelligence • Step 2 of 4
      </div>
    </div>
  );
}
