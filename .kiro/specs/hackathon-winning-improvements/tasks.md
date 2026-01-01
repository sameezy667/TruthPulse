# Implementation Tasks: Hackathon Winning Improvements

## Overview
This task list implements 3 phases to transform Sach.ai into a winning AI-native experience.
Target Score: 92-95/100

---

## PHASE 1: Real Streaming (CRITICAL - 4 hours)
**Target: 85/100**

### Task 1.1: Refactor API Route to Use streamObject
**File:** `app/api/analyze/route.ts`  
**Time:** 1 hour  
**Status:** ✅ Complete

**Implementation Steps:**
1. Import `streamObject` from 'ai' package
2. Replace `generateText` call with `streamObject`
3. Pass `AIResponseSchema` as schema parameter
4. Remove manual JSON parsing logic (jsonMatch regex)
5. Return `result.toDataStreamResponse()`
6. Test with curl to verify streaming works

**Acceptance Criteria:**
- API returns streaming response
- No manual JSON parsing
- Response conforms to AIResponseSchema

---

### Task 1.2: Add useObject Hook to Frontend
**File:** `app/page.tsx`  
**Time:** 45 minutes  
**Status:** ✅ Complete

**Implementation Steps:**
1. Import `experimental_useObject as useObject` from '@ai-sdk/react'
2. Import `AIResponseSchema` from '@/lib/schemas'
3. Replace fetch logic with useObject hook
4. Configure hook with api: '/api/analyze' and schema
5. Update handleScan to call submit({ imageBase64, userProfile })
6. Remove manual state management for analysisResult
7. Use hook's object, isLoading, and error states

**Acceptance Criteria:**
- No manual fetch calls
- Hook manages streaming state
- UI updates as data streams in

---

### Task 1.3: Connect GenerativeRenderer to Streaming Data
**File:** `app/page.tsx`  
**Time:** 30 minutes  
**Status:** ✅ Complete

**Implementation Steps:**
1. Replace ResultCard with GenerativeRenderer
2. Pass streaming `object` from hook to GenerativeRenderer
3. Pass profile and productId props
4. Remove manual step management for ANALYZING state
5. Let streaming state drive UI rendering

**Acceptance Criteria:**
- GenerativeRenderer receives partial data
- UI updates progressively
- Smooth transitions between states

---

### Task 1.4: Update SafeCard for Partial Data
**File:** `components/results/SafeCard.tsx`  
**Time:** 20 minutes  
**Status:** ✅ Complete

**Implementation Steps:**
1. Update props type to `DeepPartial<SafeResponse>`
2. Add fallback for undefined summary field
3. Display TextSkeleton when summary is undefined
4. Test with partial data

**Acceptance Criteria:**
- Component doesn't crash with partial data
- Shows skeleton while loading
- Animates when data arrives

---

### Task 1.5: Update RiskHierarchy for Partial Data
**File:** `components/results/RiskHierarchy.tsx`  
**Time:** 30 minutes  
**Status:** ✅ Complete

**Implementation Steps:**
1. Update props type to `DeepPartial<RiskResponse>`
2. Add fallback for undefined headline
3. Handle empty or undefined riskHierarchy array
4. Wrap risk items in AnimatePresence
5. Add staggered animation delays (i * 0.1)
6. Display RiskSkeleton when array is empty

**Acceptance Criteria:**
- Component handles partial data gracefully
- Items animate in as they stream
- Staggered animation looks smooth

---

### Task 1.6: Update DecisionFork for Partial Data
**File:** `components/results/DecisionFork.tsx`  
**Time:** 15 minutes  
**Status:** ✅ Complete

**Implementation Steps:**
1. Update props type to `DeepPartial<DecisionResponse>`
2. Add fallback for undefined question
3. Handle undefined options array
4. Disable buttons until data is complete

**Acceptance Criteria:**
- Component handles partial data
- Buttons disabled while loading
- Enables when data complete

---

### Task 1.7: Update UncertainCard for Partial Data
**File:** `components/results/UncertainCard.tsx`  
**Time:** 10 minutes  
**Status:** ✅ Complete

**Implementation Steps:**
1. Update props type to `DeepPartial<UncertainResponse>`
2. Add fallback for undefined rawText
3. Display placeholder text when undefined

**Acceptance Criteria:**
- Component handles partial data
- Shows placeholder while loading

---

### Task 1.8: Create Skeleton Components
**Files:** `components/ui/TextSkeleton.tsx`, `components/ui/RiskSkeleton.tsx`  
**Time:** 20 minutes  
**Status:** ✅ Complete

**Implementation Steps:**
1. Create TextSkeleton with pulsing animation
2. Create RiskSkeleton for risk hierarchy loading
3. Match skeleton heights to actual components
4. Add proper Tailwind classes

**Acceptance Criteria:**
- Skeletons pulse smoothly
- Heights match real components
- Look polished

---

### Task 1.9: Test Streaming End-to-End
**Time:** 30 minutes

**Implementation Steps:**
1. Run dev server
2. Scan test image
3. Verify reasoning terminal appears
4. Verify UI updates progressively
5. Test all 4 response types
6. Test error handling
7. Fix any issues

**Acceptance Criteria:**
- Streaming works smoothly
- No crashes or errors
- All response types render correctly

---

## PHASE 2: True Generative UI (HIGH IMPACT - 6 hours)
**Target: 92/100**

### Task 2.1: Research Vercel AI SDK streamUI
**Time:** 30 minutes

**Implementation Steps:**
1. Read streamUI documentation
2. Check compatibility with Google Gemini
3. Decide: streamUI vs custom engine
4. Document decision

**Acceptance Criteria:**
- Clear understanding of streamUI
- Decision documented

---

### Task 2.2: Implement Generative UI Engine
**File:** `lib/generative-ui-engine.ts`  
**Time:** 2 hours

**Implementation Steps:**
1. Create UIComponent interface
2. Implement generateUI async generator
3. Add logic for complexity-based UI selection
4. Handle SAFE, RISK, DECISION, UNCERTAIN types
5. Add streaming delays for smooth animation
6. Test with mock data

**Acceptance Criteria:**
- Engine generates UI components
- Adapts to product complexity
- Streams components progressively

---

### Task 2.3: Create DynamicRenderer Component
**File:** `components/results/DynamicRenderer.tsx`  
**Time:** 1.5 hours

**Implementation Steps:**
1. Create component map (text, badge, card, list, chart)
2. Implement recursive rendering
3. Add AnimatePresence with staggered delays
4. Handle nested children
5. Add error boundaries
6. Test with various component trees

**Acceptance Criteria:**
- Renders dynamic component trees
- Animations are smooth
- Handles errors gracefully

---

### Task 2.4: Create Atomic UI Components
**Files:** Multiple in `components/ui/`  
**Time:** 1 hour

**Implementation Steps:**
1. Create TextComponent
2. Create BadgeComponent
3. Create CardComponent
4. Create ListComponent
5. Create ChartComponent (simple bar chart)
6. Ensure all accept dynamic props

**Acceptance Criteria:**
- All components render correctly
- Accept dynamic props
- Look polished

---

### Task 2.5: Update System Prompt for UI Generation
**File:** `lib/prompts.ts`  
**Time:** 30 minutes

**Implementation Steps:**
1. Add UI generation instructions
2. Add complexity-based rules
3. Add examples for each product type
4. Test prompt with API

**Acceptance Criteria:**
- Prompt includes UI instructions
- AI understands complexity rules

---

### Task 2.6: Integrate Generative UI into API Route
**File:** `app/api/analyze/route.ts`  
**Time:** 1 hour

**Implementation Steps:**
1. Import generative UI engine
2. Call generateUI after analysis
3. Stream UI components
4. Handle errors
5. Test end-to-end

**Acceptance Criteria:**
- API streams UI components
- Components match analysis complexity
- No errors

---

### Task 2.7: Test Generative UI with Real Products
**Time:** 30 minutes

**Implementation Steps:**
1. Test with simple product (1-3 ingredients)
2. Test with medium product (4-8 ingredients)
3. Test with complex product (9+ ingredients)
4. Verify UI adapts appropriately
5. Fix any issues

**Acceptance Criteria:**
- UI adapts to complexity
- All product types work
- Looks professional

---

## PHASE 3: Intent Inference (NICE TO HAVE - 3 hours)
**Target: 95/100**

### Task 3.1: Create Intent Inference Engine
**File:** `lib/intent-inference.ts`  
**Time:** 1 hour

**Implementation Steps:**
1. Create InferredIntent interface
2. Implement inferIntent function
3. Add product type detection
4. Add pattern analysis from history
5. Calculate confidence scores
6. Test with various products

**Acceptance Criteria:**
- Engine infers intent from products
- Confidence scores are reasonable
- Works with and without history

---

### Task 3.2: Create User History System
**File:** `lib/user-history.ts`  
**Time:** 45 minutes

**Implementation Steps:**
1. Create UserHistory interface
2. Implement learnFromDecision function
3. Implement adaptAnalysisPrompt function
4. Add localStorage persistence
5. Test learning algorithm

**Acceptance Criteria:**
- History persists across sessions
- Learning improves over time
- Prompts adapt to history

---

### Task 3.3: Add Clarification Response Type
**File:** `lib/schemas.ts`  
**Time:** 15 minutes

**Implementation Steps:**
1. Create ClarificationResponseSchema
2. Add to discriminated union
3. Export types

**Acceptance Criteria:**
- Schema validates correctly
- TypeScript types work

---

### Task 3.4: Create ClarificationCard Component
**File:** `components/results/ClarificationCard.tsx`  
**Time:** 30 minutes

**Implementation Steps:**
1. Create component with question display
2. Add option buttons
3. Show inferred intent
4. Handle answer callback
5. Add animations

**Acceptance Criteria:**
- Component looks good
- Buttons work
- Animations smooth

---

### Task 3.5: Create Smart Onboarding
**File:** `components/onboarding/SmartOnboarding.tsx`  
**Time:** 20 minutes

**Implementation Steps:**
1. Create brief onboarding screen
2. Add feature cards
3. Add "Start Scanning" button
4. Add animations

**Acceptance Criteria:**
- Onboarding is brief and clear
- Animations are smooth
- Button works

---

### Task 3.6: Update App Flow for Intent Inference
**File:** `app/page.tsx`  
**Time:** 30 minutes

**Implementation Steps:**
1. Load user history on mount
2. Show onboarding only for first-time users
3. Remove profile selection screen
4. Call inferIntent before submit
5. Handle clarification responses
6. Update history after decisions

**Acceptance Criteria:**
- No profile selection for new users
- Intent is inferred automatically
- History persists and learns

---

### Task 3.7: Create Memory Indicator
**File:** `components/ui/MemoryIndicator.tsx`  
**Time:** 20 minutes

**Implementation Steps:**
1. Create indicator component
2. Show learned preferences
3. Add brain icon
4. Position at top of screen
5. Add animations

**Acceptance Criteria:**
- Indicator shows learned info
- Looks good
- Doesn't obstruct UI

---

### Task 3.8: Test Intent Inference Flow
**Time:** 30 minutes

**Implementation Steps:**
1. Test first-time user flow
2. Test returning user flow
3. Test clarification flow
4. Test learning over multiple scans
5. Verify memory indicator
6. Fix any issues

**Acceptance Criteria:**
- All flows work smoothly
- Learning is visible
- No errors

---

## FINAL TASKS

### Task F.1: Polish and Bug Fixes
**Time:** 1 hour

**Implementation Steps:**
1. Fix any visual glitches
2. Ensure all animations are smooth
3. Test on real mobile device
4. Fix any performance issues
5. Add loading states where needed

**Acceptance Criteria:**
- No visual glitches
- Smooth animations
- Works on mobile
- Good performance

---

### Task F.2: Create Demo Video
**Time:** 30 minutes

**Implementation Steps:**
1. Record 3-minute demo following script
2. Show streaming in action
3. Show generative UI adapting
4. Show intent inference
5. Show learning behavior
6. Edit and polish

**Acceptance Criteria:**
- Demo is 3 minutes
- Shows all key features
- Looks professional

---

### Task F.3: Update Documentation
**Time:** 30 minutes

**Implementation Steps:**
1. Update README with AI-native approach
2. Add demo video link
3. Document key features
4. Add setup instructions
5. Highlight what makes it AI-native

**Acceptance Criteria:**
- README is updated
- Demo video linked
- Clear documentation

---

### Task F.4: Final Testing
**Time:** 30 minutes

**Implementation Steps:**
1. Test all features one more time
2. Verify no console errors
3. Check mobile responsiveness
4. Test error scenarios
5. Verify API key is not exposed

**Acceptance Criteria:**
- All features work
- No errors
- Mobile responsive
- Secure

---

## Time Breakdown

**Phase 1 (Must Have):** 4 hours → 85/100  
**Phase 2 (Should Have):** 6 hours → 92/100  
**Phase 3 (Nice to Have):** 3 hours → 95/100  
**Final Tasks:** 2.5 hours

**Total Time:** 15.5 hours

**Minimum to Win:** Phase 1 + Phase 2 = 10 hours → 92/100  
**To Dominate:** All phases = 15.5 hours → 95/100

---

## Progress Tracking

### Phase 1 Status
- [x] Task 1.1: Refactor API Route to Use streamObject
- [x] Task 1.2: Add useObject Hook to Frontend
- [x] Task 1.3: Connect GenerativeRenderer to Streaming Data
- [x] Task 1.4: Update SafeCard for Partial Data
- [x] Task 1.5: Update RiskHierarchy for Partial Data
- [x] Task 1.6: Update DecisionFork for Partial Data
- [x] Task 1.7: Update UncertainCard for Partial Data
- [x] Task 1.8: Create Skeleton Components
- [x] Task 1.9: Test Streaming End-to-End

### Phase 2 Status
- [x] Task 2.1: Research Vercel AI SDK streamUI
- [x] Task 2.2: Implement Generative UI Engine
- [x] Task 2.3: Create DynamicRenderer Component
- [x] Task 2.4: Create Atomic UI Components
- [x] Task 2.5: Update System Prompt for UI Generation
- [x] Task 2.6: Integrate Generative UI into API Route
- [x] Task 2.7: Test Generative UI with Real Products

### Phase 3 Status
- [x] Task 3.1: Create Intent Inference Engine
- [x] Task 3.2: Create User History System
- [x] Task 3.3: Add Clarification Response Type
- [x] Task 3.4: Create ClarificationCard Component
- [x] Task 3.5: Create Smart Onboarding
- [x] Task 3.6: Update App Flow for Intent Inference
- [x] Task 3.7: Create Memory Indicator
- [x] Task 3.8: Test Intent Inference Flow

### Final Tasks Status
- [x] Task F.1: Polish and Bug Fixes
- [ ] Task F.2: Create Demo Video
- [ ] Task F.3: Update Documentation
- [ ] Task F.4: Final Testing

---

## Success Criteria

### Phase 1 Complete When:
- Streaming works end-to-end
- UI updates progressively
- All components handle partial data
- No blocking calls

### Phase 2 Complete When:
- UI is generated by AI
- UI adapts to product complexity
- No static templates used
- Looks professional

### Phase 3 Complete When:
- No profile selection form
- Intent is inferred automatically
- Clarification works
- Learning is visible

### Ready to Submit When:
- All phases complete (or Phase 1 + 2 minimum)
- Demo video recorded
- Documentation updated
- No bugs or errors
- Looks polished

---

## Notes

- Focus on experience over perfection
- Phase 1 is CRITICAL - don't skip
- Phase 2 is what makes you stand out
- Phase 3 is the cherry on top
- Test frequently, fix issues immediately
- Keep animations smooth (30fps minimum)
- Mobile-first always

**Current Progress:** 8/9 Phase 1 tasks complete (Tasks 1.1-1.8 ✅)  
**Next Task:** Task 1.9 - Test Streaming End-to-End
