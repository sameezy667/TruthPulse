'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Brain, ArrowRight } from 'lucide-react';
import type { ClarificationResponse } from '@/lib/schemas';
import type { DeepPartial } from '@/lib/types';

interface ClarificationCardProps {
  data: DeepPartial<ClarificationResponse>;
  onAnswer: (answer: string) => void;
  onReset: () => void;
}

export default function ClarificationCard({ data, onAnswer, onReset }: ClarificationCardProps) {
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
      className="flex flex-col h-full bg-gradient-to-b from-blue-950/20 via-black to-black p-6 pt-safe-top pb-safe-bottom"
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
          Help Me Understand
        </div>
      </div>

      {/* Content */}
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
            className="absolute inset-0 rounded-full bg-blue-500 blur-3xl will-change-opacity"
          />
          
          <div className="relative w-24 h-24 rounded-full bg-blue-500/20 backdrop-blur-xl border-2 border-blue-500/40 
                        flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <HelpCircle className="w-12 h-12 text-blue-500" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Context and Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4 max-w-md px-4"
        >
          {/* Context Badge */}
          {data?.context && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 backdrop-blur-xl inline-block"
            >
              <span className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 6.5C5 6.5 6 5.5 7 5.5C8 5.5 9 6.5 9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M11 6.5C11 6.5 12 5.5 13 5.5C14 5.5 15 6.5 15 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6 10C6 10 7 11 8 11C9 11 10 10 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Quick Question
              </span>
            </motion.div>
          )}

          {/* Context Text */}
          {data?.context && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-zinc-500 text-sm"
            >
              {data.context}
            </motion.p>
          )}

          {/* Main Question */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold tracking-tight text-white leading-tight"
          >
            {data?.question || 'Loading question...'}
          </motion.h1>
        </motion.div>

        {/* Inferred Intent Display */}
        {data?.inferredIntent && data.inferredIntent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="w-full max-w-sm px-4"
          >
            <div className="p-4 bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
                    I noticed
                  </p>
                  <p className="text-sm text-blue-300">
                    {data.inferredIntent.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Answer Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-3 max-w-sm px-4"
        >
          {data?.options && data.options.length > 0 ? (
            data.options.map((option, index) => option && (
              <motion.button
                key={option}
                onClick={() => onAnswer(option)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full group relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/30 to-blue-900/20 
                         backdrop-blur-xl border-2 border-blue-500/30 p-5 hover:border-blue-500/50 transition-all shadow-lg"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">{option}</div>
                  </div>
                  <motion.div
                    className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <ArrowRight className="w-5 h-5 text-blue-500" />
                  </motion.div>
                </div>
                
                {/* Hover Glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>
            ))
          ) : (
            <div className="text-center text-zinc-500 text-sm">
              Loading options...
            </div>
          )}
        </motion.div>

        {/* Helper Text */}
        {showHelperText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center text-xs text-zinc-600 max-w-xs px-4"
          >
            Your answer helps me provide more accurate analysis for your needs
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
