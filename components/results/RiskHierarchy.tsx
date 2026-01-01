'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, ChevronDown, AlertTriangle, Flame, Share2, Lightbulb, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import type { RiskResponse } from '@/lib/schemas';
import type { DeepPartial } from '@/lib/types';
import RiskSkeleton from '@/components/ui/RiskSkeleton';
import { hapticWarning } from '@/lib/haptics';
import { speak, stop, isSpeaking } from '@/lib/tts';
import { captureElementAsImage, shareImage } from '@/lib/screenshot';

interface RiskHierarchyProps {
  data: DeepPartial<RiskResponse>;
  onReset: () => void;
  onCompare?: () => void;
}

export default function RiskHierarchy({ data, onReset, onCompare }: RiskHierarchyProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'success'>('idle');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger haptic feedback on mount
    hapticWarning();
    
    // Cleanup voice on unmount
    return () => {
      stop();
    };
  }, []);

  // Handle empty or undefined riskHierarchy array
  const riskHierarchy = data?.riskHierarchy || [];
  const highRisks = riskHierarchy.filter((r) => r?.severity === 'high');
  const medRisks = riskHierarchy.filter((r) => r?.severity === 'med');

  // Display skeleton when riskHierarchy is empty
  const showSkeleton = riskHierarchy.length === 0;

  const handleVoiceToggle = () => {
    if (isSpeaking()) {
      stop();
      setIsVoiceActive(false);
    } else {
      const riskSummary = `${data?.headline || 'Risk detected'}. Found ${highRisks.length} high-risk and ${medRisks.length} medium-risk ingredients.`;
      const alternatives = data?.alternatives && data.alternatives.length > 0
        ? ` Better alternatives include: ${data.alternatives.map(alt => alt?.name).join(', ')}.`
        : '';
      const textToSpeak = riskSummary + alternatives;
      
      speak(textToSpeak);
      setIsVoiceActive(true);
      
      // Auto-disable voice icon after speech ends
      setTimeout(() => {
        setIsVoiceActive(false);
      }, textToSpeak.length * 50); // Rough estimate
    }
  };

  const handleShare = async () => {
    setShareStatus('sharing');
    
    try {
      if (cardRef.current) {
        // Capture the card as an image
        const blob = await captureElementAsImage(cardRef.current);
        const riskSummary = `${highRisks.length} high-risk and ${medRisks.length} medium-risk ingredients found`;
        await shareImage(blob, {
          title: `Sach.ai Analysis - ${data?.headline || 'Risk Detected'}`,
          text: `⚠️ ${riskSummary}`,
          fileName: 'sach-ai-risk-analysis.jpg',
        });
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to text sharing
      try {
        const riskSummary = `${highRisks.length} high-risk and ${medRisks.length} medium-risk ingredients found`;
        const shareData = {
          title: `Sach.ai Analysis - ${data?.headline || 'Risk Detected'}`,
          text: `⚠️ ${riskSummary}\n\nAnalyzed with Sach.ai`,
          url: window.location.href,
        };

        if (navigator.share && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setShareStatus('success');
        } else {
          await navigator.clipboard.writeText(
            `Sach.ai Analysis\n\n${data?.headline || 'Risk Detected'}\n${riskSummary}\n\nAnalyzed with Sach.ai`
          );
          setShareStatus('success');
          setTimeout(() => setShareStatus('idle'), 2000);
        }
      } catch (fallbackError) {
        console.error('Fallback share failed:', fallbackError);
        setShareStatus('idle');
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-gradient-to-b from-red-950/30 via-black to-black overflow-y-auto smooth-scroll"
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
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleVoiceToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 
                       flex items-center justify-center hover:bg-white/10 transition-all"
            >
              {isVoiceActive ? (
                <Volume2 className="w-4 h-4 text-red-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-white" />
              )}
            </motion.button>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 
                       flex items-center justify-center hover:bg-white/10 transition-all"
            >
              {shareStatus === 'success' ? (
                <span className="text-emerald-500 text-lg">✓</span>
              ) : (
                <Share2 className="w-4 h-4 text-white" />
              )}
            </motion.button>
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
                            <div className="flex items-center gap-2">
                              <div className="text-red-400 text-xs uppercase tracking-wider font-bold">
                                High Severity
                              </div>
                              {risk?.confidence !== undefined && risk.confidence < 0.8 && (
                                <div className="text-amber-400 text-xs">
                                  ⚠️ {Math.round(risk.confidence * 100)}% confident
                                </div>
                              )}
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
                            <div className="flex items-center gap-2">
                              <div className="text-amber-400 text-xs uppercase tracking-wider font-bold">
                                Medium Severity
                              </div>
                              {risk?.confidence !== undefined && risk.confidence < 0.8 && (
                                <div className="text-amber-400 text-xs">
                                  ⚠️ {Math.round(risk.confidence * 100)}% confident
                                </div>
                              )}
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

        {/* Alternative Suggestions */}
        {!showSkeleton && data?.alternatives && data.alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 pt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <h3 className="text-blue-500 text-xs font-black uppercase tracking-widest">
                Better Options
              </h3>
            </div>

            {data.alternatives.map((alt, idx) => (
              <motion.div
                key={`alt-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="p-4 bg-blue-950/20 backdrop-blur-lg border border-blue-500/20 rounded-3xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-white font-bold text-base">{alt?.name || 'Alternative'}</div>
                    <div className="text-zinc-400 text-sm">{alt?.reason || ''}</div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <div className="text-emerald-400 text-xs font-bold">{alt?.betterBy || ''}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent p-6 pb-safe-bottom max-w-md mx-auto w-full space-y-3">
        {onCompare && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onCompare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-full bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 text-purple-400 font-bold text-base h-14 
                     flex items-center justify-center gap-2 hover:bg-purple-500/30 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3H5C3.89543 3 3 3.89543 3 5V9M9 21H5C3.89543 21 3 20.1046 3 19V15M15 3H19C20.1046 3 21 3.89543 21 5V9M15 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Compare with Another Product
          </motion.button>
        )}
        
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
