'use client';

import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/types';
import { Apple, Droplet, Wheat } from 'lucide-react';

interface ProfileSelectorProps {
  currentProfile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

const profiles = [
  {
    value: UserProfile.VEGAN,
    label: 'Vegan',
    icon: Apple,
    color: 'emerald',
  },
  {
    value: UserProfile.DIABETIC,
    label: 'Diabetic',
    icon: Droplet,
    color: 'blue',
  },
  {
    value: UserProfile.PALEO,
    label: 'Paleo',
    icon: Wheat,
    color: 'amber',
  },
];

export default function ProfileSelector({ currentProfile, onProfileChange }: ProfileSelectorProps) {
  return (
    <div className="absolute top-16 left-0 right-0 z-40 px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 justify-center"
      >
        {profiles.map((profile) => {
          const Icon = profile.icon;
          const isActive = currentProfile === profile.value;
          
          return (
            <motion.button
              key={profile.value}
              onClick={() => onProfileChange(profile.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative px-4 py-2 rounded-full text-sm font-bold
                backdrop-blur-xl border transition-all
                ${isActive 
                  ? 'bg-white/20 border-white/30 text-white' 
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{profile.label}</span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="activeProfile"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-zinc-500 text-xs mt-2"
      >
        Select your dietary profile
      </motion.p>
    </div>
  );
}
