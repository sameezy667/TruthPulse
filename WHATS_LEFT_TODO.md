# What's Left To Do

## Current Status: 65% Complete

### ✅ What You Have (Working)
1. **Core App Structure**
   - Mobile-first design (430px container)
   - Profile selection (DIABETIC/VEGAN/PALEO)
   - Camera integration (Capacitor)
   - Glassmorphic UI
   - Smooth animations

2. **AI Integration**
   - Gemini 2.5 Flash Lite API
   - Context-aware prompts (profile-specific)
   - Schema validation (Zod)
   - Error handling
   - 4 response types (SAFE/RISK/DECISION/UNCERTAIN)

3. **Generative UI**
   - SafeCard component
   - RiskHierarchy component
   - DecisionFork component
   - UncertainCard component
   - Dynamic routing based on AI output

4. **Mobile App**
   - Capacitor setup
   - Android build ready
   - Camera permissions
   - Native app structure

---

## 🚧 What's Missing (35%)

### 1. OpenFoodFacts Integration (10%)
**Your Blueprint Said:**
> "Download a subset of 50 products (JSON) to your local repo. This guarantees your demo never fails due to network or scraping blocks."

**What's Needed:**
- [ ] Download OpenFoodFacts dataset (50 products)
- [ ] Create local JSON database
- [ ] Add barcode scanning
- [ ] Fallback logic when OCR fails
- [ ] Enrich AI responses with nutritional data

**Why Important:**
- Demo reliability (no network dependency)
- Richer data (nutrition facts, allergens)
- Faster responses (local lookup)
- Backup when AI fails

**Implementation:**
```typescript
// lib/openfoodfacts.ts
export const PRODUCTS_DB = {
  '5449000000996': { // Coca-Cola barcode
    name: 'Coca-Cola',
    ingredients: ['Water', 'Sugar', 'Carbon Dioxide', ...],
    nutrition: { sugar: 10.6, calories: 42, ... },
    allergens: [],
  },
  // ... 49 more products
};

// Use in API route as fallback
if (barcodeDetected) {
  const product = PRODUCTS_DB[barcode];
  if (product) {
    // Use local data instead of AI
  }
}
```

---

### 2. Real Streaming (10%)
**Current:** Blocking fetch (3-5 second wait)
**Desired:** Progressive UI updates

**Options:**

**Option A: Switch to OpenAI (Recommended)**
```bash
npm install @ai-sdk/openai
```
```typescript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';

const result = streamObject({
  model: openai('gpt-4o'),
  schema: AIResponseSchema,
  // ... works perfectly with streaming
});
```
**Pros:** Full streaming, better schema support
**Cons:** Costs money (~$0.01 per request)

**Option B: Keep Gemini (Current)**
- No streaming (Gemini doesn't support complex schemas)
- Free tier available
- Good enough for hackathon

**Decision:** Keep Gemini for now, switch to OpenAI if budget allows

---

### 3. Enhanced Uncertainty Handling (5%)
**Your Blueprint Said:**
> "If an ingredient like 'Natural Flavors' is ambiguous, the AI generates a 'Decision Fork' UI."

**What's Needed:**
- [ ] Confidence scores for each ingredient
- [ ] Probability meters (e.g., "70% likely contains dairy")
- [ ] More granular DECISION triggers
- [ ] User preference learning

**Implementation:**
```typescript
// Update schema to include confidence
export const RiskItemSchema = z.object({
  ingredient: z.string(),
  severity: z.enum(['high', 'med', 'low']),
  reason: z.string(),
  confidence: z.number().min(0).max(1), // NEW
});

// Show in UI
{risk.confidence < 0.7 && (
  <div className="text-amber-400">
    ⚠️ {Math.round(risk.confidence * 100)}% confident
  </div>
)}
```

---

### 4. Layout Control by AI (5%)
**Your Blueprint Said:**
> "Let AI return layout instructions, not just data"

**Current:** Fixed components (SafeCard, RiskHierarchy, etc.)
**Desired:** AI decides chart vs list vs table

**What's Needed:**
- [ ] Add layout field to schema
- [ ] Create chart components (bar, line, pie)
- [ ] Create comparison table component
- [ ] Let AI choose visualization

**Implementation:**
```typescript
// Update schema
export const RiskResponseSchema = z.object({
  type: z.literal('RISK'),
  headline: z.string(),
  layout: z.enum(['list', 'chart', 'table']), // NEW
  riskHierarchy: z.array(RiskItemSchema),
});

// Render based on layout
{data.layout === 'chart' && <RiskChart data={data.riskHierarchy} />}
{data.layout === 'list' && <RiskList data={data.riskHierarchy} />}
{data.layout === 'table' && <RiskTable data={data.riskHierarchy} />}
```

---

### 5. User Preference Learning (3%)
**What's Needed:**
- [ ] Save user decisions (Strict vs Flexible)
- [ ] Store in localStorage or database
- [ ] Use in future prompts
- [ ] Show "Based on your preferences" hints

**Implementation:**
```typescript
// lib/preferences.ts
export function saveDecision(ingredient: string, choice: 'Strict' | 'Flexible') {
  const prefs = JSON.parse(localStorage.getItem('preferences') || '{}');
  prefs[ingredient] = choice;
  localStorage.setItem('preferences', JSON.stringify(prefs));
}

// Use in prompt
const userPreferences = getUserPreferences();
const prompt = `
User has previously chosen:
${Object.entries(userPreferences).map(([ing, choice]) => 
  `- ${ing}: ${choice}`
).join('\n')}

Use these preferences when analyzing ambiguous ingredients.
`;
```

---

### 6. Testing & Polish (2%)
**What's Needed:**
- [ ] Test all 4 response types with real images
- [ ] Test all 3 profiles (DIABETIC/VEGAN/PALEO)
- [ ] Test on real mobile device
- [ ] Fix any UI bugs
- [ ] Add loading states
- [ ] Add success animations
- [ ] Add haptic feedback (mobile)

---

## 📊 Priority Ranking

### Must-Have (For Hackathon Demo)
1. **OpenFoodFacts Integration** (10%) - Makes demo reliable
2. **Testing & Polish** (2%) - Makes demo smooth
3. **Enhanced Uncertainty** (3%) - Shows AI intelligence

**Total: 15% → Gets you to 80%**

### Nice-to-Have (If Time Permits)
4. **Real Streaming** (10%) - Better UX but costs money
5. **Layout Control** (5%) - Cool but not essential
6. **Preference Learning** (3%) - Nice touch

**Total: 18% → Gets you to 98%**

---

## 🎯 Recommended Next Steps

### Phase 1: Make Demo Bulletproof (2-3 hours)
1. **Add OpenFoodFacts data** (1 hour)
   - Download 50 product JSONs
   - Create local database
   - Add barcode scanning
   - Implement fallback logic

2. **Test thoroughly** (1 hour)
   - Test all profiles
   - Test all response types
   - Test on mobile device
   - Fix bugs

3. **Polish UI** (30 min)
   - Add loading states
   - Add success animations
   - Add error recovery

### Phase 2: Enhance Intelligence (1-2 hours)
4. **Add confidence scores** (1 hour)
   - Update schema
   - Update prompts
   - Update UI components

5. **Add preference learning** (30 min)
   - Save decisions
   - Use in prompts

### Phase 3: Optional Upgrades (If Time)
6. **Switch to OpenAI** (30 min)
   - Get API key
   - Update code
   - Test streaming

7. **Add layout control** (1 hour)
   - Create chart components
   - Update schema
   - Update prompts

---

## 📝 Quick Wins (Do These Now)

### 1. Update README (5 min)
- Add setup instructions
- Add API key setup
- Add demo video link

### 2. Add Environment Variables Template (2 min)
```bash
# .env.example
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

### 3. Add Demo Images (10 min)
- Add 5-10 test food label images to `/public/demo`
- Document which profile works best with each

### 4. Add Error Messages (5 min)
- Better error messages for common issues
- "API key missing" → "Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local"
- "Rate limit" → "Wait 60 seconds or upgrade to paid tier"

---

## 🏆 What Makes This AI-Native

### You Already Have:
✅ Context-aware (profile-specific analysis)
✅ Generative UI (interface changes based on AI output)
✅ Dynamic routing (SAFE/RISK/DECISION/UNCERTAIN)
✅ Schema validation (type-safe AI responses)

### To Get to 95%:
- OpenFoodFacts integration (data enrichment)
- Confidence scores (honest uncertainty)
- Preference learning (personalization)

### To Get to 100%:
- Real streaming (progressive disclosure)
- Layout control (AI controls visualization)
- Conversational refinement (follow-up questions)

---

## 🎬 Demo Script (For Presentation)

1. **Show Profile Selection**
   - "First, tell Sach.ai about your dietary needs"
   - Select DIABETIC

2. **Scan Product**
   - "Now scan any food label"
   - Show candy bar

3. **Watch Analysis**
   - "Sach.ai analyzes ingredients in real-time"
   - Show reasoning terminal

4. **Show Results**
   - "It highlights exactly what matters to YOU"
   - Show risk hierarchy with sugar warnings

5. **Show Different Profile**
   - "Same product, different profile"
   - Switch to VEGAN
   - Show different analysis (animal products)

6. **Show Decision Fork**
   - "When uncertain, it asks YOU"
   - Show ambiguous ingredient
   - Choose Strict/Flexible

7. **Highlight AI-Native**
   - "The interface changes based on what the AI finds"
   - "Not a chatbot - it's a dynamic interface"

---

## 💡 Bottom Line

**You're at 65% complete.**

**To win the hackathon:**
- Add OpenFoodFacts (10%) → 75%
- Test & polish (5%) → 80%
- Add confidence scores (3%) → 83%

**That's 3-4 hours of work to get to 83% and have a solid demo.**

The remaining 17% (streaming, layout control, etc.) is nice-to-have but not essential for winning.

**Focus on making what you have bulletproof, not adding more features.**
