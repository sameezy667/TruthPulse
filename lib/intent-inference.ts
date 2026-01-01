/**
 * Intent Inference Engine
 * 
 * Infers user dietary preferences and health goals from product scans
 * without requiring explicit profile selection.
 */

import { UserProfile } from './types';

/**
 * Represents the inferred intent from analyzing a product and user history
 */
export interface InferredIntent {
  dietaryRestrictions: string[];
  healthGoals: string[];
  confidence: number;
  needsClarification: boolean;
  suggestedProfile?: UserProfile;
}

/**
 * User history for learning and pattern analysis
 */
export interface UserHistory {
  scanCount: number;
  decisions: Decision[];
  preferences: Preferences;
  lastScanDate: Date;
}

/**
 * A user decision about a product
 */
export interface Decision {
  productType: string;
  choice: 'accepted' | 'rejected';
  reason?: string;
  timestamp: Date;
}

/**
 * Learned user preferences
 */
export interface Preferences {
  avoidedIngredients: string[];
  preferredIngredients: string[];
  dietaryProfile?: UserProfile;
  strictness: 'strict' | 'flexible';
}

/**
 * Product type detection result
 */
interface ProductTypeAnalysis {
  categories: string[];
  keywords: string[];
  confidence: number;
}

/**
 * Infers user intent from product image and optional user history
 * 
 * @param productImage - Base64 encoded product image
 * @param userHistory - Optional user history for pattern analysis
 * @returns Inferred intent with confidence score
 */
export async function inferIntent(
  productImage: string,
  userHistory?: UserHistory
): Promise<InferredIntent> {
  // Detect product type from image
  const productType = await detectProductType(productImage);
  
  // Infer dietary restrictions from product type
  const inferences: string[] = [];
  const healthGoals: string[] = [];
  
  // Analyze product keywords for dietary signals
  for (const keyword of productType.keywords) {
    const lowerKeyword = keyword.toLowerCase();
    
    // Protein-focused products
    if (lowerKeyword.includes('protein') || lowerKeyword.includes('whey')) {
      healthGoals.push('fitness');
      healthGoals.push('protein-focused');
    }
    
    // Gluten-free products
    if (lowerKeyword.includes('gluten-free') || lowerKeyword.includes('gluten free')) {
      inferences.push('gluten-intolerant');
      inferences.push('celiac');
    }
    
    // Vegan products
    if (lowerKeyword.includes('vegan') || lowerKeyword.includes('plant-based')) {
      inferences.push('vegan');
      inferences.push('plant-based');
    }
    
    // Paleo products
    if (lowerKeyword.includes('paleo') || lowerKeyword.includes('grain-free')) {
      inferences.push('paleo');
      inferences.push('grain-free');
    }
    
    // Diabetic-friendly products
    if (lowerKeyword.includes('sugar-free') || lowerKeyword.includes('low-sugar') || 
        lowerKeyword.includes('diabetic')) {
      inferences.push('diabetic');
      healthGoals.push('blood-sugar-control');
    }
    
    // Keto products
    if (lowerKeyword.includes('keto') || lowerKeyword.includes('low-carb')) {
      inferences.push('keto');
      healthGoals.push('low-carb');
    }
  }
  
  // Combine with user history patterns
  if (userHistory) {
    const historicalPatterns = analyzeUserPatterns(userHistory);
    inferences.push(...historicalPatterns.dietaryRestrictions);
    healthGoals.push(...historicalPatterns.healthGoals);
  }
  
  // Remove duplicates
  const uniqueInferences = Array.from(new Set(inferences));
  const uniqueHealthGoals = Array.from(new Set(healthGoals));
  
  // Calculate confidence score
  const confidence = calculateConfidence(uniqueInferences, userHistory, productType.confidence);
  
  // Determine if clarification is needed
  const needsClarification = uniqueInferences.length === 0 || confidence < 0.7;
  
  // Suggest a profile if confidence is high enough
  const suggestedProfile = suggestUserProfile(uniqueInferences, confidence);
  
  return {
    dietaryRestrictions: uniqueInferences,
    healthGoals: uniqueHealthGoals,
    confidence,
    needsClarification,
    suggestedProfile
  };
}

/**
 * Detects product type from image analysis
 * 
 * In a real implementation, this would use OCR or image recognition.
 * For now, we'll use a simplified approach based on common patterns.
 * 
 * @param productImage - Base64 encoded product image
 * @returns Product type analysis
 */
async function detectProductType(productImage: string): Promise<ProductTypeAnalysis> {
  // This is a placeholder implementation
  // In production, this would:
  // 1. Use OCR to extract text from the image
  // 2. Use image recognition to identify product category
  // 3. Analyze packaging design and labels
  
  // For now, return a default analysis
  // The actual product analysis will happen in the AI model
  return {
    categories: ['food'],
    keywords: [],
    confidence: 0.5
  };
}

/**
 * Analyzes user history to identify patterns
 * 
 * @param history - User history
 * @returns Identified patterns
 */
function analyzeUserPatterns(history: UserHistory): {
  dietaryRestrictions: string[];
  healthGoals: string[];
} {
  const dietaryRestrictions: string[] = [];
  const healthGoals: string[] = [];
  
  // Analyze avoided ingredients
  if (history.preferences.avoidedIngredients.length > 0) {
    // Check for common dietary restriction patterns
    const avoided = history.preferences.avoidedIngredients.map(i => i.toLowerCase());
    
    if (avoided.some(i => i.includes('gluten') || i.includes('wheat'))) {
      dietaryRestrictions.push('gluten-intolerant');
    }
    
    if (avoided.some(i => i.includes('dairy') || i.includes('milk') || i.includes('lactose'))) {
      dietaryRestrictions.push('lactose-intolerant');
    }
    
    if (avoided.some(i => i.includes('meat') || i.includes('animal'))) {
      dietaryRestrictions.push('vegan');
    }
    
    if (avoided.some(i => i.includes('sugar'))) {
      dietaryRestrictions.push('diabetic');
      healthGoals.push('blood-sugar-control');
    }
  }
  
  // Use existing dietary profile if available
  if (history.preferences.dietaryProfile) {
    const profile = history.preferences.dietaryProfile.toLowerCase();
    if (!dietaryRestrictions.includes(profile)) {
      dietaryRestrictions.push(profile);
    }
  }
  
  // Analyze decision patterns
  const recentDecisions = history.decisions.slice(-10); // Last 10 decisions
  const rejectionReasons = recentDecisions
    .filter(d => d.choice === 'rejected' && d.reason)
    .map(d => d.reason!.toLowerCase());
  
  // Look for patterns in rejection reasons
  if (rejectionReasons.some(r => r.includes('high sugar') || r.includes('too much sugar'))) {
    healthGoals.push('reduce-sugar');
  }
  
  if (rejectionReasons.some(r => r.includes('processed') || r.includes('artificial'))) {
    healthGoals.push('clean-eating');
  }
  
  return {
    dietaryRestrictions: Array.from(new Set(dietaryRestrictions)),
    healthGoals: Array.from(new Set(healthGoals))
  };
}

/**
 * Calculates confidence score for inferred intent
 * 
 * @param inferences - Inferred dietary restrictions
 * @param userHistory - Optional user history
 * @param productConfidence - Confidence from product detection
 * @returns Confidence score between 0 and 1
 */
function calculateConfidence(
  inferences: string[],
  userHistory: UserHistory | undefined,
  productConfidence: number
): number {
  let confidence = productConfidence;
  
  // Boost confidence if we have inferences
  if (inferences.length > 0) {
    confidence += 0.2;
  }
  
  // Boost confidence if we have user history
  if (userHistory) {
    const historyWeight = Math.min(userHistory.scanCount / 10, 0.3);
    confidence += historyWeight;
    
    // Extra boost if we have a dietary profile
    if (userHistory.preferences.dietaryProfile) {
      confidence += 0.1;
    }
  }
  
  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Suggests a user profile based on inferred restrictions
 * 
 * @param inferences - Inferred dietary restrictions
 * @param confidence - Confidence score
 * @returns Suggested user profile or undefined
 */
function suggestUserProfile(
  inferences: string[],
  confidence: number
): UserProfile | undefined {
  // Only suggest if confidence is high enough
  if (confidence < 0.7) {
    return undefined;
  }
  
  const lowerInferences = inferences.map(i => i.toLowerCase());
  
  // Check for vegan signals
  if (lowerInferences.some(i => i.includes('vegan') || i.includes('plant-based'))) {
    return UserProfile.VEGAN;
  }
  
  // Check for diabetic signals
  if (lowerInferences.some(i => i.includes('diabetic') || i.includes('blood-sugar'))) {
    return UserProfile.DIABETIC;
  }
  
  // Check for paleo signals
  if (lowerInferences.some(i => i.includes('paleo') || i.includes('grain-free'))) {
    return UserProfile.PALEO;
  }
  
  return undefined;
}
