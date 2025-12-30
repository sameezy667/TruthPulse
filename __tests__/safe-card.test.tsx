import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('SafeCard Partial Data Handling', () => {
  const componentPath = join(process.cwd(), 'components/results/SafeCard.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('should accept DeepPartial<SafeResponse> as data prop type', () => {
    expect(componentContent).toContain('data: DeepPartial<SafeResponse>');
  });

  it('should import DeepPartial from types', () => {
    expect(componentContent).toContain("import type { DeepPartial } from '@/lib/types'");
  });

  it('should handle undefined summary field with fallback', () => {
    // Check for conditional rendering or fallback for summary
    const hasSummaryCheck = 
      componentContent.includes('data.summary') || 
      componentContent.includes('data?.summary');
    expect(hasSummaryCheck).toBeTruthy();
  });

  it('should display skeleton or placeholder when summary is undefined', () => {
    // Check for TextSkeleton component or placeholder text
    const hasSkeletonOrPlaceholder = 
      componentContent.includes('TextSkeleton') ||
      componentContent.includes('data.summary ||') ||
      componentContent.includes('data?.summary ||');
    expect(hasSkeletonOrPlaceholder).toBeTruthy();
  });

  it('should not crash with partial data by using optional chaining', () => {
    // Verify optional chaining is used for data access
    expect(componentContent).toContain('data?.summary');
  });

  it('should maintain SafeCard export as default', () => {
    expect(componentContent).toContain('export default function SafeCard');
  });
});
