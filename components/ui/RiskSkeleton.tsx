'use client';

import { motion } from 'framer-motion';

export default function RiskSkeleton() {
  return (
    <div className="space-y-4">
      {/* Skeleton for high risk items */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-red-500/20 rounded animate-pulse" />
          <div className="h-3 w-32 bg-red-500/20 rounded animate-pulse" />
        </div>
        
        {[1, 2].map((i) => (
          <motion.div
            key={`skeleton-high-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="w-full p-4 bg-red-950/20 backdrop-blur-lg border border-red-500/20 rounded-3xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-red-400/20 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skeleton for medium risk items */}
      <div className="space-y-2 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-amber-500/20 rounded animate-pulse" />
          <div className="h-3 w-32 bg-amber-500/20 rounded animate-pulse" />
        </div>
        
        {[1].map((i) => (
          <motion.div
            key={`skeleton-med-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (2 + i) * 0.1 }}
            className="w-full p-4 bg-amber-950/20 backdrop-blur-lg border border-amber-500/20 rounded-3xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-amber-400/20 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
