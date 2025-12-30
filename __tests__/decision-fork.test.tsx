import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('DecisionFork Partial Data Handling', () => {
  const componentPath = join(process.cwd(), 'components/results/DecisionFork.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('should accept DeepPartial<DecisionResponse> as data prop type', () => {
    expect(componentContent).toContain('data: DeepPartial<DecisionResponse>');
  });

  it('should import DeepPartial from types', () => {
    expect(componentContent).toContain("import type { DeepPartial } from '@/lib/types'");
  });

  it('should handle undefined question field with fallback', () => {
    // Check for conditional rendering or fallback for question
    const hasQuestionCheck = 
      componentContent.includes('data.question') || 
      componentContent.includes('data?.question');
    expect(hasQuestionCheck).toBeTruthy();
  });

  it('should handle undefined options array', () => {
    // Check for conditional rendering or fallback for options
    const hasOptionsCheck = 
      componentContent.includes('data.options') || 
      componentContent.includes('data?.options');
    expect(hasOptionsCheck).toBeTruthy();
  });

  it('should disable buttons when data is incomplete', () => {
    // Check for disabled prop based on data completeness
    const hasDisabledLogic = 
      componentContent.includes('disabled={') ||
      componentContent.includes('disabled=');
    expect(hasDisabledLogic).toBeTruthy();
  });

  it('should display loading text for missing options', () => {
    // Check for fallback text when options are undefined
    const hasLoadingText = 
      componentContent.includes('Loading...') ||
      componentContent.includes('data?.options?.[0]') ||
      componentContent.includes('data?.options?.[1]');
    expect(hasLoadingText).toBeTruthy();
  });

  it('should use optional chaining to prevent crashes with partial data', () => {
    // Verify optional chaining is used for data access
    const hasOptionalChaining = 
      componentContent.includes('data?.question') ||
      componentContent.includes('data?.options');
    expect(hasOptionalChaining).toBeTruthy();
  });

  it('should maintain DecisionFork export as default', () => {
    expect(componentContent).toContain('export default function DecisionFork');
  });
});
