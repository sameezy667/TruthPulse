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
import Toast from '@/components/ui/Toast';
import ProfileSelector from '@/components/ui/ProfileSelector';
import { analyzeClientSide } from '@/lib/client-analyzer';

function HomeContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [profile, setProfile] = useState<UserProfile>(UserProfile.VEGAN);
  const [currentImageBase64, setCurrentImageBase64] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [firstProduct, setFirstProduct] = useState<AIResponse | null>(null);
  const [secondProduct, setSecondProduct] = useState<AIResponse | null>(null);

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

    console.log('Starting analysis...', barcode ? `with barcode: ${barcode}` : 'with image');
    
    try {
      // Perform on-device OCR + text-only server analysis
      const result = await analyzeClientSide(imageBase64, profile, barcode);

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

  const handleClarificationAnswer = async (answer: string) => {
    if (!analysisResult || analysisResult.type !== 'CLARIFICATION') return;

    setError(null);
    setIsLoading(true);

    console.log('Submitting clarification answer:', answer);
    
    try {
      // Re-run client-side OCR + text-only analysis for the current image
      const result = await analyzeClientSide(currentImageBase64, profile);
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
      {/* Profile Selector - Show on scanner screen */}
      {step === AppStep.SCANNER && (
        <ProfileSelector currentProfile={profile} onProfileChange={handleProfileChange} />
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {showOnboarding && step === AppStep.SETUP ? (
          <SmartOnboarding key="onboarding" onComplete={handleOnboardingComplete} />
        ) : !showOnboarding && step === AppStep.SCANNER ? (
          <CameraView 
            key="scanner" 
            onScan={handleScan} 
            comparisonMode={comparisonMode}
            onBack={() => setShowOnboarding(true)}
          />
        ) : step === AppStep.ANALYZING && !secondProduct ? (
          <GenerativeRenderer
            key="analyzing"
            data={analysisResult || {}}
            onReset={handleReset}
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
