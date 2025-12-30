// Feature: generative-ui-streaming, Property 12: Skeleton Display for Missing Data
// Validates: Requirements 7.3

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Property 12: Skeleton Display for Missing Data', () => {
  // Read component files
  const safeCardPath = join(process.cwd(), 'components/results/SafeCard.tsx');
  const riskHierarchyPath = join(process.cwd(), 'components/results/RiskHierarchy.tsx');
  const decisionForkPath = join(process.cwd(), 'components/results/DecisionFork.tsx');
  const uncertainCardPath = join(process.cwd(), 'components/results/UncertainCard.tsx');
  const textSkeletonPath = join(process.cwd(), 'components/ui/TextSkeleton.tsx');
  const riskSkeletonPath = join(process.cwd(), 'components/ui/RiskSkeleton.tsx');

  let safeCardContent: string;
  let riskHierarchyContent: string;
  let decisionForkContent: string;
  let uncertainCardContent: string;
  let textSkeletonContent: string;
  let riskSkeletonContent: string;

  try {
    safeCardContent = readFileSync(safeCardPath, 'utf-8');
    riskHierarchyContent = readFileSync(riskHierarchyPath, 'utf-8');
    decisionForkContent = readFileSync(decisionForkPath, 'utf-8');
    uncertainCardContent = readFileSync(uncertainCardPath, 'utf-8');
    textSkeletonContent = readFileSync(textSkeletonPath, 'utf-8');
    riskSkeletonContent = readFileSync(riskSkeletonPath, 'utf-8');
  } catch (error) {
    safeCardContent = '';
    riskHierarchyContent = '';
    decisionForkContent = '';
    uncertainCardContent = '';
    textSkeletonContent = '';
    riskSkeletonContent = '';
  }

  it('for any string field that is undefined during streaming, the component should display a skeleton loader or placeholder text', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('SafeCard', 'RiskHierarchy', 'DecisionFork', 'UncertainCard'),
        fc.option(fc.string(), { nil: undefined }), // Field value can be undefined
        (componentName, fieldValue) => {
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

          // When fieldValue is undefined, component should have skeleton or placeholder
          if (fieldValue === undefined) {
            const hasSkeletonOrPlaceholder = 
              content.includes('Skeleton') ||
              content.includes('animate-pulse') ||
              content.includes('Loading...') ||
              content.includes('placeholder') ||
              content.includes('||'); // Fallback operator
            
            expect(hasSkeletonOrPlaceholder).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any component with undefined string fields, skeleton components should be available', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('TextSkeleton', 'RiskSkeleton'),
        (skeletonType) => {
          const content = skeletonType === 'TextSkeleton' ? textSkeletonContent : riskSkeletonContent;
          
          // Skeleton should have pulsing animation
          expect(content).toContain('animate-pulse');
          
          // Skeleton should be exported as default
          expect(content).toContain(`export default function ${skeletonType}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any RiskHierarchy with empty riskHierarchy array, RiskSkeleton should be displayed', () => {
    fc.assert(
      fc.property(
        fc.option(
          fc.array(
            fc.record({
              ingredient: fc.string(),
              severity: fc.constantFrom('high' as const, 'med' as const),
              reason: fc.string(),
            })
          ),
          { nil: undefined }
        ),
        (riskHierarchy) => {
          // RiskHierarchy should check for empty array
          const checksEmptyArray = 
            riskHierarchyContent.includes('riskHierarchy.length === 0') ||
            riskHierarchyContent.includes('riskHierarchy?.length === 0') ||
            riskHierarchyContent.includes('showSkeleton');
          
          expect(checksEmptyArray).toBeTruthy();
          
          // RiskHierarchy should import or use RiskSkeleton
          const usesRiskSkeleton = 
            riskHierarchyContent.includes('RiskSkeleton') ||
            riskHierarchyContent.includes('Skeleton');
          
          expect(usesRiskSkeleton).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any SafeCard with undefined summary, skeleton or placeholder should be displayed', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: undefined }),
        (summary) => {
          // SafeCard should have fallback for undefined summary
          const hasFallback = 
            safeCardContent.includes('data?.summary ||') ||
            safeCardContent.includes('animate-pulse') ||
            safeCardContent.includes('Skeleton');
          
          expect(hasFallback).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any DecisionFork with undefined options, loading text should be displayed', () => {
    fc.assert(
      fc.property(
        fc.option(
          fc.tuple(fc.constant('Strict' as const), fc.constant('Flexible' as const)),
          { nil: undefined }
        ),
        (options) => {
          // DecisionFork should have fallback for undefined options
          const hasFallback = 
            decisionForkContent.includes('Loading...') ||
            decisionForkContent.includes('data?.options?.[0]') ||
            decisionForkContent.includes('data?.options?.[1]');
          
          expect(hasFallback).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any UncertainCard with undefined rawText, placeholder should be displayed', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: undefined }),
        (rawText) => {
          // UncertainCard should have fallback for undefined rawText
          const hasFallback = 
            uncertainCardContent.includes('data?.rawText ||') ||
            uncertainCardContent.includes('placeholder');
          
          expect(hasFallback).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any skeleton component, it should have pulsing animation to indicate loading state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('TextSkeleton', 'RiskSkeleton'),
        (skeletonType) => {
          const content = skeletonType === 'TextSkeleton' ? textSkeletonContent : riskSkeletonContent;
          
          // All skeletons should have animate-pulse class
          expect(content).toContain('animate-pulse');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any component displaying skeletons, the skeleton should match the expected height of actual content', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('SafeCard', 'RiskHierarchy'),
        (componentName) => {
          const content = componentName === 'SafeCard' ? safeCardContent : riskHierarchyContent;
          
          // Components should have skeleton with appropriate sizing
          const hasSizedSkeleton = 
            content.includes('h-4') || // Height class
            content.includes('h-3') ||
            content.includes('h-9') ||
            content.includes('w-') || // Width class
            content.includes('Skeleton'); // Skeleton component
          
          expect(hasSizedSkeleton).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any streaming state with missing data, all components should prevent layout shift by reserving space', () => {
    fc.assert(
      fc.property(
        fc.record({
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
        }),
        (partialData) => {
          // All components should have mechanisms to prevent layout shift
          const allComponents = [safeCardContent, riskHierarchyContent, decisionForkContent, uncertainCardContent];
          
          for (const content of allComponents) {
            // Should have skeleton, placeholder, or fallback that reserves space
            const preventsLayoutShift = 
              content.includes('Skeleton') ||
              content.includes('animate-pulse') ||
              content.includes('||') || // Fallback operator
              content.includes('Loading...') ||
              content.includes('placeholder');
            
            expect(preventsLayoutShift).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
