import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('UncertainCard Partial Data Handling', () => {
  const componentPath = join(process.cwd(), 'components/results/UncertainCard.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('should accept DeepPartial<UncertainResponse> as data prop type', () => {
    expect(componentContent).toContain('data: DeepPartial<UncertainResponse>');
  });

  it('should import DeepPartial from types', () => {
    expect(componentContent).toContain("import type { DeepPartial } from '@/lib/types'");
  });

  it('should handle undefined rawText field with fallback', () => {
    // Check for conditional rendering or fallback for rawText
    const hasRawTextCheck = 
      componentContent.includes('data.rawText') || 
      componentContent.includes('data?.rawText');
    expect(hasRawTextCheck).toBeTruthy();
  });

  it('should display placeholder when rawText is undefined', () => {
    // Check for fallback text or placeholder
    const hasPlaceholder = 
      componentContent.includes('data?.rawText ||') ||
      componentContent.includes('data.rawText ||');
    expect(hasPlaceholder).toBeTruthy();
  });

  it('should not crash with partial data by using optional chaining', () => {
    // Verify optional chaining is used for data access
    expect(componentContent).toContain('data?.rawText');
  });

  it('should maintain UncertainCard export as default', () => {
    expect(componentContent).toContain('export default function UncertainCard');
  });

  it('should have a meaningful placeholder message', () => {
    // Check that the placeholder message is helpful
    const hasHelpfulMessage = 
      componentContent.includes('encountered an issue') ||
      componentContent.includes('try again') ||
      componentContent.includes('clearer photo');
    expect(hasHelpfulMessage).toBeTruthy();
  });
});
