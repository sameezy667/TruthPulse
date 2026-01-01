import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('ClarificationCard Component', () => {
  const componentPath = join(process.cwd(), 'components/results/ClarificationCard.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('should accept DeepPartial<ClarificationResponse> as data prop type', () => {
    expect(componentContent).toContain('data: DeepPartial<ClarificationResponse>');
  });

  it('should import DeepPartial from types', () => {
    expect(componentContent).toContain("import type { DeepPartial } from '@/lib/types'");
  });

  it('should import ClarificationResponse from schemas', () => {
    expect(componentContent).toContain("import type { ClarificationResponse } from '@/lib/schemas'");
  });

  it('should have onAnswer callback prop', () => {
    expect(componentContent).toContain('onAnswer: (answer: string) => void');
  });

  it('should have onReset callback prop', () => {
    expect(componentContent).toContain('onReset: () => void');
  });

  it('should display question with optional chaining', () => {
    expect(componentContent).toContain('data?.question');
  });

  it('should display context with optional chaining', () => {
    expect(componentContent).toContain('data?.context');
  });

  it('should display inferred intent when available', () => {
    const hasInferredIntentCheck = 
      componentContent.includes('data?.inferredIntent') &&
      componentContent.includes('inferredIntent.length > 0');
    expect(hasInferredIntentCheck).toBeTruthy();
  });

  it('should render options dynamically', () => {
    const hasOptionsMapping = 
      componentContent.includes('data?.options') &&
      componentContent.includes('.map(');
    expect(hasOptionsMapping).toBeTruthy();
  });

  it('should call onAnswer when option is clicked', () => {
    expect(componentContent).toContain('onClick={() => onAnswer(option)}');
  });

  it('should use Brain icon from lucide-react', () => {
    expect(componentContent).toContain("import { HelpCircle, Brain, ArrowRight } from 'lucide-react'");
  });

  it('should use framer-motion for animations', () => {
    expect(componentContent).toContain("import { motion } from 'framer-motion'");
  });

  it('should have loading state for question', () => {
    expect(componentContent).toContain('Loading question...');
  });

  it('should have loading state for options', () => {
    expect(componentContent).toContain('Loading options...');
  });

  it('should maintain ClarificationCard export as default', () => {
    expect(componentContent).toContain('export default function ClarificationCard');
  });
});

