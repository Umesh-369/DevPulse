import React from 'react';
import { X, Check, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Community',
      price: '$0',
      period: 'forever',
      desc: 'Everything an individual developer needs to sync handles and track velocity.',
      features: [
        'Sync GitHub, LeetCode, CodeChef, HackerRank',
        'Multi-platform contribution matrix',
        'Shareable public developer portfolio handle',
        'Basic streak & milestone tracking',
        'College & global community leaderboard'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Developer Pro',
      price: '$9',
      period: 'per month',
      desc: 'For ambitious engineers aiming for FAANG & high-growth startup roles.',
      features: [
        'Everything in Community tier',
        'AI Career Coach with personalized 7-day checklists',
        'Algorithmic skill gap radar (Topological, DP, System Design)',
        'Verified credential badge for recruiter sharing',
        'Priority API sync with instant webhook webhooks',
        'Custom domain support for your portfolio'
      ],
      cta: 'Start 14-Day Pro Trial',
      popular: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5A952]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">DevPulse Membership Plans</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-impact font-extrabold">
              Invest in Your Engineering Leverage
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Start free forever. Upgrade anytime to unlock neural AI coaching and recruiter analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  p.popular
                    ? 'border-amber-400/80 bg-amber-500/[0.04] dark:bg-[#151922] shadow-xl'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#11141C]'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-[#E5A952] text-[#0B0D11] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{p.price}</span>
                    <span className="text-xs text-slate-400">/{p.period}</span>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    to="/register"
                    onClick={onClose}
                    className={`block w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                      p.popular
                        ? 'bg-[#E5A952] text-[#0B0D11] hover:bg-[#dfa048] shadow-md'
                        : 'bg-[#111315] text-white dark:bg-white/10 hover:bg-black dark:hover:bg-white/20'
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
