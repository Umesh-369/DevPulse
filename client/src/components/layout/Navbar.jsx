import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DevPulseLogo from '../common/DevPulseLogo';
import ThemeToggle from '../common/ThemeToggle';
import PricingModal from '../landing/PricingModal';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Leaderboard', href: '/leaderboard', isRoute: true },
    { name: 'Pricing', isPricing: true },
    { name: 'Blog', href: '#features' }
  ];

  const handleLinkClick = (e, item) => {
    if (item.isPricing) {
      e.preventDefault();
      setIsPricingOpen(true);
      setMobileMenuOpen(false);
      return;
    }

    if (item.isRoute) {
      return; // normal Link handling
    }

    e.preventDefault();
    const elem = document.querySelector(item.href);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Outer Floating Wrapper with Spacing Over the Navbar */}
      <header className="sticky top-0 z-50 w-full pt-3 sm:pt-4 pb-2 px-3 sm:px-6 lg:px-8 transition-all duration-300">
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
            isScrolled
              ? 'bg-white/90 dark:bg-[#0B0D11]/90 backdrop-blur-2xl border-slate-200/90 dark:border-white/10 shadow-lg shadow-black/[0.04] dark:shadow-black/40'
              : 'bg-white/75 dark:bg-[#0B0D11]/75 backdrop-blur-xl border-slate-200/70 dark:border-white/10 shadow-sm shadow-black/[0.02] dark:shadow-black/20'
          }`}
        >
          {/* Left: Logo */}
          <div className="shrink-0 flex items-center">
            <DevPulseLogo size="md" />
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              if (link.isRoute) {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/10 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                );
              }
              return (
                <button
                  key={link.name}
                  onClick={(e) => handleLinkClick(e, link)}
                  className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer"
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center border border-amber-500/30">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all"
              >
                Sign in
              </Link>
            )}

            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-full text-[13px] font-semibold bg-[#111315] text-white hover:bg-black dark:bg-[#E5A952] dark:text-[#0B0D11] dark:hover:bg-[#dfa048] shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>{isAuthenticated ? 'Open App' : 'Get started'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 max-w-7xl mx-auto rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#11141C]/95 backdrop-blur-2xl px-5 py-4 space-y-2.5 shadow-2xl animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => {
              if (link.isRoute) {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-500"
                  >
                    {link.name}
                  </Link>
                );
              }
              return (
                <button
                  key={link.name}
                  onClick={(e) => handleLinkClick(e, link)}
                  className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-amber-500"
                >
                  {link.name}
                </button>
              );
            })}
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold border border-slate-300 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-200"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-full"
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </>
  );
}
