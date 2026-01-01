/**
 * Tests for Intent Inference Engine
 */

import { describe, it, expect } from 'vitest';
import {
  inferIntent,
  InferredIntent,
  UserHistory,
} from '../lib/intent-inference';
import { UserProfile } from '../lib/types';

describe('Intent Inference Engine', () => {
  describe('inferIntent', () => {
    it('should return low confidence when no signals are detected', async () => {
      const result = await inferIntent('base64-image-data');
      
      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.7);
      expect(result.needsClarification).toBe(true);
    });

    it('should have higher confidence with user history', async () => {
      const history: UserHistory = {
        scanCount: 5,
        decisions: [],
        preferences: {
          avoidedIngredients: ['gluten', 'dairy'],
          preferredIngredients: [],
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should infer dietary restrictions from user history', async () => {
      const history: UserHistory = {
        scanCount: 10,
        decisions: [
          {
            productType: 'bread',
            choice: 'rejected',
            reason: 'contains gluten',
            timestamp: new Date(),
          },
        ],
        preferences: {
          avoidedIngredients: ['gluten', 'wheat'],
          preferredIngredients: [],
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      expect(result.dietaryRestrictions).toContain('gluten-intolerant');
    });

    it('should suggest a profile when confidence is high', async () => {
      const history: UserHistory = {
        scanCount: 15,
        decisions: [],
        preferences: {
          avoidedIngredients: ['meat', 'dairy', 'eggs'],
          preferredIngredients: [],
          dietaryProfile: UserProfile.VEGAN,
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      expect(result.suggestedProfile).toBe(UserProfile.VEGAN);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should not need clarification when confidence is high', async () => {
      const history: UserHistory = {
        scanCount: 20,
        decisions: [],
        preferences: {
          avoidedIngredients: ['sugar'],
          preferredIngredients: [],
          dietaryProfile: UserProfile.DIABETIC,
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      expect(result.needsClarification).toBe(false);
    });

    it('should identify multiple dietary restrictions', async () => {
      const history: UserHistory = {
        scanCount: 8,
        decisions: [],
        preferences: {
          avoidedIngredients: ['gluten', 'dairy', 'sugar'],
          preferredIngredients: [],
          strictness: 'flexible',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      expect(result.dietaryRestrictions.length).toBeGreaterThan(0);
    });

    it('should identify health goals from decision patterns', async () => {
      const history: UserHistory = {
        scanCount: 12,
        decisions: [
          {
            productType: 'candy',
            choice: 'rejected',
            reason: 'high sugar content',
            timestamp: new Date(),
          },
          {
            productType: 'soda',
            choice: 'rejected',
            reason: 'too much sugar',
            timestamp: new Date(),
          },
        ],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: [],
          strictness: 'flexible',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      expect(result.healthGoals).toContain('reduce-sugar');
    });

    it('should return unique dietary restrictions', async () => {
      const history: UserHistory = {
        scanCount: 5,
        decisions: [],
        preferences: {
          avoidedIngredients: ['gluten', 'wheat', 'gluten'],
          preferredIngredients: [],
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      const uniqueRestrictions = new Set(result.dietaryRestrictions);
      expect(result.dietaryRestrictions.length).toBe(uniqueRestrictions.size);
    });
  });

  describe('confidence calculation', () => {
    it('should increase confidence with more scan history', async () => {
      const history1: UserHistory = {
        scanCount: 1,
        decisions: [],
        preferences: {
          avoidedIngredients: ['gluten'],
          preferredIngredients: [],
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const history2: UserHistory = {
        scanCount: 20,
        decisions: [],
        preferences: {
          avoidedIngredients: ['gluten'],
          preferredIngredients: [],
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const result1 = await inferIntent('base64-image-data', history1);
      const result2 = await inferIntent('base64-image-data', history2);
      
      expect(result2.confidence).toBeGreaterThan(result1.confidence);
    });

    it('should cap confidence at 1.0', async () => {
      const history: UserHistory = {
        scanCount: 100,
        decisions: [],
        preferences: {
          avoidedIngredients: ['gluten', 'dairy', 'sugar'],
          preferredIngredients: [],
          dietaryProfile: UserProfile.VEGAN,
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('profile suggestion', () => {
    it('should suggest VEGAN profile for vegan patterns', async () => {
      const history: UserHistory = {
        scanCount: 10,
        decisions: [],
        preferences: {
          avoidedIngredients: ['meat', 'dairy'],
          preferredIngredients: [],
          strictness: 'strict',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      if (result.suggestedProfile) {
        expect(result.suggestedProfile).toBe(UserProfile.VEGAN);
      }
    });

    it('should not suggest profile when confidence is low', async () => {
      const history: UserHistory = {
        scanCount: 1,
        decisions: [],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: [],
          strictness: 'flexible',
        },
        lastScanDate: new Date(),
      };

      const result = await inferIntent('base64-image-data', history);
      
      expect(result.suggestedProfile).toBeUndefined();
    });
  });
});
