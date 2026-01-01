'use client';

import { motion } from 'framer-motion';
import { Brain, MessageSquare, Target } from 'lucide-react';
import { hapticSelection } from '@/lib/haptics';

interface SmartOnboardingProps {
  onComplete: () => void;
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  const iconMap: Record<string, React.ReactElement> = {
    '🧠': (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4C10 4 6 8 6 14C6 16 6.5 17.5 7.5 19C8 19.5 8 20 7.5 20.5C7 21 6 21.5 6 23C6 25 8 26 10 26H22C24 26 26 25 26 23C26 21.5 25 21 24.5 20.5C24 20 24 19.5 24.5 19C25.5 17.5 26 16 26 14C26 8 22 4 16 4Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14C12 14 13 16 16 16C19 16 20 14 20 14" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="1" fill="#10B981"/>
        <circle cx="20" cy="12" r="1" fill="#10B981"/>
      </svg>
    ),
    '💬': (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 16C28 22 23 26 16 26C14 26 12 25.5 10.5 24.5L4 26L5.5 20C4.5 18.5 4 16.5 4 14C4 8 9 4 16 4C23 4 28 8 28 16Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 14H22" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 18H18" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    '🎯': (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" stroke="#10B981" strokeWidth="2"/>
        <circle cx="16" cy="16" r="8" stroke="#10B981" strokeWidth="2"/>
        <circle cx="16" cy="16" r="4" stroke="#10B981" strokeWidth="2"/>
        <circle cx="16" cy="16" r="1.5" fill="#10B981"/>
      </svg>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 400, damping: 20 }}
        className="flex-shrink-0"
      >
        {iconMap[icon] || icon}
      </motion.div>
      <div className="flex-1">
        <h3 className="text-white font-bold text-base mb-1 tracking-tight">
          {title}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function SmartOnboarding({ onComplete }: SmartOnboardingProps) {
  const handleComplete = () => {
    hapticSelection();
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-center items-center h-full px-8 pb-16 relative overflow-hidden"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-black overflow-hidden" />
      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [-50, 250, -50],
          scale: [1, 1.3, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-400/40 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -120, 120, 0],
          y: [0, 300, 0],
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-green-400/30 rounded-full blur-[110px]"
      />

      {/* Content */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
        className="text-center mb-8 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: 0.1, 
            type: 'spring', 
            stiffness: 300, 
            damping: 30 
          }}
          className="mb-4 flex items-center justify-center"
        >
          <motion.svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{
              rotate: [0, 5, -5, 0],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <path
              d="M32 8C32 8 20 16 20 28C20 36 25 42 32 42C39 42 44 36 44 28C44 16 32 8 32 8Z"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M32 42C32 42 28 44 28 48C28 50 29.5 52 32 52C34.5 52 36 50 36 48C36 44 32 42 32 42Z"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M26 22C26 22 24 24 26 26"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M32 18C32 18 30 20 32 22"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M38 22C38 22 36 24 38 26"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
        </motion.div>
        <h1 className="text-3xl font-black tracking-tighter text-white mb-3 leading-tight">
          Welcome to Sach.ai
        </h1>
        <p className="text-zinc-400 text-base font-medium max-w-sm mx-auto leading-relaxed">
          I&apos;m your AI co-pilot for food decisions. Just scan a product and I&apos;ll help you understand it.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-3 mb-8 relative z-10"
      >
        <FeatureCard
          icon="🧠"
          title="I learn from you"
          description="No forms to fill. I'll understand your preferences as we go."
          delay={0.4}
        />
        <FeatureCard
          icon="💬"
          title="I explain my reasoning"
          description="See how I think about each ingredient in real-time."
          delay={0.5}
        />
        <FeatureCard
          icon="🎯"
          title="I adapt to you"
          description="The more you use me, the better I understand what matters to you."
          delay={0.6}
        />
      </motion.div>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 30 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleComplete}
        className="w-full max-w-md py-4 bg-emerald-600 hover:bg-emerald-700 rounded-full font-bold text-white text-base shadow-lg hover:shadow-xl transition-all relative z-10 overflow-hidden group"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="relative z-10">Start Scanning</span>
      </motion.button>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 30 }}
        className="mt-8 text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-emerald-500"
          />
          <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
            AI-Native Experience
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
