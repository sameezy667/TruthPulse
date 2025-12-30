
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { UserProfile, AppStep, AnalysisResult } from './types';
import SetupView from './components/SetupView';
import ScannerView from './components/ScannerView';
import ReasoningEngine from './components/ReasoningEngine';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [profile, setProfile] = useState<UserProfile>(UserProfile.VEGAN);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleProfileSelect = (p: UserProfile) => {
    setProfile(p);
    setStep(AppStep.SCANNER);
  };

  const handleScan = () => {
    setStep(AppStep.REASONING);
  };

  const handleReasoningComplete = (result: AnalysisResult) => {
    setAnalysis(result);
    setStep(AppStep.RESULT);
  };

  const reset = () => {
    setStep(AppStep.SETUP);
    setAnalysis(null);
  };

  return (
    <div className="flex items-center justify-center h-screen w-full p-4 overflow-hidden font-sans">
      <div className="relative w-full max-w-[420px] h-[90vh] bg-[#0A0A0A] overflow-hidden border border-white/10 rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col ring-8 ring-zinc-900/50">
        
        {/* Dynamic Island / Status Bar Area */}
        <div className="absolute top-0 left-0 right-0 h-10 z-50 flex justify-center items-center pointer-events-none">
          <div className="w-28 h-6 bg-black rounded-full mt-2 flex items-center justify-center">
             <div className="w-1 h-1 rounded-full bg-zinc-800 ml-auto mr-4" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === AppStep.SETUP && (
            <SetupView key="setup" onSelect={handleProfileSelect} />
          )}
          {step === AppStep.SCANNER && (
            <ScannerView key="scanner" onScan={handleScan} />
          )}
          {step === AppStep.REASONING && (
            <ReasoningEngine key="reasoning" profile={profile} onComplete={handleReasoningComplete} />
          )}
          {step === AppStep.RESULT && analysis && (
            <ResultView key="result" analysis={analysis} onReset={reset} />
          )}
        </AnimatePresence>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};

export default App;
