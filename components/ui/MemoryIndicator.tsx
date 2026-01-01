'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import { UserHistory } from '@/lib/user-history';
import { useState, useEffect } from 'react';

interface MemoryIndicatorProps {
  history: UserHistory;
}

export default function MemoryIndicator({ history }: MemoryIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Don't show for new users
  if (!history || history.scanCount === 0) {
    return null;
  }

  // Don't show if no learned preferences yet
  if (history.preferences.avoidedIngredients.length === 0 && 
      history.preferences.preferredIngredients.length === 0 &&
      !history.preferences.dietaryProfile) {
    return null;
  }

  // Build memory text
  const memoryParts: string[] = [];
  
  if (history.preferences.avoidedIngredients.length > 0) {
    const avoided = history.preferences.avoidedIngredients.slice(0, 2).join(', ');
    const moreCount = history.preferences.avoidedIngredients.length - 2;
    
    if (moreCount > 0) {
      memoryParts.push(`you avoid ${avoided} and ${moreCount} more`);
    } else {
      memoryParts.push(`you avoid ${avoided}`);
    }
  }
  
  if (history.preferences.preferredIngredients.length > 0 && memoryParts.length === 0) {
    const preferred = history.preferences.preferredIngredients.slice(0, 2).join(', ');
    const moreCount = history.preferences.preferredIngredients.length - 2;
    
    if (moreCount > 0) {
      memoryParts.push(`you prefer ${preferred} and ${moreCount} more`);
    } else {
      memoryParts.push(`you prefer ${preferred}`);
    }
  }
  
  if (history.preferences.dietaryProfile && memoryParts.length === 0) {
    memoryParts.push(`you follow a ${history.preferences.dietaryProfile.toLowerCase()} diet`);
  }

  // If still no memory parts, don't show
  if (memoryParts.length === 0) {
    return null;
  }

  const memoryText = `I remember ${memoryParts[0]}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            delay: 0.5 
          }}
          className="absolute top-16 left-4 right-4 z-40 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 25,
              delay: 0.6 
            }}
            className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-lg p-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Brain className="w-4 h-4 text-blue-400 flex-shrink-0" />
              </motion.div>
              <p className="text-xs text-blue-400 font-medium leading-tight">
                {memoryText}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
