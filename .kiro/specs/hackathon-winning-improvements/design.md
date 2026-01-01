# Design Document: Hackathon Winning Improvements

## Overview

This design transforms Sach.ai from a template-based food analyzer into a true AI-native experience with streaming reasoning, generative UI, and intent inference. The implementation is divided into 3 phases targeting a 92-95/100 hackathon score.

## Architecture Changes

### Current Architecture (70/100)
```
User → Profile Form → Camera → [Blocking API Call] → Static Template → Result
```

### Target Architecture (92-95/100)
```
User → Camera → [Streaming API] → [AI Generates UI] → Progressive Result
                      ↓
              [Intent Inference Engine]
                      ↓
              [Adaptive Reasoning]
```

## Phase 1: Real Streaming Implementation

### Problem Statement
Current implementation uses `generateText` (blocking) instead of `streamObject` (streaming).
Tests expect streaming but code doesn't implement it.

### Solution Design

#### 1.1 API Route Refactor (`app/api/analyze/route.ts`)

**Current (Blocking):**
```typescript
const result = await generateText({
  model: google('gemini-2.5-flash-lite'),
  messages: [...]
});
// Parse JSON manually
const parsed = JSON.parse(result.text);
return Response.json(parsed);
```

**Target (Streaming):**
```typescript
const result = streamObject({
  model: google('gemini-2.5-flash-lite'),
  schema: AIResponseSchema,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: systemPrompt },
        { type: 'image', image: base64Data }
      ]
    }
  ]
});

return result.toDataStreamResponse();
```

**Key Changes:**
- Replace `generateText` with `streamObject`
- Pass `AIResponseSchema` for type-safe streaming
- Return `toDataStreamResponse()` for streaming response
- Remove manual JSON parsing (handled by SDK)

#### 1.2 Frontend Hook Integration (`app/page.tsx`)

**Current (Manual Fetch):**
```typescript
const [analysisResult, setAnalysisResult] = useState<any>(null);
const [isLoading, setIsLoading] = useState(false);

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({ imageBase64, userProfile })
});
const data = await response.json();
setAnalysisResult(data);
```

**Target (Streaming Hook):**
```typescript
import { experimental_useObject as useObject } from 'ai/react';

const { object, submit, isLoading, error } = useObject({
  api: '/api/analyze',
  schema: AIResponseSchema
});

const handleScan = async (imageBase64: string) => {
  submit({ imageBase64, userProfile: profile });
};
```

**Key Changes:**
- Import `useObject` hook from `ai/react`
- Remove manual state management
- Use hook's `object` for streaming data
- Use hook's `isLoading` and `error` states

#### 1.3 Generative Renderer Updates

**Component: `components/results/GenerativeRenderer.tsx`**

Already exists but needs to be connected to streaming data:

```typescript
interface GenerativeRendererProps {
  data: DeepPartial<AIResponse>; // Handles partial streaming data
  onReset: () => void;
  onDecision?: (choice: 'Strict' | 'Flexible') => void;
  profile: UserProfile;
  productId: string;
}

export default function GenerativeRenderer({ data, ...props }) {
  // Show reasoning terminal while streaming
  if (!data?.type) {
    return <ReasoningTerminal profile={profile} productId={productId} />;
  }
  
  // Switch on discriminated union
  switch (data.type) {
    case 'SAFE': return <SafeCard data={data} {...props} />;
    case 'RISK': return <RiskHierarchy data={data} {...props} />;
    case 'DECISION': return <DecisionFork data={data} {...props} />;
    case 'UNCERTAIN': return <UncertainCard data={data} {...props} />;
  }
}
```

**Key Features:**
- Accepts `DeepPartial<AIResponse>` for partial data
- Shows reasoning terminal while `type` is undefined
- Switches to appropriate card when type arrives
- Handles progressive data updates

#### 1.4 Component Updates for Partial Data

All result components need to handle partial streaming data:

**SafeCard:**
```typescript
interface SafeCardProps {
  data: DeepPartial<SafeResponse>;
  onReset: () => void;
}

// Show skeleton while summary is undefined
{data.summary ? (
  <p>{data.summary}</p>
) : (
  <TextSkeleton />
)}
```

**RiskHierarchy:**
```typescript
interface RiskHierarchyProps {
  data: DeepPartial<RiskResponse>;
  onReset: () => void;
}

// Animate items as they stream in
<AnimatePresence>
  {data.riskHierarchy?.map((item, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
    >
      <RiskItem {...item} />
    </motion.div>
  ))}
</AnimatePresence>
```

### Expected Behavior After Phase 1

1. User scans product
2. Reasoning terminal appears immediately
3. AI reasoning streams in real-time (type is undefined)
4. When `type` field arrives, appropriate card appears
5. Card content fills in progressively as data streams
6. Smooth animations between states

**Score Impact: 70 → 85/100**

## Phase 2: True Generative UI

### Problem Statement
Current implementation uses predefined templates (SafeCard, RiskHierarchy, etc.).
Hackathon requires AI to generate UI components dynamically.

### Solution Design

#### 2.1 Streaming UI Architecture

**Concept:**
Instead of returning JSON that maps to templates, the AI generates React components directly.

**Implementation Approach:**

**Option A: Vercel AI SDK `streamUI` (Recommended)**
```typescript
import { streamUI } from 'ai/rsc';

const result = await streamUI({
  model: google('gemini-2.5-flash-lite'),
  messages: [...],
  text: ({ content, done }) => {
    if (!done) {
      return <ReasoningDisplay text={content} />;
    }
  },
  tools: {
    displaySafeProduct: {
      description: 'Show that a product is safe for the user',
      parameters: z.object({
        summary: z.string(),
        confidence: z.number()
      }),
      generate: async function* ({ summary, confidence }) {
        yield <SafeIndicator confidence={confidence} />;
        yield <SafeSummary>{summary}</SafeSummary>;
      }
    },
    displayRisk: {
      description: 'Show a risky ingredient with explanation',
      parameters: z.object({
        ingredient: z.string(),
        severity: z.enum(['high', 'med']),
        reason: z.string()
      }),
      generate: async function* ({ ingredient, severity, reason }) {
        yield <RiskBadge severity={severity}>{ingredient}</RiskBadge>;
        await new Promise(r => setTimeout(r, 300));
        yield <RiskExplanation>{reason}</RiskExplanation>;
      }
    }
  }
});
```

**Option B: Custom Generative UI Engine**

If `streamUI` has limitations, build a custom engine:

```typescript
// New file: lib/generative-ui-engine.ts

interface UIComponent {
  type: 'text' | 'badge' | 'card' | 'list' | 'chart';
  props: Record<string, any>;
  children?: UIComponent[];
}

export async function* generateUI(
  analysis: AIResponse,
  userProfile: UserProfile
): AsyncGenerator<UIComponent> {
  // AI decides UI structure based on complexity
  
  if (analysis.type === 'SAFE') {
    yield { type: 'badge', props: { variant: 'success' } };
    yield { type: 'text', props: { content: analysis.summary } };
  }
  
  if (analysis.type === 'RISK') {
    // Complex products get rich UI
    if (analysis.riskHierarchy.length > 5) {
      yield { type: 'chart', props: { data: analysis.riskHierarchy } };
    }
    
    // Stream each risk item
    for (const risk of analysis.riskHierarchy) {
      yield {
        type: 'card',
        props: { severity: risk.severity },
        children: [
          { type: 'text', props: { content: risk.ingredient } },
          { type: 'text', props: { content: risk.reason } }
        ]
      };
      await new Promise(r => setTimeout(r, 200));
    }
  }
}
```

#### 2.2 Dynamic Component Renderer

**New Component: `components/results/DynamicRenderer.tsx`**
```typescript
interface DynamicRendererProps {
  components: UIComponent[];
}

const componentMap = {
  text: TextComponent,
  badge: BadgeComponent,
  card: CardComponent,
  list: ListComponent,
  chart: ChartComponent
};

export default function DynamicRenderer({ components }: DynamicRendererProps) {
  return (
    <AnimatePresence mode="popLayout">
      {components.map((comp, i) => {
        const Component = componentMap[comp.type];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Component {...comp.props}>
              {comp.children && <DynamicRenderer components={comp.children} />}
            </Component>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
```

#### 2.3 AI Prompt Updates

Update system prompt to include UI generation instructions:

```typescript
export function generateSystemPrompt(userProfile: UserProfile): string {
  return `You are Sach.ai, an AI co-pilot for food analysis.

**Your Task:**
1. Analyze the food product image
2. Determine the appropriate response type
3. Generate UI components that match the complexity

**UI Generation Rules:**
- Simple products (1-3 ingredients): Minimal UI with single summary
- Medium products (4-8 ingredients): Card-based layout with expandable sections
- Complex products (9+ ingredients): Rich visualization with charts and hierarchies

**For SAFE products:**
- Show confidence indicator
- Brief summary
- Optional: Comparison to similar products

**For RISK products:**
- Prioritize by severity
- Use visual hierarchy (high risks prominent)
- Explain each risk with context
- Show tradeoffs when applicable

**For DECISION products:**
- Present options clearly
- Explain implications of each choice
- Show what information is missing

**Adapt UI density to user expertise:**
- First-time users: More explanations, simpler language
- Returning users: Denser information, technical terms OK

Return your analysis using the provided schema.`;
}
```

#### 2.4 Adaptive Complexity System

**New File: `lib/complexity-analyzer.ts`**

```typescript
export interface ComplexityMetrics {
  ingredientCount: number;
  unknownIngredients: number;
  riskLevel: 'low' | 'medium' | 'high';
  userExpertise: 'beginner' | 'intermediate' | 'expert';
}

export function analyzeComplexity(
  analysis: AIResponse,
  userHistory: UserHistory
): ComplexityMetrics {
  // Determine product complexity
  const ingredientCount = 
    analysis.type === 'RISK' ? analysis.riskHierarchy.length : 0;
  
  // Determine user expertise from history
  const userExpertise = userHistory.scanCount > 10 ? 'expert' : 
                        userHistory.scanCount > 3 ? 'intermediate' : 
                        'beginner';
  
  return {
    ingredientCount,
    unknownIngredients: 0, // Calculate from analysis
    riskLevel: analysis.type === 'RISK' ? 'high' : 'low',
    userExpertise
  };
}

export function selectUIStrategy(metrics: ComplexityMetrics): UIStrategy {
  if (metrics.ingredientCount <= 3 && metrics.userExpertise === 'beginner') {
    return 'minimal';
  }
  
  if (metrics.ingredientCount > 8 || metrics.riskLevel === 'high') {
    return 'rich';
  }
  
  return 'standard';
}
```

### Expected Behavior After Phase 2

1. AI analyzes product complexity
2. AI generates appropriate UI structure
3. Simple products get minimal, focused UI
4. Complex products get rich, layered UI
5. UI adapts to user expertise level
6. No more static templates

**Score Impact: 85 → 92/100**

## Phase 3: Intent Inference & Adaptive Onboarding

### Problem Statement
Current implementation requires explicit profile selection upfront.
Hackathon requires "intent-first, not filter-first" approach.

### Solution Design

#### 3.1 Remove Profile Selection Screen

**Current Flow:**
```
Open App → Profile Selection → Camera → Scan
```

**Target Flow:**
```
Open App → Camera → Scan → [AI Infers Intent] → Clarify if Needed
```

#### 3.2 Intent Inference Engine

**New File: `lib/intent-inference.ts`**

```typescript
export interface InferredIntent {
  dietaryRestrictions: string[];
  healthGoals: string[];
  confidence: number;
  needsClarification: boolean;
}

export async function inferIntent(
  productImage: string,
  userHistory?: UserHistory
): Promise<InferredIntent> {
  // Analyze product to infer why user is scanning it
  
  const productType = await detectProductType(productImage);
  
  // Infer from product type
  const inferences: string[] = [];
  
  if (productType.includes('protein bar')) {
    inferences.push('fitness', 'protein-focused');
  }
  
  if (productType.includes('gluten-free')) {
    inferences.push('gluten-intolerant', 'celiac');
  }
  
  if (productType.includes('vegan')) {
    inferences.push('vegan', 'plant-based');
  }
  
  // Combine with user history
  if (userHistory) {
    const historicalPatterns = analyzeUserPatterns(userHistory);
    inferences.push(...historicalPatterns);
  }
  
  return {
    dietaryRestrictions: inferences,
    healthGoals: [],
    confidence: calculateConfidence(inferences, userHistory),
    needsClarification: inferences.length === 0 || confidence < 0.7
  };
}
```

#### 3.3 Conversational Clarification

**New Response Type: CLARIFICATION**

Update `lib/schemas.ts`:

```typescript
export const ClarificationResponseSchema = z.object({
  type: z.literal('CLARIFICATION'),
  question: z.string(),
  context: z.string(),
  options: z.array(z.string()),
  inferredIntent: z.array(z.string())
});

export const AIResponseSchema = z.discriminatedUnion('type', [
  SafeResponseSchema,
  RiskResponseSchema,
  DecisionResponseSchema,
  ClarificationResponseSchema, // NEW
  UncertainResponseSchema,
]);
```

**New Component: `components/results/ClarificationCard.tsx`**

```typescript
interface ClarificationCardProps {
  data: ClarificationResponse;
  onAnswer: (answer: string) => void;
}

export default function ClarificationCard({ data, onAnswer }) {
  return (
    <motion.div className="p-6">
      <div className="mb-4">
        <p className="text-sm text-zinc-500">{data.context}</p>
        <h2 className="text-xl font-bold mt-2">{data.question}</h2>
      </div>
      
      {data.inferredIntent.length > 0 && (
        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg">
          <p className="text-xs text-blue-400">
            I noticed: {data.inferredIntent.join(', ')}
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        {data.options.map(option => (
          <button
            key={option}
            onClick={() => onAnswer(option)}
            className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10"
          >
            {option}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
```

#### 3.4 User History & Learning

**New File: `lib/user-history.ts`**

```typescript
export interface UserHistory {
  scanCount: number;
  decisions: Decision[];
  preferences: Preferences;
  lastScanDate: Date;
}

export interface Decision {
  productType: string;
  choice: 'accepted' | 'rejected';
  reason?: string;
  timestamp: Date;
}

export interface Preferences {
  avoidedIngredients: string[];
  preferredIngredients: string[];
  dietaryProfile?: UserProfile;
  strictness: 'strict' | 'flexible';
}

export function learnFromDecision(
  history: UserHistory,
  decision: Decision
): UserHistory {
  // Update preferences based on user decisions
  
  if (decision.choice === 'rejected' && decision.reason) {
    // Extract avoided ingredients
    const ingredients = extractIngredients(decision.reason);
    history.preferences.avoidedIngredients.push(...ingredients);
  }
  
  // Infer dietary profile from patterns
  if (history.decisions.length >= 5) {
    const inferredProfile = inferDietaryProfile(history.decisions);
    if (inferredProfile.confidence > 0.8) {
      history.preferences.dietaryProfile = inferredProfile.profile;
    }
  }
  
  return history;
}

export function adaptAnalysisPrompt(
  basePrompt: string,
  history: UserHistory
): string {
  if (history.preferences.avoidedIngredients.length > 0) {
    basePrompt += `\n\nUser typically avoids: ${history.preferences.avoidedIngredients.join(', ')}`;
  }
  
  if (history.preferences.dietaryProfile) {
    basePrompt += `\n\nUser appears to follow a ${history.preferences.dietaryProfile} diet.`;
  }
  
  return basePrompt;
}
```

#### 3.5 Smart Onboarding Flow

**Updated `app/page.tsx`:**

```typescript
function HomeContent() {
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Load user history from localStorage
    const history = loadUserHistory();
    setUserHistory(history);
    
    // Show onboarding only for first-time users
    if (!history || history.scanCount === 0) {
      setShowOnboarding(true);
    }
  }, []);
  
  const handleScan = async (imageBase64: string) => {
    // Infer intent from image and history
    const intent = await inferIntent(imageBase64, userHistory);
    
    // Submit with inferred context
    submit({
      imageBase64,
      inferredIntent: intent,
      userHistory
    });
  };
  
  if (showOnboarding) {
    return <SmartOnboarding onComplete={() => setShowOnboarding(false)} />;
  }
  
  return <CameraView onScan={handleScan} />;
}
```

**New Component: `components/onboarding/SmartOnboarding.tsx`**

```typescript
export default function SmartOnboarding({ onComplete }) {
  return (
    <motion.div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Sach.ai</h1>
      
      <p className="text-zinc-400 mb-8">
        I'm your AI co-pilot for food decisions. Just scan a product and I'll help you understand it.
      </p>
      
      <div className="space-y-4 mb-8">
        <FeatureCard
          icon="🧠"
          title="I learn from you"
          description="No forms to fill. I'll understand your preferences as we go."
        />
        <FeatureCard
          icon="💬"
          title="I explain my reasoning"
          description="See how I think about each ingredient in real-time."
        />
        <FeatureCard
          icon="🎯"
          title="I adapt to you"
          description="The more you use me, the better I understand what matters to you."
        />
      </div>
      
      <button
        onClick={onComplete}
        className="w-full py-4 bg-emerald-500 rounded-full font-bold"
      >
        Start Scanning
      </button>
    </motion.div>
  );
}
```

#### 3.6 Contextual Memory Display

**New Component: `components/ui/MemoryIndicator.tsx`**

Show users that the AI remembers their preferences:

```typescript
export default function MemoryIndicator({ history }: { history: UserHistory }) {
  if (!history || history.scanCount === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-16 left-4 right-4 z-40"
    >
      <div className="bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <p className="text-xs text-blue-400">
            I remember you avoid {history.preferences.avoidedIngredients.slice(0, 2).join(', ')}
            {history.preferences.avoidedIngredients.length > 2 && ` and ${history.preferences.avoidedIngredients.length - 2} more`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
```

### Expected Behavior After Phase 3

1. First-time user opens app → Brief onboarding → Camera
2. User scans product → AI infers intent from product type
3. If confident → Direct analysis with inferred context
4. If uncertain → "I see this is gluten-free. Are you avoiding gluten?"
5. User makes decision → AI learns and remembers
6. Next scan → AI adapts based on learned preferences
7. Returning user → No onboarding, direct to camera
8. Memory indicator shows "I remember you avoid dairy"

**Score Impact: 92 → 95/100**

## Implementation Priority

### Must Have (Phase 1)
- Real streaming with `streamObject` and `useObject`
- Partial data handling in components
- Progressive UI updates
- **Time: 4 hours**
- **Score: 85/100**

### Should Have (Phase 2)
- Generative UI with dynamic components
- Complexity-based UI adaptation
- Rich visualizations for complex products
- **Time: 6 hours**
- **Score: 92/100**

### Nice to Have (Phase 3)
- Intent inference engine
- Conversational clarification
- User history and learning
- Smart onboarding
- **Time: 3 hours**
- **Score: 95/100**

## Technical Considerations

### Performance

**Streaming Latency:**
- First token should arrive within 500ms
- Subsequent tokens every 50-100ms
- Total time to complete: 2-4 seconds

**UI Rendering:**
- Use `AnimatePresence` with `mode="popLayout"` for smooth transitions
- Stagger animations by 100ms per item
- Use `will-change: transform` for animated elements

### Error Handling

**Streaming Failures:**
```typescript
const { object, error, isLoading } = useObject({
  api: '/api/analyze',
  schema: AIResponseSchema,
  onError: (error) => {
    console.error('Streaming failed:', error);
    // Fall back to blocking mode
    return fallbackAnalysis(imageBase64);
  }
});
```

**Partial Data Validation:**
```typescript
// Don't validate until streaming is complete
if (isLoading) {
  // Render with partial data
  return <GenerativeRenderer data={object} />;
}

// Validate complete data
const validated = AIResponseSchema.parse(object);
```

### Mobile Considerations

**Safe Area Handling:**
```css
.camera-view {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

**Performance:**
- Limit animations on low-end devices
- Use `transform` and `opacity` only (GPU-accelerated)
- Debounce rapid state updates

### Data Persistence

**LocalStorage Schema:**
```typescript
interface StoredData {
  userHistory: UserHistory;
  lastSync: Date;
  version: string;
}

// Store after each decision
localStorage.setItem('sach-ai-history', JSON.stringify(data));
```

## Testing Strategy

### Unit Tests
- Test each component with partial data
- Test intent inference with various product types
- Test user history learning algorithm

### Integration Tests
- Test streaming end-to-end
- Test clarification flow
- Test memory persistence

### Manual Testing
- Test on real device with camera
- Test with various product types
- Test with slow network (throttle to 3G)

## Success Metrics

### Quantitative
- First token latency < 500ms
- Complete analysis < 4 seconds
- UI frame rate > 30fps during streaming
- Zero crashes during streaming

### Qualitative
- Judges say "This feels like magic"
- Judges understand "AI-native" from demo
- Judges see reasoning happen in real-time
- Judges notice adaptive behavior

## Demo Script

**Opening (30 seconds):**
"This is Sach.ai. Watch what happens when I scan this product..."

**Streaming Demo (60 seconds):**
- Open app (no forms!)
- Scan product
- Point out: "See the AI thinking in real-time"
- Point out: "Watch the UI build as it analyzes"
- Point out: "It's explaining WHY each ingredient matters"

**Intent Inference Demo (45 seconds):**
- Scan another product
- Point out: "Notice it remembered I avoid dairy"
- Show clarification: "It asks when uncertain"
- Make decision
- Point out: "Now it learned something new"

**Complexity Demo (45 seconds):**
- Scan simple product: "Simple product, simple UI"
- Scan complex product: "Complex product, rich visualization"
- Point out: "The AI decides the UI structure"

**Closing (30 seconds):**
"This is what AI-native means. The AI is the interface, not a feature."

**Total: 3 minutes 30 seconds**

## Next Steps

1. Review this design document
2. Create detailed task list for Phase 1
3. Implement Phase 1 (streaming)
4. Test and validate
5. Proceed to Phase 2 if time permits
6. Proceed to Phase 3 if time permits
7. Record demo video
8. Submit!
