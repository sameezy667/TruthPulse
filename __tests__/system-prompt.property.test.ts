import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateSystemPrompt } from '@/lib/prompts';
import { UserProfile } from '@/lib/types';

// Feature: generative-ui-streaming, Property 4: System Prompt Completeness
// Validates: Requirements 3.5

describe('Property-Based System Prompt Completeness', () => {
  it('Property 4: For any user profile, system prompt should contain profile name', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserProfile.DIABETIC, UserProfile.VEGAN, UserProfile.PALEO),
        (userProfile) => {
          const systemPrompt = generateSystemPrompt(userProfile);
          
          // Should contain the profile name
          expect(systemPrompt).toContain(userProfile);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: For any user profile, system prompt should contain concerns list', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserProfile.DIABETIC, UserProfile.VEGAN, UserProfile.PALEO),
        (userProfile) => {
          const systemPrompt = generateSystemPrompt(userProfile);
          
          // Should contain "Primary Concerns:" section
          expect(systemPrompt).toContain('Primary Concerns:');
          
          // Should contain profile-specific concerns
          if (userProfile === UserProfile.DIABETIC) {
            expect(systemPrompt).toContain('blood sugar');
            expect(systemPrompt).toContain('glycemic index');
          } else if (userProfile === UserProfile.VEGAN) {
            expect(systemPrompt).toContain('animal-derived');
          } else if (userProfile === UserProfile.PALEO) {
            expect(systemPrompt).toContain('grains');
            expect(systemPrompt).toContain('legumes');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: For any user profile, system prompt should contain safe ingredients list', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserProfile.DIABETIC, UserProfile.VEGAN, UserProfile.PALEO),
        (userProfile) => {
          const systemPrompt = generateSystemPrompt(userProfile);
          
          // Should contain "Safe Ingredients:" section
          expect(systemPrompt).toContain('Safe Ingredients:');
          
          // Should contain profile-specific safe ingredients
          if (userProfile === UserProfile.DIABETIC) {
            expect(systemPrompt).toContain('whole grains');
            expect(systemPrompt).toContain('lean proteins');
          } else if (userProfile === UserProfile.VEGAN) {
            expect(systemPrompt).toContain('plant-based');
          } else if (userProfile === UserProfile.PALEO) {
            expect(systemPrompt).toContain('vegetables');
            expect(systemPrompt).toContain('nuts');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: For any user profile, system prompt should contain risky ingredients list', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserProfile.DIABETIC, UserProfile.VEGAN, UserProfile.PALEO),
        (userProfile) => {
          const systemPrompt = generateSystemPrompt(userProfile);
          
          // Should contain "Risky Ingredients:" section
          expect(systemPrompt).toContain('Risky Ingredients:');
          
          // Should contain profile-specific risky ingredients
          if (userProfile === UserProfile.DIABETIC) {
            expect(systemPrompt).toContain('refined sugars');
            expect(systemPrompt).toContain('high-carb');
          } else if (userProfile === UserProfile.VEGAN) {
            expect(systemPrompt).toContain('dairy');
            expect(systemPrompt).toContain('eggs');
          } else if (userProfile === UserProfile.PALEO) {
            expect(systemPrompt).toContain('grains');
            expect(systemPrompt).toContain('legumes');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: For any user profile, system prompt should contain all four response scenarios', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserProfile.DIABETIC, UserProfile.VEGAN, UserProfile.PALEO),
        (userProfile) => {
          const systemPrompt = generateSystemPrompt(userProfile);
          
          // Should contain all four scenario types
          expect(systemPrompt).toContain('Scenario A');
          expect(systemPrompt).toContain('Scenario B');
          expect(systemPrompt).toContain('Scenario C');
          expect(systemPrompt).toContain('Scenario D');
          
          // Should contain the response type names
          expect(systemPrompt).toContain('SAFE');
          expect(systemPrompt).toContain('RISK');
          expect(systemPrompt).toContain('DECISION');
          expect(systemPrompt).toContain('UNCERTAIN');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: For any user profile, system prompt should contain JSON structure examples', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserProfile.DIABETIC, UserProfile.VEGAN, UserProfile.PALEO),
        (userProfile) => {
          const systemPrompt = generateSystemPrompt(userProfile);
          
          // Should contain JSON structure indicators
          expect(systemPrompt).toContain('"type"');
          expect(systemPrompt).toContain('"summary"');
          expect(systemPrompt).toContain('"headline"');
          expect(systemPrompt).toContain('"riskHierarchy"');
          expect(systemPrompt).toContain('"question"');
          expect(systemPrompt).toContain('"options"');
          expect(systemPrompt).toContain('"rawText"');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: For any user profile, system prompt should reference Sach.ai branding', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserProfile.DIABETIC, UserProfile.VEGAN, UserProfile.PALEO),
        (userProfile) => {
          const systemPrompt = generateSystemPrompt(userProfile);
          
          // Should contain Sach.ai branding
          expect(systemPrompt).toContain('Sach.ai');
          
          // Should not contain old branding
          expect(systemPrompt).not.toContain('TruthPulse');
          expect(systemPrompt).not.toContain('truthpulse');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: For any user profile, system prompt should be non-empty and substantial', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(UserProfile.DIABETIC, UserProfile.VEGAN, UserProfile.PALEO),
        (userProfile) => {
          const systemPrompt = generateSystemPrompt(userProfile);
          
          // Should be non-empty
          expect(systemPrompt.length).toBeGreaterThan(0);
          
          // Should be substantial (at least 500 characters)
          expect(systemPrompt.length).toBeGreaterThan(500);
        }
      ),
      { numRuns: 100 }
    );
  });
});
