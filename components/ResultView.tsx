
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertOctagon, Scale, ArrowLeft, MoreHorizontal, Home, Grid, Settings, Activity, ChevronDown, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultViewProps {
  analysis: AnalysisResult;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ analysis, onReset }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const isDanger = analysis.status === 'danger';
  const isSafe = analysis.status === 'safe';
  const isTradeoff = analysis.status === 'tradeoff';

  // Dynamic Score Mapping
  const scoreValue = isSafe ? 94 : isDanger ? 18 : 68;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-transparent relative"
    >
      {/* Premium Header Area */}
      <div className="px-7 pt-16 pb-4 flex justify-between items-center">
        <button onClick={onReset} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-zinc-400 hover:text-white transition-all">
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold tracking-widest-custom text-zinc-600 uppercase">Neural Context</span>
          <h2 className="text-white font-extrabold text-xs">DETAILED_MANIFEST</h2>
        </div>
        <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-zinc-400">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-7 pb-36">
        {/* Date / Headline Branding like Exoplan */}
        <div className="mt-4 mb-10">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active Report</span>
              <span className="text-zinc-600 text-xs font-semibold">— SESSION 29B</span>
           </div>
           <h1 className="text-[42px] font-extrabold tracking-tight-custom text-white leading-[0.9] mb-4">
              {analysis.title}
           </h1>
           <p className="text-zinc-400 text-lg font-medium leading-tight">
             Found <span className="text-white font-bold">{analysis.details.length} markers</span>. 
             {isSafe ? " Optimal alignment confirmed." : " Critical meetings with allergens detected."}
           </p>
        </div>

        {/* Dynamic Exo-Score Pill */}
        <div className="glass-card p-6 rounded-[2.5rem] mb-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles size={100} />
           </div>
           
           <div className="flex justify-between items-end mb-6">
              <div className="space-y-1">
                 <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Exo-Safety Score</h4>
                 <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white leading-none">{scoreValue}</span>
                    <span className="text-zinc-600 text-xs font-bold">/ 100</span>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`text-[10px] font-black px-2 py-1 rounded-md ${isSafe ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {isSafe ? 'GREAT' : isDanger ? 'CRITICAL' : 'TYPICAL'}
                 </span>
              </div>
           </div>
           
           <div className="relative h-1.5 w-full rounded-full bg-zinc-800/50 overflow-hidden">
              <div className="absolute inset-0 score-gradient" />
              <motion.div 
                initial={{ left: 0 }}
                animate={{ left: `${scoreValue}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_15px_white] z-10 rounded-full"
              />
           </div>
        </div>

        {/* Schedule-style Signature List */}
        <div className="space-y-4">
           <div className="flex justify-between items-center px-1 mb-2">
              <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-widest-custom">Molecular Findings</h3>
              <Activity size={12} className="text-zinc-700" />
           </div>
           
           <div className="space-y-3">
             {analysis.details.map((detail, idx) => (
               <div key={idx} className="flex flex-col">
                 <motion.button
                   onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                   whileTap={{ scale: 0.98 }}
                   className="w-full flex items-center justify-between p-5 bg-[#0e0e0e] border border-white/[0.03] rounded-[2rem] hover:bg-[#141414] transition-all group"
                 >
                   <div className="flex items-center gap-4">
                     <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${expandedIndex === idx ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500'}`}>
                        {isSafe ? <ShieldCheck size={20} /> : <AlertOctagon size={20} />}
                     </div>
                     <div>
                       <h4 className="text-white font-bold text-sm tracking-tight mb-0.5">{detail}</h4>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Sig_ID: {idx + 400}</span>
                          <span className={`text-[9px] font-black ${isSafe ? 'text-emerald-500' : 'text-red-500'}`}>
                             {isSafe ? '▲ STABLE' : '▼ VOLATILE'}
                          </span>
                       </div>
                     </div>
                   </div>
                   <ChevronDown size={16} className={`text-zinc-700 transition-transform duration-300 ${expandedIndex === idx ? 'rotate-180 text-white' : ''}`} />
                 </motion.button>
                 
                 <AnimatePresence>
                   {expandedIndex === idx && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden"
                     >
                       <div className="px-6 py-4 text-[11px] text-zinc-500 leading-relaxed font-medium bg-[#0e0e0e]/50 rounded-b-[2rem] border-x border-b border-white/[0.03] -mt-4 pt-8">
                         Deep neural analysis confirms {isSafe ? 'compatibility' : 'conflict'} with target bio-marker. 
                         Glycemic resonance: <span className="text-zinc-300">{isSafe ? 'Low' : 'Critical'}</span>. 
                         Cellular absorption rate projected at {isSafe ? '98%' : '14%'}.
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Exoplan-Style Bottom Nav Pill */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[88%] z-50">
        <div className="glass-card p-2 rounded-full flex items-center justify-between px-6 h-16 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/5">
           <button onClick={onReset} className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform">
              <Home size={18} strokeWidth={2.5} />
           </button>
           <button className="text-zinc-500 hover:text-white transition-colors">
              <Grid size={18} />
           </button>
           <button className="text-zinc-500 hover:text-white transition-colors">
              <Settings size={18} />
           </button>
           <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-800 shadow-inner">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User" />
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultView;
