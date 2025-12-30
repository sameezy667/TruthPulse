import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { DeepPartial } from '@/lib/types';
import { 
  type AIResponse, 
  type SafeResponse, 
  type RiskResponse, 
  type RiskItem 
} from '@/lib/schemas';

// Feature: generative-ui-streaming, Property 16: DeepPartial Type Correctness
// Validates: Requirements 11.5

describe('Property-Based DeepPartial Type Correctness', () => {
  it('Property 16: For any object type T, when wrapped in DeepPartial<T>, all properties should be optional', () => {
    // Test that DeepPartial makes all properties optional
    
    // SafeResponse normally requires all fields
    const completeSafe: SafeResponse = {
      type: 'SAFE',
      summary: 'Test',
      safeBadge: true,
    };
    
    // DeepPartial<SafeResponse> should allow partial data
    const partialSafe1: DeepPartial<SafeResponse> = {};
    const partialSafe2: DeepPartial<SafeResponse> = { type: 'SAFE' };
    const partialSafe3: DeepPartial<SafeResponse> = { type: 'SAFE', summary: 'Test' };
    const partialSafe4: DeepPartial<SafeResponse> = completeSafe;
    
    // All should be valid
    expect(partialSafe1).toBeDefined();
    expect(partialSafe2).toBeDefined();
    expect(partialSafe3).toBeDefined();
    expect(partialSafe4).toBeDefined();
  });

  it('Property 16: For any nested object type, DeepPartial should make nested properties optional', () => {
    // RiskResponse has nested RiskItem objects
    const completeRisk: RiskResponse = {
      type: 'RISK',
      headline: 'Test',
      riskHierarchy: [
        {
          ingredient: 'Sugar',
          severity: 'high',
          reason: 'Test reason',
        },
      ],
    };
    
    // DeepPartial should allow partial nested objects
    const partialRisk1: DeepPartial<RiskResponse> = {};
    const partialRisk2: DeepPartial<RiskResponse> = { type: 'RISK' };
    const partialRisk3: DeepPartial<RiskResponse> = { 
      type: 'RISK', 
      riskHierarchy: [] 
    };
    const partialRisk4: DeepPartial<RiskResponse> = { 
      type: 'RISK', 
      riskHierarchy: [{}] // Empty risk item should be valid
    };
    const partialRisk5: DeepPartial<RiskResponse> = { 
      type: 'RISK', 
      riskHierarchy: [{ ingredient: 'Sugar' }] // Partial risk item
    };
    const partialRisk6: DeepPartial<RiskResponse> = completeRisk;
    
    // All should be valid
    expect(partialRisk1).toBeDefined();
    expect(partialRisk2).toBeDefined();
    expect(partialRisk3).toBeDefined();
    expect(partialRisk4).toBeDefined();
    expect(partialRisk5).toBeDefined();
    expect(partialRisk6).toBeDefined();
  });

  it('Property 16: For any array property, DeepPartial should allow undefined or partial array elements', () => {
    // Test that arrays can be undefined or contain partial elements
    const partialWithUndefinedArray: DeepPartial<RiskResponse> = {
      type: 'RISK',
      headline: 'Test',
      // riskHierarchy is undefined
    };
    
    const partialWithEmptyArray: DeepPartial<RiskResponse> = {
      type: 'RISK',
      headline: 'Test',
      riskHierarchy: [],
    };
    
    const partialWithPartialElements: DeepPartial<RiskResponse> = {
      type: 'RISK',
      headline: 'Test',
      riskHierarchy: [
        { ingredient: 'Sugar' }, // Missing severity and reason
        { severity: 'high' },    // Missing ingredient and reason
        {},                       // All fields missing
      ],
    };
    
    expect(partialWithUndefinedArray).toBeDefined();
    expect(partialWithEmptyArray).toBeDefined();
    expect(partialWithPartialElements).toBeDefined();
  });

  it('Property 16: For any discriminated union, DeepPartial should allow partial discriminator', () => {
    // Test that even the discriminator can be undefined
    const noDiscriminator: DeepPartial<AIResponse> = {};
    const withDiscriminator: DeepPartial<AIResponse> = { type: 'SAFE' };
    const withPartialData: DeepPartial<AIResponse> = { 
      type: 'SAFE', 
      summary: 'Test' 
    };
    
    expect(noDiscriminator).toBeDefined();
    expect(withDiscriminator).toBeDefined();
    expect(withPartialData).toBeDefined();
  });

  it('Property 16: For any primitive type, DeepPartial should preserve the primitive type', () => {
    // Test that primitives are not affected by DeepPartial
    type StringType = string;
    type NumberType = number;
    type BooleanType = boolean;
    
    const str: DeepPartial<StringType> = 'test';
    const num: DeepPartial<NumberType> = 42;
    const bool: DeepPartial<BooleanType> = true;
    
    expect(typeof str).toBe('string');
    expect(typeof num).toBe('number');
    expect(typeof bool).toBe('boolean');
  });

  it('Property 16: For any deeply nested object, all levels should be optional', () => {
    // Create a deeply nested type
    type DeeplyNested = {
      level1: {
        level2: {
          level3: {
            value: string;
          };
        };
      };
    };
    
    // All levels should be optional
    const partial1: DeepPartial<DeeplyNested> = {};
    const partial2: DeepPartial<DeeplyNested> = { level1: {} };
    const partial3: DeepPartial<DeeplyNested> = { level1: { level2: {} } };
    const partial4: DeepPartial<DeeplyNested> = { level1: { level2: { level3: {} } } };
    const partial5: DeepPartial<DeeplyNested> = { 
      level1: { 
        level2: { 
          level3: { 
            value: 'test' 
          } 
        } 
      } 
    };
    
    expect(partial1).toBeDefined();
    expect(partial2).toBeDefined();
    expect(partial3).toBeDefined();
    expect(partial4).toBeDefined();
    expect(partial5).toBeDefined();
  });

  it('Property 16: For any RiskItem, DeepPartial should allow any combination of fields', () => {
    // Generate all possible combinations of RiskItem fields
    fc.assert(
      fc.property(
        fc.record({
          ingredient: fc.option(fc.string(), { nil: undefined }),
          severity: fc.option(fc.constantFrom('high' as const, 'med' as const), { nil: undefined }),
          reason: fc.option(fc.string(), { nil: undefined }),
        }),
        (partialRiskItem) => {
          // Any combination should be valid for DeepPartial<RiskItem>
          const item: DeepPartial<RiskItem> = partialRiskItem;
          expect(item).toBeDefined();
          
          // Verify that undefined fields are actually undefined
          if (partialRiskItem.ingredient === undefined) {
            expect(item.ingredient).toBeUndefined();
          }
          if (partialRiskItem.severity === undefined) {
            expect(item.severity).toBeUndefined();
          }
          if (partialRiskItem.reason === undefined) {
            expect(item.reason).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 16: For any SafeResponse, DeepPartial should allow any combination of fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.option(fc.constant('SAFE' as const), { nil: undefined }),
          summary: fc.option(fc.string(), { nil: undefined }),
          safeBadge: fc.option(fc.boolean(), { nil: undefined }),
        }),
        (partialSafe) => {
          // Any combination should be valid for DeepPartial<SafeResponse>
          const safe: DeepPartial<SafeResponse> = partialSafe;
          expect(safe).toBeDefined();
          
          // Verify that present fields have correct types
          if (partialSafe.type !== undefined) {
            expect(safe.type).toBe('SAFE');
          }
          if (partialSafe.summary !== undefined) {
            expect(typeof safe.summary).toBe('string');
          }
          if (partialSafe.safeBadge !== undefined) {
            expect(typeof safe.safeBadge).toBe('boolean');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 16: For any RiskResponse with partial array, DeepPartial should handle it correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.option(fc.constant('RISK' as const), { nil: undefined }),
          headline: fc.option(fc.string(), { nil: undefined }),
          riskHierarchy: fc.option(
            fc.array(
              fc.record({
                ingredient: fc.option(fc.string(), { nil: undefined }),
                severity: fc.option(fc.constantFrom('high' as const, 'med' as const), { nil: undefined }),
                reason: fc.option(fc.string(), { nil: undefined }),
              })
            ),
            { nil: undefined }
          ),
        }),
        (partialRisk) => {
          // Any combination should be valid for DeepPartial<RiskResponse>
          const risk: DeepPartial<RiskResponse> = partialRisk;
          expect(risk).toBeDefined();
          
          // Verify that present fields have correct types
          if (partialRisk.type !== undefined) {
            expect(risk.type).toBe('RISK');
          }
          if (partialRisk.headline !== undefined) {
            expect(typeof risk.headline).toBe('string');
          }
          if (partialRisk.riskHierarchy !== undefined) {
            expect(Array.isArray(risk.riskHierarchy)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
