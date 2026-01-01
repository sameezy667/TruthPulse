/**
 * Test: Generative UI Integration in API Route
 * 
 * This test verifies that the API route correctly integrates the generative UI engine
 * and generates UI components based on the analysis.
 */

import { generateUISync } from '@/lib/generative-ui-engine';
import { UserProfile } from '@/lib/types';
import type { AIResponse } from '@/lib/schemas';

describe('Generative UI Integration', () => {
  describe('SAFE response', () => {
    it('should generate UI components for safe products', async () => {
      const analysis: AIResponse = {
        type: 'SAFE',
        summary: 'This product is safe for diabetics',
        safeBadge: true,
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('badge');
      expect(components[0].props.variant).toBe('success');
    });
  });

  describe('RISK response', () => {
    it('should generate UI components for risky products', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Contains high sugar',
        riskHierarchy: [
          {
            ingredient: 'Sugar',
            severity: 'high' as const,
            reason: 'High glycemic index',
          },
          {
            ingredient: 'Corn Syrup',
            severity: 'med' as const,
            reason: 'Added sugar',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      expect(components.length).toBeGreaterThan(0);
      // Should have headline text
      expect(components.some(c => c.type === 'text')).toBe(true);
      // Should have risk cards
      expect(components.some(c => c.type === 'card')).toBe(true);
    });

    it('should generate chart for complex products (9+ ingredients)', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Multiple concerning ingredients',
        riskHierarchy: Array.from({ length: 10 }, (_, i) => ({
          ingredient: `Ingredient ${i + 1}`,
          severity: (i % 2 === 0 ? 'high' : 'med') as 'high' | 'med',
          reason: `Reason ${i + 1}`,
        })),
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      // Should include a chart for complex products
      expect(components.some(c => c.type === 'chart')).toBe(true);
    });
  });

  describe('DECISION response', () => {
    it('should generate UI components for decision forks', async () => {
      const analysis: AIResponse = {
        type: 'DECISION',
        question: 'How strict is your diet?',
        options: ['Strict', 'Flexible'],
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      expect(components.length).toBeGreaterThan(0);
      expect(components.some(c => c.type === 'text')).toBe(true);
      expect(components.some(c => c.type === 'list')).toBe(true);
    });
  });

  describe('UNCERTAIN response', () => {
    it('should generate UI components for uncertain analysis', async () => {
      const analysis: AIResponse = {
        type: 'UNCERTAIN',
        rawText: 'Unable to analyze this product',
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      expect(components.length).toBeGreaterThan(0);
      expect(components[0].type).toBe('card');
    });
  });

  describe('Component structure', () => {
    it('should generate components with valid props', async () => {
      const analysis: AIResponse = {
        type: 'SAFE',
        summary: 'Test summary',
        safeBadge: true,
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      components.forEach(component => {
        expect(component).toHaveProperty('type');
        expect(component).toHaveProperty('props');
        expect(typeof component.props).toBe('object');
      });
    });

    it('should handle nested children', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Test',
        riskHierarchy: [
          {
            ingredient: 'Test',
            severity: 'high' as const,
            reason: 'Test reason',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      // Card components should have children
      const cardComponents = components.filter(c => c.type === 'card');
      expect(cardComponents.length).toBeGreaterThan(0);
      expect(cardComponents[0].children).toBeDefined();
      expect(Array.isArray(cardComponents[0].children)).toBe(true);
    });
  });
});
