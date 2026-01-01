import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  UserHistory,
  Decision,
  Preferences,
  loadUserHistory,
  saveUserHistory,
  initializeUserHistory,
  learnFromDecision,
  adaptAnalysisPrompt,
  clearUserHistory,
  getUserExpertise
} from '../lib/user-history';
import { UserProfile } from '../lib/types';

describe('User History System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearUserHistory();
  });

  afterEach(() => {
    // Clean up after each test
    clearUserHistory();
  });

  describe('initializeUserHistory', () => {
    it('should create a new user history with default values', () => {
      const history = initializeUserHistory();

      expect(history.scanCount).toBe(0);
      expect(history.decisions).toEqual([]);
      expect(history.preferences.avoidedIngredients).toEqual([]);
      expect(history.preferences.preferredIngredients).toEqual([]);
      expect(history.preferences.strictness).toBe('flexible');
      expect(history.preferences.dietaryProfile).toBeUndefined();
      expect(history.lastScanDate).toBeInstanceOf(Date);
    });
  });

  describe('saveUserHistory and loadUserHistory', () => {
    it('should save and load user history from localStorage', () => {
      const history: UserHistory = {
        scanCount: 5,
        decisions: [
          {
            productType: 'protein bar',
            choice: 'accepted',
            timestamp: new Date('2026-01-01')
          }
        ],
        preferences: {
          avoidedIngredients: ['dairy', 'gluten'],
          preferredIngredients: ['protein'],
          strictness: 'strict'
        },
        lastScanDate: new Date('2026-01-01')
      };

      saveUserHistory(history);
      const loaded = loadUserHistory();

      expect(loaded).not.toBeNull();
      expect(loaded!.scanCount).toBe(5);
      expect(loaded!.decisions).toHaveLength(1);
      expect(loaded!.decisions[0].productType).toBe('protein bar');
      expect(loaded!.decisions[0].timestamp).toBeInstanceOf(Date);
      expect(loaded!.preferences.avoidedIngredients).toEqual(['dairy', 'gluten']);
      expect(loaded!.preferences.strictness).toBe('strict');
    });

    it('should return null when no history exists', () => {
      const loaded = loadUserHistory();
      expect(loaded).toBeNull();
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('sach-ai-history', 'invalid json');
      const loaded = loadUserHistory();
      expect(loaded).toBeNull();
    });
  });

  describe('learnFromDecision', () => {
    it('should increment scan count when learning from decision', () => {
      const history = initializeUserHistory();
      const decision: Decision = {
        productType: 'chocolate bar',
        choice: 'accepted',
        timestamp: new Date()
      };

      const updated = learnFromDecision(history, decision);

      expect(updated.scanCount).toBe(1);
      expect(updated.decisions).toHaveLength(1);
    });

    it('should add avoided ingredients when product is rejected', () => {
      const history = initializeUserHistory();
      const decision: Decision = {
        productType: 'milk chocolate',
        choice: 'rejected',
        reason: 'contains dairy, has too much sugar',
        timestamp: new Date()
      };

      const updated = learnFromDecision(history, decision);

      expect(updated.preferences.avoidedIngredients.length).toBeGreaterThan(0);
      expect(updated.preferences.avoidedIngredients.some(i => 
        i.includes('dairy') || i.includes('sugar')
      )).toBe(true);
    });

    it('should add preferred ingredients when product is accepted', () => {
      const history = initializeUserHistory();
      const decision: Decision = {
        productType: 'almond butter, organic',
        choice: 'accepted',
        timestamp: new Date()
      };

      const updated = learnFromDecision(history, decision);

      expect(updated.preferences.preferredIngredients.length).toBeGreaterThan(0);
    });

    it('should not duplicate avoided ingredients', () => {
      let history = initializeUserHistory();
      
      const decision1: Decision = {
        productType: 'product 1',
        choice: 'rejected',
        reason: 'contains dairy',
        timestamp: new Date()
      };
      
      history = learnFromDecision(history, decision1);
      const firstCount = history.preferences.avoidedIngredients.filter(i => 
        i.includes('dairy')
      ).length;

      const decision2: Decision = {
        productType: 'product 2',
        choice: 'rejected',
        reason: 'has dairy',
        timestamp: new Date()
      };
      
      history = learnFromDecision(history, decision2);
      const secondCount = history.preferences.avoidedIngredients.filter(i => 
        i.includes('dairy')
      ).length;

      // Should not add duplicate dairy entries
      expect(secondCount).toBe(firstCount);
    });

    it('should infer dietary profile after 5 decisions with vegan pattern', () => {
      let history = initializeUserHistory();

      // Add 5 decisions with vegan patterns
      for (let i = 0; i < 5; i++) {
        const decision: Decision = {
          productType: 'vegan product',
          choice: 'rejected',
          reason: 'contains dairy and meat',
          timestamp: new Date()
        };
        history = learnFromDecision(history, decision);
      }

      expect(history.preferences.dietaryProfile).toBe(UserProfile.VEGAN);
    });

    it('should infer dietary profile after 5 decisions with diabetic pattern', () => {
      let history = initializeUserHistory();

      // Add 5 decisions with diabetic patterns
      for (let i = 0; i < 5; i++) {
        const decision: Decision = {
          productType: 'snack',
          choice: 'rejected',
          reason: 'too much sugar and carbs',
          timestamp: new Date()
        };
        history = learnFromDecision(history, decision);
      }

      expect(history.preferences.dietaryProfile).toBe(UserProfile.DIABETIC);
    });

    it('should update lastScanDate to decision timestamp', () => {
      const history = initializeUserHistory();
      const decisionDate = new Date('2026-01-15');
      const decision: Decision = {
        productType: 'test product',
        choice: 'accepted',
        timestamp: decisionDate
      };

      const updated = learnFromDecision(history, decision);

      expect(updated.lastScanDate).toEqual(decisionDate);
    });
  });

  describe('adaptAnalysisPrompt', () => {
    it('should add avoided ingredients to prompt', () => {
      const history: UserHistory = {
        scanCount: 3,
        decisions: [],
        preferences: {
          avoidedIngredients: ['dairy', 'gluten', 'soy'],
          preferredIngredients: [],
          strictness: 'flexible'
        },
        lastScanDate: new Date()
      };

      const basePrompt = 'Analyze this product.';
      const adapted = adaptAnalysisPrompt(basePrompt, history);

      expect(adapted).toContain('User typically avoids: dairy, gluten, soy');
    });

    it('should add preferred ingredients to prompt', () => {
      const history: UserHistory = {
        scanCount: 3,
        decisions: [],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: ['protein', 'fiber'],
          strictness: 'flexible'
        },
        lastScanDate: new Date()
      };

      const basePrompt = 'Analyze this product.';
      const adapted = adaptAnalysisPrompt(basePrompt, history);

      expect(adapted).toContain('User typically prefers: protein, fiber');
    });

    it('should add dietary profile to prompt', () => {
      const history: UserHistory = {
        scanCount: 10,
        decisions: [],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: [],
          dietaryProfile: UserProfile.VEGAN,
          strictness: 'flexible'
        },
        lastScanDate: new Date()
      };

      const basePrompt = 'Analyze this product.';
      const adapted = adaptAnalysisPrompt(basePrompt, history);

      expect(adapted).toContain('User appears to follow a VEGAN diet');
    });

    it('should add strictness context to prompt', () => {
      const strictHistory: UserHistory = {
        scanCount: 5,
        decisions: [],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: [],
          strictness: 'strict'
        },
        lastScanDate: new Date()
      };

      const flexibleHistory: UserHistory = {
        ...strictHistory,
        preferences: {
          ...strictHistory.preferences,
          strictness: 'flexible'
        }
      };

      const basePrompt = 'Analyze this product.';
      const strictAdapted = adaptAnalysisPrompt(basePrompt, strictHistory);
      const flexibleAdapted = adaptAnalysisPrompt(basePrompt, flexibleHistory);

      expect(strictAdapted).toContain('strict adherence');
      expect(flexibleAdapted).toContain('flexible with their dietary preferences');
    });

    it('should adapt language based on experience level', () => {
      const beginnerHistory: UserHistory = {
        scanCount: 1,
        decisions: [],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: [],
          strictness: 'flexible'
        },
        lastScanDate: new Date()
      };

      const intermediateHistory: UserHistory = {
        ...beginnerHistory,
        scanCount: 5
      };

      const expertHistory: UserHistory = {
        ...beginnerHistory,
        scanCount: 15
      };

      const basePrompt = 'Analyze this product.';
      const beginnerAdapted = adaptAnalysisPrompt(basePrompt, beginnerHistory);
      const intermediateAdapted = adaptAnalysisPrompt(basePrompt, intermediateHistory);
      const expertAdapted = adaptAnalysisPrompt(basePrompt, expertHistory);

      expect(beginnerAdapted).toContain('User is new');
      expect(beginnerAdapted).toContain('simple language');
      expect(intermediateAdapted).toContain('some experience');
      expect(expertAdapted).toContain('experienced');
      expect(expertAdapted).toContain('technical language');
    });

    it('should limit avoided ingredients list to 5 in prompt', () => {
      const history: UserHistory = {
        scanCount: 10,
        decisions: [],
        preferences: {
          avoidedIngredients: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
          preferredIngredients: [],
          strictness: 'flexible'
        },
        lastScanDate: new Date()
      };

      const basePrompt = 'Analyze this product.';
      const adapted = adaptAnalysisPrompt(basePrompt, history);

      expect(adapted).toContain('and 3 more ingredients');
    });
  });

  describe('getUserExpertise', () => {
    it('should return beginner for 0-3 scans', () => {
      const history: UserHistory = {
        scanCount: 2,
        decisions: [],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: [],
          strictness: 'flexible'
        },
        lastScanDate: new Date()
      };

      expect(getUserExpertise(history)).toBe('beginner');
    });

    it('should return intermediate for 4-10 scans', () => {
      const history: UserHistory = {
        scanCount: 7,
        decisions: [],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: [],
          strictness: 'flexible'
        },
        lastScanDate: new Date()
      };

      expect(getUserExpertise(history)).toBe('intermediate');
    });

    it('should return expert for 11+ scans', () => {
      const history: UserHistory = {
        scanCount: 15,
        decisions: [],
        preferences: {
          avoidedIngredients: [],
          preferredIngredients: [],
          strictness: 'flexible'
        },
        lastScanDate: new Date()
      };

      expect(getUserExpertise(history)).toBe('expert');
    });
  });

  describe('clearUserHistory', () => {
    it('should remove history from localStorage', () => {
      const history = initializeUserHistory();
      saveUserHistory(history);

      expect(loadUserHistory()).not.toBeNull();

      clearUserHistory();

      expect(loadUserHistory()).toBeNull();
    });
  });
});
