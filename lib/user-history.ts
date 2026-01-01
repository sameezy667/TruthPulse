import { UserProfile } from './types';

export interface UserHistory {
  scanCount: number;
  decisions: Decision[];
  preferences: Preferences;
  lastScanDate: Date;
}

export interface Decision {
  productType: string;
  choice: 'accepted' | 'rejected';
  reason?: string;
  timestamp: Date;
}

export interface Preferences {
  avoidedIngredients: string[];
  preferredIngredients: string[];
  dietaryProfile?: UserProfile;
  strictness: 'strict' | 'flexible';
}

interface StoredData {
  userHistory: UserHistory;
  lastSync: Date;
  version: string;
}

const STORAGE_KEY = 'sach-ai-history';
const CURRENT_VERSION = '1.0.0';

/**
 * Load user history from localStorage
 */
export function loadUserHistory(): UserHistory | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StoredData = JSON.parse(stored);
    
    // Convert date strings back to Date objects
    data.userHistory.lastScanDate = new Date(data.userHistory.lastScanDate);
    data.userHistory.decisions = data.userHistory.decisions.map(d => ({
      ...d,
      timestamp: new Date(d.timestamp)
    }));

    return data.userHistory;
  } catch (error) {
    console.error('Failed to load user history:', error);
    return null;
  }
}

/**
 * Save user history to localStorage
 */
export function saveUserHistory(history: UserHistory): void {
  try {
    const data: StoredData = {
      userHistory: history,
      lastSync: new Date(),
      version: CURRENT_VERSION
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save user history:', error);
  }
}

/**
 * Initialize a new user history
 */
export function initializeUserHistory(): UserHistory {
  return {
    scanCount: 0,
    decisions: [],
    preferences: {
      avoidedIngredients: [],
      preferredIngredients: [],
      strictness: 'flexible'
    },
    lastScanDate: new Date()
  };
}

/**
 * Learn from user decision and update preferences
 */
export function learnFromDecision(
  history: UserHistory,
  decision: Decision
): UserHistory {
  const updatedHistory = { ...history };
  
  // Add decision to history
  updatedHistory.decisions.push(decision);
  updatedHistory.scanCount += 1;
  updatedHistory.lastScanDate = decision.timestamp;

  // Update preferences based on decision
  if (decision.choice === 'rejected' && decision.reason) {
    // Extract avoided ingredients from reason
    const ingredients = extractIngredients(decision.reason);
    
    // Add to avoided ingredients if not already present (check for similar ingredients)
    ingredients.forEach(ingredient => {
      const isDuplicate = updatedHistory.preferences.avoidedIngredients.some(existing => 
        areSimilarIngredients(existing, ingredient)
      );
      
      if (!isDuplicate) {
        updatedHistory.preferences.avoidedIngredients.push(ingredient);
      }
    });
  }

  if (decision.choice === 'accepted') {
    // Extract preferred ingredients from product type
    const ingredients = extractIngredients(decision.productType);
    
    // Add to preferred ingredients if not already present (check for similar ingredients)
    ingredients.forEach(ingredient => {
      const isDuplicate = updatedHistory.preferences.preferredIngredients.some(existing => 
        areSimilarIngredients(existing, ingredient)
      );
      
      if (!isDuplicate) {
        updatedHistory.preferences.preferredIngredients.push(ingredient);
      }
    });
  }

  // Infer dietary profile from patterns
  if (updatedHistory.decisions.length >= 5) {
    const inferredProfile = inferDietaryProfile(updatedHistory.decisions);
    if (inferredProfile.confidence > 0.8) {
      updatedHistory.preferences.dietaryProfile = inferredProfile.profile;
    }
  }

  return updatedHistory;
}

/**
 * Extract ingredients from text
 */
function extractIngredients(text: string): string[] {
  // Simple extraction: split by common delimiters and clean up
  const ingredients = text
    .toLowerCase()
    .split(/[,;.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 2 && s.length < 30); // Filter reasonable ingredient names

  return ingredients;
}

/**
 * Check if two ingredient strings are similar enough to be considered duplicates
 */
function areSimilarIngredients(ing1: string, ing2: string): boolean {
  // Check if one is a substring of the other
  if (ing1.includes(ing2) || ing2.includes(ing1)) {
    return true;
  }
  
  // Extract key words (longer than 4 characters) from both
  const words1 = ing1.split(/\s+/).filter(w => w.length > 4);
  const words2 = ing2.split(/\s+/).filter(w => w.length > 4);
  
  // If they share a significant word, consider them similar
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Infer dietary profile from decision history
 */
function inferDietaryProfile(decisions: Decision[]): {
  profile: UserProfile;
  confidence: number;
} {
  const patterns = {
    vegan: 0,
    diabetic: 0,
    paleo: 0
  };

  // Analyze decision patterns
  decisions.forEach(decision => {
    const text = `${decision.productType} ${decision.reason || ''}`.toLowerCase();

    // Vegan patterns
    if (text.includes('vegan') || text.includes('plant-based') || 
        text.includes('dairy') || text.includes('meat') || text.includes('egg')) {
      patterns.vegan += 1;
    }

    // Diabetic patterns
    if (text.includes('sugar') || text.includes('carb') || 
        text.includes('glucose') || text.includes('diabetic')) {
      patterns.diabetic += 1;
    }

    // Paleo patterns
    if (text.includes('paleo') || text.includes('grain') || 
        text.includes('processed') || text.includes('natural')) {
      patterns.paleo += 1;
    }
  });

  // Find dominant pattern
  const maxPattern = Math.max(patterns.vegan, patterns.diabetic, patterns.paleo);
  const totalDecisions = decisions.length;
  const confidence = maxPattern / totalDecisions;

  let profile: UserProfile;
  if (patterns.vegan === maxPattern) {
    profile = UserProfile.VEGAN;
  } else if (patterns.diabetic === maxPattern) {
    profile = UserProfile.DIABETIC;
  } else {
    profile = UserProfile.PALEO;
  }

  return { profile, confidence };
}

/**
 * Adapt analysis prompt based on user history
 */
export function adaptAnalysisPrompt(
  basePrompt: string,
  history: UserHistory
): string {
  let adaptedPrompt = basePrompt;

  // Add avoided ingredients context
  if (history.preferences.avoidedIngredients.length > 0) {
    const avoided = history.preferences.avoidedIngredients.slice(0, 5).join(', ');
    adaptedPrompt += `\n\nUser typically avoids: ${avoided}`;
    
    if (history.preferences.avoidedIngredients.length > 5) {
      adaptedPrompt += ` and ${history.preferences.avoidedIngredients.length - 5} more ingredients`;
    }
  }

  // Add preferred ingredients context
  if (history.preferences.preferredIngredients.length > 0) {
    const preferred = history.preferences.preferredIngredients.slice(0, 5).join(', ');
    adaptedPrompt += `\n\nUser typically prefers: ${preferred}`;
  }

  // Add dietary profile context
  if (history.preferences.dietaryProfile) {
    adaptedPrompt += `\n\nUser appears to follow a ${history.preferences.dietaryProfile} diet based on their history.`;
  }

  // Add strictness context
  if (history.preferences.strictness === 'strict') {
    adaptedPrompt += `\n\nUser prefers strict adherence to their dietary preferences.`;
  } else {
    adaptedPrompt += `\n\nUser is flexible with their dietary preferences.`;
  }

  // Add experience level context
  if (history.scanCount > 10) {
    adaptedPrompt += `\n\nUser is experienced (${history.scanCount} scans). Use more technical language and denser information.`;
  } else if (history.scanCount > 3) {
    adaptedPrompt += `\n\nUser has some experience (${history.scanCount} scans). Balance technical and simple language.`;
  } else {
    adaptedPrompt += `\n\nUser is new (${history.scanCount} scans). Use simple language and more explanations.`;
  }

  return adaptedPrompt;
}

/**
 * Clear user history (for testing or user request)
 */
export function clearUserHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear user history:', error);
  }
}

/**
 * Get user expertise level based on scan count
 */
export function getUserExpertise(history: UserHistory): 'beginner' | 'intermediate' | 'expert' {
  if (history.scanCount > 10) {
    return 'expert';
  } else if (history.scanCount > 3) {
    return 'intermediate';
  }
  return 'beginner';
}
