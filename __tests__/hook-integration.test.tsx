import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Hook Integration', () => {
  it('should import useObject hook from ai/react in page.tsx', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    expect(pageContent).toContain("import { experimental_useObject as useObject } from 'ai/react'");
  });

  it('should import AIResponseSchema from lib/schemas', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    expect(pageContent).toContain("import { AIResponseSchema } from '@/lib/schemas'");
  });

  it('should configure useObject hook with correct api endpoint', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    expect(pageContent).toContain("api: '/api/analyze'");
  });

  it('should configure useObject hook with AIResponseSchema', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    expect(pageContent).toContain('schema: AIResponseSchema');
  });

  it('should destructure object, submit, isLoading, and error from useObject', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    expect(pageContent).toContain('const { object, submit, isLoading, error } = useObject');
  });

  it('should call submit with imageBase64 and userProfile in handleScan', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    expect(pageContent).toContain('submit({ imageBase64, userProfile: profile })');
  });

  it('should not have manual analysis state management', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    // Should not have the old state variables
    expect(pageContent).not.toContain('useState<AIResponse | null>(null)');
    expect(pageContent).not.toContain('setAnalysis');
    expect(pageContent).not.toContain('setIsAnalyzing');
  });

  it('should not have manual fetch logic', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    // Should not have the old fetch call
    expect(pageContent).not.toContain("await fetch('/api/analyze'");
  });

  it('should use object from hook in rendering', () => {
    const pageContent = readFileSync(
      join(process.cwd(), 'app/page.tsx'),
      'utf-8'
    );
    
    expect(pageContent).toContain('object && (');
  });
});

