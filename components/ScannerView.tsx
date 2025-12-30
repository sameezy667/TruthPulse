
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Zap, Activity } from 'lucide-react';

interface ScannerViewProps {
  onScan: () => void;
}

const ScannerView: React.FC<ScannerViewProps> = ({ onScan }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-transparent relative"
    >
      {/* Immersive background with slight zoom effect */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-[6px]" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]" />

      <div className="flex-1 flex flex-col p-7 z-10 pt-16">
        <div className="flex justify-between items-center mb-10">
          <div className="px-5 py-2.5 glass-card rounded-2xl flex items-center gap-3">
            <Activity size={14} className="text-emerald-500" />
            <p className="text-[10px] font-black tracking-widest text-zinc-200">OPTI_SCAN_READY</p>
          </div>
          <div className="w-11 h-11 rounded-full glass-card flex items-center justify-center">
            <Zap className="text-yellow-500" size={20} fill="currentColor" />
          </div>
        </div>

        {/* Sophisticated Scanning Portal */}
        <div className="relative flex-1 rounded-[3rem] overflow-hidden flex items-center justify-center ring-1 ring-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-black/20 backdrop-blur-sm">
          {/* Enhanced Liquid Scan Line */}
          <motion.div
            animate={{ top: ['-5%', '105%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_30px_rgba(16,185,129,0.8)] z-20"
          />
          
          <div className="text-center space-y-6">
             <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center mx-auto shadow-2xl">
                <Camera size={38} className="text-white/40" />
             </div>
             <p className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Targeting ingredients...</p>
          </div>

          {/* Detailed UI Frame */}
          <div className="absolute top-10 left-10 w-10 h-10 border-l-2 border-t-2 border-white/10 rounded-tl-2xl" />
          <div className="absolute top-10 right-10 w-10 h-10 border-r-2 border-t-2 border-white/10 rounded-tr-2xl" />
          <div className="absolute bottom-10 left-10 w-10 h-10 border-l-2 border-b-2 border-white/10 rounded-bl-2xl" />
          <div className="absolute bottom-10 right-10 w-10 h-10 border-r-2 border-b-2 border-white/10 rounded-br-2xl" />
        </div>

        {/* Action Interaction Area */}
        <div className="h-44 flex flex-col justify-center items-center gap-5">
           <button
             onClick={onScan}
             className="group relative w-22 h-22 rounded-full border-2 border-white/10 p-1 flex items-center justify-center hover:border-emerald-500/30 transition-all duration-700 shadow-2xl"
           >
             <div className="w-full h-full bg-white rounded-full scale-90 group-hover:scale-100 group-active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]" />
             <div className="absolute -inset-6 border border-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-110" />
           </button>
           <p className="text-[11px] text-zinc-600 font-black tracking-widest uppercase">Ingest high-res data</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ScannerView;
