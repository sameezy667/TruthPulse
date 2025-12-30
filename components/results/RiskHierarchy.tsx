'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, ChevronDown, AlertTriangle, Flame } from 'lucide-react';
import type { RiskResponse } from '@/lib/schemas';
import type { DeepPartial } from '@/lib/types';
import RiskSkeleton from '@/components/ui/RiskSkeleton';
import { hapticWarning } from '@/lib/haptics';

interface RiskHierarchyProps {
  data: DeepPartial<RiskResponse>;
  onReset: () => void;
}

export default function RiskHierarchy({ data, onReset }: RiskHierarchyProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Trigger haptic feedback on mount
    hapticWarning();
  }, []);

  // Handle empty or undefined riskHierarchy array
  const riskHierarchy = data?.riskHierarchy || [];
  const highRisks = riskHierarchy.filter((r) => r?.severity === 'high');
  const medRisks = riskHierarchy.filter((r) => r?.severity === 'med');

  // Display skeleton when riskHierarchy is empty
  const showSkeleton = riskHierarchy.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-gradient-to-b from-red-950/30 via-black to-black overflow-y-auto"
    >
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 p-6 pt-safe-top max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
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
            Risk Analysis
          </div>
        </div>

        {/* Danger Badge */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <AlertOctagon className="w-8 h-8 text-red-500" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tighter text-white leading-tight break-words flex-1">
            {data?.headline || (
              <span className="inline-block h-9 w-64 bg-white/10 rounded animate-pulse" />
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-xl">
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">
              ⚠ {highRisks.length} High Risk
            </span>
          </div>
          {medRisks.length > 0 && (
            <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
                {medRisks.length} Medium
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Risk List */}
      <div className="flex-1 p-6 space-y-4 max-w-md mx-auto w-full">
        {/* Display skeleton when riskHierarchy is empty */}
        {showSkeleton ? (
          <RiskSkeleton />
        ) : (
          <>
            {/* High Severity Section */}
            {highRisks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-red-500" />
                  <h3 className="text-red-500 text-xs font-black uppercase tracking-widest">
                    Critical Ingredients
                  </h3>
                </div>
                
                <AnimatePresence>
                  {highRisks.map((risk, idx) => (
                    <motion.div
                      key={`high-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <motion.button
                        onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-between p-4 bg-red-950/30 backdrop-blur-lg 
                                 border-2 border-red-500/30 rounded-3xl hover:border-red-500/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                            <AlertOctagon className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                          </div>
                          <div className="text-left break-words">
                            <div className="text-white font-bold text-base break-words">{risk?.ingredient || 'Loading...'}</div>
                            <div className="text-red-400 text-xs uppercase tracking-wider font-bold">
                              High Severity
                            </div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedIndex === idx ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-red-500" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {expandedIndex === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 p-4 bg-zinc-900/40 backdrop-blur-lg border border-white/10 rounded-2xl">
                              <p className="text-zinc-400 text-sm leading-relaxed break-words">{risk?.reason || 'Loading...'}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Medium Severity Section */}
            {medRisks.length > 0 && (
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-amber-500 text-xs font-black uppercase tracking-widest">
                    Moderate Concerns
                  </h3>
                </div>
                
                <AnimatePresence>
                  {medRisks.map((risk, idx) => (
                    <motion.div
                      key={`med-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (highRisks.length + idx) * 0.1 }}
                    >
                      <motion.button
                        onClick={() => setExpandedIndex(expandedIndex === (highRisks.length + idx) ? null : (highRisks.length + idx))}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-between p-4 bg-amber-950/20 backdrop-blur-lg 
                                 border border-amber-500/20 rounded-3xl hover:border-amber-500/40 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={2} />
                          </div>
                          <div className="text-left break-words">
                            <div className="text-white font-bold text-base break-words">{risk?.ingredient || 'Loading...'}</div>
                            <div className="text-amber-400 text-xs uppercase tracking-wider font-bold">
                              Medium Severity
                            </div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedIndex === (highRisks.length + idx) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-amber-500" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {expandedIndex === (highRisks.length + idx) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 p-4 bg-zinc-900/40 backdrop-blur-lg border border-white/10 rounded-2xl">
                              <p className="text-zinc-400 text-sm leading-relaxed break-words">{risk?.reason || 'Loading...'}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Action */}
      <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent p-6 pb-safe-bottom max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-base h-14 
                   flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
        >
          Scan Another Product
        </motion.button>
      </div>
    </motion.div>
  );
}
