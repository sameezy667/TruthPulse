'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/types';

interface ReasoningTerminalProps {
  profile: UserProfile;
  productId: string;
}

const baseLogs = [
  'INITIALIZING_NEURAL_CORE',
  'LOADING_VISION_MODEL',
  'ANALYZING_IMAGE_DATA',
  'EXTRACTING_TEXT_REGIONS',
];

const profileSpecificLogs: Record<UserProfile, string[]> = {
  [UserProfile.DIABETIC]: [
    'SCANNING_SUGAR_CONTENT',
    'CALCULATING_GLYCEMIC_INDEX',
    'EVALUATING_CARBOHYDRATE_IMPACT',
    'CROSS_REFERENCING_DIABETIC_DATABASE',
    'FINALIZING_RISK_ASSESSMENT',
  ],
  [UserProfile.VEGAN]: [
    'DETECTING_ANIMAL_DERIVATIVES',
    'SCANNING_INGREDIENT_ORIGINS',
    'CHECKING_HIDDEN_ANIMAL_PRODUCTS',
    'VERIFYING_PLANT_BASED_STATUS',
    'COMPILING_VEGAN_ANALYSIS',
  ],
  [UserProfile.PALEO]: [
    'IDENTIFYING_PROCESSED_INGREDIENTS',
    'SCANNING_GRAIN_CONTENT',
    'ANALYZING_FOOD_PROCESSING_LEVEL',
    'EVALUATING_NATURAL_INGREDIENTS',
    'GENERATING_PALEO_REPORT',
  ],
};

export default function ReasoningTerminal({
  profile,
  productId,
}: ReasoningTerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Memoize allLogs to prevent re-creation on every render
  const allLogs = useMemo(() => [...baseLogs, ...profileSpecificLogs[profile]], [profile]);

  useEffect(() => {
    if (currentIndex < allLogs.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, allLogs[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, allLogs, profile, productId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-[#050505] p-8 font-mono will-change-opacity"
    >
      {/* Header */}
      <div className="mb-10 pt-6">
        <div className="flex items-center gap-2 mb-1.5">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, type: 'spring', stiffness: 300, damping: 30 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
          />
          <span className="text-[9px] text-emerald-600 tracking-widest uppercase">
            AI Thinking...
          </span>
        </div>
        <h2 className="text-lg text-white font-medium tracking-tighter">
          Neural Reasoning
        </h2>
      </div>

      {/* Terminal Logs */}
      <div className="flex-1 overflow-hidden">
        <div className="space-y-2.5">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
              className={`text-[13px] leading-relaxed ${
                i === logs.length - 1 ? 'text-white font-medium' : 'text-zinc-500'
              }`}
            >
              {log}
            </motion.div>
          ))}
          {currentIndex < allLogs.length && (
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-1.5 h-3 bg-zinc-700 inline-block"
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <p className="text-[8px] text-zinc-800 text-center tracking-[0.3em]">
          X-PROCESSOR: GEMINI_3_PRO_CORE
        </p>
      </div>
    </motion.div>
  );
}
