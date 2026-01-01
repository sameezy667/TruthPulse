'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { AIResponse } from '@/lib/schemas';
import { UserProfile } from '@/lib/types';

interface ComparisonViewProps {
  product1: AIResponse;
  product2: AIResponse;
  profile: UserProfile;
  onReset: () => void;
}

export default function ComparisonView({
  product1,
  product2,
  profile,
  onReset,
}: ComparisonViewProps) {
  // Calculate comparison insights
  const getComparison = () => {
    const p1Risks = product1.type === 'RISK' ? product1.riskHierarchy?.length || 0 : 0;
    const p2Risks = product2.type === 'RISK' ? product2.riskHierarchy?.length || 0 : 0;
    
    const p1HighRisks = product1.type === 'RISK' 
      ? product1.riskHierarchy?.filter(r => r.severity === 'high').length || 0 
      : 0;
    const p2HighRisks = product2.type === 'RISK' 
      ? product2.riskHierarchy?.filter(r => r.severity === 'high').length || 0 
      : 0;

    let winner: 'product1' | 'product2' | 'tie' = 'tie';
    let reason = '';

    if (product1.type === 'SAFE' && product2.type !== 'SAFE') {
      winner = 'product1';
      reason = 'Product A is safe while Product B has concerns';
    } else if (product2.type === 'SAFE' && product1.type !== 'SAFE') {
      winner = 'product2';
      reason = 'Product B is safe while Product A has concerns';
    } else if (p1HighRisks < p2HighRisks) {
      winner = 'product1';
      reason = `Product A has ${p2HighRisks - p1HighRisks} fewer high-risk ingredients`;
    } else if (p2HighRisks < p1HighRisks) {
      winner = 'product2';
      reason = `Product B has ${p1HighRisks - p2HighRisks} fewer high-risk ingredients`;
    } else if (p1Risks < p2Risks) {
      winner = 'product1';
      reason = `Product A has ${p2Risks - p1Risks} fewer total concerns`;
    } else if (p2Risks < p1Risks) {
      winner = 'product2';
      reason = `Product B has ${p1Risks - p2Risks} fewer total concerns`;
    } else if (product1.type === 'SAFE' && product2.type === 'SAFE') {
      winner = 'tie';
      reason = 'Both products are safe for your profile';
    } else {
      winner = 'tie';
      reason = 'Both products have similar risk profiles';
    }

    return { winner, reason, p1Risks, p2Risks, p1HighRisks, p2HighRisks };
  };

  const comparison = getComparison();

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'SAFE': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'RISK': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'DECISION': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getStatusLabel = (type: string) => {
    switch (type) {
      case 'SAFE': return '✓ Safe';
      case 'RISK': return '⚠ Risk';
      case 'DECISION': return '? Decision';
      case 'UNCERTAIN': return '? Uncertain';
      default: return type;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-gradient-to-b from-purple-950/20 via-black to-black overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 p-6 pt-safe-top">
        <div className="flex items-center justify-between mb-4">
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
            AI Comparison
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tighter text-white mb-2">
          Product Comparison
        </h1>
        <p className="text-zinc-400 text-sm">
          Analyzed for your {profile.toLowerCase()} profile
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="flex-1 p-6 space-y-6">
        {/* Products Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Product 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-2xl border-2 backdrop-blur-xl ${
              comparison.winner === 'product1' 
                ? 'bg-emerald-500/10 border-emerald-500/50' 
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="text-center mb-3">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Product A</div>
              {comparison.winner === 'product1' && (
                <div className="text-emerald-400 text-xs font-bold">✓ Better Choice</div>
              )}
            </div>
            
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-center mb-3 border ${getStatusColor(product1.type)}`}>
              {getStatusLabel(product1.type)}
            </div>

            {product1.type === 'RISK' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">High Risk:</span>
                  <span className="text-red-400 font-bold">{comparison.p1HighRisks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Concerns:</span>
                  <span className="text-amber-400 font-bold">{comparison.p1Risks}</span>
                </div>
              </div>
            )}

            {product1.type === 'SAFE' && (
              <div className="text-center text-emerald-400 text-xs">
                ✓ All clear
              </div>
            )}
          </motion.div>

          {/* Product 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-2xl border-2 backdrop-blur-xl ${
              comparison.winner === 'product2' 
                ? 'bg-emerald-500/10 border-emerald-500/50' 
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="text-center mb-3">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Product B</div>
              {comparison.winner === 'product2' && (
                <div className="text-emerald-400 text-xs font-bold">✓ Better Choice</div>
              )}
            </div>
            
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-center mb-3 border ${getStatusColor(product2.type)}`}>
              {getStatusLabel(product2.type)}
            </div>

            {product2.type === 'RISK' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">High Risk:</span>
                  <span className="text-red-400 font-bold">{comparison.p2HighRisks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Concerns:</span>
                  <span className="text-amber-400 font-bold">{comparison.p2Risks}</span>
                </div>
              </div>
            )}

            {product2.type === 'SAFE' && (
              <div className="text-center text-emerald-400 text-xs">
                ✓ All clear
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl 
                   border border-purple-500/30 rounded-3xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <h3 className="text-white font-bold text-base">AI Recommendation</h3>
          </div>
          
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            {comparison.reason}
          </p>

          {comparison.winner !== 'tie' && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>
                {comparison.winner === 'product1' ? 'Product A' : 'Product B'} is better for your {profile.toLowerCase()} profile
              </span>
            </div>
          )}

          {comparison.winner === 'tie' && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
              <Minus className="w-4 h-4" />
              <span>Both products are similar for your profile</span>
            </div>
          )}
        </motion.div>

        {/* Detailed Comparison */}
        {(product1.type === 'RISK' || product2.type === 'RISK') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Detailed Breakdown
            </h3>

            {/* Compare high risks */}
            {(comparison.p1HighRisks > 0 || comparison.p2HighRisks > 0) && (
              <div className="p-4 bg-red-950/20 backdrop-blur-xl border border-red-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 text-xs font-bold uppercase">High Risk Ingredients</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-red-400">{comparison.p1HighRisks}</div>
                    <div className="text-xs text-zinc-500">Product A</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-red-400">{comparison.p2HighRisks}</div>
                    <div className="text-xs text-zinc-500">Product B</div>
                  </div>
                </div>
              </div>
            )}

            {/* Compare total risks */}
            {(comparison.p1Risks > 0 || comparison.p2Risks > 0) && (
              <div className="p-4 bg-amber-950/20 backdrop-blur-xl border border-amber-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 text-xs font-bold uppercase">Total Concerns</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-amber-400">{comparison.p1Risks}</div>
                    <div className="text-xs text-zinc-500">Product A</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-amber-400">{comparison.p2Risks}</div>
                    <div className="text-xs text-zinc-500">Product B</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent p-6 pb-safe-bottom">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-base h-14 
                   flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
        >
          Start New Comparison
        </motion.button>
      </div>
    </motion.div>
  );
}
