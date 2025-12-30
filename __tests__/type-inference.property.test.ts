import { describe, it, expect } from 'vitest';
import { 
  AIResponseSchema, 
  SafeResponseSchema, 
  RiskResponseSchema, 
  DecisionResponseSchema, 
  UncertainResponseSchema,
  RiskItemSchema,
  AnalyzeRequestSchema,
  type AIResponse,
  type SafeResponse,
  type RiskResponse,
  type DecisionResponse,
  type UncertainResponse,
  type RiskItem,
  type AnalyzeRequest
} from '@/lib/schemas';
import { UserProfile } from '@/lib/types';

// Feature: generative-ui-streaming, Property 15: Type Inference from Schema
// Validates: Requirements 11.4

describe('Property-Based Type Inference', () => {
  it('Property 15: For any Zod schema, TypeScript should correctly infer the type without manual annotations', () => {
    // Test that types are correctly inferred from schemas
    // This test validates that z.infer works correctly
    
    // Test SafeResponse type inference
    const safeData: SafeResponse = {
      type: 'SAFE',
      summary: 'Test summary',
      safeBadge: true,
    };
    
    const safeResult = SafeResponseSchema.safeParse(safeData);
    expect(safeResult.success).toBe(true);
    if (safeResult.success) {
      // TypeScript should infer the correct type
      const inferredType: SafeResponse = safeResult.data;
      expect(inferredType.type).toBe('SAFE');
      expect(inferredType.safeBadge).toBe(true);
    }
  });

  it('Property 15: For any RiskResponse schema, TypeScript should infer nested array types correctly', () => {
    const riskData: RiskResponse = {
      type: 'RISK',
      headline: 'Test headline',
      riskHierarchy: [
        {
          ingredient: 'Sugar',
          severity: 'high',
          reason: 'High glycemic index',
        },
      ],
    };
    
    const riskResult = RiskResponseSchema.safeParse(riskData);
    expect(riskResult.success).toBe(true);
    if (riskResult.success) {
      // TypeScript should infer the array type correctly
      const inferredType: RiskResponse = riskResult.data;
      expect(Array.isArray(inferredType.riskHierarchy)).toBe(true);
      
      // TypeScript should infer the item type correctly
      const firstItem: RiskItem = inferredType.riskHierarchy[0];
      expect(firstItem.severity).toMatch(/^(high|med)$/);
    }
  });

  it('Property 15: For any DecisionResponse schema, TypeScript should infer tuple types correctly', () => {
    const decisionData: DecisionResponse = {
      type: 'DECISION',
      question: 'Test question',
      options: ['Strict', 'Flexible'],
    };
    
    const decisionResult = DecisionResponseSchema.safeParse(decisionData);
    expect(decisionResult.success).toBe(true);
    if (decisionResult.success) {
      // TypeScript should infer the tuple type correctly
      const inferredType: DecisionResponse = decisionResult.data;
      expect(inferredType.options).toHaveLength(2);
      
      // TypeScript should know the exact literal types
      const firstOption: 'Strict' = inferredType.options[0];
      const secondOption: 'Flexible' = inferredType.options[1];
      expect(firstOption).toBe('Strict');
      expect(secondOption).toBe('Flexible');
    }
  });

  it('Property 15: For any UncertainResponse schema, TypeScript should infer string types correctly', () => {
    const uncertainData: UncertainResponse = {
      type: 'UNCERTAIN',
      rawText: 'Test raw text',
    };
    
    const uncertainResult = UncertainResponseSchema.safeParse(uncertainData);
    expect(uncertainResult.success).toBe(true);
    if (uncertainResult.success) {
      // TypeScript should infer the string type correctly
      const inferredType: UncertainResponse = uncertainResult.data;
      expect(typeof inferredType.rawText).toBe('string');
    }
  });

  it('Property 15: For any discriminated union schema, TypeScript should infer all union members correctly', () => {
    // Test that AIResponse type is a union of all response types
    const safeResponse: AIResponse = {
      type: 'SAFE',
      summary: 'Safe',
      safeBadge: true,
    };
    
    const riskResponse: AIResponse = {
      type: 'RISK',
      headline: 'Risk',
      riskHierarchy: [],
    };
    
    const decisionResponse: AIResponse = {
      type: 'DECISION',
      question: 'Question',
      options: ['Strict', 'Flexible'],
    };
    
    const uncertainResponse: AIResponse = {
      type: 'UNCERTAIN',
      rawText: 'Uncertain',
    };
    
    // All should parse successfully
    expect(AIResponseSchema.safeParse(safeResponse).success).toBe(true);
    expect(AIResponseSchema.safeParse(riskResponse).success).toBe(true);
    expect(AIResponseSchema.safeParse(decisionResponse).success).toBe(true);
    expect(AIResponseSchema.safeParse(uncertainResponse).success).toBe(true);
  });

  it('Property 15: For any discriminated union, TypeScript should narrow types based on discriminator', () => {
    const response: AIResponse = {
      type: 'SAFE',
      summary: 'Test',
      safeBadge: true,
    };
    
    // TypeScript should narrow the type based on the discriminator
    if (response.type === 'SAFE') {
      // In this block, TypeScript knows response is SafeResponse
      const summary: string = response.summary;
      const safeBadge: boolean = response.safeBadge;
      expect(summary).toBe('Test');
      expect(safeBadge).toBe(true);
    }
    
    const riskResponse: AIResponse = {
      type: 'RISK',
      headline: 'Risk',
      riskHierarchy: [],
    };
    
    if (riskResponse.type === 'RISK') {
      // In this block, TypeScript knows riskResponse is RiskResponse
      const headline: string = riskResponse.headline;
      const hierarchy: RiskItem[] = riskResponse.riskHierarchy;
      expect(headline).toBe('Risk');
      expect(Array.isArray(hierarchy)).toBe(true);
    }
  });

  it('Property 15: For any request schema, TypeScript should infer enum types correctly', () => {
    const requestData: AnalyzeRequest = {
      imageBase64: 'base64data',
      userProfile: UserProfile.DIABETIC,
    };
    
    const requestResult = AnalyzeRequestSchema.safeParse(requestData);
    expect(requestResult.success).toBe(true);
    if (requestResult.success) {
      // TypeScript should infer the enum type correctly
      const inferredType: AnalyzeRequest = requestResult.data;
      expect(['DIABETIC', 'VEGAN', 'PALEO']).toContain(inferredType.userProfile);
    }
  });

  it('Property 15: For any schema with literal types, TypeScript should infer exact literal values', () => {
    // Test that literal types are inferred correctly
    const safeType: SafeResponse['type'] = 'SAFE';
    const riskType: RiskResponse['type'] = 'RISK';
    const decisionType: DecisionResponse['type'] = 'DECISION';
    const uncertainType: UncertainResponse['type'] = 'UNCERTAIN';
    
    // These should be exact literal types, not just string
    expect(safeType).toBe('SAFE');
    expect(riskType).toBe('RISK');
    expect(decisionType).toBe('DECISION');
    expect(uncertainType).toBe('UNCERTAIN');
    
    // TypeScript should prevent assignment of wrong literals
    // This is a compile-time check, but we can verify the runtime values
    const allTypes = [safeType, riskType, decisionType, uncertainType];
    expect(allTypes).toEqual(['SAFE', 'RISK', 'DECISION', 'UNCERTAIN']);
  });

  it('Property 15: For any nested schema, TypeScript should infer nested object types correctly', () => {
    const riskItem: RiskItem = {
      ingredient: 'Sugar',
      severity: 'high',
      reason: 'Test reason',
    };
    
    const riskItemResult = RiskItemSchema.safeParse(riskItem);
    expect(riskItemResult.success).toBe(true);
    if (riskItemResult.success) {
      // TypeScript should infer the nested type correctly
      const inferredItem: RiskItem = riskItemResult.data;
      expect(inferredItem.ingredient).toBe('Sugar');
      expect(inferredItem.severity).toBe('high');
      expect(inferredItem.reason).toBe('Test reason');
      
      // TypeScript should know severity is an enum
      const severity: 'high' | 'med' = inferredItem.severity;
      expect(['high', 'med']).toContain(severity);
    }
  });
});
