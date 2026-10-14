import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

export default function TestimonialsCarousel() {
  const testimonials = [
    {
      type: 'quote',
      quote:
        'DevPulse brought all my disparate coding handles into one coherent, recruiter-ready profile. Within two weeks of sharing my link, I had three interview requests from top fintech startups.',
      author: 'Alex Rivera',
      role: 'Full Stack Engineer @ Stripe',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    {
      type: 'quote',
      quote:
        'Tracking our college coding club’s leaderboard helped us climb to the top 5 nationwide. The friendly competition, multi-platform telemetry, and AI roadmap keep everyone locked in.',
      author: 'Sarah Chen',
      role: 'CS Undergrad & Lead @ Stanford',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    {
      type: 'stars',
      stars: 5,
      quote:
        'The AI skill gap analysis is unreal. It pointed out blind spots in Graph Topological Sort that I had been struggling with in interviews, with exact targeted problems from LeetCode.',
      author: 'Marcus Vance',
      role: 'Algorithmic Competitor & SDE II',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80'
    },
    {
      type: 'stars',
      stars: 5,
      quote:
        'The automated sync across GitHub, CodeChef, and HackerRank saves hours every week. My portfolio updates seamlessly whenever I push code or solve a new problem.',
      author: 'Elena Rostova',
      role: 'AI Systems Engineer @ DeepMind',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? testimonials.length - 3 : prevIdx - 1));
  };

  const next = () => {
    setCurrentIndex((prevIdx) =>
      prevIdx >= testimonials.length - 3 ? 0 : prevIdx + 1
    );
  };

  const visibleTestimonials = [
    testimonials[currentIndex % testimonials.length],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length]
  ];

  return (
    <section className="py-16 sm:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with Navigation Controls */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#C58B43] dark:text-[#E5A952]">
            TESTIMONIALS
          </span>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-9 h-9 rounded-full bg-white/80 dark:bg-[#151922]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-amber-400/50 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-9 h-9 rounded-full bg-white/80 dark:bg-[#151922]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-amber-400/50 hover:text-amber-500 hover:scale-105 active:scale-95 transition-all shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Testimonials Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {visibleTestimonials.map((t, idx) => (
              <motion.div
                key={`${t.author}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="flex flex-col justify-between p-7 rounded-3xl bg-white/75 dark:bg-[#151922]/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300 min-h-[220px]"
              >
                <div className="space-y-4">
                  {/* Top indicator: Quote or Stars */}
                  {t.type === 'stars' ? (
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-[#C58B43] dark:text-[#E5A952]">
                      <Quote className="w-6 h-6 rotate-180 opacity-80" />
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5 mt-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#C58B43] dark:text-[#E5A952] border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.author}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
