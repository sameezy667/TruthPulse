import { describe, it, expect } from 'vitest';
import { generateUISync, UIComponent } from '../lib/generative-ui-engine';
import { AIResponse } from '../lib/schemas';
import { UserProfile } from '../lib/types';

describe('Generative UI Engine', () => {
  describe('SAFE response', () => {
    it('should generate badge and summary for safe products', async () => {
      const analysis: AIResponse = {
        type: 'SAFE',
        summary: 'This product is safe for your dietary needs.',
        safeBadge: true,
      };

      const components = await generateUISync(analysis, UserProfile.VEGAN);

      expect(components).toHaveLength(2);
      expect(components[0].type).toBe('badge');
      expect(components[0].props.variant).toBe('success');
      expect(components[1].type).toBe('text');
      expect(components[1].props.content).toBe('This product is safe for your dietary needs.');
    });
  });

  describe('RISK response', () => {
    it('should generate headline and risk cards for simple products', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Contains ingredients to avoid',
        riskHierarchy: [
          {
            ingredient: 'High Fructose Corn Syrup',
            severity: 'high' as const,
            reason: 'Can spike blood sugar levels',
          },
          {
            ingredient: 'Artificial Colors',
            severity: 'med' as const,
            reason: 'May cause allergic reactions',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      expect(components.length).toBeGreaterThan(2);
      expect(components[0].type).toBe('text');
      expect(components[0].props.content).toBe('Contains ingredients to avoid');
      
      // Should have cards for each risk item
      const cards = components.filter(c => c.type === 'card');
      expect(cards).toHaveLength(2);
    });

    it('should generate chart for complex products (9+ ingredients)', async () => {
      const riskItems = Array.from({ length: 10 }, (_, i) => ({
        ingredient: `Ingredient ${i + 1}`,
        severity: (i % 2 === 0 ? 'high' : 'med') as 'high' | 'med',
        reason: `Reason for ingredient ${i + 1}`,
      }));

      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Complex product with many ingredients',
        riskHierarchy: riskItems,
      };

      const components = await generateUISync(analysis, UserProfile.VEGAN);

      // Should include a chart component for complex products
      const chart = components.find(c => c.type === 'chart');
      expect(chart).toBeDefined();
      expect(chart?.props.data).toHaveLength(10);
    });
  });

  describe('DECISION response', () => {
    it('should generate question and options list', async () => {
      const analysis: AIResponse = {
        type: 'DECISION',
        question: 'How strict are you with your diet?',
        options: ['Very Strict', 'Somewhat Flexible', 'Not Strict'],
      };

      const components = await generateUISync(analysis, UserProfile.PALEO);

      expect(components).toHaveLength(2);
      expect(components[0].type).toBe('text');
      expect(components[0].props.content).toBe('How strict are you with your diet?');
      expect(components[1].type).toBe('list');
      expect(components[1].props.items).toEqual(['Very Strict', 'Somewhat Flexible', 'Not Strict']);
    });
  });

  describe('UNCERTAIN response', () => {
    it('should generate card with uncertain message', async () => {
      const analysis: AIResponse = {
        type: 'UNCERTAIN',
        rawText: 'Unable to clearly identify all ingredients in this product.',
      };

      const components = await generateUISync(analysis, UserProfile.VEGAN);

      expect(components).toHaveLength(1);
      expect(components[0].type).toBe('card');
      expect(components[0].children).toHaveLength(2);
      expect(components[0].children?.[1].props.content).toContain('Unable to clearly identify');
    });
  });

  describe('Complexity-based UI selection', () => {
    it('should not generate chart for products with less than 9 ingredients', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Simple product',
        riskHierarchy: [
          { ingredient: 'Sugar', severity: 'high' as const, reason: 'High sugar content' },
          { ingredient: 'Salt', severity: 'med' as const, reason: 'Moderate sodium' },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      const chart = components.find(c => c.type === 'chart');
      expect(chart).toBeUndefined();
    });

    it('should generate chart for products with 9 or more ingredients', async () => {
      const riskItems = Array.from({ length: 9 }, (_, i) => ({
        ingredient: `Ingredient ${i + 1}`,
        severity: 'med' as const,
        reason: `Reason ${i + 1}`,
      }));

      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Complex product',
        riskHierarchy: riskItems,
      };

      const components = await generateUISync(analysis, UserProfile.VEGAN);

      const chart = components.find(c => c.type === 'chart');
      expect(chart).toBeDefined();
    });
  });
});
