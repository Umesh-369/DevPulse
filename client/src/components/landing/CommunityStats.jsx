import React from 'react';
import { motion } from 'framer-motion';
import { Users, Landmark, Layers, Zap } from 'lucide-react';
import AnimatedCounter from '../common/AnimatedCounter';

export default function CommunityStats() {
  const stats = [
    {
      icon: Users,
      value: 50000,
      suffix: '+',
      label: 'Active Developers',
      iconBg: 'bg-amber-500/15 text-amber-500'
    },
    {
      icon: Landmark,
      value: 120,
      suffix: '+',
      label: 'Colleges & Communities',
      iconBg: 'bg-purple-500/15 text-purple-400'
    },
    {
      icon: Layers,
      value: 250000,
      suffix: '+',
      label: 'Repositories Tracked',
      iconBg: 'bg-blue-500/15 text-blue-400'
    },
    {
      icon: Zap,
      value: 1200000,
      suffix: '+',
      label: 'Total Problems Solved',
      iconBg: 'bg-emerald-500/15 text-emerald-400'
    }
  ];

  return (
    <section className="py-16 sm:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#C58B43] dark:text-[#E5A952]">
            TRUSTED BY DEVELOPERS
          </span>
          <h2 className="text-2xl sm:text-4xl font-impact font-extrabold text-slate-900 dark:text-white tracking-tight">
            A Growing Community Worldwide
          </h2>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/75 dark:bg-[#151922]/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-impact tracking-tight">
                    <AnimatedCounter value={item.value} suffix={item.suffix} duration={1500} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
