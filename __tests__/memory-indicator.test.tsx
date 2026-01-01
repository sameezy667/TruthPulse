import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('MemoryIndicator', () => {
  const componentPath = join(process.cwd(), 'components/ui/MemoryIndicator.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('should accept UserHistory as history prop', () => {
    expect(componentContent).toContain('history: UserHistory');
  });

  it('should import UserHistory from user-history', () => {
    expect(componentContent).toContain("import { UserHistory } from '@/lib/user-history'");
  });

  it('should use Brain icon from lucide-react', () => {
    expect(componentContent).toContain("import { Brain } from 'lucide-react'");
    expect(componentContent).toContain('<Brain');
  });

  it('should return null for new users with no scan count', () => {
    expect(componentContent).toContain('history.scanCount === 0');
    expect(componentContent).toContain('return null');
  });

  it('should return null when no preferences are learned', () => {
    const hasPreferenceCheck = 
      componentContent.includes('avoidedIngredients.length === 0') &&
      componentContent.includes('preferredIngredients.length === 0');
    expect(hasPreferenceCheck).toBeTruthy();
  });

  it('should display avoided ingredients', () => {
    expect(componentContent).toContain('avoidedIngredients');
    expect(componentContent).toContain('you avoid');
  });

  it('should display preferred ingredients', () => {
    expect(componentContent).toContain('preferredIngredients');
    expect(componentContent).toContain('you prefer');
  });

  it('should display dietary profile', () => {
    expect(componentContent).toContain('dietaryProfile');
    expect(componentContent).toContain('you follow a');
  });

  it('should show "and X more" for additional ingredients', () => {
    expect(componentContent).toContain('and ${');
    expect(componentContent).toContain('} more');
  });

  it('should be positioned at top of screen', () => {
    expect(componentContent).toContain('top-16');
  });

  it('should have animations', () => {
    expect(componentContent).toContain('motion.div');
    expect(componentContent).toContain('initial=');
    expect(componentContent).toContain('animate=');
  });

  it('should use pointer-events-none to not obstruct UI', () => {
    expect(componentContent).toContain('pointer-events-none');
  });

  it('should have blue theme styling', () => {
    expect(componentContent).toContain('blue-');
  });

  it('should use backdrop blur', () => {
    expect(componentContent).toContain('backdrop-blur');
  });
});
