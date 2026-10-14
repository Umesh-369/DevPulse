import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DevPulseLogo from '../components/common/DevPulseLogo';
import { GitHubIcon, GoogleIcon } from '../components/common/PlatformIcons';
import { Eye, EyeOff, ArrowRight, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';
import confetti from 'canvas-confetti';

const API_URL = API_BASE;

export default function RegisterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState('Umesh');
  const [email, setEmail] = useState('umesh@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleOAuthLogin = (provider) => {
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      confetti({ particleCount: 60, spread: 60 });
      navigate('/onboarding/connect');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
    }
  };

  const carouselQuotes = [
    { title: 'Join a community that builds', italic: 'a brighter future.', sub: 'Track. Learn. Grow. Achieve.' },
    { title: 'Autonomous AI guidance tailored to', italic: 'your coding goals.', sub: 'From daily commits to Senior Engineer.' },
    { title: 'One verified profile for recruiters', italic: 'worldwide.', sub: 'Showcase your real-world proof of work.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="w-full max-w-5xl bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Split Panel (5 Cols) */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-slate-900 text-white">
          <img
            src="/images/mountain-spire.jpg"
            alt="Mountain Spire"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] dark:brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />

          <div className="relative z-10">
            <DevPulseLogo size="md" />
          </div>

          <div className="relative z-10 space-y-4 max-w-sm">
            <h2 className="text-3xl font-impact font-bold leading-tight">
              {carouselQuotes[carouselIndex].title}{' '}
              <span className="font-editorial italic font-normal text-amber-400 block mt-1">
                {carouselQuotes[carouselIndex].italic}
              </span>
            </h2>
            <p className="text-xs text-slate-300 font-medium tracking-wide">
              {carouselQuotes[carouselIndex].sub}
            </p>

            <div className="flex gap-2 pt-2">
              {carouselQuotes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    carouselIndex === idx ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400">
            © 2026 DevPulse Inc. All rights reserved.
          </div>
        </div>

        {/* Right Form Panel (7 Cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="lg:hidden pb-4">
              <DevPulseLogo size="md" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Create your account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Start your developer journey today.
              </p>
            </div>

            {/* Error Message Toast / Alert */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">OAuth Configuration Note</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSearchParams({});
                  }}
                  className="text-rose-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-semibold bg-[#111315] text-white hover:bg-black dark:bg-[#1C212D] dark:hover:bg-[#232A39] border border-transparent dark:border-white/10 shadow-xs transition-colors cursor-pointer"
              >
                <GitHubIcon className="w-4 h-4" />
                <span>Continue with GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-semibold bg-white dark:bg-[#151922] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 shadow-xs transition-colors cursor-pointer"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              <span className="bg-white dark:bg-[#151922] px-3 text-[11px] text-slate-400 uppercase tracking-widest absolute">
                or
              </span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Umesh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  placeholder="umesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-semibold bg-[#111315] text-white hover:bg-black dark:bg-[#E5A952] dark:text-[#0B0D11] dark:hover:bg-[#dfa048] flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Create account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
