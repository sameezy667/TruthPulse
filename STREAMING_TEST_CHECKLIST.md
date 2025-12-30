# Streaming End-to-End Test Checklist

## Test Environment
- **Server**: http://localhost:3000
- **Status**: ✅ Running
- **API Key**: ✅ Configured (GOOGLE_GENERATIVE_AI_API_KEY)

## Test Scenarios

### 1. Basic Streaming Functionality

#### Test 1.1: Application Loads
- [ ] Navigate to http://localhost:3000
- [ ] Verify the setup screen appears
- [ ] Verify three profile options are visible (DIABETIC, VEGAN, PALEO)
- [ ] Verify no console errors

#### Test 1.2: Profile Selection
- [ ] Select VEGAN profile
- [ ] Verify transition to camera/scanner view
- [ ] Verify URL updates with `?mode=VEGAN`
- [ ] Verify smooth animation transition

### 2. Streaming Response Types

#### Test 2.1: SAFE Response
**Test Image**: Product with clearly safe ingredients for selected profile

Steps:
- [ ] Select a profile (e.g., VEGAN)
- [ ] Upload/scan an image of a clearly safe product
- [ ] **Verify streaming behavior**:
  - [ ] ReasoningTerminal appears immediately
  - [ ] SafeCard appears when type='SAFE' is received
  - [ ] Summary text streams in progressively
  - [ ] Safe badge displays correctly
- [ ] Verify no console errors
- [ ] Verify reset button works

#### Test 2.2: RISK Response
**Test Image**: Product with risky ingredients for selected profile

Steps:
- [ ] Select a profile (e.g., DIABETIC)
- [ ] Upload/scan an image with high sugar content
- [ ] **Verify streaming behavior**:
  - [ ] ReasoningTerminal appears immediately
  - [ ] RiskHierarchy appears when type='RISK' is received
  - [ ] Headline streams in first
  - [ ] Risk items appear one by one with animation
  - [ ] Each risk item shows: ingredient, severity badge, reason
  - [ ] Severity badges are color-coded (high=red, med=yellow)
- [ ] Verify animations are smooth
- [ ] Verify no console errors
- [ ] Verify reset button works

#### Test 2.3: DECISION Response
**Test Image**: Product with ambiguous ingredients (e.g., "Natural Flavors" for VEGAN)

Steps:
- [ ] Select VEGAN profile
- [ ] Upload/scan an image with "Natural Flavors"
- [ ] **Verify streaming behavior**:
  - [ ] ReasoningTerminal appears immediately
  - [ ] DecisionFork appears when type='DECISION' is received
  - [ ] Question text streams in
  - [ ] Two option buttons appear (Strict, Flexible)
  - [ ] Buttons are disabled until data is complete
- [ ] Click "Strict" option
- [ ] Verify re-analysis occurs
- [ ] Verify new response is received
- [ ] Verify no console errors

#### Test 2.4: UNCERTAIN Response
**Test Image**: Blurry or unreadable image

Steps:
- [ ] Select any profile
- [ ] Upload a blurry/unreadable image
- [ ] **Verify streaming behavior**:
  - [ ] ReasoningTerminal appears immediately
  - [ ] UncertainCard appears when type='UNCERTAIN' is received
  - [ ] Raw text explanation streams in
  - [ ] Retry button is visible
- [ ] Verify no console errors
- [ ] Verify reset button works

### 3. Partial Data Handling

#### Test 3.1: SafeCard Partial Data
- [ ] During streaming, verify TextSkeleton appears for missing summary
- [ ] Verify component doesn't crash with undefined fields
- [ ] Verify smooth transition from skeleton to actual content

#### Test 3.2: RiskHierarchy Partial Data
- [ ] During streaming, verify RiskSkeleton appears when array is empty
- [ ] Verify headline shows skeleton when undefined
- [ ] Verify risk items animate in as they arrive
- [ ] Verify staggered animation delays (each item slightly delayed)
- [ ] Verify component doesn't crash with partial data

#### Test 3.3: DecisionFork Partial Data
- [ ] During streaming, verify buttons are disabled initially
- [ ] Verify "Loading..." text appears for missing options
- [ ] Verify buttons enable when data is complete
- [ ] Verify component doesn't crash with undefined fields

#### Test 3.4: UncertainCard Partial Data
- [ ] During streaming, verify placeholder text for missing rawText
- [ ] Verify component doesn't crash with undefined fields

### 4. Error Handling

#### Test 4.1: Network Error
Steps:
- [ ] Start a scan
- [ ] Disconnect network mid-stream (or use browser DevTools to simulate)
- [ ] Verify error toast appears
- [ ] Verify message: "Analysis failed. Please try again."
- [ ] Verify toast has destructive variant (red styling)
- [ ] Verify application doesn't crash

#### Test 4.2: Invalid API Key
Steps:
- [ ] Stop the dev server
- [ ] Temporarily rename .env.local or clear GOOGLE_GENERATIVE_AI_API_KEY
- [ ] Restart dev server
- [ ] Attempt to scan an image
- [ ] Verify UNCERTAIN response is returned
- [ ] Verify message mentions missing API key
- [ ] Restore API key and restart server

#### Test 4.3: Malformed Response
- [ ] Check browser console for any JSON parsing errors
- [ ] Verify application handles unexpected response formats gracefully

### 5. Loading States and Skeletons

#### Test 5.1: ReasoningTerminal
- [ ] Verify ReasoningTerminal appears immediately when analysis starts
- [ ] Verify loading animation is smooth
- [ ] Verify terminal-style UI matches design

#### Test 5.2: Skeleton Components
- [ ] Verify TextSkeleton has pulsing animation
- [ ] Verify RiskSkeleton matches expected height
- [ ] Verify skeletons don't cause layout shift
- [ ] Verify smooth transition from skeleton to content

### 6. Mobile Layout and Responsiveness

#### Test 6.1: Layout Constraints
- [ ] Open browser DevTools
- [ ] Set viewport to 430px width (iPhone 14 Pro Max)
- [ ] Verify no horizontal scrolling
- [ ] Verify all components fit within viewport
- [ ] Verify max-width constraint is respected

#### Test 6.2: Touch Interactions
- [ ] Verify all buttons are touch-friendly (min 44px touch target)
- [ ] Verify smooth scrolling on mobile
- [ ] Verify animations perform well on mobile

#### Test 6.3: Safe Area Handling
- [ ] Verify pt-safe-top and pb-safe-bottom classes are applied
- [ ] Verify content doesn't overlap with notch/home indicator

### 7. Animation Performance

#### Test 7.1: Framer Motion Animations
- [ ] Verify AnimatePresence transitions between steps
- [ ] Verify risk items animate in with stagger effect
- [ ] Verify animations are smooth (60fps)
- [ ] Verify no janky animations during streaming

#### Test 7.2: Streaming Updates
- [ ] Verify UI updates in real-time as data streams
- [ ] Verify no flickering or layout jumps
- [ ] Verify smooth text appearance

### 8. Browser Console Checks

#### Test 8.1: Console Errors
- [ ] Open browser DevTools console
- [ ] Perform all test scenarios above
- [ ] Verify no TypeScript errors
- [ ] Verify no React errors
- [ ] Verify no network errors (except intentional tests)

#### Test 8.2: Network Tab
- [ ] Open browser DevTools Network tab
- [ ] Start a scan
- [ ] Verify POST request to /api/analyze
- [ ] Verify response type is text/event-stream or similar
- [ ] Verify streaming chunks are received progressively

### 9. Multiple Profile Testing

#### Test 9.1: DIABETIC Profile
- [ ] Test with high-sugar product → expect RISK
- [ ] Test with low-sugar product → expect SAFE
- [ ] Verify profile-specific concerns in responses

#### Test 9.2: VEGAN Profile
- [ ] Test with plant-based product → expect SAFE
- [ ] Test with dairy product → expect RISK
- [ ] Test with "Natural Flavors" → expect DECISION
- [ ] Verify profile-specific concerns in responses

#### Test 9.3: PALEO Profile
- [ ] Test with grain-free product → expect SAFE
- [ ] Test with grain-containing product → expect RISK
- [ ] Verify profile-specific concerns in responses

### 10. Edge Cases

#### Test 10.1: Rapid Successive Scans
- [ ] Scan an image
- [ ] Immediately scan another image before first completes
- [ ] Verify no race conditions
- [ ] Verify latest scan takes precedence

#### Test 10.2: Very Large Images
- [ ] Upload a very large image (>5MB)
- [ ] Verify streaming still works
- [ ] Verify no memory issues

#### Test 10.3: Special Characters
- [ ] Test with product containing special characters in ingredients
- [ ] Verify JSON parsing handles special characters correctly

## Test Results Summary

### Passing Tests
- [ ] All basic functionality tests pass
- [ ] All four response types render correctly
- [ ] Streaming UI updates work in real-time
- [ ] Partial data handling works correctly
- [ ] Error handling works as expected
- [ ] Loading states and skeletons display correctly
- [ ] Mobile layout is responsive
- [ ] Animations are smooth
- [ ] No console errors

### Issues Found
(Document any issues discovered during testing)

---

## Notes
- Test with real images when possible
- Use browser DevTools to simulate network conditions
- Test on actual mobile device if available
- Document any unexpected behavior
