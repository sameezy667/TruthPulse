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
});

// Scenario A: Safe
export const SafeResponseSchema = z.object({
  type: z.literal('SAFE'),
  summary: z.string(),
  safeBadge: z.literal(true),
});

// Scenario B: Risk
export const RiskResponseSchema = z.object({
  type: z.literal('RISK'),
  headline: z.string(),
  riskHierarchy: z.array(RiskItemSchema),
});

// Scenario C: Decision Fork
export const DecisionResponseSchema = z.object({
  type: z.literal('DECISION'),
  question: z.string(),
  options: z.tuple([z.literal('Strict'), z.literal('Flexible')]),
});

// Fallback: Uncertain
export const UncertainResponseSchema = z.object({
  type: z.literal('UNCERTAIN'),
  rawText: z.string(),
});

// Discriminated Union
export const AIResponseSchema = z.discriminatedUnion('type', [
  SafeResponseSchema,
  RiskResponseSchema,
  DecisionResponseSchema,
  UncertainResponseSchema,
]);

export type AIResponse = z.infer<typeof AIResponseSchema>;
export type SafeResponse = z.infer<typeof SafeResponseSchema>;
export type RiskResponse = z.infer<typeof RiskResponseSchema>;
export type RiskItem = z.infer<typeof RiskItemSchema>;
export type DecisionResponse = z.infer<typeof DecisionResponseSchema>;
export type UncertainResponse = z.infer<typeof UncertainResponseSchema>;
