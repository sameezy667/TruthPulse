import { z } from 'zod';
import { UserProfile } from './types';

// API Request Schema
export const AnalyzeRequestSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  userProfile: z.nativeEnum(UserProfile),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// Risk Hierarchy Item
export const RiskItemSchema = z.object({
  ingredient: z.string(),
  severity: z.enum(['high', 'med']),
  reason: z.string(),
  confidence: z.number().min(0).max(1).optional(), // AI confidence score
});

// Alternative Product Suggestion
export const AlternativeSchema = z.object({
  name: z.string(),
  reason: z.string(),
  betterBy: z.string(),
}).passthrough(); // Allow extra fields

// Scenario A: Safe
export const SafeResponseSchema = z.object({
  type: z.literal('SAFE'),
  summary: z.string(),
  safeBadge: z.boolean(),
});

// Scenario B: Risk
export const RiskResponseSchema = z.object({
  type: z.literal('RISK'),
  headline: z.string(),
  riskHierarchy: z.array(RiskItemSchema),
  alternatives: z.array(AlternativeSchema).optional(),
});

// Scenario C: Decision Fork
export const DecisionResponseSchema = z.object({
  type: z.literal('DECISION'),
  question: z.string(),
  options: z.array(z.string()),
});

// Scenario D: Clarification
export const ClarificationResponseSchema = z.object({
  type: z.literal('CLARIFICATION'),
  question: z.string(),
  context: z.string(),
  options: z.array(z.string()),
  inferredIntent: z.array(z.string()),
});

// Fallback: Uncertain
export const UncertainResponseSchema = z.object({
  type: z.literal('UNCERTAIN'),
  rawText: z.string(),
});

// UI Component Schema for generative UI
export const UIComponentSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.string(), // Allow any type string
    props: z.record(z.string(), z.any()).optional(), // Make props optional
    children: z.array(UIComponentSchema).optional(),
    text: z.string().optional(), // Allow text field
  }).passthrough() // Allow extra fields
);

// Simplified schema for Gemini compatibility
// Single object with type discriminator and optional fields
export const AIResponseSchema = z.object({
  type: z.enum(['SAFE', 'RISK', 'DECISION', 'CLARIFICATION', 'UNCERTAIN']),
  // SAFE fields
  summary: z.string().optional(),
  safeBadge: z.boolean().optional(),
  // RISK fields
  headline: z.string().optional(),
  riskHierarchy: z.array(RiskItemSchema).optional(),
  alternatives: z.array(AlternativeSchema).optional(),
  // DECISION fields
  question: z.string().optional(),
  options: z.array(z.string()).optional(),
  // CLARIFICATION fields
  context: z.string().optional(),
  inferredIntent: z.array(z.string()).optional(),
  // UNCERTAIN fields
  rawText: z.string().optional(),
  // Generative UI components (optional, not used - ignore if present)
  uiComponents: z.any().optional(),
}).passthrough(); // Allow extra fields from AI

export type AIResponse = z.infer<typeof AIResponseSchema>;
export type SafeResponse = z.infer<typeof SafeResponseSchema>;
export type RiskResponse = z.infer<typeof RiskResponseSchema>;
export type RiskItem = z.infer<typeof RiskItemSchema>;
export type Alternative = z.infer<typeof AlternativeSchema>;
export type DecisionResponse = z.infer<typeof DecisionResponseSchema>;
export type ClarificationResponse = z.infer<typeof ClarificationResponseSchema>;
export type UncertainResponse = z.infer<typeof UncertainResponseSchema>;
