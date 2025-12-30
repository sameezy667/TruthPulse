# 🧪 Streaming Implementation Testing Checklist

## Pre-Test Setup

- [x] Dev server running on http://localhost:3002
- [ ] `.env.local` has valid `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] Browser open to http://localhost:3002
- [ ] Test food label images ready

## Core Streaming Tests

### Test 1: SAFE Response
**Goal:** Verify streaming works for safe products

1. [ ] Select profile: VEGAN
2. [ ] Scan image of: Plain almonds, vegetables, or 100% plant-based product
3. [ ] **Observe:**
   - [ ] Reasoning terminal appears immediately (< 0.5s)
   - [ ] Terminal shows animated logs
   - [ ] Type switches to SAFE
   - [ ] Green shield icon appears
   - [ ] Summary text streams in
   - [ ] Safety score animates
4. [ ] **Expected:** Smooth transition, no loading spinner

### Test 2: RISK Response
**Goal:** Verify streaming works for risky products

1. [ ] Select profile: DIABETIC
2. [ ] Scan image of: Candy bar, soda, or high-sugar product
3. [ ] **Observe:**
   - [ ] Reasoning terminal appears immediately
   - [ ] Type switches to RISK
   - [ ] Red alert icon appears
   - [ ] Headline streams in
   - [ ] First risk item animates in
   - [ ] Second risk item animates in (staggered)
   - [ ] Each item has severity badge
4. [ ] **Expected:** Progressive disclosure, items appear one by one

### Test 3: DECISION Response
**Goal:** Verify streaming works for ambiguous cases

1. [ ] Select profile: VEGAN
2. [ ] Scan image of: Product with "Natural Flavors" or ambiguous ingredients
3. [ ] **Observe:**
   - [ ] Reasoning terminal appears
   - [ ] Type switches to DECISION
   - [ ] Question mark icon appears
   - [ ] Question text streams in
   - [ ] Two option buttons appear
   - [ ] Buttons are disabled until complete
4. [ ] Click "Strict" or "Flexible"
5. [ ] **Expected:** New analysis starts with user's choice

### Test 4: UNCERTAIN Response
**Goal:** Verify error handling works

1. [ ] Select any profile
2. [ ] Scan image of: Blurry label or non-food item
3. [ ] **Observe:**
   - [ ] Reasoning terminal appears
   - [ ] Type switches to UNCERTAIN
   - [ ] Gray alert icon appears
   - [ ] Error message streams in
   - [ ] Helpful tips displayed
4. [ ] **Expected:** Graceful error handling, no crash

## Edge Cases

### Test 5: Network Error
**Goal:** Verify error handling for network issues

1. [ ] Disconnect internet
2. [ ] Try to scan
3. [ ] **Expected:** UNCERTAIN response with error message

### Test 6: Invalid API Key
**Goal:** Verify API key validation

1. [ ] Set `GOOGLE_GENERATIVE_AI_API_KEY` to invalid value
2. [ ] Restart dev server
3. [ ] Try to scan
4. [ ] **Expected:** UNCERTAIN response about invalid API key

### Test 7: Rapid Scanning
**Goal:** Verify no race conditions

1. [ ] Scan first image
2. [ ] Immediately scan second image (before first completes)
3. [ ] **Expected:** Second scan cancels first, no overlap

### Test 8: Profile Switching
**Goal:** Verify profile context works

1. [ ] Scan same product as DIABETIC
2. [ ] Note result (e.g., RISK for sugar)
3. [ ] Go back, select VEGAN
4. [ ] Scan same product
5. [ ] **Expected:** Different analysis based on profile

## Performance Tests

### Test 9: Time to First Feedback
**Goal:** Measure perceived speed

1. [ ] Use stopwatch
2. [ ] Tap scan button
3. [ ] Measure time until reasoning terminal appears
4. [ ] **Expected:** < 0.5 seconds

### Test 10: Time to Complete
**Goal:** Measure total analysis time

1. [ ] Use stopwatch
2. [ ] Tap scan button
3. [ ] Measure time until all content loaded
4. [ ] **Expected:** 2-4 seconds (similar to before, but feels faster)

## UI/UX Tests

### Test 11: Animation Smoothness
**Goal:** Verify animations are smooth

1. [ ] Scan any product
2. [ ] **Observe:**
   - [ ] No janky animations
   - [ ] Smooth transitions between states
   - [ ] No flash of empty content
   - [ ] No layout shifts

### Test 12: Mobile Responsiveness
**Goal:** Verify mobile layout works

1. [ ] Open browser dev tools
2. [ ] Switch to mobile view (iPhone 14 Pro)
3. [ ] Test all flows
4. [ ] **Expected:** Perfect mobile layout, no overflow

### Test 13: Back Button
**Goal:** Verify navigation works

1. [ ] Complete a scan
2. [ ] Click back button (top-left)
3. [ ] **Expected:** Returns to profile selection

### Test 14: Scan Another
**Goal:** Verify reset works

1. [ ] Complete a scan
2. [ ] Click "Scan Another" button
3. [ ] **Expected:** Returns to profile selection

## Streaming-Specific Tests

### Test 15: Partial Data Handling
**Goal:** Verify components handle incomplete data

1. [ ] Open browser dev tools → Network tab
2. [ ] Throttle to "Slow 3G"
3. [ ] Scan product
4. [ ] **Observe:**
   - [ ] Components render with partial data
   - [ ] Skeletons show for missing content
   - [ ] No crashes or errors
   - [ ] Content fills in as it arrives

### Test 16: Type Switching
**Goal:** Verify discriminated union routing works

1. [ ] Scan product
2. [ ] **Observe:**
   - [ ] Starts with ReasoningTerminal (type undefined)
   - [ ] Switches to correct component when type arrives
   - [ ] No flash of wrong component
   - [ ] Smooth transition

### Test 17: Array Streaming
**Goal:** Verify arrays populate progressively

1. [ ] Scan product that will return RISK
2. [ ] **Observe:**
   - [ ] RiskHierarchy shows skeleton initially
   - [ ] First item appears
   - [ ] Second item appears (staggered animation)
   - [ ] Each item has entrance animation

## Browser Compatibility

### Test 18: Chrome
- [ ] All tests pass in Chrome

### Test 19: Firefox
- [ ] All tests pass in Firefox

### Test 20: Safari
- [ ] All tests pass in Safari

### Test 21: Mobile Safari (iOS)
- [ ] All tests pass on iPhone

### Test 22: Chrome Mobile (Android)
- [ ] All tests pass on Android

## Console Tests

### Test 23: No Errors
**Goal:** Verify clean console

1. [ ] Open browser console
2. [ ] Run all tests
3. [ ] **Expected:** No errors (warnings OK)

### Test 24: Streaming Logs
**Goal:** Verify streaming is actually happening

1. [ ] Open browser console
2. [ ] Scan product
3. [ ] **Observe:**
   - [ ] Network request shows streaming response
   - [ ] Console logs show progressive updates
   - [ ] "Streaming complete" log appears

## Production Build Tests

### Test 25: Build Success
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors (warnings OK)

### Test 26: Production Mode
```bash
npm run build
npm run start
```
- [ ] App runs in production mode
- [ ] Streaming still works
- [ ] Performance is good

## Regression Tests

### Test 27: Existing Features
**Goal:** Verify nothing broke

- [ ] Profile selection works
- [ ] Camera view works
- [ ] URL persistence works (?mode=DIABETIC)
- [ ] Animations work
- [ ] Glassmorphic UI intact
- [ ] Mobile container (430px) works
- [ ] Dynamic Island visible
- [ ] Home indicator visible

## Documentation Tests

### Test 28: README Accuracy
- [ ] README instructions work
- [ ] Tech stack is accurate
- [ ] Getting started works

### Test 29: Code Comments
- [ ] Code is well-commented
- [ ] Complex logic explained
- [ ] Type definitions clear

## Final Checklist

### Before Deployment
- [ ] All tests pass
- [ ] No console errors
- [ ] Production build works
- [ ] Environment variables documented
- [ ] API key is secure (not in code)
- [ ] Mobile tested on real device
- [ ] Performance is acceptable

### After Deployment
- [ ] Test on production URL
- [ ] Monitor error logs
- [ ] Check analytics
- [ ] Gather user feedback

---

## Test Results Template

```
Date: ___________
Tester: ___________

SAFE Response: ✅ / ❌
RISK Response: ✅ / ❌
DECISION Response: ✅ / ❌
UNCERTAIN Response: ✅ / ❌

Network Error: ✅ / ❌
Invalid API Key: ✅ / ❌
Rapid Scanning: ✅ / ❌
Profile Switching: ✅ / ❌

Time to First Feedback: _____ ms
Time to Complete: _____ s

Animation Smoothness: ✅ / ❌
Mobile Responsiveness: ✅ / ❌
Back Button: ✅ / ❌
Scan Another: ✅ / ❌

Partial Data Handling: ✅ / ❌
Type Switching: ✅ / ❌
Array Streaming: ✅ / ❌

Chrome: ✅ / ❌
Firefox: ✅ / ❌
Safari: ✅ / ❌
Mobile Safari: ✅ / ❌
Chrome Mobile: ✅ / ❌

No Console Errors: ✅ / ❌
Streaming Logs: ✅ / ❌

Build Success: ✅ / ❌
Production Mode: ✅ / ❌

Overall: ✅ / ❌

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Priority Tests:** 1-4, 9-10, 15-17, 23-24, 25

**Nice-to-Have Tests:** 5-8, 11-14, 18-22, 26-29

**Start Here:** Test 1 (SAFE Response) - This will verify the entire streaming pipeline works!
