'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowRight } from 'lucide-react';
import type { DecisionResponse } from '@/lib/schemas';
import type { DeepPartial } from '@/lib/types';

interface DecisionForkProps {
  data: DeepPartial<DecisionResponse>;
  onDecision: (choice: 'Strict' | 'Flexible') => void;
  onReset: () => void;
}

export default function DecisionFork({ data, onDecision, onReset }: DecisionForkProps) {
  const [showHelperText, setShowHelperText] = useState(true);

  // Auto-hide helper text after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelperText(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-gradient-to-b from-amber-950/20 via-black to-black p-6 pt-safe-top pb-safe-bottom"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 
                   flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <span className="text-white text-xl">←</span>
        </motion.button>
        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          Clarification Needed
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Question Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative will-change-transform"
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-amber-500 blur-3xl will-change-opacity"
          />
          
          <div className="relative w-24 h-24 rounded-full bg-amber-500/20 backdrop-blur-xl border-2 border-amber-500/40 
                        flex items-center justify-center shadow-2xl shadow-amber-500/20">
            <HelpCircle className="w-12 h-12 text-amber-500" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Question Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4 max-w-md px-4"
        >
          <div className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl inline-block">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 6.5C5 6.5 6 5.5 7 5.5C8 5.5 9 6.5 9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11 6.5C11 6.5 12 5.5 13 5.5C14 5.5 15 6.5 15 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 10C6 10 7 11 8 11C9 11 10 10 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Ambiguous Ingredient
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
            {data?.question || 'Loading question...'}
          </h1>

          <p className="text-zinc-500 text-sm">
            The AI detected an ingredient that could be interpreted differently based on your preferences. 
            Help us give you the most accurate analysis.
          </p>
        </motion.div>

        {/* Decision Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-3 max-w-sm"
        >
          {/* Strict Option */}
          <motion.button
            onClick={() => onDecision('Strict')}
            disabled={!data?.question || !data?.options}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/30 to-red-900/20 
                     backdrop-blur-xl border-2 border-red-500/30 p-5 hover:border-red-500/50 transition-all shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-left">
                <div className="text-white font-bold text-lg mb-1">{data?.options?.[0] || 'Loading...'}</div>
                <div className="text-red-300 text-sm">Flag as potentially unsafe</div>
              </div>
              <motion.div
                className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <ArrowRight className="w-5 h-5 text-red-500" />
              </motion.div>
            </div>
            
            {/* Hover Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>

          {/* Flexible Option */}
          <motion.button
            onClick={() => onDecision('Flexible')}
            disabled={!data?.question || !data?.options}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/30 to-emerald-900/20 
                     backdrop-blur-xl border-2 border-emerald-500/30 p-5 hover:border-emerald-500/50 transition-all shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-left">
                <div className="text-white font-bold text-lg mb-1">{data?.options?.[1] || 'Loading...'}</div>
                <div className="text-emerald-300 text-sm">Assume it&apos;s acceptable</div>
              </div>
              <motion.div
                className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <ArrowRight className="w-5 h-5 text-emerald-500" />
              </motion.div>
            </div>
            
            {/* Hover Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>
        </motion.div>

        {/* Helper Text */}
        {showHelperText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-zinc-600 max-w-xs"
          >
            Your choice will update your profile preferences for future scans
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
