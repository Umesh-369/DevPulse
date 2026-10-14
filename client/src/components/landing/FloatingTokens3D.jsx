import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Code2, GitBranch, Terminal } from 'lucide-react';

export default function FloatingTokens3D({ className = '' }) {
  return (
    <div className={`relative pointer-events-none select-none ${className}`}>
      {/* Token 1: Golden Hexagon Crystal (Top-Left) */}
      <motion.div
        animate={{
          y: [0, -14, 0],
          rotate: [0, 8, -6, 0],
          scale: [1, 1.04, 1]
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute -top-10 -left-6 z-20"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B]/30 via-[#E5A952]/20 to-transparent p-0.5 backdrop-blur-xl shadow-xl shadow-amber-500/10 border border-amber-400/40 flex items-center justify-center transform -rotate-12">
          <div className="w-full h-full rounded-2xl bg-white/70 dark:bg-[#151922]/90 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#E5A952] drop-shadow-[0_0_8px_rgba(229,169,82,0.8)]" />
          </div>
        </div>
      </motion.div>

      {/* Token 2: Golden Octahedron / Cube (Middle-Right) */}
      <motion.div
        animate={{
          y: [0, 16, 0],
          rotate: [0, -10, 6, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 6.2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.8
        }}
        className="absolute top-28 -right-8 sm:-right-12 z-20"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E5A952]/40 via-amber-400/10 to-transparent p-0.5 backdrop-blur-xl shadow-2xl shadow-amber-500/15 border border-amber-400/50 flex items-center justify-center transform rotate-12">
          <div className="w-full h-full rounded-2xl bg-white/75 dark:bg-[#151922]/95 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-[#D97706] dark:text-[#E5A952] drop-shadow-[0_0_10px_rgba(229,169,82,0.7)]" />
          </div>
        </div>
      </motion.div>

      {/* Token 3: Golden Gem Token (Bottom-Left) */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 12, -8, 0],
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5
        }}
        className="absolute -bottom-8 left-16 z-20"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/30 to-yellow-200/20 p-0.5 backdrop-blur-lg shadow-lg shadow-amber-500/10 border border-amber-300/40 flex items-center justify-center transform rotate-45">
          <div className="w-full h-full rounded-xl bg-white/70 dark:bg-[#151922]/90 flex items-center justify-center transform -rotate-45">
            <Code2 className="w-5 h-5 text-amber-500 drop-shadow-[0_0_6px_rgba(229,169,82,0.6)]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
