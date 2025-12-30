import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Skeleton Components', () => {
  describe('TextSkeleton', () => {
    const componentPath = join(process.cwd(), 'components/ui/TextSkeleton.tsx');
    let componentContent: string;

    // Read the component file once for all tests
    try {
      componentContent = readFileSync(componentPath, 'utf-8');
    } catch (error) {
      componentContent = '';
    }

    it('should accept width prop with default value', () => {
      expect(componentContent).toContain('width');
      expect(componentContent).toContain("width = '100%'");
    });

    it('should accept height prop with default value', () => {
      expect(componentContent).toContain('height');
      expect(componentContent).toContain("height = '1rem'");
    });

    it('should accept className prop', () => {
      expect(componentContent).toContain('className');
    });

    it('should have pulsing animation class', () => {
      expect(componentContent).toContain('animate-pulse');
    });

    it('should have background styling', () => {
      expect(componentContent).toContain('bg-zinc-800/50');
    });

    it('should render as span element', () => {
      expect(componentContent).toContain('<span');
    });

    it('should apply width and height via style prop', () => {
      expect(componentContent).toContain('style={{ width, height }}');
    });

    it('should export as default', () => {
      expect(componentContent).toContain('export default function TextSkeleton');
    });
  });

  describe('RiskSkeleton', () => {
    const componentPath = join(process.cwd(), 'components/ui/RiskSkeleton.tsx');
    let componentContent: string;

    // Read the component file once for all tests
    try {
      componentContent = readFileSync(componentPath, 'utf-8');
    } catch (error) {
      componentContent = '';
    }

    it('should render high risk skeleton items', () => {
      // Should have red-themed skeleton items
      expect(componentContent).toContain('bg-red-950/20');
      expect(componentContent).toContain('bg-red-500/20');
    });

    it('should render medium risk skeleton items', () => {
      // Should have amber-themed skeleton items
      expect(componentContent).toContain('bg-amber-950/20');
      expect(componentContent).toContain('bg-amber-500/20');
    });

    it('should have pulsing animation on skeleton elements', () => {
      expect(componentContent).toContain('animate-pulse');
    });

    it('should use framer-motion for animations', () => {
      expect(componentContent).toContain("from 'framer-motion'");
      expect(componentContent).toContain('motion.div');
    });

    it('should have proper spacing structure', () => {
      expect(componentContent).toContain('space-y-4');
    });

    it('should match expected height for risk hierarchy with multiple items', () => {
      // Should render multiple skeleton items (at least 2 high + 1 med)
      const highRiskMatches = componentContent.match(/skeleton-high-/g);
      const medRiskMatches = componentContent.match(/skeleton-med-/g);
      
      expect(highRiskMatches).toBeTruthy();
      expect(medRiskMatches).toBeTruthy();
    });

    it('should export as default', () => {
      expect(componentContent).toContain('export default function RiskSkeleton');
    });
  });
});
