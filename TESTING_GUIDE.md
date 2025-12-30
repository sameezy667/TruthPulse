# Testing Scenarios

## How to Test the Logic Layer

### Setup
1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Select a user profile (Diabetic, Vegan, or Paleo)

---

## Scenario 1: Diabetic + High Sugar Product

### Steps:
1. Select **"Diabetic"** profile
2. Tap **once** in the top-right corner of the camera screen
3. Watch reasoning terminal logs
4. View result card

### Expected Result:
- **Title**: "Critical Danger"
- **Status**: Red danger indicator
- **Score**: 18 / 100
- **Description**: "Bio-hazard detected. Contains 12g of sugar per serving..."
- **Findings**:
  - 12g Sugar Per Serving
  - Glycemic Load: 30
  - Fast-Acting Carbohydrates
  - Insulin Response: Critical
- **Metrics**:
  - Sugar Content: 80
  - Insulin Spike Risk: 30
  - Glycemic Index: 92

### Why This Happens:
- Granola bar contains 12g sugar (threshold: >8g)
- Honey + brown rice syrup = fast-acting carbs
- High glycemic load triggers insulin spike warning

---

## Scenario 2: Diabetic + Clean Product

### Steps:
1. Select **"Diabetic"** profile
2. Tap **twice** in the top-right corner (double-tap quickly)
3. Watch reasoning terminal
4. View result

### Expected Result:
- **Title**: "Diabetic Approved"
- **Status**: Green safe indicator
- **Score**: 94 / 100
- **Description**: "Excellent choice. Low sugar content (1g)..."
- **Findings**:
  - Low Sugar: 1g
  - Stable Glycemic Response
  - High Protein Content
  - Safe for Daily Consumption

### Why This Happens:
- Almond butter has only 1g sugar
- Single ingredient = no hidden sugars
- High fat/protein = stable blood glucose

---

## Scenario 3: Vegan + Animal Product

### Steps:
1. Select **"Vegan"** profile
2. Tap **once** (Granola Bar with honey)
3. View result

### Expected Result:
- **Title**: "Non-Vegan Product"
- **Status**: Red danger indicator
- **Score**: 18 / 100
- **Description**: "Contains 1 animal-derived ingredient..."
- **Findings**:
  - Contains: Honey

### Why This Happens:
- Honey is animal-derived (bee product)
- Detected by vegan analysis filter

---

## Scenario 4: Vegan + Plant-Based Product

### Steps:
1. Select **"Vegan"** profile
2. Tap **twice** (Almond Butter)
3. View result

### Expected Result:
- **Title**: "Vegan Certified"
- **Status**: Green safe indicator
- **Score**: 94 / 100
- **Description**: "100% aligned with your ethical profile..."
- **Findings**:
  - Plant-Based Formula
  - No Animal Derivatives
  - Cruelty-Free Production
  - Ethically Sourced

### Why This Happens:
- Only ingredient: Raw almonds (plant-based)
- No honey, whey, milk, eggs, gelatin detected

---

## Scenario 5: Vegan + Whey Protein

### Steps:
1. Select **"Vegan"** profile
2. Tap **three times** (Protein Shake)
3. View result

### Expected Result:
- **Title**: "Non-Vegan Product"
- **Status**: Red danger indicator
- **Score**: 18 / 100
- **Findings**:
  - Contains: Whey Protein Isolate
  - Contains: Whey Protein Concentrate

### Why This Happens:
- Whey is milk-derived protein
- Multiple whey ingredients listed

---

## Scenario 6: Paleo + Grain Product

### Steps:
1. Select **"Paleo"** profile
2. Tap **once** (Granola Bar with oats + rice syrup)
3. View result

### Expected Result:
- **Title**: "Not Paleo Friendly"
- **Status**: Red danger indicator
- **Score**: 18 / 100
- **Description**: "Contains multiple processed ingredients and grains..."
- **Findings**:
  - Non-Paleo: Organic Oats
  - Non-Paleo: Brown Rice Syrup
  - Non-Paleo: Cane Sugar

### Why This Happens:
- Oats = grain (forbidden in paleo)
- Rice = grain (forbidden)
- Cane sugar = refined sugar (forbidden)
- 3 violations > threshold (2)

---

## Scenario 7: Paleo + Clean Product

### Steps:
1. Select **"Paleo"** profile
2. Tap **twice** (Almond Butter)
3. View result

### Expected Result:
- **Title**: "Paleo Approved"
- **Status**: Green safe indicator
- **Score**: 94 / 100
- **Description**: "All ingredients align with ancestral eating patterns..."
- **Findings**:
  - Whole Food Based
  - No Grains or Legumes
  - Unprocessed Ingredients
  - Evolutionary Aligned

### Why This Happens:
- Almonds = paleo-approved nut
- No grains, legumes, or processed ingredients
- Single ingredient = unprocessed

---

## Scenario 8: Paleo + Protein Shake (Trade-off)

### Steps:
1. Select **"Paleo"** profile
2. Tap **three times** (Protein Shake)
3. View result

### Expected Result:
- **Title**: "Trade-off Required"
- **Status**: Yellow tradeoff indicator
- **Score**: 68 / 100
- **Description**: "High in protein (24g) but contains trace soy lecithin..."
- **Pros**:
  - High Protein: 24g
  - Healthy Fats: 1.5g
  - Nutrient Dense
- **Cons**:
  - Soy Lecithin (legume derivative)
- **Details**:
  - Protein: 24g
  - Fats: 1.5g
  - Carbs: 3g

### Why This Happens:
- Whey protein = acceptable for some paleo followers
- Soy lecithin = legume (technically non-paleo)
- High protein value = trade-off situation
- Only 1 violation (< 2 threshold)

---

## Edge Case Testing

### Test A: Rapid Tapping
**Action**: Tap 5+ times rapidly  
**Expected**: Should register 3 taps max, trigger protein shake

### Test B: Profile Switching
**Action**: Complete scan → Go back → Switch profile → Scan again  
**Expected**: New analysis based on new profile

### Test C: URL Persistence
**Action**: Select profile → Refresh page  
**Expected**: Profile persists via ?mode=diabetic query param

### Test D: Animation Timing
**Action**: Watch full reasoning terminal  
**Expected**: 
- Logs appear every 250ms
- Total runtime: ~2.5s
- Smooth transition to result

---

## Debugging Tips

### Check Selected Product
Add to `CameraView.tsx`:
```typescript
console.log('Scanning product:', productId);
```

### Check Analysis Result
Add to `app/page.tsx`:
```typescript
console.log('Analysis result:', analysis);
```

### Force Specific Product
Edit `CameraView.tsx` line 67:
```typescript
handleScanTrigger('protein-shake') // Force protein shake
```

### Skip Reasoning Animation
Edit `lib/data.ts` line 131:
```typescript
await new Promise((resolve) => setTimeout(resolve, 0)); // Instant
```

---

## Expected Terminal Output

### Diabetic Profile
```
> INITIALIZING_NEURAL_CORE...
> ACCESSING_VISUAL_BUFFER...
> OCR_ENGINE: ISOLATING_INGREDIENTS...
> DB_QUERY: FDA_TOXICOLOGY_DATABASE_V12
> CROSS_REFERENCING_USER_CONTEXT...
> SCANNING: HIDDEN_SUGAR_PROFILES...
> CALC: GLYCEMIC_LOAD_PROJECTION...
> WARNING: INSULIN_SPIKE_DETECTED...
> CROSS_REFERENCING: ADA_GUIDELINES...
> ANALYZING: MALTODEXTRIN_LEVELS...
> VERDICT: HIGH_RISK_AGENT
```

### Vegan Profile
```
> INITIALIZING_NEURAL_CORE...
> ACCESSING_VISUAL_BUFFER...
> OCR_ENGINE: ISOLATING_INGREDIENTS...
> DB_QUERY: FDA_TOXICOLOGY_DATABASE_V12
> CROSS_REFERENCING_USER_CONTEXT...
> SCANNING: ANIMAL_BYPRODUCTS...
> ANALYZING: ETHICAL_COMPLIANCE_RATIO...
> CHECKING: BONE_CHAR_IN_SUGAR...
> VERIFYING: WHEY_PROTEIN_ABSENCE...
> DB: PLANT_BASED_VERIFICATION_COMPLETE
> VERDICT: SAFE_CONSUMPTION
```

### Paleo Profile
```
> INITIALIZING_NEURAL_CORE...
> ACCESSING_VISUAL_BUFFER...
> OCR_ENGINE: ISOLATING_INGREDIENTS...
> DB_QUERY: FDA_TOXICOLOGY_DATABASE_V12
> CROSS_REFERENCING_USER_CONTEXT...
> SCANNING: PROCESSED_GRAINS...
> CHECKING: EVOLUTIONARY_BIOLOGY_ALIGNMENT...
> DETECTING: SEED_OILS...
> ANALYZING: NUTRIENT_DENSITY_TRADE-OFFS...
> VERDICT: CONDITIONAL_APPROVAL
```

---

## Success Criteria

### ✅ Functional Requirements
- [ ] Profile selection updates URL param
- [ ] Hidden dev menu triggers product selection
- [ ] Reasoning terminal displays profile-specific logs
- [ ] Analysis completes in 2.5s
- [ ] Result card shows correct status color
- [ ] Score matches status (safe: 94, danger: 18, tradeoff: 68)
- [ ] Findings array displays in expandable list
- [ ] Back button returns to setup
- [ ] No console errors

### ✅ Visual Requirements
- [ ] Smooth transitions between steps
- [ ] Terminal logs appear with typewriter effect
- [ ] Score indicator animates to correct position
- [ ] Status pill shows correct color/label
- [ ] Glassmorphic effects visible
- [ ] Green gradient background animates

### ✅ Data Integrity
- [ ] AnalysisResult matches expected schema
- [ ] All 3 products return different results
- [ ] Profile logic correctly filters ingredients
- [ ] Metrics array populated for danger cases
- [ ] Pros/cons arrays populated for tradeoff cases

---

## Known Issues

### None! 🎉

All TypeScript compilation errors resolved.  
All components properly typed.  
All data flows connected.

---

## Demo Script (30 seconds)

1. "I'm diabetic, let me scan this granola bar..."
2. [Tap once → Red danger result]
3. "Wow, 12g of sugar! Let me try this almond butter instead..."
4. [Go back → Tap twice → Green safe result]
5. "Perfect! Only 1g of sugar and pure almonds."

**Result**: User understands the value prop instantly.
