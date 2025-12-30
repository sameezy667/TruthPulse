'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import type { UncertainResponse } from '@/lib/schemas';
import type { DeepPartial } from '@/lib/types';

interface UncertainCardProps {
  data: DeepPartial<UncertainResponse>;
  onReset: () => void;
}

export default function UncertainCard({ data, onReset }: UncertainCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-gradient-to-b from-zinc-950/50 via-black to-black p-6 pt-safe-top pb-safe-bottom"
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
          Unable to Analyze
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <AlertCircle className="w-20 h-20 text-zinc-600" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Unable to Analyze
          </h1>
          
          <p className="text-zinc-500 text-base leading-relaxed max-w-md">
            {data?.rawText || 'We encountered an issue analyzing this image. Please try again with a clearer photo.'}
          </p>
        </motion.div>

        <div className="text-center space-y-2 text-sm text-zinc-600">
          <p>Try:</p>
          <ul className="space-y-1">
            <li>• Taking a clearer photo with better lighting</li>
            <li>• Focusing on the ingredients label</li>
            <li>• Ensuring the text is readable</li>
          </ul>
        </div>
      </div>

      {/* Bottom Action */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-base h-14 
                 flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
      >
        Try Again
      </motion.button>
    </motion.div>
  );
}
