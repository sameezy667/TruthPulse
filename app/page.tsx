'use client';

import { useState, useEffect, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { UserProfile, AppStep } from '@/lib/types';
import type { AIResponse } from '@/lib/schemas';
import SmartOnboarding from '@/components/onboarding/SmartOnboarding';
import CameraView from '@/components/scanner/CameraView';
import GenerativeRenderer from '@/components/results/GenerativeRenderer';
import ComparisonView from '@/components/results/ComparisonView';
import HistoryTimeline from '@/components/history/HistoryTimeline';
import Toast from '@/components/ui/Toast';
import MemoryIndicator from '@/components/ui/MemoryIndicator';
import ProfileSelector from '@/components/ui/ProfileSelector';
import { 
  loadUserHistory, 
  saveUserHistory, 
  initializeUserHistory,
  learnFromDecision,
  type UserHistory,
  type Decision
} from '@/lib/user-history';
import { inferIntent, type InferredIntent } from '@/lib/intent-inference';

function HomeContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [profile, setProfile] = useState<UserProfile>(UserProfile.VEGAN);
  const [currentImageBase64, setCurrentImageBase64] = useState<string>('');
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [inferredIntent, setInferredIntent] = useState<InferredIntent | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [firstProduct, setFirstProduct] = useState<AIResponse | null>(null);
  const [secondProduct, setSecondProduct] = useState<AIResponse | null>(null);
  
  // History timeline state
  const [showHistory, setShowHistory] = useState(false);

  // Load user history on mount
  useEffect(() => {
    const history = loadUserHistory();
    
    if (!history || history.scanCount === 0) {
      // First-time user: show onboarding
      const newHistory = initializeUserHistory();
      setUserHistory(newHistory);
      saveUserHistory(newHistory);
      setShowOnboarding(true);
      setStep(AppStep.SETUP);
    } else {
      // Returning user: skip directly to camera
      setUserHistory(history);
      setShowOnboarding(false);
      setStep(AppStep.SCANNER);
      
      // Use their learned profile if available
      if (history.preferences.dietaryProfile) {
        setProfile(history.preferences.dietaryProfile);
      }
    }
  }, []);

  // Persist profile from URL query params (for backward compatibility)
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode && Object.values(UserProfile).includes(mode as UserProfile)) {
      setProfile(mode as UserProfile);
    }
  }, [searchParams]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setStep(AppStep.SCANNER);
  };

  const handleScan = async (imageBase64: string, barcode?: string) => {
    setCurrentImageBase64(imageBase64);
    setError(null);
    setIsLoading(true);
    setStep(AppStep.ANALYZING);

    console.log('Inferring intent before analysis...', barcode ? `with barcode: ${barcode}` : 'with image');
    
    try {
      // Infer intent from image and history
      const intent = await inferIntent(imageBase64, userHistory || undefined);
      setInferredIntent(intent);
      
      console.log('Inferred intent:', intent);
      
      // Use suggested profile if confidence is high
      if (intent.suggestedProfile && intent.confidence > 0.7) {
        setProfile(intent.suggestedProfile);
      }
      
      // Call API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          userProfile: profile,
          ...(barcode && { barcode }),
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: AIResponse = await response.json();
      
      // Handle comparison mode
      if (comparisonMode && firstProduct) {
        // This is the second product
        setSecondProduct(result);
        setAnalysisResult(null); // Clear single result
      } else {
        // Normal mode or first product in comparison
        setAnalysisResult(result);
      }
      
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err : new Error('Analysis failed'));
      setAnalysisResult({
        type: 'UNCERTAIN',
        rawText: 'Unable to analyze this product. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (choice: 'Strict' | 'Flexible') => {
    if (!analysisResult || analysisResult.type !== 'DECISION') return;

    setError(null);
    setIsLoading(true);

    console.log('Submitting decision to /api/analyze...');
    
    // Learn from decision
    if (userHistory) {
      const decision: Decision = {
        productType: 'unknown',
        choice: choice === 'Strict' ? 'rejected' : 'accepted',
        reason: `User chose ${choice} option`,
        timestamp: new Date(),
      };
      
      const updatedHistory = learnFromDecision(userHistory, decision);
      setUserHistory(updatedHistory);
      saveUserHistory(updatedHistory);
      
      console.log('Updated user history after decision');
    }
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: currentImageBase64,
          userProfile: profile,
          decision: choice,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: AIResponse = await response.json();
      setAnalysisResult(result);
      
    } catch (err) {
      console.error('Decision analysis failed:', err);
      setError(err instanceof Error ? err : new Error('Analysis failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarificationAnswer = async (answer: string) => {
    if (!analysisResult || analysisResult.type !== 'CLARIFICATION') return;

    setError(null);
    setIsLoading(true);

    console.log('Submitting clarification answer:', answer);
    
    // Learn from clarification answer
    if (userHistory) {
      const decision: Decision = {
        productType: 'clarification',
        choice: 'accepted',
        reason: `User clarified: ${answer}`,
        timestamp: new Date(),
      };
      
      const updatedHistory = learnFromDecision(userHistory, decision);
      setUserHistory(updatedHistory);
      saveUserHistory(updatedHistory);
      
      console.log('Updated user history after clarification');
    }
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: currentImageBase64,
          userProfile: profile,
          clarification: answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: AIResponse = await response.json();
      setAnalysisResult(result);
      
    } catch (err) {
      console.error('Clarification analysis failed:', err);
      setError(err instanceof Error ? err : new Error('Analysis failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(AppStep.SCANNER);
    setCurrentImageBase64('');
    setAnalysisResult(null);
    setInferredIntent(null);
    setComparisonMode(false);
    setFirstProduct(null);
    setSecondProduct(null);
  };

  const handleStartComparison = () => {
    if (!analysisResult) return;
    
    // Store current result as first product
    setFirstProduct(analysisResult);
    setComparisonMode(true);
    
    // Return to scanner for second product
    setStep(AppStep.SCANNER);
    setAnalysisResult(null);
    setCurrentImageBase64('');
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleProfileChange = (newProfile: UserProfile) => {
    setProfile(newProfile);
    console.log('Profile changed to:', newProfile);
  };

  return (
    <div className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden flex flex-col">
      {/* Memory Indicator - Show when user has history and is on scanner or analyzing */}
      {userHistory && (step === AppStep.SCANNER || step === AppStep.ANALYZING) && (
        <MemoryIndicator history={userHistory} />
      )}

      {/* Profile Selector - Show on scanner screen */}
      {step === AppStep.SCANNER && (
        <ProfileSelector currentProfile={profile} onProfileChange={handleProfileChange} />
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {showHistory && userHistory ? (
          <HistoryTimeline key="history" history={userHistory} onClose={() => setShowHistory(false)} />
        ) : showOnboarding && step === AppStep.SETUP ? (
          <SmartOnboarding key="onboarding" onComplete={handleOnboardingComplete} />
        ) : !showOnboarding && step === AppStep.SCANNER ? (
          <CameraView 
            key="scanner" 
            onScan={handleScan} 
            comparisonMode={comparisonMode}
            onShowHistory={() => setShowHistory(true)}
            hasHistory={userHistory !== null && userHistory.scanCount > 0}
            onBack={() => setShowOnboarding(true)}
          />
        ) : step === AppStep.ANALYZING && !secondProduct ? (
          <GenerativeRenderer
            key="analyzing"
            data={analysisResult || {}}
            onReset={handleReset}
            onDecision={handleDecision}
            onAnswer={handleClarificationAnswer}
            onCompare={handleStartComparison}
            profile={profile}
            productId={currentImageBase64}
            showCompareButton={!comparisonMode}
          />
        ) : step === AppStep.ANALYZING && secondProduct && firstProduct ? (
          <ComparisonView
            key="comparison"
            product1={firstProduct}
            product2={secondProduct}
            profile={profile}
            onReset={handleReset}
          />
        ) : null}
      </AnimatePresence>

      {/* Home Indicator - Removed */}

      {/* Error Toast */}
      {error && (
        <Toast
          message="Analysis failed. Please try again."
          variant="destructive"
          onClose={handleCloseError}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
