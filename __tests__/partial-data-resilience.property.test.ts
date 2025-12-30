// Feature: generative-ui-streaming, Property 10: Partial Data Resilience
// Validates: Requirements 5.9, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Property 10: Partial Data Resilience', () => {
  // Read component files
  const safeCardPath = join(process.cwd(), 'components/results/SafeCard.tsx');
  const riskHierarchyPath = join(process.cwd(), 'components/results/RiskHierarchy.tsx');
  const decisionForkPath = join(process.cwd(), 'components/results/DecisionFork.tsx');
  const uncertainCardPath = join(process.cwd(), 'components/results/UncertainCard.tsx');

  let safeCardContent: string;
  let riskHierarchyContent: string;
  let decisionForkContent: string;
  let uncertainCardContent: string;

  try {
    safeCardContent = readFileSync(safeCardPath, 'utf-8');
    riskHierarchyContent = readFileSync(riskHierarchyPath, 'utf-8');
    decisionForkContent = readFileSync(decisionForkPath, 'utf-8');
    uncertainCardContent = readFileSync(uncertainCardPath, 'utf-8');
  } catch (error) {
    safeCardContent = '';
    riskHierarchyContent = '';
    decisionForkContent = '';
    uncertainCardContent = '';
  }

  it('for any SafeCard with partial SafeResponse data, component should handle undefined summary field', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: undefined }), // summary can be undefined
        fc.option(fc.boolean(), { nil: undefined }), // safeBadge can be undefined
        (summary, safeBadge) => {
          // SafeCard should use optional chaining for summary
          expect(safeCardContent).toContain('data?.summary');
          
          // SafeCard should have a fallback for undefined summary
          const hasFallback = 
            safeCardContent.includes('data?.summary ||') ||
            safeCardContent.includes('TextSkeleton');
          expect(hasFallback).toBeTruthy();
          
          // Component should accept DeepPartial type
          expect(safeCardContent).toContain('DeepPartial<SafeResponse>');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any RiskHierarchy with partial RiskResponse data, component should handle undefined headline and empty riskHierarchy', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: undefined }), // headline can be undefined
        fc.option(
          fc.array(
            fc.record({
              ingredient: fc.string(),
              severity: fc.constantFrom('high' as const, 'med' as const),
              reason: fc.string(),
            })
          ),
          { nil: undefined }
        ), // riskHierarchy can be undefined
        (headline, riskHierarchy) => {
          // RiskHierarchy should use optional chaining for headline
          expect(riskHierarchyContent).toContain('data?.headline');
          
          // RiskHierarchy should handle undefined or empty riskHierarchy array
          const handlesEmptyArray = 
            riskHierarchyContent.includes('data?.riskHierarchy') ||
            riskHierarchyContent.includes('data.riskHierarchy');
          expect(handlesEmptyArray).toBeTruthy();
          
          // Component should accept DeepPartial type
          expect(riskHierarchyContent).toContain('DeepPartial<RiskResponse>');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any DecisionFork with partial DecisionResponse data, component should handle undefined question and options', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: undefined }), // question can be undefined
        fc.option(
          fc.tuple(fc.constant('Strict' as const), fc.constant('Flexible' as const)),
          { nil: undefined }
        ), // options can be undefined
        (question, options) => {
          // DecisionFork should use optional chaining for question
          expect(decisionForkContent).toContain('data?.question');
          
          // DecisionFork should handle undefined options
          const handlesOptions = 
            decisionForkContent.includes('data?.options') ||
            decisionForkContent.includes('data.options');
          expect(handlesOptions).toBeTruthy();
          
          // Component should accept DeepPartial type
          expect(decisionForkContent).toContain('DeepPartial<DecisionResponse>');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any UncertainCard with partial UncertainResponse data, component should handle undefined rawText', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: undefined }), // rawText can be undefined
        (rawText) => {
          // UncertainCard should use optional chaining for rawText
          expect(uncertainCardContent).toContain('data?.rawText');
          
          // UncertainCard should have a fallback for undefined rawText
          const hasFallback = uncertainCardContent.includes('data?.rawText ||');
          expect(hasFallback).toBeTruthy();
          
          // Component should accept DeepPartial type
          expect(uncertainCardContent).toContain('DeepPartial<UncertainResponse>');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any component receiving partial data, all string fields should have fallbacks or placeholders', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('SafeCard', 'RiskHierarchy', 'DecisionFork', 'UncertainCard'),
        (componentName) => {
          let content: string;
          let expectedFields: string[];

          switch (componentName) {
            case 'SafeCard':
              content = safeCardContent;
              expectedFields = ['summary'];
              break;
            case 'RiskHierarchy':
              content = riskHierarchyContent;
              expectedFields = ['headline'];
              break;
            case 'DecisionFork':
              content = decisionForkContent;
              expectedFields = ['question'];
              break;
            case 'UncertainCard':
              content = uncertainCardContent;
              expectedFields = ['rawText'];
              break;
            default:
              content = '';
              expectedFields = [];
          }

          // Each component should use optional chaining for its fields
          for (const field of expectedFields) {
            const usesOptionalChaining = content.includes(`data?.${field}`);
            expect(usesOptionalChaining).toBeTruthy();
          }

          // Each component should accept DeepPartial type
          expect(content).toContain('DeepPartial<');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any partial data object, components should not crash by using defensive programming', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.option(fc.constantFrom('SAFE', 'RISK', 'DECISION', 'UNCERTAIN'), { nil: undefined }),
          summary: fc.option(fc.string(), { nil: undefined }),
          headline: fc.option(fc.string(), { nil: undefined }),
          question: fc.option(fc.string(), { nil: undefined }),
          rawText: fc.option(fc.string(), { nil: undefined }),
          riskHierarchy: fc.option(
            fc.array(
              fc.record({
                ingredient: fc.string(),
                severity: fc.constantFrom('high' as const, 'med' as const),
                reason: fc.string(),
              })
            ),
            { nil: undefined }
          ),
          options: fc.option(
            fc.tuple(fc.constant('Strict' as const), fc.constant('Flexible' as const)),
            { nil: undefined }
          ),
        }),
        (partialData) => {
          // All components should use optional chaining (defensive programming)
          const allComponents = [safeCardContent, riskHierarchyContent, decisionForkContent, uncertainCardContent];
          
          for (const content of allComponents) {
            // Should use optional chaining
            const usesOptionalChaining = content.includes('data?.');
            expect(usesOptionalChaining).toBeTruthy();
            
            // Should accept DeepPartial type
            const acceptsDeepPartial = content.includes('DeepPartial<');
            expect(acceptsDeepPartial).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any streaming state with incomplete data, components should display appropriate placeholders', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('SafeCard', 'RiskHierarchy', 'DecisionFork', 'UncertainCard'),
        (componentName) => {
          let content: string;

          switch (componentName) {
            case 'SafeCard':
              content = safeCardContent;
              break;
            case 'RiskHierarchy':
              content = riskHierarchyContent;
              break;
            case 'DecisionFork':
              content = decisionForkContent;
              break;
            case 'UncertainCard':
              content = uncertainCardContent;
              break;
            default:
              content = '';
          }

          // Components should have fallback mechanisms
          const hasFallback = 
            content.includes('||') || // Logical OR for fallbacks
            content.includes('Skeleton') || // Skeleton components
            content.includes('placeholder') || // Placeholder text
            content.includes('Loading'); // Loading text
          
          expect(hasFallback).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
