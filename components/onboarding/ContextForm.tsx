'use client';

import { motion } from 'framer-motion';
import { Leaf, Activity, Drumstick } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { hapticSelection } from '@/lib/haptics';

interface ContextFormProps {
  onSelect: (profile: UserProfile) => void;
}

const profiles = [
  {
    id: UserProfile.VEGAN,
    label: 'Vegan',
    icon: Leaf,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    id: UserProfile.DIABETIC,
    label: 'Diabetic',
    icon: Activity,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    id: UserProfile.PALEO,
    label: 'Paleo',
    icon: Drumstick,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
];

export default function ContextForm({ onSelect }: ContextFormProps) {
  const handleSelect = (profile: UserProfile) => {
    hapticSelection();
    onSelect(profile);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-center items-center h-full px-8 pb-16 relative overflow-hidden"
    >
      {/* Animated Green Gradient Background */}
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

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        className="text-center mb-10 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, 5, 0, -5, 0] }}
          transition={{ 
            scale: { delay: 0.2, type: 'spring', stiffness: 300, damping: 30 },
            rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }
          }}
          className="text-5xl mb-3"
        >
          👋
        </motion.div>
        <h1 className="text-3xl font-black tracking-tighter text-white mb-2 leading-tight">
          Welcome to TruthLens
        </h1>
        <p className="text-zinc-500 text-[0.925rem] font-medium">
          Let&apos;s personalize your food analysis experience
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.4,
            },
          },
        }}
        className="w-full max-w-sm space-y-3 relative z-10"
      >
        {profiles.map((profile, index) => {
          const Icon = profile.icon;
          return (
            <motion.button
              key={profile.id}
              variants={{
                hidden: { y: 10, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(profile.id)}
              className={`w-full h-16 rounded-full border ${profile.border} ${profile.bg} backdrop-blur-xl hover:bg-white/10 transition-all group flex items-center gap-4 px-5 shadow-lg hover:shadow-xl relative overflow-hidden`}
            >
              {/* Subtle shimmer sweep on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              
              <motion.div
                whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-10 h-10 rounded-full ${profile.bg} flex items-center justify-center flex-shrink-0 relative z-10`}
              >
                <Icon className={`w-5 h-5 ${profile.color}`} strokeWidth={2.5} />
              </motion.div>
              <div className="text-left flex-1 relative z-10">
                <h3 className="text-white font-bold text-[0.925rem] tracking-tight leading-tight group-hover:translate-x-0.5 transition-transform duration-200">
                  I&apos;m {profile.label}
                </h3>
                <p className="text-zinc-500 text-xs font-medium leading-tight">
                  Get {profile.label.toLowerCase()}-friendly insights
                </p>
              </div>
              <motion.svg
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-5 h-5 text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 30 }}
        className="mt-12 text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-emerald-500"
          />
          <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
            Powered by Neural Vision
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
