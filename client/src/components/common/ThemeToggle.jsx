import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle theme"
      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E5A952]/50 ${
        isDark
          ? 'text-amber-400 hover:bg-white/10 hover:text-amber-300'
          : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
      } ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="w-4 h-4 fill-amber-400/30 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 fill-slate-700/10" />
        )}
      </motion.div>
    </button>
  );
}
