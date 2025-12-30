'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/types';

interface ReasoningTerminalProps {
  profile: UserProfile;
  productId: string;
}

const baseLogs = [
  '> INITIALIZING_NEURAL_CORE...',
  '> ACCESSING_VISUAL_BUFFER...',
  '> OCR_ENGINE: ISOLATING_INGREDIENTS...',
  '> DB_QUERY: FDA_TOXICOLOGY_DATABASE_V12',
  '> CROSS_REFERENCING_USER_CONTEXT...',
];

const profileSpecificLogs: Record<UserProfile, string[]> = {
  [UserProfile.DIABETIC]: [
    '> SCANNING: HIDDEN_SUGAR_PROFILES...',
    '> CALC: GLYCEMIC_LOAD_PROJECTION...',
    '> WARNING: INSULIN_SPIKE_DETECTED...',
    '> CROSS_REFERENCING: ADA_GUIDELINES...',
    '> ANALYZING: MALTODEXTRIN_LEVELS...',
    '> VERDICT: HIGH_RISK_AGENT',
  ],
  [UserProfile.VEGAN]: [
    '> SCANNING: ANIMAL_BYPRODUCTS...',
    '> ANALYZING: ETHICAL_COMPLIANCE_RATIO...',
    '> CHECKING: BONE_CHAR_IN_SUGAR...',
    '> VERIFYING: WHEY_PROTEIN_ABSENCE...',
    '> DB: PLANT_BASED_VERIFICATION_COMPLETE',
    '> VERDICT: SAFE_CONSUMPTION',
  ],
  [UserProfile.PALEO]: [
    '> SCANNING: PROCESSED_GRAINS...',
    '> CHECKING: EVOLUTIONARY_BIOLOGY_ALIGNMENT...',
    '> DETECTING: SEED_OILS...',
    '> ANALYZING: NUTRIENT_DENSITY_TRADE-OFFS...',
    '> VERDICT: CONDITIONAL_APPROVAL',
  ],
};

export default function ReasoningTerminal({
  profile,
  productId,
}: ReasoningTerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allLogs = [...baseLogs, ...profileSpecificLogs[profile]];

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
      className="flex flex-col h-full bg-[#050505] p-8 font-mono"
    >
      {/* Header */}
      <div className="mb-10 pt-6">
        <div className="flex items-center gap-2 mb-1.5">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, type: 'spring', stiffness: 300, damping: 30 }}
            className="w-1.5 h-1.5 rounded-full bg-zinc-500"
          />
          <span className="text-[9px] text-zinc-600 tracking-widest uppercase">
            Deep Thinking...
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
              className={`text-[11px] ${
                i === logs.length - 1 ? 'text-white' : 'text-zinc-600'
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
