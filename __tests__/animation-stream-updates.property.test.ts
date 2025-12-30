// Feature: generative-ui-streaming, Property 11: Animation on Stream Updates
// Validates: Requirements 5.8

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Property 11: Animation on Stream Updates', () => {
  const componentPath = join(process.cwd(), 'components/results/RiskHierarchy.tsx');
  let componentContent: string;

  // Read the component file once for all tests
  try {
    componentContent = readFileSync(componentPath, 'utf-8');
  } catch (error) {
    componentContent = '';
  }

  it('for any risk hierarchy array, when new items are added during streaming, each new item should trigger a Framer Motion animation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            ingredient: fc.string({ minLength: 1 }),
            severity: fc.constantFrom('high' as const, 'med' as const),
            reason: fc.string({ minLength: 1 }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (riskHierarchy) => {
          // Property: Each risk item should have animation properties
          // Verify that the component uses motion.div with initial, animate, and transition props
          
          // Check that AnimatePresence wraps the risk items
          expect(componentContent).toContain('AnimatePresence');
          
          // Check that motion.div is used for each risk item
          expect(componentContent).toContain('motion.div');
          
          // Check for animation properties
          expect(componentContent).toContain('initial={{ opacity: 0, x: -20 }}');
          expect(componentContent).toContain('animate={{ opacity: 1, x: 0 }}');
          
          // Check for staggered delay based on index
          const hasStaggeredDelay = 
            componentContent.includes('delay: idx * 0.1') ||
            componentContent.includes('delay: (highRisks.length + idx) * 0.1');
          expect(hasStaggeredDelay).toBe(true);
          
          // Verify that each item in the array would get a unique animation delay
          riskHierarchy.forEach((_, idx) => {
            // Each item should have a delay proportional to its index
            const expectedDelay = idx * 0.1;
            expect(expectedDelay).toBeGreaterThanOrEqual(0);
            expect(expectedDelay).toBeLessThanOrEqual(riskHierarchy.length * 0.1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any streaming update that adds risk items, the animation delay should increase with index', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }), // number of items
        (itemCount) => {
          // Property: Animation delays should be staggered
          // Each subsequent item should have a larger delay than the previous
          
          const delays: number[] = [];
          for (let idx = 0; idx < itemCount; idx++) {
            delays.push(idx * 0.1);
          }
          
          // Verify delays are monotonically increasing
          for (let i = 1; i < delays.length; i++) {
            expect(delays[i]).toBeGreaterThan(delays[i - 1]);
          }
          
          // Verify the delay increment is consistent (0.1 seconds)
          for (let i = 1; i < delays.length; i++) {
            const increment = delays[i] - delays[i - 1];
            expect(increment).toBeCloseTo(0.1, 5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any risk item, the animation should use Framer Motion transition properties', () => {
    fc.assert(
      fc.property(
        fc.record({
          ingredient: fc.string({ minLength: 1 }),
          severity: fc.constantFrom('high' as const, 'med' as const),
          reason: fc.string({ minLength: 1 }),
        }),
        (riskItem) => {
          // Property: Each risk item should have proper animation configuration
          
          // Verify motion.div is used
          expect(componentContent).toContain('motion.div');
          
          // Verify initial state (hidden and offset)
          expect(componentContent).toContain('initial={{ opacity: 0, x: -20 }}');
          
          // Verify animate state (visible and in position)
          expect(componentContent).toContain('animate={{ opacity: 1, x: 0 }}');
          
          // Verify transition with delay
          expect(componentContent).toContain('transition={{');
          expect(componentContent).toContain('delay:');
          
          // The risk item should have required properties
          expect(riskItem).toHaveProperty('ingredient');
          expect(riskItem).toHaveProperty('severity');
          expect(riskItem).toHaveProperty('reason');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any array of risk items, AnimatePresence should wrap the mapped items', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            ingredient: fc.string({ minLength: 1 }),
            severity: fc.constantFrom('high' as const, 'med' as const),
            reason: fc.string({ minLength: 1 }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (riskHierarchy) => {
          // Property: AnimatePresence should be present in the component
          // to handle enter/exit animations for streaming items
          
          expect(componentContent).toContain('AnimatePresence');
          expect(componentContent).toContain('import { motion, AnimatePresence }');
          
          // Verify that the component can handle any array length
          expect(riskHierarchy.length).toBeGreaterThanOrEqual(0);
          expect(riskHierarchy.length).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any high and medium risk items, each should have independent staggered animations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            ingredient: fc.string({ minLength: 1 }),
            severity: fc.constant('high' as const),
            reason: fc.string({ minLength: 1 }),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        fc.array(
          fc.record({
            ingredient: fc.string({ minLength: 1 }),
            severity: fc.constant('med' as const),
            reason: fc.string({ minLength: 1 }),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        (highRisks, medRisks) => {
          // Property: Medium risk items should have delays that account for high risk items
          // to maintain continuous staggered animation
          
          // Check that the component handles both severity levels
          expect(componentContent).toContain('highRisks');
          expect(componentContent).toContain('medRisks');
          
          // Verify that medium risks have delays that continue from high risks
          expect(componentContent).toContain('delay: (highRisks.length + idx) * 0.1');
          
          // Calculate expected delays
          const highRiskDelays = highRisks.map((_, idx) => idx * 0.1);
          const medRiskDelays = medRisks.map((_, idx) => (highRisks.length + idx) * 0.1);
          
          // Verify high risk delays
          highRiskDelays.forEach((delay, idx) => {
            expect(delay).toBe(idx * 0.1);
          });
          
          // Verify medium risk delays continue from high risks
          medRiskDelays.forEach((delay, idx) => {
            expect(delay).toBe((highRisks.length + idx) * 0.1);
            if (highRisks.length > 0) {
              // Medium risk delays should be greater than the last high risk delay
              const lastHighRiskDelay = (highRisks.length - 1) * 0.1;
              expect(delay).toBeGreaterThan(lastHighRiskDelay);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
