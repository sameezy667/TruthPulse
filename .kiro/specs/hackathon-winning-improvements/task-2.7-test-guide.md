# Task 2.7: Generative UI Testing Guide

## Overview
This guide provides instructions for testing the Generative UI implementation with real products of varying complexity.

## Test Scenarios

### Scenario 1: Simple Product (1-3 ingredients)
**Expected Behavior:**
- Minimal, focused UI
- Badge component for safe products
- Single summary text
- No chart visualization
- Quick, clean presentation

**Test Products:**
- Plain water
- Single-ingredient items (e.g., "100% Apple Juice")
- Simple snacks with 2-3 ingredients

**Verification Steps:**
1. Open the app at http://localhost:3000
2. Select a dietary profile (e.g., DIABETIC)
3. Scan or upload a simple product image
4. Verify:
   - ✓ Reasoning terminal appears first
   - ✓ UI transitions smoothly to result
   - ✓ Only essential components are shown (badge + text)
   - ✓ No chart component appears
   - ✓ Layout is clean and uncluttered

---

### Scenario 2: Medium Product (4-8 ingredients)
**Expected Behavior:**
- Structured card-based layout
- Clear categorization of ingredients
- Individual risk cards for each concerning ingredient
- No chart visualization (reserved for complex products)
- Staggered animation of risk items

**Test Products:**
- Granola bars
- Yogurt with multiple ingredients
- Packaged snacks with 5-7 ingredients

**Verification Steps:**
1. Scan a medium-complexity product
2. Verify:
   - ✓ Headline text appears first
   - ✓ Risk cards appear one by one with stagger effect
   - ✓ Each card shows ingredient name and reason
   - ✓ Severity is visually indicated (high vs med)
   - ✓ No chart component appears
   - ✓ Animation is smooth (100ms stagger)

---

### Scenario 3: Complex Product (9+ ingredients)
**Expected Behavior:**
- Rich, layered information architecture
- Chart visualization for risk overview
- Individual risk cards for detailed analysis
- Hierarchical presentation
- Smooth progressive disclosure

**Test Products:**
- Processed foods with 10+ ingredients
- Protein bars with extensive ingredient lists
- Packaged meals with complex formulations

**Verification Steps:**
1. Scan a complex product (9+ ingredients)
2. Verify:
   - ✓ Headline text appears
   - ✓ Chart component appears showing risk overview
   - ✓ Chart displays all ingredients with severity indicators
   - ✓ Individual risk cards follow the chart
   - ✓ Cards are staggered with smooth animation
   - ✓ UI feels organized despite complexity
   - ✓ No performance issues with many components

---

## Cross-Scenario Verification

### Animation Quality
- [ ] All components fade in smoothly (opacity 0 → 1)
- [ ] Components slide up gently (y: 20 → 0)
- [ ] Stagger delay is consistent (100ms per item)
- [ ] No jank or stuttering during animation
- [ ] Transitions feel natural and polished

### Responsive Behavior
- [ ] UI adapts to different screen sizes
- [ ] Components stack properly on mobile
- [ ] Touch targets are appropriately sized
- [ ] No horizontal scrolling
- [ ] Safe areas are respected (notch, home indicator)

### Error Handling
- [ ] Graceful fallback if UI generation fails
- [ ] Error boundaries catch component rendering errors
- [ ] User sees helpful error message, not crash
- [ ] Can reset and try again

### Performance
- [ ] First component appears within 500ms
- [ ] Complete UI renders within 4 seconds
- [ ] No memory leaks during streaming
- [ ] Smooth 60fps animation
- [ ] No console errors or warnings

---

## Testing Checklist

### Pre-Test Setup
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser is open to http://localhost:3000
- [ ] Console is open for error monitoring
- [ ] Network tab is open to verify streaming

### During Testing
- [ ] Test each scenario at least twice
- [ ] Try different dietary profiles
- [ ] Test with both clear and unclear images
- [ ] Monitor console for errors
- [ ] Check network requests for proper streaming

### Post-Test Validation
- [ ] No console errors
- [ ] No memory leaks
- [ ] All animations smooth
- [ ] UI adapts correctly to complexity
- [ ] User experience feels polished

---

## Known Issues & Fixes

### Issue: Chart not appearing for 9+ ingredients
**Symptom:** Complex products don't show chart visualization
**Fix:** Check `analyzeComplexity` function in `generative-ui-engine.ts`
**Verification:** Ensure `ingredientCount >= 9` condition is met

### Issue: Stagger animation too fast/slow
**Symptom:** Components appear too quickly or slowly
**Fix:** Adjust delay in `ComponentWrapper` (currently 100ms)
**Verification:** Animation should feel natural, not rushed

### Issue: Components not streaming progressively
**Symptom:** All components appear at once
**Fix:** Verify `generateUI` async generator is yielding properly
**Verification:** Components should appear one by one

---

## Success Criteria

Task 2.7 is complete when:
- ✅ Simple products show minimal UI (no chart)
- ✅ Medium products show structured cards (no chart)
- ✅ Complex products show chart + cards
- ✅ All animations are smooth and polished
- ✅ No console errors during testing
- ✅ UI adapts appropriately to product complexity
- ✅ Performance is acceptable (< 4s total render)

---

## Next Steps

After completing Task 2.7:
1. Document any issues found
2. Fix critical bugs immediately
3. Note nice-to-have improvements for later
4. Proceed to Phase 3 (Intent Inference) if time permits
5. Otherwise, move to Final Tasks (Polish & Demo)

---

## Test Results Log

### Test Run 1: [Date/Time]
**Tester:** [Name]
**Environment:** [Browser, OS]

**Simple Product Test:**
- Product: _______________
- Result: ☐ Pass ☐ Fail
- Notes: _______________

**Medium Product Test:**
- Product: _______________
- Result: ☐ Pass ☐ Fail
- Notes: _______________

**Complex Product Test:**
- Product: _______________
- Result: ☐ Pass ☐ Fail
- Notes: _______________

**Overall Result:** ☐ Pass ☐ Fail
**Issues Found:** _______________
**Action Items:** _______________

