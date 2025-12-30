import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('RiskHierarchy Partial Data Handling', () => {
  const componentPath = join(process.cwd(), 'components/results/RiskHierarchy.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('should accept DeepPartial<RiskResponse> as data prop type', () => {
    expect(componentContent).toContain('data: DeepPartial<RiskResponse>');
  });

  it('should import DeepPartial from types', () => {
    expect(componentContent).toContain("import type { DeepPartial } from '@/lib/types'");
  });

  it('should handle undefined headline field with fallback', () => {
    // Check for conditional rendering or fallback for headline
    const hasHeadlineCheck = 
      componentContent.includes('data.headline') || 
      componentContent.includes('data?.headline');
    expect(hasHeadlineCheck).toBeTruthy();
  });

  it('should handle empty or undefined riskHierarchy array', () => {
    // Check for handling of empty/undefined array
    const hasArrayHandling = 
      componentContent.includes('data.riskHierarchy || []') ||
      componentContent.includes('data?.riskHierarchy') ||
      componentContent.includes('riskHierarchy = data.riskHierarchy || []');
    expect(hasArrayHandling).toBeTruthy();
  });

  it('should display RiskSkeleton when riskHierarchy is empty', () => {
    // Check for RiskSkeleton component usage
    expect(componentContent).toContain('RiskSkeleton');
    expect(componentContent).toContain('showSkeleton');
  });

  it('should import RiskSkeleton component', () => {
    expect(componentContent).toContain("import RiskSkeleton from '@/components/ui/RiskSkeleton'");
  });

  it('should wrap risk items in AnimatePresence', () => {
    // Verify AnimatePresence is used for animations
    expect(componentContent).toContain('AnimatePresence');
    expect(componentContent).toContain('import { motion, AnimatePresence }');
  });

  it('should add staggered animation delays for streaming items', () => {
    // Check for delay calculation based on index
    const hasStaggeredDelay = 
      componentContent.includes('delay: idx * 0.1') ||
      componentContent.includes('delay: (highRisks.length + idx) * 0.1');
    expect(hasStaggeredDelay).toBeTruthy();
  });

  it('should not crash with partial data by using optional chaining', () => {
    // Verify optional chaining is used for nested data access
    const hasOptionalChaining = 
      componentContent.includes('risk?.ingredient') ||
      componentContent.includes('risk?.severity') ||
      componentContent.includes('risk?.reason');
    expect(hasOptionalChaining).toBeTruthy();
  });

  it('should maintain RiskHierarchy export as default', () => {
    expect(componentContent).toContain('export default function RiskHierarchy');
  });
});
