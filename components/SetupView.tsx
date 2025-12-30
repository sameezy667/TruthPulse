
import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { ShieldCheck, Flame, Activity, Bell, Sparkles } from 'lucide-react';

interface SetupViewProps {
  onSelect: (p: UserProfile) => void;
}

const SetupView: React.FC<SetupViewProps> = ({ onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full p-7 pt-16"
    >
      {/* High-End Header Branding */}
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 rounded-full glass-card flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             </div>
             <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest-custom">Neural_Node_1.0</span>
          </div>
          <h1 className="text-[42px] font-extrabold text-white tracking-tight-custom leading-[0.9]">
            Good morning.<br/><span className="text-zinc-600">Scan ready.</span>
          </h1>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 ring-4 ring-black shadow-2xl">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User profile" />
        </div>
      </div>

      <p className="text-zinc-500 text-lg font-medium mb-12 leading-tight">
        Initialize your <span className="text-white font-bold">Health Matrix</span> by selecting a context profile for today&apos;s analysis.
      </p>

      <div className="space-y-4">
        <h3 className="text-zinc-700 text-[10px] font-black uppercase tracking-widest-custom px-1 mb-2">Available Nodes</h3>
        
        <motion.button
          whileHover={{ x: 6 }}
          onClick={() => onSelect(UserProfile.VEGAN)}
          className="w-full flex items-center justify-between p-6 bg-[#0e0e0e] border border-white/[0.03] rounded-[2.5rem] group shadow-xl"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
              <ShieldCheck className="text-emerald-500" size={24} />
            </div>
            <div className="text-left">
              <h4 className="text-white font-bold tracking-tight text-base">Vegan Pure</h4>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Active Verification</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ x: 6 }}
          onClick={() => onSelect(UserProfile.DIABETIC)}
          className="w-full flex items-center justify-between p-6 bg-[#0e0e0e] border border-white/[0.03] rounded-[2.5rem] group shadow-xl"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
              <Activity className="text-red-500" size={24} />
            </div>
            <div className="text-left">
              <h4 className="text-white font-bold tracking-tight text-base">Diabetic Monitor</h4>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Glycemic Control</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ x: 6 }}
          onClick={() => onSelect(UserProfile.PALEO)}
          className="w-full flex items-center justify-between p-6 bg-[#0e0e0e] border border-white/[0.03] rounded-[2.5rem] group shadow-xl"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
              <Flame className="text-blue-500" size={24} />
            </div>
            <div className="text-left">
              <h4 className="text-white font-bold tracking-tight text-base">Paleo Primal</h4>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Evolutionary Diet</p>
            </div>
          </div>
        </motion.button>
      </div>

      <div className="mt-auto pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full shadow-2xl">
           <Sparkles size={12} className="text-emerald-500" />
           <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">Encryption: AES_256</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SetupView;
