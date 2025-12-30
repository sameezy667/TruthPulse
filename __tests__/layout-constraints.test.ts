// Unit tests for layout constraints
// Requirements: 10.1, 10.5

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Layout Constraints', () => {
  const generativeRendererPath = join(process.cwd(), 'components/results/GenerativeRenderer.tsx');
  const safeCardPath = join(process.cwd(), 'components/results/SafeCard.tsx');
  const riskHierarchyPath = join(process.cwd(), 'components/results/RiskHierarchy.tsx');
  const decisionForkPath = join(process.cwd(), 'components/results/DecisionFork.tsx');
  const uncertainCardPath = join(process.cwd(), 'components/results/UncertainCard.tsx');
  const pageComponentPath = join(process.cwd(), 'app/page.tsx');
  const tailwindConfigPath = join(process.cwd(), 'tailwind.config.ts');

  let generativeRendererContent: string;
  let safeCardContent: string;
  let riskHierarchyContent: string;
  let decisionForkContent: string;
  let uncertainCardContent: string;
  let pageContent: string;
  let tailwindConfig: string;

  try {
    generativeRendererContent = readFileSync(generativeRendererPath, 'utf-8');
    safeCardContent = readFileSync(safeCardPath, 'utf-8');
    riskHierarchyContent = readFileSync(riskHierarchyPath, 'utf-8');
    decisionForkContent = readFileSync(decisionForkPath, 'utf-8');
    uncertainCardContent = readFileSync(uncertainCardPath, 'utf-8');
    pageContent = readFileSync(pageComponentPath, 'utf-8');
    tailwindConfig = readFileSync(tailwindConfigPath, 'utf-8');
  } catch (error) {
    generativeRendererContent = '';
    safeCardContent = '';
    riskHierarchyContent = '';
    decisionForkContent = '';
    uncertainCardContent = '';
    pageContent = '';
    tailwindConfig = '';
  }

  describe('Safe Area Handling', () => {
    it('should configure safe area spacing in tailwind config', () => {
      // Check for safe area inset configuration
      expect(tailwindConfig).toContain('safe-area-inset-top');
      expect(tailwindConfig).toContain('safe-area-inset-bottom');
    });

    it('SafeCard should use pt-safe-top class for top padding', () => {
      expect(safeCardContent).toContain('pt-safe-top');
    });

    it('SafeCard should use pb-safe-bottom class for bottom padding', () => {
      expect(safeCardContent).toContain('pb-safe-bottom');
    });

    it('RiskHierarchy should use pt-safe-top class for top padding', () => {
      expect(riskHierarchyContent).toContain('pt-safe-top');
    });

    it('RiskHierarchy should use pb-safe-bottom class for bottom padding', () => {
      expect(riskHierarchyContent).toContain('pb-safe-bottom');
    });

    it('DecisionFork should use pt-safe-top class for top padding', () => {
      expect(decisionForkContent).toContain('pt-safe-top');
    });

    it('DecisionFork should use pb-safe-bottom class for bottom padding', () => {
      expect(decisionForkContent).toContain('pb-safe-bottom');
    });

    it('UncertainCard should use pt-safe-top class for top padding', () => {
      expect(uncertainCardContent).toContain('pt-safe-top');
    });

    it('UncertainCard should use pb-safe-bottom class for bottom padding', () => {
      expect(uncertainCardContent).toContain('pb-safe-bottom');
    });

    it('main page should use pt-safe or pb-safe for safe area handling', () => {
      const hasSafeAreaHandling = 
        pageContent.includes('pt-safe') || 
        pageContent.includes('pb-safe');
      expect(hasSafeAreaHandling).toBeTruthy();
    });
  });

  describe('Mobile-First Layout', () => {
    it('SafeCard should use full height layout', () => {
      // Check for h-full or h-screen
      const hasFullHeight = 
        safeCardContent.includes('h-full') || 
        safeCardContent.includes('h-screen');
      expect(hasFullHeight).toBeTruthy();
    });

    it('RiskHierarchy should use full height layout', () => {
      const hasFullHeight = 
        riskHierarchyContent.includes('h-full') || 
        riskHierarchyContent.includes('h-screen');
      expect(hasFullHeight).toBeTruthy();
    });

    it('DecisionFork should use full height layout', () => {
      const hasFullHeight = 
        decisionForkContent.includes('h-full') || 
        decisionForkContent.includes('h-screen');
      expect(hasFullHeight).toBeTruthy();
    });

    it('UncertainCard should use full height layout', () => {
      const hasFullHeight = 
        uncertainCardContent.includes('h-full') || 
        uncertainCardContent.includes('h-screen');
      expect(hasFullHeight).toBeTruthy();
    });

    it('components should use flex-col for vertical layout', () => {
      expect(safeCardContent).toContain('flex-col');
      expect(riskHierarchyContent).toContain('flex-col');
      expect(decisionForkContent).toContain('flex-col');
      expect(uncertainCardContent).toContain('flex-col');
    });

    it('SafeCard should constrain content width for mobile', () => {
      // Check for max-w-* classes
      const hasMaxWidth = /max-w-\w+/.test(safeCardContent);
      expect(hasMaxWidth).toBeTruthy();
    });

    it('RiskHierarchy should handle overflow with scrolling', () => {
      // Check for overflow-y-auto or similar
      const hasOverflowHandling = 
        riskHierarchyContent.includes('overflow-y-auto') ||
        riskHierarchyContent.includes('overflow-auto');
      expect(hasOverflowHandling).toBeTruthy();
    });

    it('DecisionFork should constrain content width for mobile', () => {
      const hasMaxWidth = /max-w-\w+/.test(decisionForkContent);
      expect(hasMaxWidth).toBeTruthy();
    });

    it('UncertainCard should constrain content width for mobile', () => {
      const hasMaxWidth = /max-w-\w+/.test(uncertainCardContent);
      expect(hasMaxWidth).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('components should use responsive padding classes', () => {
      // Check for p-* or px-* or py-* classes
      const components = [
        safeCardContent,
        riskHierarchyContent,
        decisionForkContent,
        uncertainCardContent,
      ];

      for (const content of components) {
        const hasResponsivePadding = /p-\d+|px-\d+|py-\d+/.test(content);
        expect(hasResponsivePadding).toBeTruthy();
      }
    });

    it('components should use responsive spacing classes', () => {
      const components = [
        safeCardContent,
        riskHierarchyContent,
        decisionForkContent,
        uncertainCardContent,
      ];

      for (const content of components) {
        const hasResponsiveSpacing = /space-y-\d+|gap-\d+/.test(content);
        expect(hasResponsiveSpacing).toBeTruthy();
      }
    });

    it('main page should prevent horizontal overflow', () => {
      // Check for overflow-hidden on main container
      const hasOverflowControl = 
        pageContent.includes('overflow-hidden') ||
        pageContent.includes('overflow-x-hidden');
      expect(hasOverflowControl).toBeTruthy();
    });

    it('main page should use full viewport dimensions', () => {
      expect(pageContent).toContain('w-full');
      const hasFullHeight = 
        pageContent.includes('h-screen') || 
        pageContent.includes('h-full');
      expect(hasFullHeight).toBeTruthy();
    });
  });

  describe('Touch-Friendly Interactions', () => {
    it('SafeCard should have touch-friendly button sizes', () => {
      // Check for h-10 or h-14 or similar (minimum 40px touch target)
      const hasTouchFriendlyButtons = /h-10|h-14|h-12/.test(safeCardContent);
      expect(hasTouchFriendlyButtons).toBeTruthy();
    });

    it('RiskHierarchy should have touch-friendly button sizes', () => {
      const hasTouchFriendlyButtons = /h-10|h-14|h-12/.test(riskHierarchyContent);
      expect(hasTouchFriendlyButtons).toBeTruthy();
    });

    it('DecisionFork should have touch-friendly button sizes', () => {
      const hasTouchFriendlyButtons = /h-10|h-14|h-12/.test(decisionForkContent);
      expect(hasTouchFriendlyButtons).toBeTruthy();
    });

    it('UncertainCard should have touch-friendly button sizes', () => {
      const hasTouchFriendlyButtons = /h-10|h-14|h-12/.test(uncertainCardContent);
      expect(hasTouchFriendlyButtons).toBeTruthy();
    });

    it('components should use rounded corners for better mobile UX', () => {
      const components = [
        safeCardContent,
        riskHierarchyContent,
        decisionForkContent,
        uncertainCardContent,
      ];

      for (const content of components) {
        const hasRoundedCorners = /rounded-\w+/.test(content);
        expect(hasRoundedCorners).toBeTruthy();
      }
    });
  });
});
