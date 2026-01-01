'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, TrendingUp, Calendar } from 'lucide-react';
import type { UserHistory } from '@/lib/user-history';

interface HistoryTimelineProps {
  history: UserHistory;
  onClose: () => void;
}

export default function HistoryTimeline({ history, onClose }: HistoryTimelineProps) {
  const recentDecisions = history.decisions.slice(-10).reverse(); // Last 10, most recent first

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getChoiceIcon = (choice: 'accepted' | 'rejected') => {
    return choice === 'accepted' ? (
      <CheckCircle className="w-4 h-4 text-emerald-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getChoiceColor = (choice: 'accepted' | 'rejected') => {
    return choice === 'accepted' 
      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
      : 'bg-red-500/20 border-red-500/30 text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Phone-sized container */}
      <div className="relative w-full h-full max-w-md bg-black overflow-y-auto smooth-scroll">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 p-6 pt-safe-top">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 
                       flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <span className="text-white text-xl">←</span>
            </motion.button>
            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              Your Journey
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Scan History
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="text-2xl font-black text-white">{history.scanCount}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Scans</div>
            </div>
            <div className="p-3 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl">
              <div className="text-2xl font-black text-emerald-400">
                {history.decisions.filter(d => d.choice === 'accepted').length}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Accepted</div>
            </div>
            <div className="p-3 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl">
              <div className="text-2xl font-black text-red-400">
                {history.decisions.filter(d => d.choice === 'rejected').length}
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Rejected</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 space-y-4">
          {recentDecisions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">No scan history yet</p>
              <p className="text-zinc-600 text-xs mt-2">Start scanning products to build your history</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {recentDecisions.map((decision, idx) => (
                <motion.div
                  key={`decision-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative"
                >
                  {/* Timeline connector */}
                  {idx < recentDecisions.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-white/10" />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 
                                  flex items-center justify-center relative z-10">
                      {getChoiceIcon(decision.choice)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getChoiceColor(decision.choice)}`}>
                          {decision.choice}
                        </span>
                        <span className="text-zinc-600 text-xs">
                          {formatDate(decision.timestamp)}
                        </span>
                      </div>

                      <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                        <div className="text-white font-bold text-sm mb-1">
                          {decision.productType}
                        </div>
                        {decision.reason && (
                          <div className="text-zinc-400 text-xs leading-relaxed">
                            {decision.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Learning Insights */}
          {history.preferences.avoidedIngredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl 
                       border border-purple-500/30 rounded-3xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <h3 className="text-white font-bold text-sm">What I&apos;ve Learned</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">You typically avoid:</div>
                  <div className="flex flex-wrap gap-2">
                    {history.preferences.avoidedIngredients.slice(0, 5).map((ing, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-full">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {history.preferences.preferredIngredients.length > 0 && (
                  <div className="pt-2">
                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">You prefer:</div>
                    <div className="flex flex-wrap gap-2">
                      {history.preferences.preferredIngredients.slice(0, 5).map((ing, idx) => (
                        <span key={idx} className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Action */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent p-6 pb-safe-bottom">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-base h-14 
                     flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
          >
            Close History
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
