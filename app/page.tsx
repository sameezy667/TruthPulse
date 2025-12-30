'use client';

import { useState, useEffect, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { UserProfile, AppStep } from '@/lib/types';
import { AIResponseSchema } from '@/lib/schemas';
import ContextForm from '@/components/onboarding/ContextForm';
import CameraView from '@/components/scanner/CameraView';
import GenerativeRenderer from '@/components/results/GenerativeRenderer';
import Toast from '@/components/ui/Toast';

function HomeContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [profile, setProfile] = useState<UserProfile>(UserProfile.VEGAN);
  const [currentImageBase64, setCurrentImageBase64] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Persist profile from URL query params
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode && Object.values(UserProfile).includes(mode as UserProfile)) {
      setProfile(mode as UserProfile);
    }
  }, [searchParams]);

  const handleProfileSelect = (selectedProfile: UserProfile) => {
    setProfile(selectedProfile);
    setStep(AppStep.SCANNER);

    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('mode', selectedProfile);
    window.history.replaceState({}, '', url.toString());
  };

  const handleScan = async (imageBase64: string, barcode?: string) => {
    setCurrentImageBase64(imageBase64);
    setStep(AppStep.ANALYZING);
    setAnalysisResult(null);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending request to /api/analyze...', barcode ? `with barcode: ${barcode}` : 'with image');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          userProfile: profile,
          ...(barcode && { barcode }), // Include barcode if provided
        }),
      });

      const data = await response.json();
      console.log('Received response:', data);
      
      const validated = AIResponseSchema.parse(data);
      setAnalysisResult(validated);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err : new Error('Analysis failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (choice: 'Strict' | 'Flexible') => {
    if (!analysisResult || analysisResult.type !== 'DECISION') return;

    setAnalysisResult(null);
    setIsLoading(true);
    setError(null);

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

      const data = await response.json();
      const validated = AIResponseSchema.parse(data);
      setAnalysisResult(validated);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err : new Error('Analysis failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(AppStep.SETUP);
    setCurrentImageBase64('');
    setAnalysisResult(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden flex flex-col">
      {/* Dynamic Island / Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-10 z-50 flex justify-center items-center pointer-events-none pt-safe">
        <div className="w-28 h-6 bg-black rounded-full mt-2 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-zinc-800 ml-auto mr-4" />
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {step === AppStep.SETUP && (
          <ContextForm key="setup" onSelect={handleProfileSelect} />
        )}
        {step === AppStep.SCANNER && (
          <CameraView key="scanner" onScan={handleScan} />
        )}
        {step === AppStep.ANALYZING && (
          <GenerativeRenderer
            key="analyzing"
            data={analysisResult || {}}
            onReset={handleReset}
            onDecision={handleDecision}
            profile={profile}
            productId={currentImageBase64}
          />
        )}
      </AnimatePresence>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 pointer-events-none pb-safe" />

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
