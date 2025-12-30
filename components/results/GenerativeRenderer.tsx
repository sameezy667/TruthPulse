'use client';

import { DeepPartial } from '@/lib/types';
import type { AIResponse } from '@/lib/schemas';
import ReasoningTerminal from '@/components/processing/ReasoningTerminal';
import SafeCard from './SafeCard';
import RiskHierarchy from './RiskHierarchy';
import DecisionFork from './DecisionFork';
import UncertainCard from './UncertainCard';
import { UserProfile } from '@/lib/types';

interface GenerativeRendererProps {
  data: DeepPartial<AIResponse>;
  onReset: () => void;
  onDecision?: (choice: 'Strict' | 'Flexible') => void;
  profile?: UserProfile;
  productId?: string;
}

export default function GenerativeRenderer({
  data,
  onReset,
  onDecision,
  profile = UserProfile.DIABETIC,
  productId = 'unknown',
}: GenerativeRendererProps) {
  // Handle undefined type (initial streaming state)
  if (!data?.type) {
    return <ReasoningTerminal profile={profile} productId={productId} />;
  }

  // Switch on discriminator
  switch (data.type) {
    case 'SAFE':
      return <SafeCard data={data} onReset={onReset} />;
    case 'RISK':
      return <RiskHierarchy data={data} onReset={onReset} />;
    case 'DECISION':
      return (
        <DecisionFork
          data={data}
          onDecision={onDecision || (() => {})}
          onReset={onReset}
        />
      );
    case 'UNCERTAIN':
      return <UncertainCard data={data} onReset={onReset} />;
    default:
      return <ReasoningTerminal profile={profile} productId={productId} />;
  }
}
