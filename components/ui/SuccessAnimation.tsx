'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';

interface SuccessAnimationProps {
  message?: string;
}

export default function SuccessAnimation({ message = 'Analysis Complete!' }: SuccessAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      {/* Success Icon with Pulse */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative"
      >
        {/* Pulse rings */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-emerald-500 blur-2xl"
        />
        
        {/* Icon */}
        <div className="relative w-20 h-20 rounded-full bg-emerald-500/20 backdrop-blur-xl border-2 border-emerald-500/50 
                      flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-emerald-500" strokeWidth={2.5} />
        </div>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span className="text-emerald-400 font-bold text-lg">{message}</span>
      </motion.div>

      {/* Confetti particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.cos((i * Math.PI * 2) / 8) * 100,
            y: Math.sin((i * Math.PI * 2) / 8) * 100,
          }}
          transition={{
            duration: 1,
            delay: 0.2 + i * 0.05,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 rounded-full bg-emerald-500"
          style={{
            left: '50%',
            top: '50%',
          }}
        />
      ))}
    </motion.div>
  );
}
