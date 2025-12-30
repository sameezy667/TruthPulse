
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserProfile, AnalysisResult } from '../types';

interface ReasoningEngineProps {
  profile: UserProfile;
  onComplete: (result: AnalysisResult) => void;
}

const ReasoningEngine: React.FC<ReasoningEngineProps> = ({ profile, onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const baseLogs = [
    "> INITIALIZING_NEURAL_CORE...",
    "> ACCESSING_VISUAL_BUFFER...",
    "> OCR_ENGINE: ISOLATING_INGREDIENTS...",
    "> DB_QUERY: FDA_TOXICOLOGY_DATABASE_V12",
    "> CROSS_REFERENCING_USER_CONTEXT...",
  ];

  const profileSpecificLogs = {
    [UserProfile.DIABETIC]: [
      "> SCANNING: HIDDEN_SUGAR_PROFILES...",
      "> CALC: GLYCEMIC_LOAD_PROJECTION...",
      "> WARNING: INSULIN_SPIKE_DETECTED...",
      "> VERDICT: HIGH_RISK_AGENT",
    ],
    [UserProfile.VEGAN]: [
      "> SCANNING: ANIMAL_BYPRODUCTS...",
      "> ANALYZING: ETHICAL_COMPLIANCE_RATIO...",
      "> DB: PLANT_BASED_VERIFICATION_COMPLETE",
      "> VERDICT: SAFE_CONSUMPTION",
    ],
    [UserProfile.PALEO]: [
      "> SCANNING: PROCESSED_GRAINS...",
      "> CHECKING: EVOLUTIONARY_BIOLOGY_ALIGNMENT...",
      "> ANALYZING: NUTRIENT_DENSITY_TRADE-OFFS...",
      "> VERDICT: CONDITIONAL_APPROVAL",
    ],
  };

  const allLogs = [...baseLogs, ...profileSpecificLogs[profile]];

  useEffect(() => {
    if (currentIndex < allLogs.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, allLogs[currentIndex]]);
        setCurrentIndex(currentIndex + 1);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      // Mocked final data based on profile
      const timer = setTimeout(() => {
        const results: Record<UserProfile, AnalysisResult> = {
          [UserProfile.VEGAN]: {
            title: 'Vegan Certified',
            status: 'safe',
            description: 'This item aligns 100% with your ethical profile. No animal byproducts detected.',
            details: ['Non-GMO', 'No Bone Char Sugar', 'Plant Based'],
          },
          [UserProfile.DIABETIC]: {
            title: 'Critical Danger',
            status: 'danger',
            description: 'Bio-hazard detected. Extremely high glycemic load. Hidden sugars will cause insulin destabilization.',
            details: ['High Fructose Corn Syrup', 'Maltodextrin', 'Artificial Red 40'],
            metrics: [
              { name: 'Sugar', value: 34 },
              { name: 'Insulin Spike', value: 88 },
              { name: 'Glycemic index', value: 92 },
            ],
          },
          [UserProfile.PALEO]: {
            title: 'Trade-off Required',
            status: 'tradeoff',
            description: 'High in protein but contains trace soy lecithin. Overall density is high, but not strictly primal.',
            pros: ['Grass-Fed Protein', 'High Collagen Content'],
            cons: ['Soy Lecithin Trace', 'Refined Salt'],
            details: ['Protein: 24g', 'Fats: 12g', 'Carbs: 2g'],
          },
        };
        onComplete(results[profile]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, allLogs, profile, onComplete]);

  return (
    <div className="flex flex-col h-full bg-[#050505] p-10 font-mono">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
          <span className="text-[10px] text-zinc-500 tracking-widest uppercase">Deep Thinking...</span>
        </div>
        <h2 className="text-xl text-white font-medium">Neural Reasoning</h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="space-y-3">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs ${i === logs.length - 1 ? 'text-white' : 'text-zinc-600'}`}
            >
              {log}
            </motion.div>
          ))}
          {currentIndex < allLogs.length && (
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-zinc-700"
            />
          )}
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-white/5">
        <p className="text-[9px] text-zinc-800 text-center tracking-[0.3em]">
          X-PROCESSOR: GEMINI_3_PRO_CORE
        </p>
      </div>
    </div>
  );
};

export default ReasoningEngine;
