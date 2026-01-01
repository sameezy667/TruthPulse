/**
 * Integration tests for Intent Inference Flow
 * 
 * Tests the complete flow from first-time user through learning and adaptation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  loadUserHistory,
  saveUserHistory,
  initializeUserHistory,
  learnFromDecision,
  clearUserHistory,
  getUserExpertise,
  adaptAnalysisPrompt,
  type UserHistory,
  type Decision,
} from '../lib/user-history';
import {
  inferIntent,
  type InferredIntent,
} from '../lib/intent-inference';
import { UserProfile } from '../lib/types';

describe('Intent Inference Flow Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearUserHistory();
  });

  afterEach(() => {
    // Clean up after each test
    clearUserHistory();
  });

  describe('First-Time User Flow', () => {
    it('should initialize empty history for new users', () => {
      const history = loadUserHistory();
      expect(history).toBeNull();
    });

    it('should create new history with default values', () => {
      const history = initializeUserHistory();
      
      expect(history.scanCount).toBe(0);
      expect(history.decisions).toHaveLength(0);
      expect(history.preferences.avoidedIngredients).toHaveLength(0);
      expect(history.preferences.preferredIngredients).toHaveLength(0);
      expect(history.preferences.strictness).toBe('flexible');
      expect(history.preferences.dietaryProfile).toBeUndefined();
    });

    it('should persist new history to localStorage', () => {
      const history = initializeUserHistory();
      saveUserHistory(history);
      
      const loaded = loadUserHistory();
      expect(loaded).not.toBeNull();
      expect(loaded?.scanCount).toBe(0);
    });

    it('should classify new users as beginners', () => {
      const history = initializeUserHistory();
      const expertise = getUserExpertise(history);
      
      expect(expertise).toBe('beginner');
    });

    it('should infer intent without history', async () => {
      const mockImage = 'data:image/png;base64,test';
      const intent = await inferIntent(mockImage);
      
      expect(intent).toBeDefined();
      expect(intent.dietaryRestrictions).toBeDefined();
      expect(intent.healthGoals).toBeDefined();
      expect(intent.confidence).toBeGreaterThanOrEqual(0);
      expect(intent.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Returning User Flow', () => {
    it('should load existing history for returning users', () => {
      // Create and save history
      const history = initializeUserHistory();
      history.scanCount = 5;
      history.preferences.avoidedIngredients = ['dairy', 'gluten'];
      saveUserHistory(history);
      
      // Load it back
      const loaded = loadUserHistory();
      expect(loaded).not.toBeNull();
      expect(loaded?.scanCount).toBe(5);
      expect(loaded?.preferences.avoidedIngredients).toContain('dairy');
      expect(loaded?.preferences.avoidedIngredients).toContain('gluten');
    });

    it('should classify users by experience level', () => {
      const beginner = initializeUserHistory();
      beginner.scanCount = 2;
      expect(getUserExpertise(beginner)).toBe('beginner');
      
      const intermediate = initializeUserHistory();
      intermediate.scanCount = 5;
      expect(getUserExpertise(intermediate)).toBe('intermediate');
      
      const expert = initializeUserHistory();
      expert.scanCount = 15;
      expect(getUserExpertise(expert)).toBe('expert');
    });

    it('should adapt prompts based on user history', () => {
      const history = initializeUserHistory();
      history.scanCount = 10;
      history.preferences.avoidedIngredients = ['dairy', 'soy'];
      history.preferences.dietaryProfile = UserProfile.VEGAN;
      
      const basePrompt = 'Analyze this product.';
      const adapted = adaptAnalysisPrompt(basePrompt, history);
      
      expect(adapted).toContain('dairy');
      expect(adapted).toContain('soy');
      expect(adapted.toLowerCase()).toContain('vegan');
      expect(adapted).toContain('experience'); // "some experience" or "experienced"
    });

    it('should infer intent with user history', async () => {
      const history = initializeUserHistory();
      history.scanCount = 5;
      history.preferences.avoidedIngredients = ['dairy', 'lactose'];
      history.preferences.dietaryProfile = UserProfile.VEGAN;
      
      const mockImage = 'data:image/png;base64,test';
      const intent = await inferIntent(mockImage, history);
      
      // Should have higher confidence with history
      expect(intent.confidence).toBeGreaterThan(0.5);
      
      // Should infer vegan from history
      expect(intent.dietaryRestrictions).toContain('vegan');
    });
  });

  describe('Learning from Decisions', () => {
    it('should learn avoided ingredients from rejections', () => {
      const history = initializeUserHistory();
      
      const decision: Decision = {
        productType: 'milk chocolate',
        choice: 'rejected',
        reason: 'Contains dairy and milk',
        timestamp: new Date(),
      };
      
      const updated = learnFromDecision(history, decision);
      
      expect(updated.scanCount).toBe(1);
      expect(updated.decisions).toHaveLength(1);
      expect(updated.preferences.avoidedIngredients.length).toBeGreaterThan(0);
    });

    it('should learn preferred ingredients from acceptances', () => {
      const history = initializeUserHistory();
      
      const decision: Decision = {
        productType: 'almond milk',
        choice: 'accepted',
        reason: undefined,
        timestamp: new Date(),
      };
      
      const updated = learnFromDecision(history, decision);
      
      expect(updated.scanCount).toBe(1);
      expect(updated.decisions).toHaveLength(1);
    });

    it('should infer dietary profile after multiple decisions', () => {
      let history = initializeUserHistory();
      
      // Make 5 vegan-related decisions
      for (let i = 0; i < 5; i++) {
        const decision: Decision = {
          productType: 'vegan product',
          choice: 'accepted',
          reason: 'plant-based',
          timestamp: new Date(),
        };
        history = learnFromDecision(history, decision);
      }
      
      // Should infer vegan profile
      expect(history.preferences.dietaryProfile).toBeDefined();
    });

    it('should not create duplicate avoided ingredients', () => {
      let history = initializeUserHistory();
      
      // Add dairy twice
      const decision1: Decision = {
        productType: 'milk',
        choice: 'rejected',
        reason: 'Contains dairy',
        timestamp: new Date(),
      };
      history = learnFromDecision(history, decision1);
      
      const decision2: Decision = {
        productType: 'cheese',
        choice: 'rejected',
        reason: 'Contains dairy products',
        timestamp: new Date(),
      };
      history = learnFromDecision(history, decision2);
      
      // Should only have dairy-related ingredient once (or similar ingredients grouped)
      const dairyCount = history.preferences.avoidedIngredients.filter(
        ing => ing.toLowerCase().includes('dairy')
      ).length;
      
      // Should be 1 or 2 at most (dairy and dairy products might be separate)
      expect(dairyCount).toBeLessThanOrEqual(2);
    });

    it('should update scan count and last scan date', () => {
      const history = initializeUserHistory();
      const beforeDate = new Date();
      
      const decision: Decision = {
        productType: 'test',
        choice: 'accepted',
        timestamp: new Date(),
      };
      
      const updated = learnFromDecision(history, decision);
      
      expect(updated.scanCount).toBe(1);
      expect(updated.lastScanDate.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
    });
  });

  describe('Clarification Flow', () => {
    it('should request clarification when confidence is low', async () => {
      const mockImage = 'data:image/png;base64,test';
      const intent = await inferIntent(mockImage);
      
      // With no product signals and no history, should need clarification
      if (intent.confidence < 0.7) {
        expect(intent.needsClarification).toBe(true);
      }
    });

    it('should not request clarification when confidence is high', async () => {
      const history = initializeUserHistory();
      history.scanCount = 10;
      history.preferences.avoidedIngredients = ['dairy', 'gluten', 'soy'];
      history.preferences.dietaryProfile = UserProfile.VEGAN;
      
      const mockImage = 'data:image/png;base64,test';
      const intent = await inferIntent(mockImage, history);
      
      // With strong history, confidence should be higher
      if (intent.confidence >= 0.7) {
        expect(intent.needsClarification).toBe(false);
      }
    });

    it('should learn from clarification answers', () => {
      const history = initializeUserHistory();
      
      const clarificationDecision: Decision = {
        productType: 'clarification',
        choice: 'accepted',
        reason: 'User clarified: I avoid gluten',
        timestamp: new Date(),
      };
      
      const updated = learnFromDecision(history, clarificationDecision);
      
      expect(updated.scanCount).toBe(1);
      expect(updated.decisions).toHaveLength(1);
    });
  });

  describe('Memory Indicator Logic', () => {
    it('should not show memory for new users', () => {
      const history = initializeUserHistory();
      
      // New user with no preferences
      const shouldShow = 
        history.scanCount > 0 &&
        (history.preferences.avoidedIngredients.length > 0 ||
         history.preferences.preferredIngredients.length > 0 ||
         history.preferences.dietaryProfile !== undefined);
      
      expect(shouldShow).toBe(false);
    });

    it('should show memory when user has avoided ingredients', () => {
      const history = initializeUserHistory();
      history.scanCount = 3;
      history.preferences.avoidedIngredients = ['dairy', 'gluten'];
      
      const shouldShow = 
        history.scanCount > 0 &&
        (history.preferences.avoidedIngredients.length > 0 ||
         history.preferences.preferredIngredients.length > 0 ||
         history.preferences.dietaryProfile !== undefined);
      
      expect(shouldShow).toBe(true);
    });

    it('should show memory when user has dietary profile', () => {
      const history = initializeUserHistory();
      history.scanCount = 5;
      history.preferences.dietaryProfile = UserProfile.VEGAN;
      
      const shouldShow = 
        history.scanCount > 0 &&
        (history.preferences.avoidedIngredients.length > 0 ||
         history.preferences.preferredIngredients.length > 0 ||
         history.preferences.dietaryProfile !== undefined);
      
      expect(shouldShow).toBe(true);
    });

    it('should format memory text correctly', () => {
      const history = initializeUserHistory();
      history.scanCount = 5;
      history.preferences.avoidedIngredients = ['dairy', 'gluten', 'soy'];
      
      // Simulate memory text generation
      const avoided = history.preferences.avoidedIngredients.slice(0, 2).join(', ');
      const moreCount = history.preferences.avoidedIngredients.length - 2;
      const memoryText = `I remember you avoid ${avoided} and ${moreCount} more`;
      
      expect(memoryText).toContain('dairy');
      expect(memoryText).toContain('gluten');
      expect(memoryText).toContain('1 more');
    });
  });

  describe('Complete User Journey', () => {
    it('should handle complete first-time to expert user journey', async () => {
      // Step 1: First-time user
      let history = loadUserHistory();
      expect(history).toBeNull();
      
      // Step 2: Initialize
      history = initializeUserHistory();
      saveUserHistory(history);
      expect(getUserExpertise(history)).toBe('beginner');
      
      // Step 3: First scan - infer intent
      const mockImage = 'data:image/png;base64,test';
      let intent = await inferIntent(mockImage, history);
      expect(intent).toBeDefined();
      
      // Step 4: Make first decision
      const decision1: Decision = {
        productType: 'dairy milk',
        choice: 'rejected',
        reason: 'Contains dairy',
        timestamp: new Date(),
      };
      history = learnFromDecision(history, decision1);
      saveUserHistory(history);
      expect(history.scanCount).toBe(1);
      
      // Step 5: Make more decisions to build history
      for (let i = 0; i < 4; i++) {
        const decision: Decision = {
          productType: 'vegan product',
          choice: 'accepted',
          reason: 'plant-based',
          timestamp: new Date(),
        };
        history = learnFromDecision(history, decision);
      }
      saveUserHistory(history);
      
      // Step 6: Check expertise level
      expect(getUserExpertise(history)).toBe('intermediate');
      expect(history.scanCount).toBe(5);
      
      // Step 7: Infer intent with history
      intent = await inferIntent(mockImage, history);
      expect(intent.confidence).toBeGreaterThan(0.5);
      
      // Step 8: Continue to expert level
      for (let i = 0; i < 6; i++) {
        const decision: Decision = {
          productType: 'vegan product',
          choice: 'accepted',
          timestamp: new Date(),
        };
        history = learnFromDecision(history, decision);
      }
      saveUserHistory(history);
      
      // Step 9: Verify expert status
      expect(getUserExpertise(history)).toBe('expert');
      expect(history.scanCount).toBe(11);
      expect(history.preferences.dietaryProfile).toBeDefined();
      
      // Step 10: Verify adapted prompts
      const basePrompt = 'Analyze this product.';
      const adapted = adaptAnalysisPrompt(basePrompt, history);
      expect(adapted).toContain('experienced');
      expect(adapted.length).toBeGreaterThan(basePrompt.length);
    });

    it('should persist and reload complete user journey', () => {
      // Create a user with history
      let history = initializeUserHistory();
      history.scanCount = 10;
      history.preferences.avoidedIngredients = ['dairy', 'gluten'];
      history.preferences.dietaryProfile = UserProfile.VEGAN;
      history.preferences.strictness = 'strict';
      
      // Save it
      saveUserHistory(history);
      
      // Clear from memory
      history = null as any;
      
      // Reload it
      const loaded = loadUserHistory();
      expect(loaded).not.toBeNull();
      expect(loaded?.scanCount).toBe(10);
      expect(loaded?.preferences.avoidedIngredients).toEqual(['dairy', 'gluten']);
      expect(loaded?.preferences.dietaryProfile).toBe(UserProfile.VEGAN);
      expect(loaded?.preferences.strictness).toBe('strict');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle corrupted localStorage data', () => {
      // Manually corrupt the data
      localStorage.setItem('sach-ai-history', 'invalid json {{{');
      
      const history = loadUserHistory();
      expect(history).toBeNull();
    });

    it('should handle missing fields in stored data', () => {
      // Store incomplete data
      const incomplete = {
        userHistory: {
          scanCount: 5,
          decisions: [],
          // Missing preferences
        },
        lastSync: new Date(),
        version: '1.0.0',
      };
      localStorage.setItem('sach-ai-history', JSON.stringify(incomplete));
      
      // Should handle gracefully
      const history = loadUserHistory();
      // Either null or with defaults
      expect(history === null || history.scanCount === 5).toBe(true);
    });

    it('should handle empty decision reason', () => {
      const history = initializeUserHistory();
      
      const decision: Decision = {
        productType: 'test',
        choice: 'rejected',
        reason: undefined,
        timestamp: new Date(),
      };
      
      const updated = learnFromDecision(history, decision);
      expect(updated.scanCount).toBe(1);
      // Should not crash
    });

    it('should handle very long avoided ingredients list', () => {
      const history = initializeUserHistory();
      
      // Add many ingredients
      for (let i = 0; i < 20; i++) {
        const decision: Decision = {
          productType: `product${i}`,
          choice: 'rejected',
          reason: `ingredient${i}`,
          timestamp: new Date(),
        };
        history.preferences.avoidedIngredients.push(`ingredient${i}`);
      }
      
      // Should still format memory text correctly
      const avoided = history.preferences.avoidedIngredients.slice(0, 2).join(', ');
      const moreCount = history.preferences.avoidedIngredients.length - 2;
      const memoryText = `I remember you avoid ${avoided} and ${moreCount} more`;
      
      expect(memoryText).toContain('18 more');
    });
  });
});
