import React, { useState } from 'react';
import { X, Play, Sparkles, CheckCircle2, ChevronRight, Laptop } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DemoModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: 'Unified Developer Intelligence',
      desc: 'DevPulse connects your GitHub, LeetCode, CodeChef, and competitive accounts into one synchronized real-time hub.',
      highlight: 'Real GitHub Repos • Live LeetCode Solved • Real Streak Telemetry'
    },
    {
      title: 'Automated AI Career Guidance',
      desc: 'Our neural agent evaluates your coding velocity, identifies skill gaps in DSA or System Design, and produces dynamic checklists.',
      highlight: 'Overall Developer Score: 80/100 (Top Candidate Telemetry)'
    },
    {
      title: 'Showcase Your Work with Shareable Portfolio',
      desc: 'Generate a verified developer card with your custom projects, connected GitHub repositories, and verified badges with one click.',
      highlight: 'Custom Featured Projects • Connected GitHub Repositories • Verified Badges'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0B0D11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5A952] animate-pulse" />
            <span className="text-xs font-bold text-slate-200">DevPulse Interactive Tour</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Walkthrough Preview Container */}
        <div className="p-6 space-y-6">
          <div className="aspect-video w-full rounded-2xl bg-[#151922] border border-white/10 relative overflow-hidden flex flex-col justify-center items-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-[#E5A952] flex items-center justify-center shadow-glow-amber mb-4">
              <Laptop className="w-8 h-8 text-[#0B0D11]" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              {demoSteps[step].title}
            </h3>

            <p className="text-xs text-slate-300 max-w-md mt-2 leading-relaxed">
              {demoSteps[step].desc}
            </p>

            <div className="mt-4 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#E5A952] font-mono">
              {demoSteps[step].highlight}
            </div>
          </div>

          {/* Stepper Dots & Navigation */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {demoSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    step === idx ? 'w-8 bg-[#E5A952]' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {step < demoSteps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
                >
                  <span>Next Feature</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    navigate('/dashboard');
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#E5A952] text-[#0B0D11] hover:bg-[#dfa048]"
                >
                  <span>Explore Live Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
