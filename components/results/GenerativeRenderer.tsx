'use client';

import { DeepPartial } from '@/lib/types';
import type { AIResponse } from '@/lib/schemas';
import ReasoningTerminal from '@/components/processing/ReasoningTerminal';
import SafeCard from './SafeCard';
import RiskHierarchy from './RiskHierarchy';
import DecisionFork from './DecisionFork';
import ClarificationCard from './ClarificationCard';
import UncertainCard from './UncertainCard';
import { UserProfile } from '@/lib/types';

interface GenerativeRendererProps {
  data: DeepPartial<AIResponse>;
  onReset: () => void;
  onDecision?: (choice: 'Strict' | 'Flexible') => void;
  onAnswer?: (answer: string) => void;
  onCompare?: () => void;
  profile?: UserProfile;
  productId?: string;
  showCompareButton?: boolean;
}

export default function GenerativeRenderer({
  data,
  onReset,
  onDecision,
  onAnswer,
  onCompare,
  profile = UserProfile.DIABETIC,
  productId = 'unknown',
  showCompareButton = false,
}: GenerativeRendererProps) {
  // Handle undefined type (initial streaming state)
  if (!data?.type) {
    return <ReasoningTerminal profile={profile} productId={productId} />;
  }

  // Switch on discriminator
  switch (data.type) {
    case 'SAFE':
      return <SafeCard data={data as DeepPartial<AIResponse & { type: 'SAFE' }>} onReset={onReset} onCompare={showCompareButton ? onCompare : undefined} />;
    case 'RISK':
      return <RiskHierarchy data={data as DeepPartial<AIResponse & { type: 'RISK' }>} onReset={onReset} onCompare={showCompareButton ? onCompare : undefined} />;
    case 'DECISION':
      return (
        <DecisionFork
          data={data as DeepPartial<AIResponse & { type: 'DECISION' }>}
          onDecision={onDecision || (() => {})}
          onReset={onReset}
        />
      );
    case 'CLARIFICATION':
      return (
        <ClarificationCard
          data={data as DeepPartial<AIResponse & { type: 'CLARIFICATION' }>}
          onAnswer={onAnswer || (() => {})}
          onReset={onReset}
        />
      );
    case 'UNCERTAIN':
      return <UncertainCard data={data as DeepPartial<AIResponse & { type: 'UNCERTAIN' }>} onReset={onReset} />;
    default:
      return <ReasoningTerminal profile={profile} productId={productId} />;
  }
}
