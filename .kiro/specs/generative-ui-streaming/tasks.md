# Implementation Plan: Generative UI Streaming

## Overview

This implementation plan converts the Sach.ai application from a blocking fetch-and-wait architecture to a production-grade streaming Generative UI system. The tasks are organized to build incrementally, with each step validating functionality before proceeding.

## Tasks

- [x] 1. Install Vercel AI SDK dependencies
  - Run `npm install ai @ai-sdk/google`
  - Run `npm install clsx tailwind-merge` (if not present)
  - Verify `framer-motion` and `lucide-react` are already installed
  - Verify all packages appear in package.json
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.1 Write unit test to verify dependencies are installed
  - Test that package.json contains 'ai', '@ai-sdk/google', 'clsx', 'tailwind-merge'
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Update schema exports and types
  - Verify `lib/schemas.ts` exports `AIResponseSchema` with discriminated union
  - Verify schema includes all four response types (SAFE, RISK, DECISION, UNCERTAIN)
  - Add `DeepPartial` utility type to `lib/types.ts`
  - Export type inference helpers from schemas
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 2.1 Write unit tests for schema validation
  - Test each response type validates correctly against schema
  - Test invalid schemas are rejected
  - Test discriminated union switching works
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 2.2 Write property test for schema validation
  - **Property 2: Schema Validation for All Responses**
  - **Validates: Requirements 2.1, 2.7, 2.8**

- [x] 3. Refactor API route to use streamObject
  - Import `streamObject` from 'ai' package
  - Import `google` from '@ai-sdk/google' package
  - Replace `GoogleGenerativeAI` initialization with `google('gemini-2.5-flash-lite')`
  - Replace `generateContent` call with `streamObject` call
  - Pass `AIResponseSchema` as schema parameter
  - Update system prompt to work with streaming
  - Return `result.toDataStreamResponse()`
  - _Requirements: 3.2, 3.3, 3.4, 3.7_

- [x] 3.1 Write unit test for API route request validation
  - Test API accepts valid imageBase64 and userProfile
  - Test API rejects invalid requests
  - _Requirements: 3.1_

- [x] 3.2 Write property test for API request acceptance
  - **Property 3: API Request Acceptance**
  - **Validates: Requirements 3.1**

- [x] 3.3 Write property test for system prompt completeness
  - **Property 4: System Prompt Completeness**
  - **Validates: Requirements 3.5**

- [x] 3.4 Write property test for image data transmission
  - **Property 5: Image Data Transmission**
  - **Validates: Requirements 3.6**

- [x] 4. Add comprehensive error handling to API route
  - Add try-catch block around entire route handler
  - Check for missing GEMINI_API_KEY and return UNCERTAIN response
  - Catch validation errors and return UNCERTAIN response
  - Catch streaming errors and return UNCERTAIN response
  - Log all errors for debugging
  - _Requirements: 3.8, 8.5, 8.6, 8.7_

- [x] 4.1 Write unit tests for error handling
  - Test missing API key returns UNCERTAIN
  - Test invalid request returns UNCERTAIN
  - Test model unavailable returns UNCERTAIN
  - _Requirements: 8.5, 8.6, 8.7_

- [x] 4.2 Write property test for error resilience
  - **Property 6: Error Resilience**
  - **Validates: Requirements 3.8, 8.4, 8.5, 8.6, 8.7**

- [x] 5. Checkpoint - Verify streaming backend works
  - Test API route with curl or Postman
  - Verify streaming response is received
  - Verify response conforms to AIResponseSchema
  - Ask user if questions arise

- [x] 6. Update app/page.tsx to use useObject hook
  - Import `experimental_useObject as useObject` from 'ai/react'
  - Import `AIResponseSchema` from '@/lib/schemas'
  - Replace fetch logic with `useObject` hook
  - Configure hook with api: '/api/analyze' and schema: AIResponseSchema
  - Update handleScan to call `submit({ imageBase64, userProfile })`
  - Remove manual state management for analysis and isAnalyzing
  - Use hook's `object`, `isLoading`, and `error` states
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.1 Write unit test for hook integration
  - Test submit function is called with correct parameters
  - Test hook exposes object, isLoading, and error states
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.2 Write property test for hook data flow
  - **Property 7: Hook Data Flow**
  - **Validates: Requirements 4.4, 4.8**

- [x] 6.3 Write property test for loading state exposure
  - **Property 8: Loading State Exposure**
  - **Validates: Requirements 4.6**

- [x] 6.4 Write property test for error state exposure
  - **Property 9: Error State Exposure**
  - **Validates: Requirements 4.7**

- [x] 7. Create GenerativeRenderer component
  - Create `components/results/GenerativeRenderer.tsx`
  - Accept prop `data: DeepPartial<AIResponse>`
  - Accept props `onReset` and `onDecision`
  - Implement switch statement on `data?.type`
  - Render ReasoningTerminal when type is undefined
  - Render SafeCard when type is 'SAFE'
  - Render RiskHierarchy when type is 'RISK'
  - Render DecisionFork when type is 'DECISION'
  - Render UncertainCard when type is 'UNCERTAIN'
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 7.1 Write unit tests for GenerativeRenderer routing
  - Test undefined type renders ReasoningTerminal
  - Test SAFE type renders SafeCard
  - Test RISK type renders RiskHierarchy
  - Test DECISION type renders DecisionFork
  - Test UNCERTAIN type renders UncertainCard
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 8. Update SafeCard to handle partial data
  - Update props type to accept `DeepPartial<SafeResponse>`
  - Add fallback for undefined `summary` field
  - Display TextSkeleton component when summary is undefined
  - Ensure component doesn't crash with partial data
  - _Requirements: 6.1, 6.7_

- [x] 8.1 Write unit test for SafeCard partial data handling
  - Test component renders with undefined summary
  - Test component displays skeleton for missing data
  - _Requirements: 6.1, 6.7_

- [x] 9. Update RiskHierarchy to handle partial data and streaming animations
  - Update props type to accept `DeepPartial<RiskResponse>`
  - Add fallback for undefined `headline` field
  - Handle empty or undefined `riskHierarchy` array
  - Display RiskSkeleton when riskHierarchy is empty
  - Wrap risk items in AnimatePresence
  - Add staggered animation delays for streaming items
  - Ensure component doesn't crash with partial data
  - _Requirements: 5.7, 5.8, 6.2, 6.3, 6.7_

- [x] 9.1 Write unit test for RiskHierarchy partial data handling
  - Test component renders with undefined headline
  - Test component renders with empty riskHierarchy
  - Test component displays skeleton for missing data
  - _Requirements: 6.2, 6.3, 6.7_

- [x] 9.2 Write property test for animation on stream updates
  - **Property 11: Animation on Stream Updates**
  - **Validates: Requirements 5.8**

- [x] 10. Update DecisionFork to handle partial data
  - Update props type to accept `DeepPartial<DecisionResponse>`
  - Add fallback for undefined `question` field
  - Handle undefined `options` array
  - Disable buttons until data is complete
  - Display loading text for missing options
  - Ensure component doesn't crash with partial data
  - _Requirements: 6.4, 6.5, 6.7_

- [x] 10.1 Write unit test for DecisionFork partial data handling
  - Test component renders with undefined question
  - Test component renders with undefined options
  - Test buttons are disabled when data is incomplete
  - _Requirements: 6.4, 6.5, 6.7_

- [x] 11. Update UncertainCard to handle partial data
  - Update props type to accept `DeepPartial<UncertainResponse>`
  - Add fallback for undefined `rawText` field
  - Display placeholder text when rawText is undefined
  - Ensure component doesn't crash with partial data
  - _Requirements: 6.6, 6.7_

- [x] 11.1 Write unit test for UncertainCard partial data handling
  - Test component renders with undefined rawText
  - Test component displays placeholder for missing data
  - _Requirements: 6.6, 6.7_

- [x] 11.2 Write property test for partial data resilience
  - **Property 10: Partial Data Resilience**
  - **Validates: Requirements 5.9, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

- [x] 12. Create skeleton components
  - Create `components/ui/TextSkeleton.tsx` for text placeholders
  - Create `components/ui/RiskSkeleton.tsx` for risk hierarchy loading state
  - Add pulsing animation to skeletons
  - Match skeleton heights to actual component heights
  - _Requirements: 7.1, 7.3_

- [x] 12.1 Write unit test for skeleton components
  - Test TextSkeleton renders with correct width
  - Test RiskSkeleton renders with pulsing animation
  - _Requirements: 7.1, 7.3_

- [x] 12.2 Write property test for skeleton display
  - **Property 12: Skeleton Display for Missing Data**
  - **Validates: Requirements 7.3**

- [x] 13. Update app/page.tsx to use GenerativeRenderer
  - Replace ResultCard with GenerativeRenderer
  - Pass streaming `object` from hook to GenerativeRenderer
  - Remove manual step management for REASONING and RESULT
  - Let streaming state drive UI rendering
  - _Requirements: 4.8, 5.1_

- [x] 14. Add error handling UI to app/page.tsx
  - Create Toast component (or use existing toast library)
  - Display toast when `error` is present
  - Set toast variant to "destructive"
  - Display message: "Analysis failed. Please try again."
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 14.1 Write unit test for error UI
  - Test toast displays when error is present
  - Test toast shows correct error message
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 15. Checkpoint - Test streaming end-to-end
  - Run application in development mode
  - Test scanning an image
  - Verify streaming UI updates in real-time
  - Verify all four response types render correctly
  - Verify error handling works
  - Ask user if questions arise

- [x] 16. Update branding across codebase
  - Search for "TruthPulse" and replace with "Sach.ai"
  - Search for "truthpulse" and replace with "Sach.ai" or "sachai"
  - Update system prompts to reference "Sach.ai"
  - Update metadata and configuration files
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 16.1 Write unit test for branding consistency
  - Test codebase contains no "TruthPulse" references
  - Test codebase contains no "truthpulse" references
  - _Requirements: 9.1, 9.2_

- [x] 16.2 Write property test for branding consistency
  - **Property 13: Branding Consistency**
  - **Validates: Requirements 9.3**

- [x] 17. Verify mobile-first layout constraints
  - Check GenerativeRenderer respects max-width: 430px
  - Verify no horizontal scrolling occurs during streaming
  - Test safe area handling with pt-safe-top and pb-safe-bottom
  - Ensure all components fit within mobile viewport
  - _Requirements: 10.1, 10.4, 10.5_

- [x] 17.1 Write unit test for layout constraints
  - Test GenerativeRenderer has max-width constraint
  - Test components use safe area classes
  - _Requirements: 10.1, 10.5_

- [x] 17.2 Write property test for layout constraint compliance
  - **Property 14: Layout Constraint Compliance**
  - **Validates: Requirements 10.4**

- [x] 18. Update Next.js configuration for Capacitor
  - Open `next.config.js` or `next.config.ts`
  - Add or update `images.unoptimized = true`
  - Verify configuration is valid
  - _Requirements: 12.1_

- [x] 18.1 Write unit test for Next.js configuration
  - Test next.config contains images.unoptimized = true
  - _Requirements: 12.1_

- [x] 19. Clean up old dependencies and code
  - Remove `@google/generative-ai` from package.json
  - Remove `@google/genai` from package.json
  - Remove `selectAvailableModel` function from API route
  - Remove manual JSON parsing logic (jsonMatch regex)
  - Remove old blocking `generateContent` calls
  - Check for and remove `lib/data.ts` if it contains mock data
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 19.1 Write unit tests for cleanup verification
  - Test old packages are not in package.json
  - Test selectAvailableModel function doesn't exist
  - Test generateContent is not called in API route
  - _Requirements: 13.2, 13.3, 13.4_

- [x] 20. Run TypeScript compilation and verify type safety
  - Run `npm run build`
  - Verify no TypeScript errors
  - Verify no ESLint errors
  - Check for any `any` types in the codebase
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 20.1 Write property test for type safety
  - **Property 1: Type Safety Across Codebase**
  - **Validates: Requirements 1.5, 11.3**

- [x] 20.2 Write property test for type inference
  - **Property 15: Type Inference from Schema**
  - **Validates: Requirements 11.4**

- [x] 20.3 Write property test for DeepPartial correctness
  - **Property 16: DeepPartial Type Correctness**
  - **Validates: Requirements 11.5**

- [x] 21. Final checkpoint - Complete validation
  - Run full test suite
  - Test application with real Gemini API
  - Test all three user profiles (DIABETIC, VEGAN, PALEO)
  - Test error scenarios (invalid API key, network failure)
  - Verify streaming works smoothly
  - Verify mobile layout on actual device or emulator
  - Ask user for final approval

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a phased approach: dependencies → backend → frontend → polish → cleanup
