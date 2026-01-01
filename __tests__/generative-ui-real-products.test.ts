/**
 * Task 2.7: Test Generative UI with Real Products
 * 
 * This test simulates real product scenarios with varying complexity levels
 * to verify that the generative UI engine adapts appropriately.
 */

import { describe, it, expect } from 'vitest';
import { generateUISync } from '@/lib/generative-ui-engine';
import { AIResponse } from '@/lib/schemas';
import { UserProfile } from '@/lib/types';

describe('Task 2.7: Generative UI with Real Products', () => {
  describe('Simple Products (1-3 ingredients)', () => {
    it('should generate minimal UI for plain water', async () => {
      const analysis: AIResponse = {
        type: 'SAFE',
        summary: 'Pure water with no additives. Safe for all dietary needs.',
        safeBadge: true,
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      // Should have minimal components: badge + text
      expect(components).toHaveLength(2);
      expect(components[0].type).toBe('badge');
      expect(components[0].props.variant).toBe('success');
      expect(components[1].type).toBe('text');
      
      // Should NOT have chart
      const hasChart = components.some(c => c.type === 'chart');
      expect(hasChart).toBe(false);
    });

    it('should generate minimal UI for 100% apple juice', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Contains natural sugars',
        riskHierarchy: [
          {
            ingredient: 'Natural Sugars',
            severity: 'med' as const,
            reason: 'Can affect blood sugar levels, though natural',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      // Should have headline + 1 risk card, no chart
      expect(components.length).toBeLessThanOrEqual(3);
      
      const hasChart = components.some(c => c.type === 'chart');
      expect(hasChart).toBe(false);
      
      const cards = components.filter(c => c.type === 'card');
      expect(cards).toHaveLength(1);
    });

    it('should generate minimal UI for simple snack (2 ingredients)', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Simple snack with minor concerns',
        riskHierarchy: [
          {
            ingredient: 'Peanuts',
            severity: 'med' as const,
            reason: 'High in calories',
          },
          {
            ingredient: 'Salt',
            severity: 'med' as const,
            reason: 'Moderate sodium content',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.PALEO);

      // Should have headline + 2 risk cards, no chart
      const hasChart = components.some(c => c.type === 'chart');
      expect(hasChart).toBe(false);
      
      const cards = components.filter(c => c.type === 'card');
      expect(cards).toHaveLength(2);
    });
  });

  describe('Medium Products (4-8 ingredients)', () => {
    it('should generate structured UI for granola bar (5 ingredients)', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Granola bar with some concerning ingredients',
        riskHierarchy: [
          {
            ingredient: 'Brown Sugar',
            severity: 'high' as const,
            reason: 'High sugar content can spike blood glucose',
          },
          {
            ingredient: 'Honey',
            severity: 'med' as const,
            reason: 'Natural sweetener but still affects blood sugar',
          },
          {
            ingredient: 'Oats',
            severity: 'med' as const,
            reason: 'Moderate carbohydrate content',
          },
          {
            ingredient: 'Almonds',
            severity: 'med' as const,
            reason: 'High in calories',
          },
          {
            ingredient: 'Vegetable Oil',
            severity: 'med' as const,
            reason: 'Processed oil',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      // Should have headline + 5 risk cards, NO chart (< 9 ingredients)
      const hasChart = components.some(c => c.type === 'chart');
      expect(hasChart).toBe(false);
      
      const cards = components.filter(c => c.type === 'card');
      expect(cards).toHaveLength(5);
      
      // Should have headline
      const headline = components.find(c => c.type === 'text' && c.props.weight === 'bold');
      expect(headline).toBeDefined();
    });

    it('should generate structured UI for yogurt (6 ingredients)', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Yogurt with added ingredients',
        riskHierarchy: [
          {
            ingredient: 'Milk',
            severity: 'high' as const,
            reason: 'Contains dairy - not suitable for vegan diet',
          },
          {
            ingredient: 'Sugar',
            severity: 'high' as const,
            reason: 'Added sugar',
          },
          {
            ingredient: 'Fruit Concentrate',
            severity: 'med' as const,
            reason: 'Concentrated sugars',
          },
          {
            ingredient: 'Pectin',
            severity: 'med' as const,
            reason: 'Thickening agent',
          },
          {
            ingredient: 'Natural Flavors',
            severity: 'med' as const,
            reason: 'May contain animal-derived ingredients',
          },
          {
            ingredient: 'Live Cultures',
            severity: 'med' as const,
            reason: 'Probiotic bacteria',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.VEGAN);

      // Should NOT have chart (< 9 ingredients)
      const hasChart = components.some(c => c.type === 'chart');
      expect(hasChart).toBe(false);
      
      // Should have 6 risk cards
      const cards = components.filter(c => c.type === 'card');
      expect(cards).toHaveLength(6);
    });

    it('should generate structured UI for packaged snack (8 ingredients)', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Packaged snack with multiple ingredients',
        riskHierarchy: [
          {
            ingredient: 'Wheat Flour',
            severity: 'high' as const,
            reason: 'Contains grains - not paleo-friendly',
          },
          {
            ingredient: 'Sugar',
            severity: 'high' as const,
            reason: 'Refined sugar',
          },
          {
            ingredient: 'Palm Oil',
            severity: 'med' as const,
            reason: 'Processed oil',
          },
          {
            ingredient: 'Salt',
            severity: 'med' as const,
            reason: 'Sodium content',
          },
          {
            ingredient: 'Baking Powder',
            severity: 'med' as const,
            reason: 'Leavening agent',
          },
          {
            ingredient: 'Artificial Flavors',
            severity: 'med' as const,
            reason: 'Synthetic additives',
          },
          {
            ingredient: 'Preservatives',
            severity: 'med' as const,
            reason: 'Chemical preservatives',
          },
          {
            ingredient: 'Food Coloring',
            severity: 'med' as const,
            reason: 'Artificial colors',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.PALEO);

      // Should NOT have chart (exactly 8 ingredients, need 9+)
      const hasChart = components.some(c => c.type === 'chart');
      expect(hasChart).toBe(false);
      
      // Should have 8 risk cards
      const cards = components.filter(c => c.type === 'card');
      expect(cards).toHaveLength(8);
    });
  });

  describe('Complex Products (9+ ingredients)', () => {
    it('should generate rich UI with chart for protein bar (10 ingredients)', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Protein bar with extensive ingredient list',
        riskHierarchy: [
          {
            ingredient: 'Whey Protein',
            severity: 'high' as const,
            reason: 'Contains dairy - not vegan',
          },
          {
            ingredient: 'Sugar',
            severity: 'high' as const,
            reason: 'High sugar content',
          },
          {
            ingredient: 'Corn Syrup',
            severity: 'high' as const,
            reason: 'Added sweetener',
          },
          {
            ingredient: 'Soy Lecithin',
            severity: 'med' as const,
            reason: 'Emulsifier',
          },
          {
            ingredient: 'Natural Flavors',
            severity: 'med' as const,
            reason: 'May contain animal products',
          },
          {
            ingredient: 'Palm Kernel Oil',
            severity: 'med' as const,
            reason: 'Processed oil',
          },
          {
            ingredient: 'Salt',
            severity: 'med' as const,
            reason: 'Sodium content',
          },
          {
            ingredient: 'Artificial Sweeteners',
            severity: 'med' as const,
            reason: 'Synthetic additives',
          },
          {
            ingredient: 'Preservatives',
            severity: 'med' as const,
            reason: 'Chemical preservatives',
          },
          {
            ingredient: 'Vitamins & Minerals',
            severity: 'med' as const,
            reason: 'Fortification',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.VEGAN);

      // MUST have chart for 10 ingredients
      const chart = components.find(c => c.type === 'chart');
      expect(chart).toBeDefined();
      expect(chart?.props.data).toHaveLength(10);
      expect(chart?.props.title).toBe('Risk Overview');
      
      // Should also have individual risk cards
      const cards = components.filter(c => c.type === 'card');
      expect(cards).toHaveLength(10);
      
      // Should have headline
      const headline = components.find(c => c.type === 'text' && c.props.weight === 'bold');
      expect(headline).toBeDefined();
    });

    it('should generate rich UI with chart for processed meal (15 ingredients)', async () => {
      const riskItems = [
        { ingredient: 'Wheat Flour', severity: 'high' as const, reason: 'Contains grains' },
        { ingredient: 'Sugar', severity: 'high' as const, reason: 'Refined sugar' },
        { ingredient: 'Corn Syrup', severity: 'high' as const, reason: 'Added sweetener' },
        { ingredient: 'Soybean Oil', severity: 'med' as const, reason: 'Processed oil' },
        { ingredient: 'Salt', severity: 'med' as const, reason: 'High sodium' },
        { ingredient: 'Artificial Flavors', severity: 'med' as const, reason: 'Synthetic additives' },
        { ingredient: 'Preservatives', severity: 'med' as const, reason: 'Chemical preservatives' },
        { ingredient: 'Food Coloring', severity: 'med' as const, reason: 'Artificial colors' },
        { ingredient: 'Emulsifiers', severity: 'med' as const, reason: 'Processing agents' },
        { ingredient: 'Thickeners', severity: 'med' as const, reason: 'Texture modifiers' },
        { ingredient: 'Flavor Enhancers', severity: 'med' as const, reason: 'MSG-like compounds' },
        { ingredient: 'Acidity Regulators', severity: 'med' as const, reason: 'pH adjusters' },
        { ingredient: 'Anti-caking Agents', severity: 'med' as const, reason: 'Flow agents' },
        { ingredient: 'Stabilizers', severity: 'med' as const, reason: 'Consistency agents' },
        { ingredient: 'Vitamins', severity: 'med' as const, reason: 'Fortification' },
      ];

      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Highly processed meal with many additives',
        riskHierarchy: riskItems,
      };

      const components = await generateUISync(analysis, UserProfile.PALEO);

      // MUST have chart for 15 ingredients
      const chart = components.find(c => c.type === 'chart');
      expect(chart).toBeDefined();
      expect(chart?.props.data).toHaveLength(15);
      
      // Should have all 15 risk cards
      const cards = components.filter(c => c.type === 'card');
      expect(cards).toHaveLength(15);
      
      // Verify chart data structure
      expect(chart?.props.data[0]).toHaveProperty('label');
      expect(chart?.props.data[0]).toHaveProperty('value');
      expect(chart?.props.data[0]).toHaveProperty('severity');
    });

    it('should generate rich UI with chart at boundary (exactly 9 ingredients)', async () => {
      const riskItems = Array.from({ length: 9 }, (_, i) => ({
        ingredient: `Ingredient ${i + 1}`,
        severity: (i % 2 === 0 ? 'high' : 'med') as 'high' | 'med',
        reason: `Reason for ingredient ${i + 1}`,
      }));

      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Product at complexity boundary',
        riskHierarchy: riskItems,
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);

      // MUST have chart at exactly 9 ingredients (boundary condition)
      const chart = components.find(c => c.type === 'chart');
      expect(chart).toBeDefined();
      expect(chart?.props.data).toHaveLength(9);
    });
  });

  describe('UI Adaptation Verification', () => {
    it('should adapt UI density based on ingredient count', async () => {
      // Test that UI complexity increases with ingredient count
      const simpleAnalysis: AIResponse = {
        type: 'RISK',
        headline: 'Simple',
        riskHierarchy: [
          { ingredient: 'A', severity: 'med' as const, reason: 'Test' },
        ],
      };

      const complexAnalysis: AIResponse = {
        type: 'RISK',
        headline: 'Complex',
        riskHierarchy: Array.from({ length: 12 }, (_, i) => ({
          ingredient: `Ingredient ${i}`,
          severity: 'med' as const,
          reason: 'Test',
        })),
      };

      const simpleComponents = await generateUISync(simpleAnalysis, UserProfile.DIABETIC);
      const complexComponents = await generateUISync(complexAnalysis, UserProfile.DIABETIC);

      // Complex should have more components (includes chart)
      expect(complexComponents.length).toBeGreaterThan(simpleComponents.length);
      
      // Complex should have chart, simple should not
      const simpleHasChart = simpleComponents.some(c => c.type === 'chart');
      const complexHasChart = complexComponents.some(c => c.type === 'chart');
      
      expect(simpleHasChart).toBe(false);
      expect(complexHasChart).toBe(true);
    });

    it('should maintain consistent component structure across profiles', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Test product',
        riskHierarchy: Array.from({ length: 10 }, (_, i) => ({
          ingredient: `Ingredient ${i}`,
          severity: 'med' as const,
          reason: 'Test',
        })),
      };

      const diabeticComponents = await generateUISync(analysis, UserProfile.DIABETIC);
      const veganComponents = await generateUISync(analysis, UserProfile.VEGAN);
      const paleoComponents = await generateUISync(analysis, UserProfile.PALEO);

      // All profiles should generate same structure for same analysis
      expect(diabeticComponents.length).toBe(veganComponents.length);
      expect(veganComponents.length).toBe(paleoComponents.length);
      
      // All should have chart
      expect(diabeticComponents.some(c => c.type === 'chart')).toBe(true);
      expect(veganComponents.some(c => c.type === 'chart')).toBe(true);
      expect(paleoComponents.some(c => c.type === 'chart')).toBe(true);
    }, 10000); // Increase timeout for multiple profile generations

    it('should handle edge case: 8 ingredients (no chart) vs 9 ingredients (chart)', async () => {
      const eightIngredients: AIResponse = {
        type: 'RISK',
        headline: 'Eight ingredients',
        riskHierarchy: Array.from({ length: 8 }, (_, i) => ({
          ingredient: `Ingredient ${i}`,
          severity: 'med' as const,
          reason: 'Test',
        })),
      };

      const nineIngredients: AIResponse = {
        type: 'RISK',
        headline: 'Nine ingredients',
        riskHierarchy: Array.from({ length: 9 }, (_, i) => ({
          ingredient: `Ingredient ${i}`,
          severity: 'med' as const,
          reason: 'Test',
        })),
      };

      const eightComponents = await generateUISync(eightIngredients, UserProfile.DIABETIC);
      const nineComponents = await generateUISync(nineIngredients, UserProfile.DIABETIC);

      // 8 ingredients: NO chart
      const eightHasChart = eightComponents.some(c => c.type === 'chart');
      expect(eightHasChart).toBe(false);
      
      // 9 ingredients: YES chart
      const nineHasChart = nineComponents.some(c => c.type === 'chart');
      expect(nineHasChart).toBe(true);
    });
  });

  describe('Component Quality Checks', () => {
    it('should generate valid component props for all complexity levels', async () => {
      const analyses: AIResponse[] = [
        {
          type: 'SAFE',
          summary: 'Simple safe product',
          safeBadge: true,
        },
        {
          type: 'RISK',
          headline: 'Medium product',
          riskHierarchy: Array.from({ length: 5 }, (_, i) => ({
            ingredient: `Ingredient ${i}`,
            severity: 'med' as const,
            reason: 'Test',
          })),
        },
        {
          type: 'RISK',
          headline: 'Complex product',
          riskHierarchy: Array.from({ length: 12 }, (_, i) => ({
            ingredient: `Ingredient ${i}`,
            severity: 'high' as const,
            reason: 'Test',
          })),
        },
      ];

      for (const analysis of analyses) {
        const components = await generateUISync(analysis, UserProfile.DIABETIC);
        
        // All components should have valid structure
        components.forEach(component => {
          expect(component).toHaveProperty('type');
          expect(component).toHaveProperty('props');
          expect(typeof component.props).toBe('object');
          expect(['text', 'badge', 'card', 'list', 'chart']).toContain(component.type);
        });
      }
    });

    it('should generate nested children correctly for card components', async () => {
      const analysis: AIResponse = {
        type: 'RISK',
        headline: 'Test',
        riskHierarchy: [
          {
            ingredient: 'Test Ingredient',
            severity: 'high' as const,
            reason: 'Test reason',
          },
        ],
      };

      const components = await generateUISync(analysis, UserProfile.DIABETIC);
      
      const cards = components.filter(c => c.type === 'card');
      expect(cards.length).toBeGreaterThan(0);
      
      // Each card should have children (ingredient name + reason)
      cards.forEach(card => {
        expect(card.children).toBeDefined();
        expect(Array.isArray(card.children)).toBe(true);
        expect(card.children!.length).toBeGreaterThan(0);
        
        // Children should be text components
        card.children!.forEach(child => {
          expect(child.type).toBe('text');
          expect(child.props).toHaveProperty('content');
        });
      });
    });
  });
});
