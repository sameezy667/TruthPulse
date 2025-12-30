'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  variant?: 'default' | 'destructive';
  onClose?: () => void;
  duration?: number;
}

export default function Toast({ 
  message, 
  variant = 'default',
  onClose,
  duration = 5000 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const variantStyles = {
    default: 'bg-zinc-900 border-zinc-800 text-zinc-100',
    destructive: 'bg-red-950/90 border-red-900/50 text-red-100'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`
            fixed top-16 left-1/2 -translate-x-1/2 z-[100]
            max-w-[90vw] w-full sm:max-w-md
            px-4 py-3 rounded-lg border
            shadow-lg backdrop-blur-sm
            flex items-center gap-3
            ${variantStyles[variant]}
          `}
          role="alert"
          aria-live="assertive"
        >
          {variant === 'destructive' && (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
