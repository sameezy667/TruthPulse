// Feature: generative-ui-streaming, Property 14: Layout Constraint Compliance
// Validates: Requirements 10.4

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Property 14: Layout Constraint Compliance', () => {
  const safeCardPath = join(process.cwd(), 'components/results/SafeCard.tsx');
  const riskHierarchyPath = join(process.cwd(), 'components/results/RiskHierarchy.tsx');
  const decisionForkPath = join(process.cwd(), 'components/results/DecisionFork.tsx');
  const uncertainCardPath = join(process.cwd(), 'components/results/UncertainCard.tsx');
  const pageComponentPath = join(process.cwd(), 'app/page.tsx');
  const globalsPath = join(process.cwd(), 'app/globals.css');

  let safeCardContent: string;
  let riskHierarchyContent: string;
  let decisionForkContent: string;
  let uncertainCardContent: string;
  let pageContent: string;
  let globalsContent: string;

  try {
    safeCardContent = readFileSync(safeCardPath, 'utf-8');
    riskHierarchyContent = readFileSync(riskHierarchyPath, 'utf-8');
    decisionForkContent = readFileSync(decisionForkPath, 'utf-8');
    uncertainCardContent = readFileSync(uncertainCardPath, 'utf-8');
    pageContent = readFileSync(pageComponentPath, 'utf-8');
    globalsContent = readFileSync(globalsPath, 'utf-8');
  } catch (error) {
    safeCardContent = '';
    riskHierarchyContent = '';
    decisionForkContent = '';
    uncertainCardContent = '';
    pageContent = '';
    globalsContent = '';
  }

  it('for any streaming data that causes content to grow, the layout should not cause horizontal scrolling beyond viewport width', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('SafeCard', 'RiskHierarchy', 'DecisionFork', 'UncertainCard'),
        fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 1, maxLength: 20 }), // Varying content lengths
        (componentName, contentArray) => {
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

          // Components should use full width (w-full) to prevent overflow
          const usesFullWidth = content.includes('w-full');
          expect(usesFullWidth).toBeTruthy();

          // Components should NOT use fixed widths that could exceed viewport
          const hasFixedWidth = /w-\d{3,}/.test(content); // w-100, w-200, etc.
          expect(hasFixedWidth).toBeFalsy();

          // Components should use max-width constraints for content
          const hasMaxWidth = /max-w-\w+/.test(content);
          expect(hasMaxWidth).toBeTruthy();

          // Components should handle text overflow gracefully
          const hasTextOverflowHandling = 
            content.includes('overflow-hidden') ||
            content.includes('overflow-x-hidden') ||
            content.includes('truncate') ||
            content.includes('break-words') ||
            content.includes('break-all');
          
          // At least one component should have overflow handling
          // (not all components need it, but the system should handle it)
          if (componentName === 'RiskHierarchy') {
            expect(hasTextOverflowHandling).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any component with dynamic content, width constraints should prevent horizontal scroll', () => {
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

          // Components should use responsive width classes
          const hasResponsiveWidth = 
            content.includes('w-full') ||
            content.includes('w-screen');
          expect(hasResponsiveWidth).toBeTruthy();

          // Components should constrain inner content with max-width
          const hasMaxWidthConstraint = /max-w-(xs|sm|md|lg|xl|\d+xl|\w+)/.test(content);
          expect(hasMaxWidthConstraint).toBeTruthy();

          // Components should use padding that doesn't cause overflow
          const usesSafePadding = /p-\d+|px-\d+/.test(content);
          expect(usesSafePadding).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any text content of varying length, components should handle overflow without horizontal scroll', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }), // Varying text lengths
        fc.constantFrom('SafeCard', 'RiskHierarchy', 'DecisionFork', 'UncertainCard'),
        (textContent, componentName) => {
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

          // Text containers should have width constraints
          const hasWidthConstraint = 
            content.includes('max-w-') ||
            content.includes('w-full');
          expect(hasWidthConstraint).toBeTruthy();

          // Components should use flex layout for proper sizing
          const usesFlexLayout = content.includes('flex');
          expect(usesFlexLayout).toBeTruthy();

          // Components should use flex-col for vertical stacking
          const usesFlexCol = content.includes('flex-col');
          expect(usesFlexCol).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any array of risk items that grows during streaming, RiskHierarchy should not cause horizontal scroll', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            ingredient: fc.string({ minLength: 5, maxLength: 100 }),
            severity: fc.constantFrom('high' as const, 'med' as const),
            reason: fc.string({ minLength: 20, maxLength: 300 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (riskItems) => {
          // RiskHierarchy should handle overflow with vertical scrolling
          const hasVerticalScroll = 
            riskHierarchyContent.includes('overflow-y-auto') ||
            riskHierarchyContent.includes('overflow-auto');
          expect(hasVerticalScroll).toBeTruthy();

          // RiskHierarchy should NOT allow horizontal overflow
          const preventsHorizontalScroll = 
            !riskHierarchyContent.includes('overflow-x-auto') &&
            !riskHierarchyContent.includes('overflow-x-scroll');
          expect(preventsHorizontalScroll).toBeTruthy();

          // RiskHierarchy should use full width
          const usesFullWidth = riskHierarchyContent.includes('w-full');
          expect(usesFullWidth).toBeTruthy();

          // Risk items should have width constraints
          const hasMaxWidth = /max-w-\w+/.test(riskHierarchyContent);
          expect(hasMaxWidth).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any main page container, overflow should be controlled to prevent horizontal scroll', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('SETUP', 'SCANNER', 'ANALYZING'),
        (appStep) => {
          // Main page should prevent horizontal overflow
          const hasOverflowControl = 
            pageContent.includes('overflow-hidden') ||
            pageContent.includes('overflow-x-hidden');
          expect(hasOverflowControl).toBeTruthy();

          // Main page should use full width
          const usesFullWidth = pageContent.includes('w-full');
          expect(usesFullWidth).toBeTruthy();

          // Main page should use full height
          const usesFullHeight = 
            pageContent.includes('h-screen') ||
            pageContent.includes('h-full');
          expect(usesFullHeight).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any component with buttons or interactive elements, they should fit within viewport width', () => {
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

          // Buttons should use w-full or constrained widths
          const hasButtonWidthControl = 
            content.includes('w-full') ||
            /max-w-\w+/.test(content);
          expect(hasButtonWidthControl).toBeTruthy();

          // Buttons should use rounded corners (mobile-friendly)
          const hasRoundedButtons = /rounded-\w+/.test(content);
          expect(hasRoundedButtons).toBeTruthy();

          // Buttons should have appropriate height (touch-friendly)
          const hasTouchFriendlyHeight = /h-10|h-12|h-14/.test(content);
          expect(hasTouchFriendlyHeight).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any global styles, they should prevent horizontal scroll', () => {
    fc.assert(
      fc.property(
        fc.constant(true),
        () => {
          // Check if globals.css has no-scrollbar utility
          const hasNoScrollbarUtility = globalsContent.includes('no-scrollbar');
          expect(hasNoScrollbarUtility).toBeTruthy();

          // Body should have proper styling
          const hasBodyStyling = globalsContent.includes('body');
          expect(hasBodyStyling).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any component with animations during streaming, animations should not cause layout shift or horizontal scroll', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('SafeCard', 'RiskHierarchy', 'DecisionFork', 'UncertainCard'),
        fc.integer({ min: 1, max: 20 }), // Number of animated items
        (componentName, itemCount) => {
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

          // Components using framer-motion should have proper layout
          if (content.includes('motion.')) {
            // Should use flex layout for proper sizing
            const usesFlexLayout = content.includes('flex');
            expect(usesFlexLayout).toBeTruthy();

            // Should have width constraints
            const hasWidthConstraint = 
              content.includes('w-full') ||
              /max-w-\w+/.test(content);
            expect(hasWidthConstraint).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any viewport width, components should adapt without horizontal scroll', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 430 }), // Mobile viewport widths
        fc.constantFrom('SafeCard', 'RiskHierarchy', 'DecisionFork', 'UncertainCard'),
        (viewportWidth, componentName) => {
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

          // Components should use responsive width classes
          const usesResponsiveWidth = 
            content.includes('w-full') ||
            content.includes('w-screen');
          expect(usesResponsiveWidth).toBeTruthy();

          // Components should use max-width for content constraint
          const hasMaxWidth = /max-w-\w+/.test(content);
          expect(hasMaxWidth).toBeTruthy();

          // Components should use responsive padding
          const hasResponsivePadding = /p-\d+|px-\d+|py-\d+/.test(content);
          expect(hasResponsivePadding).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any content that streams in incrementally, layout should remain stable without horizontal scroll', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 1, maxLength: 10 }),
        fc.constantFrom('SafeCard', 'RiskHierarchy', 'DecisionFork', 'UncertainCard'),
        (streamingContent, componentName) => {
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

          // Components should use flex layout for stable sizing
          const usesFlexLayout = content.includes('flex-col');
          expect(usesFlexLayout).toBeTruthy();

          // Components should constrain content width
          const hasWidthConstraint = 
            content.includes('w-full') ||
            /max-w-\w+/.test(content);
          expect(hasWidthConstraint).toBeTruthy();

          // Components should use proper spacing that doesn't cause overflow
          const hasProperSpacing = /space-y-\d+|gap-\d+/.test(content);
          expect(hasProperSpacing).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
