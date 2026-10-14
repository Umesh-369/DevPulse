import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DemoModal from '../components/landing/DemoModal';
import HeroDashboard3D from '../components/landing/HeroDashboard3D';
import PlatformGrid from '../components/landing/PlatformGrid';
import FeaturesRow from '../components/landing/FeaturesRow';
import OpportunityProfile3D from '../components/landing/OpportunityProfile3D';
import FloatingTokens3D from '../components/landing/FloatingTokens3D';
import CommunityStats from '../components/landing/CommunityStats';
import TestimonialsCarousel from '../components/landing/TestimonialsCarousel';
import CtaBanner from '../components/landing/CtaBanner';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // 3D Perspective Tilt mouse coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 14;
    const y = ((clientY - top) / height - 0.5) * -14;
    setMousePos({ x, y });
  };
  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const heroBg = isDark ? '/images/hero-dark.jpg' : '/images/hero-light.jpg';
  const oppBg = isDark ? '/images/opportunity-cosmic.jpg' : '/images/mountain-spire.jpg';


  const opportunityChecklist = [
    'Build a verified developer profile',
    'Highlight your projects and achievements',
    'Share your journey with recruiters',
    'Track progress toward your career goals'
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans antialiased overflow-x-hidden selection:bg-[#E5A952]/30 selection:text-[#E5A952]">
      <Navbar />

      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative pt-6 pb-20 sm:pt-10 sm:pb-28 lg:pt-14 lg:pb-32 overflow-hidden"
      >
        {/* Dual-Mode Atmospheric Landscape Background */}
        <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-700">
          <img
            src={heroBg}
            alt="DevPulse Landscape"
            className="w-full h-full object-cover object-top opacity-35 dark:opacity-40 filter blur-xs"
          />
          {/* Subtle gradient fog overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/90 via-transparent to-[#FAF8F5] dark:from-[#0B0D11]/90 dark:via-transparent dark:to-[#0B0D11]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/80 via-transparent to-[#FAF8F5]/80 dark:from-[#0B0D11]/80 dark:via-transparent dark:to-[#0B0D11]/80" />
        </div>

        {/* Floating Golden Particle Embers */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {[
            { top: '20%', left: '15%', delay: 0, duration: 6 },
            { top: '35%', left: '45%', delay: 1.5, duration: 8 },
            { top: '65%', left: '25%', delay: 0.8, duration: 7 },
            { top: '15%', left: '80%', delay: 2, duration: 9 },
            { top: '75%', left: '70%', delay: 3, duration: 6.5 }
          ].map((pt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: [0.2, 0.7, 0.2],
                y: [-10, -50, -10]
              }}
              transition={{
                duration: pt.duration,
                repeat: Infinity,
                delay: pt.delay,
                ease: 'easeInOut'
              }}
              style={{ top: pt.top, left: pt.left }}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#E5A952] blur-[1px] shadow-[0_0_8px_rgba(229,169,82,0.8)]"
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Typography & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-7 text-left">
              {/* Pill Badge: "Your Development Journey" */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A952] animate-pulse" />
                <span>Your Development Journey</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-impact font-extrabold text-slate-950 dark:text-white leading-[1.05] tracking-tight"
              >
                BUILD. TRACK.<br />
                <span className="font-editorial font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-[#D97706] via-[#E5A952] to-[#C58B43] dark:from-[#E5A952] dark:via-[#F59E0B] dark:to-[#FBBF24]">
                  Grow Beyond.
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed"
              >
                All your developer activity in one place. Insights, analytics and AI-powered guidance to help you become a better developer.
              </motion.p>

              {/* Action Buttons Row */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-1"
              >
                {/* Primary CTA */}
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-[#111315] text-white hover:bg-black dark:bg-[#E5A952] dark:text-[#0B0D11] dark:hover:bg-[#dfa048] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Get started free'}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                {/* Secondary CTA: Explore Features */}
                <button
                  type="button"
                  onClick={() => setIsDemoOpen(true)}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold bg-white/80 dark:bg-[#151922]/80 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-white/10 hover:border-amber-400/50 shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full border border-amber-500/30 flex items-center justify-center">
                    <Play className="w-3 h-3 text-amber-500 fill-amber-500 ml-0.5" />
                  </div>
                  <span>Explore features</span>
                </button>
              </motion.div>


            </div>

            {/* Right Column: 3D Interactive Tablet Showcase (5 cols) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <HeroDashboard3D mousePos={mousePos} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PLATFORMS ROW: "Connect Your World"
          ========================================================================= */}
      <PlatformGrid />

      {/* =========================================================================
          FEATURES ROW: "Everything You Need to Grow as a Developer"
          ========================================================================= */}
      <FeaturesRow />

      {/* =========================================================================
          OPPORTUNITY SHOWCASE: "Turn Your Activity Into Opportunity."
          ========================================================================= */}
      <section className="py-20 sm:py-28 relative z-10 overflow-hidden">
        {/* Background Mountain Spire / Cosmic Terrain Layer */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[550px] pointer-events-none opacity-20 dark:opacity-30 filter blur-xs -z-10">
          <img
            src={oppBg}
            alt="Atmospheric Backdrop"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Bullets & Action (6 cols) */}
            <div className="lg:col-span-6 space-y-7 relative">
              <FloatingTokens3D />

              <div className="space-y-3">
                <h2 className="text-3xl sm:text-5xl font-impact font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                  Turn Your Activity<br />Into Opportunity.
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md">
                  Showcase your skills, track your growth, and get noticed by top companies.
                </p>
              </div>

              {/* 4 Feature Checklist Items */}
              <div className="space-y-3.5 pt-2">
                {opportunityChecklist.map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                    className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 dark:text-[#E5A952] border border-amber-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button: Create your profile */}
              <div className="pt-3">
                <Link
                  to={isAuthenticated ? '/portfolio' : '/register'}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-[#111315] text-white hover:bg-black dark:bg-[#E5A952] dark:text-[#0B0D11] dark:hover:bg-[#dfa048] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span>Create your profile</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Developer Profile Showcase (6 cols) */}
            <div className="lg:col-span-6 relative flex justify-center">
              <OpportunityProfile3D mousePos={mousePos} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMMUNITY METRICS: "A Growing Community Worldwide"
          ========================================================================= */}
      <CommunityStats />

      {/* =========================================================================
          TESTIMONIALS CAROUSEL
          ========================================================================= */}
      <TestimonialsCarousel />

      {/* =========================================================================
          BOTTOM CTA BANNER
          ========================================================================= */}
      <CtaBanner />

      {/* =========================================================================
          FOOTER & MODALS
          ========================================================================= */}
      <Footer />
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
