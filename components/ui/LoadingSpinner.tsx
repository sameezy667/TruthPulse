'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative w-16 h-16 will-change-transform"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00FF94] will-change-transform"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#00FF94]/50 will-change-transform"
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Center dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-[#00FF94]" />
        </motion.div>
      </motion.div>
    </div>
  );
}
