'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Share2, Volume2, VolumeX } from 'lucide-react';
import type { SafeResponse } from '@/lib/schemas';
import type { DeepPartial } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { hapticSuccess } from '@/lib/haptics';
import TextSkeleton from '@/components/ui/TextSkeleton';
import { speak, stop, isSpeaking } from '@/lib/tts';
import { captureElementAsImage, shareImage } from '@/lib/screenshot';

interface SafeCardProps {
  data: DeepPartial<SafeResponse>;
  onReset: () => void;
  onCompare?: () => void;
}

export default function SafeCard({ data, onReset, onCompare }: SafeCardProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'success'>('idle');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger haptic feedback on mount
    hapticSuccess();
    
    // Cleanup voice on unmount
    return () => {
      stop();
    };
  }, []);

  const handleVoiceToggle = () => {
    if (isSpeaking()) {
      stop();
      setIsVoiceActive(false);
    } else {
      const textToSpeak = `All Clear. ${data?.summary || 'This product is safe for your dietary profile.'}`;
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
        await shareImage(blob, {
          title: 'Sach.ai Analysis - All Clear ✓',
          text: `This product is safe! ${data?.summary || 'No concerns found.'}`,
          fileName: 'sach-ai-safe-analysis.jpg',
        });
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to text sharing
      try {
        const shareData = {
          title: 'Sach.ai Analysis - All Clear ✓',
          text: `This product is safe! ${data?.summary || 'No concerns found for my dietary profile.'}`,
          url: window.location.href,
        };

        if (navigator.share && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setShareStatus('success');
        } else {
          await navigator.clipboard.writeText(
            `Sach.ai Analysis - All Clear ✓\n\n${data?.summary || 'No concerns found.'}\n\nAnalyzed with Sach.ai`
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-gradient-to-b from-emerald-950/30 via-black to-black p-6 pt-safe-top pb-safe-bottom"
    >
      {/* Header with Back Button, Voice, and Share */}
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
          Sach.ai Analysis
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
              <Volume2 className="w-4 h-4 text-emerald-500" />
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

      {/* Safe Badge - Hero Element */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Pulsing Green Shield */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative will-change-transform"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-emerald-500 blur-3xl will-change-opacity"
          />
          
          <div className="relative w-32 h-32 rounded-full bg-emerald-500/20 backdrop-blur-xl border-2 border-emerald-500/50 
                        flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <ShieldCheck className="w-16 h-16 text-emerald-500" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Safe Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h1 className="text-4xl font-black tracking-tighter text-white">
              All Clear
            </h1>
          </div>
          
          <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl inline-block">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
              ✓ Profile Approved
            </span>
          </div>
        </motion.div>

        {/* Summary Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-sm px-6"
        >
          {data?.summary ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center text-zinc-400 text-base leading-relaxed"
            >
              {data.summary}
            </motion.p>
          ) : (
            <div className="space-y-2">
              <TextSkeleton width="100%" height="1rem" />
              <TextSkeleton width="90%" height="1rem" />
              <TextSkeleton width="95%" height="1rem" />
            </div>
          )}
        </motion.div>

        {/* Confidence Meter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-xs space-y-2"
        >
          <div className="flex justify-between text-xs text-zinc-600 font-bold uppercase tracking-wider">
            <span>Safety Score</span>
            <span>98/100</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-900/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '98%' }}
              transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-lg shadow-emerald-500/30 will-change-transform"
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="space-y-3">
        {onCompare && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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
          transition={{ delay: 0.7 }}
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full bg-emerald-500 text-black font-bold text-lg h-14 
                   flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20
                   hover:shadow-2xl hover:shadow-emerald-500/30 transition-all"
        >
          Scan Another Item
        </motion.button>
      </div>
    </motion.div>
  );
}
