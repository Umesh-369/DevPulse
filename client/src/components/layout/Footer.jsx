import React, { useState } from 'react';
import DevPulseLogo from '../common/DevPulseLogo';
import PricingModal from '../landing/PricingModal';
import { Link } from 'react-router-dom';
import { GitHubIcon } from '../common/PlatformIcons';
import { Globe } from 'lucide-react';

export default function Footer() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

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
      return;
    }

    if (item.isRoute) return;

    e.preventDefault();
    const elem = document.querySelector(item.href);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="relative border-t border-slate-200/80 dark:border-white/5 bg-[#FAF8F5]/90 dark:bg-[#07090C]/90 text-slate-600 dark:text-slate-400 text-xs transition-colors overflow-hidden">
        {/* Subtle Background Golden Ribbon Accent */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-white/5">
            {/* Left: Logo */}
            <DevPulseLogo size="md" />

            {/* Center: Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
              {navLinks.map((link) => {
                if (link.isRoute) {
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  );
                }
                return (
                  <button
                    key={link.name}
                    onClick={(e) => handleLinkClick(e, link)}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {link.name}
                  </button>
                );
              })}
            </nav>

            {/* Center-Right: Social Icons */}
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:text-amber-500 hover:scale-105 transition-all"
              >
                <GitHubIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:text-amber-500 hover:scale-105 transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:text-amber-500 hover:scale-105 transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:text-amber-500 hover:scale-105 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Right: Legal Links */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <a href="#privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="#terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Terms
              </a>
              <span>•</span>
              <a href="#contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
            <p>© 2026 DevPulse Inc. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Designed for ambitious engineers worldwide.</p>
          </div>
        </div>
      </footer>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </>
  );
}
