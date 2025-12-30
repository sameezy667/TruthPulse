import { describe, it, expect } from 'vitest';
import {
  AIResponseSchema,
  SafeResponseSchema,
  RiskResponseSchema,
  DecisionResponseSchema,
  UncertainResponseSchema,
  RiskItemSchema,
} from '@/lib/schemas';

describe('Schema Validation', () => {
  describe('SafeResponseSchema', () => {
    it('should validate a correct SAFE response', () => {
      const validSafe = {
        type: 'SAFE',
        summary: 'This product is safe for your dietary needs.',
        safeBadge: true,
      };

      const result = SafeResponseSchema.safeParse(validSafe);
      expect(result.success).toBe(true);
    });

    it('should reject SAFE response with missing summary', () => {
      const invalidSafe = {
        type: 'SAFE',
        safeBadge: true,
      };

      const result = SafeResponseSchema.safeParse(invalidSafe);
      expect(result.success).toBe(false);
    });

    it('should reject SAFE response with safeBadge false', () => {
      const invalidSafe = {
        type: 'SAFE',
        summary: 'This product is safe.',
        safeBadge: false,
      };

      const result = SafeResponseSchema.safeParse(invalidSafe);
      expect(result.success).toBe(false);
    });
  });

  describe('RiskItemSchema', () => {
    it('should validate a correct risk item', () => {
      const validRiskItem = {
        ingredient: 'Sugar',
        severity: 'high',
        reason: 'High glycemic index',
      };

      const result = RiskItemSchema.safeParse(validRiskItem);
      expect(result.success).toBe(true);
    });

    it('should reject risk item with invalid severity', () => {
      const invalidRiskItem = {
        ingredient: 'Sugar',
        severity: 'low',
        reason: 'High glycemic index',
      };

      const result = RiskItemSchema.safeParse(invalidRiskItem);
      expect(result.success).toBe(false);
    });
  });

  describe('RiskResponseSchema', () => {
    it('should validate a correct RISK response', () => {
      const validRisk = {
        type: 'RISK',
        headline: 'Contains ingredients that may affect your health',
        riskHierarchy: [
          {
            ingredient: 'Sugar',
            severity: 'high',
            reason: 'High glycemic index',
          },
          {
            ingredient: 'Salt',
            severity: 'med',
            reason: 'Moderate sodium content',
          },
        ],
      };

      const result = RiskResponseSchema.safeParse(validRisk);
      expect(result.success).toBe(true);
    });

    it('should reject RISK response with missing headline', () => {
      const invalidRisk = {
        type: 'RISK',
        riskHierarchy: [],
      };

      const result = RiskResponseSchema.safeParse(invalidRisk);
      expect(result.success).toBe(false);
    });

    it('should validate RISK response with empty riskHierarchy', () => {
      const validRisk = {
        type: 'RISK',
        headline: 'No specific risks identified',
        riskHierarchy: [],
      };

      const result = RiskResponseSchema.safeParse(validRisk);
      expect(result.success).toBe(true);
    });
  });

  describe('DecisionResponseSchema', () => {
    it('should validate a correct DECISION response', () => {
      const validDecision = {
        type: 'DECISION',
        question: 'Would you like to be strict or flexible?',
        options: ['Strict', 'Flexible'],
      };

      const result = DecisionResponseSchema.safeParse(validDecision);
      expect(result.success).toBe(true);
    });

    it('should reject DECISION response with missing question', () => {
      const invalidDecision = {
        type: 'DECISION',
        options: ['Strict', 'Flexible'],
      };

      const result = DecisionResponseSchema.safeParse(invalidDecision);
      expect(result.success).toBe(false);
    });

    it('should reject DECISION response with wrong options', () => {
      const invalidDecision = {
        type: 'DECISION',
        question: 'Choose one',
        options: ['Yes', 'No'],
      };

      const result = DecisionResponseSchema.safeParse(invalidDecision);
      expect(result.success).toBe(false);
    });
  });

  describe('UncertainResponseSchema', () => {
    it('should validate a correct UNCERTAIN response', () => {
      const validUncertain = {
        type: 'UNCERTAIN',
        rawText: 'Unable to analyze the image clearly.',
      };

      const result = UncertainResponseSchema.safeParse(validUncertain);
      expect(result.success).toBe(true);
    });

    it('should reject UNCERTAIN response with missing rawText', () => {
      const invalidUncertain = {
        type: 'UNCERTAIN',
      };

      const result = UncertainResponseSchema.safeParse(invalidUncertain);
      expect(result.success).toBe(false);
    });
  });

  describe('AIResponseSchema - Discriminated Union', () => {
    it('should validate SAFE response through discriminated union', () => {
      const safeResponse = {
        type: 'SAFE',
        summary: 'Product is safe',
        safeBadge: true,
      };

      const result = AIResponseSchema.safeParse(safeResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('SAFE');
      }
    });

    it('should validate RISK response through discriminated union', () => {
      const riskResponse = {
        type: 'RISK',
        headline: 'Contains risky ingredients',
        riskHierarchy: [
          {
            ingredient: 'Sugar',
            severity: 'high',
            reason: 'High glycemic index',
          },
        ],
      };

      const result = AIResponseSchema.safeParse(riskResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('RISK');
      }
    });

    it('should validate DECISION response through discriminated union', () => {
      const decisionResponse = {
        type: 'DECISION',
        question: 'How strict do you want to be?',
        options: ['Strict', 'Flexible'],
      };

      const result = AIResponseSchema.safeParse(decisionResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('DECISION');
      }
    });

    it('should validate UNCERTAIN response through discriminated union', () => {
      const uncertainResponse = {
        type: 'UNCERTAIN',
        rawText: 'Could not process the image',
      };

      const result = AIResponseSchema.safeParse(uncertainResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('UNCERTAIN');
      }
    });

    it('should reject response with invalid type', () => {
      const invalidResponse = {
        type: 'INVALID',
        data: 'some data',
      };

      const result = AIResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject response with type mismatch', () => {
      const invalidResponse = {
        type: 'SAFE',
        headline: 'This should be summary',
        riskHierarchy: [],
      };

      const result = AIResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });
});
