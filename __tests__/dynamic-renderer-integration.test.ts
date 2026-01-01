import { describe, it, expect } from 'vitest';
import { generateUISync } from '@/lib/generative-ui-engine';
import { AIResponse } from '@/lib/schemas';
import { UserProfile } from '@/lib/types';

describe('DynamicRenderer Integration with Generative UI Engine', () => {
  it('should generate renderable components for SAFE response', async () => {
    const analysis: AIResponse = {
      type: 'SAFE',
      summary: 'This product is safe for your dietary needs.',
      safeBadge: true,
    };

    const components = await generateUISync(analysis, UserProfile.VEGAN);

    // Verify components can be passed to DynamicRenderer
    expect(components).toBeInstanceOf(Array);
    expect(components.length).toBeGreaterThan(0);
    
    // Verify component structure
    components.forEach(comp => {
      expect(comp).toHaveProperty('type');
      expect(comp).toHaveProperty('props');
      expect(['text', 'badge', 'card', 'list', 'chart']).toContain(comp.type);
    });
  });

  it('should generate renderable components for RISK response with chart', async () => {
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

    const components = await generateUISync(analysis, UserProfile.DIABETIC);

    // Should include chart for complex products
    const chart = components.find(c => c.type === 'chart');
    expect(chart).toBeDefined();
    expect(chart?.props.data).toHaveLength(10);
    
    // Should include cards for each risk
    const cards = components.filter(c => c.type === 'card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should generate renderable components for DECISION response', async () => {
    const analysis: AIResponse = {
      type: 'DECISION',
      question: 'How strict are you with your diet?',
      options: ['Very Strict', 'Somewhat Flexible', 'Not Strict'],
    };

    const components = await generateUISync(analysis, UserProfile.PALEO);

    // Should have text and list components
    expect(components.some(c => c.type === 'text')).toBe(true);
    expect(components.some(c => c.type === 'list')).toBe(true);
    
    const list = components.find(c => c.type === 'list');
    expect(list?.props.items).toEqual(['Very Strict', 'Somewhat Flexible', 'Not Strict']);
  });

  it('should generate renderable components with nested children', async () => {
    const analysis: AIResponse = {
      type: 'UNCERTAIN',
      rawText: 'Unable to clearly identify all ingredients.',
    };

    const components = await generateUISync(analysis, UserProfile.VEGAN);

    // Should have card with nested children
    const card = components.find(c => c.type === 'card');
    expect(card).toBeDefined();
    expect(card?.children).toBeDefined();
    expect(card?.children?.length).toBeGreaterThan(0);
  });

  it('should handle all component types from engine', async () => {
    const analyses: AIResponse[] = [
      { type: 'SAFE', summary: 'Safe', safeBadge: true },
      { type: 'RISK', headline: 'Risk', riskHierarchy: [
        { ingredient: 'Sugar', severity: 'high', reason: 'High sugar' }
      ]},
      { type: 'DECISION', question: 'Question?', options: ['A', 'B'] },
      { type: 'UNCERTAIN', rawText: 'Uncertain' },
    ];

    for (const analysis of analyses) {
      const components = await generateUISync(analysis, UserProfile.DIABETIC);
      
      // All components should be valid
      expect(components).toBeInstanceOf(Array);
      components.forEach(comp => {
        expect(['text', 'badge', 'card', 'list', 'chart']).toContain(comp.type);
      });
    }
  });
});
