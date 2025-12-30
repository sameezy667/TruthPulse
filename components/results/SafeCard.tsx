'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles } from 'lucide-react';
import type { SafeResponse } from '@/lib/schemas';
import type { DeepPartial } from '@/lib/types';
import { useEffect } from 'react';
import { hapticSuccess } from '@/lib/haptics';

interface SafeCardProps {
  data: DeepPartial<SafeResponse>;
  onReset: () => void;
}

export default function SafeCard({ data, onReset }: SafeCardProps) {
  useEffect(() => {
    // Trigger haptic feedback on mount
    hapticSuccess();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-gradient-to-b from-emerald-950/30 via-black to-black p-6 pt-safe-top pb-safe-bottom"
    >
      {/* Header with Back Button */}
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
          Sach.ai Analysis
        </div>
      </div>

      {/* Safe Badge - Hero Element */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Pulsing Green Shield */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-emerald-500 blur-3xl"
          />
          
          <div className="relative w-32 h-32 rounded-full bg-emerald-500/20 backdrop-blur-xl border-2 border-emerald-500/50 
                        flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <ShieldCheck className="w-16 h-16 text-emerald-500" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Safe Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h1 className="text-4xl font-black tracking-tighter text-white">
              All Clear
            </h1>
          </div>
          
          <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl inline-block">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
              ✓ Profile Approved
            </span>
          </div>
        </motion.div>

        {/* Summary Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-sm px-6"
        >
          <p className="text-center text-zinc-400 text-base leading-relaxed">
            {data?.summary || (
              <span className="inline-block w-full h-4 bg-zinc-800/50 rounded animate-pulse" />
            )}
          </p>
        </motion.div>

        {/* Confidence Meter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs space-y-2"
        >
          <div className="flex justify-between text-xs text-zinc-600 font-bold uppercase tracking-wider">
            <span>Safety Score</span>
            <span>98/100</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-900/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '98%' }}
              transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-lg shadow-emerald-500/30"
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-full bg-emerald-500 text-black font-bold text-lg h-14 
                 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20
                 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all"
      >
        Scan Another Item
      </motion.button>
    </motion.div>
  );
}
