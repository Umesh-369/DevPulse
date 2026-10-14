import React from 'react';
import { Link } from 'react-router-dom';

export default function DevPulseLogo({ size = 'md', link = true, className = '' }) {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', dot: 'w-1.5 h-1.5' },
    md: { icon: 'w-8 h-8', text: 'text-xl', dot: 'w-2 h-2' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', dot: 'w-2.5 h-2.5' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* DevPulse Geometric Amber Polygon Icon */}
      <div className={`relative ${currentSize.icon} flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(229,169,82,0.4)]">
          {/* Outer faceted geometric polygon */}
          <polygon
            points="50,6 88,28 88,72 50,94 12,72 12,28"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          {/* Inner faceted gold core */}
          <polygon
            points="50,22 76,37 76,65 50,80 24,65 24,37"
            fill="url(#goldGradCore)"
          />
          {/* Center dark core notch */}
          <circle cx="50" cy="51" r="9" className="fill-[#FAF8F5] dark:fill-[#0B0D11] transition-colors" />

          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#E5A952" />
              <stop offset="100%" stopColor="#C58B43" />
            </linearGradient>
            <linearGradient id="goldGradCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <span className={`font-display font-extrabold tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}>
        Dev<span className="text-[#E5A952] dark:text-[#E5A952]">Pulse</span>
      </span>
    </div>
  );

  if (link) {
    return (
      <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
