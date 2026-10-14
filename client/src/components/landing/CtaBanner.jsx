import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function CtaBanner() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  const bannerBg = isDark ? '/images/hero-dark.jpg' : '/images/hero-light.jpg';

  return (
    <section className="py-12 sm:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-2xl p-8 sm:p-12 lg:p-14"
        >
          {/* Background Landscape Layer */}
          <div className="absolute inset-0 z-0">
            <img
              src={bannerBg}
              alt="Cosmic Mountain"
              className="w-full h-full object-cover object-center filter brightness-[0.95] dark:brightness-[0.4] transition-all duration-700"
            />
            {/* Subtle Gradient Fog to keep text hyper-legible */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-[#0B0D11]/95 dark:via-[#0B0D11]/85 dark:to-transparent" />
          </div>

          {/* Golden Ribbon Curve SVG Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-60 -z-0"
            preserveAspectRatio="none"
            viewBox="0 0 1000 300"
            fill="none"
          >
            <path
              d="M 0 180 C 250 80, 500 240, 750 120 C 850 70, 950 100, 1000 60"
              stroke="url(#bannerGold)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient id="bannerGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E5A952" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-impact font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.1]">
                Ready to Elevate Your Developer Journey?
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Join thousands of developers who are already building, tracking and growing with DevPulse.
              </p>
            </div>

            {/* CTA Button */}
            <div className="shrink-0">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-bold bg-[#111315] text-white hover:bg-black dark:bg-[#E5A952] dark:text-[#0B0D11] dark:hover:bg-[#dfa048] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Get started free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
