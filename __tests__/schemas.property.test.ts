import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { AIResponseSchema } from '@/lib/schemas';

// Feature: generative-ui-streaming, Property 2: Schema Validation for All Responses
// Validates: Requirements 2.1, 2.7, 2.8

describe('Property-Based Schema Validation', () => {
  // Arbitrary for generating valid SAFE responses
  const safeResponseArbitrary = fc.record({
    type: fc.constant('SAFE' as const),
    summary: fc.string({ minLength: 1 }),
    safeBadge: fc.constant(true as const),
  });

  // Arbitrary for generating valid risk items
  const riskItemArbitrary = fc.record({
    ingredient: fc.string({ minLength: 1 }),
    severity: fc.constantFrom('high' as const, 'med' as const),
    reason: fc.string({ minLength: 1 }),
  });

  // Arbitrary for generating valid RISK responses
  const riskResponseArbitrary = fc.record({
    type: fc.constant('RISK' as const),
    headline: fc.string({ minLength: 1 }),
    riskHierarchy: fc.array(riskItemArbitrary),
  });

  // Arbitrary for generating valid DECISION responses
  const decisionResponseArbitrary = fc.record({
    type: fc.constant('DECISION' as const),
    question: fc.string({ minLength: 1 }),
    options: fc.constant(['Strict', 'Flexible'] as const),
  });

  // Arbitrary for generating valid UNCERTAIN responses
  const uncertainResponseArbitrary = fc.record({
    type: fc.constant('UNCERTAIN' as const),
    rawText: fc.string({ minLength: 1 }),
  });

  // Combined arbitrary for all valid AI responses
  const validAIResponseArbitrary = fc.oneof(
    safeResponseArbitrary,
    riskResponseArbitrary,
    decisionResponseArbitrary,
    uncertainResponseArbitrary
  );

  it('Property 2: For any valid AI response, schema validation should succeed', () => {
    fc.assert(
      fc.property(validAIResponseArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: For any SAFE response with valid fields, schema should validate', () => {
    fc.assert(
      fc.property(safeResponseArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
        if (result.success && result.data.type === 'SAFE') {
          expect(result.data.type).toBe('SAFE');
          expect(result.data.safeBadge).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: For any RISK response with valid fields, schema should validate', () => {
    fc.assert(
      fc.property(riskResponseArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
        if (result.success && result.data.type === 'RISK') {
          expect(result.data.type).toBe('RISK');
          expect(Array.isArray(result.data.riskHierarchy)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: For any DECISION response with valid fields, schema should validate', () => {
    fc.assert(
      fc.property(decisionResponseArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
        if (result.success && result.data.type === 'DECISION') {
          expect(result.data.type).toBe('DECISION');
          expect(result.data.options).toEqual(['Strict', 'Flexible']);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: For any UNCERTAIN response with valid fields, schema should validate', () => {
    fc.assert(
      fc.property(uncertainResponseArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
        if (result.success && result.data.type === 'UNCERTAIN') {
          expect(result.data.type).toBe('UNCERTAIN');
          expect(typeof result.data.rawText).toBe('string');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: For any response with invalid type discriminator, schema should reject', () => {
    const invalidTypeArbitrary = fc.record({
      type: fc.string().filter(s => !['SAFE', 'RISK', 'DECISION', 'UNCERTAIN'].includes(s)),
      data: fc.anything(),
    });

    fc.assert(
      fc.property(invalidTypeArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: For any SAFE response with safeBadge=false, schema should reject', () => {
    const invalidSafeArbitrary = fc.record({
      type: fc.constant('SAFE' as const),
      summary: fc.string({ minLength: 1 }),
      safeBadge: fc.constant(false),
    });

    fc.assert(
      fc.property(invalidSafeArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: For any DECISION response with wrong options, schema should reject', () => {
    const invalidDecisionArbitrary = fc.record({
      type: fc.constant('DECISION' as const),
      question: fc.string({ minLength: 1 }),
      options: fc.array(fc.string(), { minLength: 2, maxLength: 2 })
        .filter(opts => opts[0] !== 'Strict' || opts[1] !== 'Flexible'),
    });

    fc.assert(
      fc.property(invalidDecisionArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: For any risk item with invalid severity, schema should reject', () => {
    const invalidRiskItemArbitrary = fc.record({
      ingredient: fc.string({ minLength: 1 }),
      severity: fc.string().filter(s => s !== 'high' && s !== 'med'),
      reason: fc.string({ minLength: 1 }),
    });

    const invalidRiskResponseArbitrary = fc.record({
      type: fc.constant('RISK' as const),
      headline: fc.string({ minLength: 1 }),
      riskHierarchy: fc.array(invalidRiskItemArbitrary, { minLength: 1 }),
    });

    fc.assert(
      fc.property(invalidRiskResponseArbitrary, (response) => {
        const result = AIResponseSchema.safeParse(response);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
