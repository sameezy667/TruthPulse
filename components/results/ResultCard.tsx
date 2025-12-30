'use client';

import { AnimatePresence } from 'framer-motion';
import type { AIResponse } from '@/lib/schemas';
import SafeCard from './SafeCard';
import RiskHierarchy from './RiskHierarchy';
import DecisionFork from './DecisionFork';
import UncertainCard from './UncertainCard';

interface ResultCardProps {
  analysis: AIResponse;
  onReset: () => void;
  onDecision?: (choice: 'Strict' | 'Flexible') => void;
}

export default function ResultCard({ analysis, onReset, onDecision }: ResultCardProps) {
  return (
    <AnimatePresence mode="wait">
      {analysis.type === 'SAFE' && (
        <SafeCard key="safe" data={analysis} onReset={onReset} />
      )}
      
      {analysis.type === 'RISK' && (
        <RiskHierarchy key="risk" data={analysis} onReset={onReset} />
      )}
      
      {analysis.type === 'DECISION' && onDecision && (
        <DecisionFork 
          key="decision" 
          data={analysis} 
          onDecision={onDecision}
          onReset={onReset} 
        />
      )}
      
      {analysis.type === 'UNCERTAIN' && (
        <UncertainCard key="uncertain" data={analysis} onReset={onReset} />
      )}
    </AnimatePresence>
  );
}
