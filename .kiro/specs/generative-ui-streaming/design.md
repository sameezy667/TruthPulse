# Design Document

## Overview

This design document specifies the architecture for upgrading Sach.ai from a blocking fetch-and-wait pattern to a production-grade streaming Generative UI system using Vercel AI SDK. The system will stream typed JSON objects from Google Gemini to the client, rendering UI components incrementally as data arrives.

### Key Design Principles

1. **Type Safety First**: All data flows through Zod schemas with no `any` types
2. **Streaming Architecture**: Use `streamObject` on the backend and `experimental_useObject` on the frontend
3. **Graceful Degradation**: Handle partial data, network failures, and errors without crashing
4. **Mobile-First**: All components respect 430px max-width and touch interactions
5. **Vendor Agnostic**: Use Vercel AI SDK abstractions to avoid Google-specific lock-in

## Architecture

### High-Level Data Flow

```
User Scans Image
    ↓
Frontend: experimental_useObject hook
    ↓
POST /api/analyze { imageBase64, userProfile }
    ↓
Backend: streamObject with Gemini
    ↓
Stream: Partial JSON chunks
    ↓
Frontend: DeepPartial<AIResponse>
    ↓
GenerativeRenderer: Switch on type
    ↓
Component: Render with partial data
```

### Technology Stack

- **AI SDK**: `ai` (Vercel AI SDK core)
- **AI Provider**: `@ai-sdk/google` (Gemini integration)
- **Schema Validation**: `zod` v4.2.1
- **Animation**: `framer-motion` v11.11.17
- **Styling Utilities**: `clsx`, `tailwind-merge`
- **Framework**: Next.js 15.1.0 with App Router

## Components and Interfaces

### 1. Schema Layer (`lib/schemas.ts`)

The schema layer defines the contract between backend and frontend using Zod discriminated unions.

#### AIResponseSchema

```typescript
// Discriminated union on 'type' field
export const AIResponseSchema = z.discriminatedUnion('type', [
  SafeResponseSchema,
  RiskResponseSchema,
  DecisionResponseSchema,
  UncertainResponseSchema,
]);
```

#### Individual Response Schemas

**SafeResponseSchema**:
```typescript
const SafeResponseSchema = z.object({
  type: z.literal('SAFE'),
  summary: z.string(),
  safeBadge: z.literal(true),
});
```

**RiskResponseSchema**:
```typescript
const RiskItemSchema = z.object({
  ingredient: z.string(),
  severity: z.enum(['high', 'med']),
  reason: z.string(),
});

const RiskResponseSchema = z.object({
  type: z.literal('RISK'),
  headline: z.string(),
  riskHierarchy: z.array(RiskItemSchema),
});
```

**DecisionResponseSchema**:
```typescript
const DecisionResponseSchema = z.object({
  type: z.literal('DECISION'),
  question: z.string(),
  options: z.tuple([z.literal('Strict'), z.literal('Flexible')]),
});
```

**UncertainResponseSchema**:
```typescript
const UncertainResponseSchema = z.object({
  type: z.literal('UNCERTAIN'),
  rawText: z.string(),
});
```

### 2. Backend API Route (`app/api/analyze/route.ts`)

The API route handles streaming AI responses using Vercel AI SDK.

#### Interface

```typescript
// Request
POST /api/analyze
Content-Type: application/json
Body: {
  imageBase64: string,
  userProfile: 'DIABETIC' | 'VEGAN' | 'PALEO'
}

// Response
Content-Type: text/event-stream
Body: Server-Sent Events stream with partial JSON
```

#### Implementation Structure

```typescript
import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { AIResponseSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  // 1. Validate request
  const { imageBase64, userProfile } = await request.json();
  
  // 2. Configure model
  const model = google('gemini-2.5-flash-lite');
  
  // 3. Generate prompts
  const systemPrompt = generateSystemPrompt(userProfile);
  const userPrompt = [
    { type: 'text', text: 'Analyze this food label' },
    { type: 'image', image: imageBase64 }
  ];
  
  // 4. Stream object
  const result = await streamObject({
    model,
    schema: AIResponseSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });
  
  // 5. Return stream
  return result.toDataStreamResponse();
}
```

#### System Prompt Design

The system prompt must:
- Define the user profile context (concerns, safe ingredients, risky ingredients)
- Explain the four response scenarios (SAFE, RISK, DECISION, UNCERTAIN)
- Provide schema examples for each scenario
- Emphasize strict JSON output without markdown

### 3. Frontend Hook Integration (`app/page.tsx`)

The main page component uses the `experimental_useObject` hook to consume the stream.

#### Hook Configuration

```typescript
import { experimental_useObject as useObject } from 'ai/react';
import { AIResponseSchema } from '@/lib/schemas';

const { object, submit, isLoading, error } = useObject({
  api: '/api/analyze',
  schema: AIResponseSchema,
});
```

#### State Management

```typescript
// Trigger analysis
const handleScan = (imageBase64: string) => {
  submit({ imageBase64, userProfile: profile });
};

// Render based on state
{isLoading && <ReasoningTerminal />}
{object && <GenerativeRenderer data={object} />}
{error && <ErrorToast message="Analysis failed. Please try again." />}
```

### 4. Generative Renderer (`components/results/GenerativeRenderer.tsx`)

The renderer switches on the response type and delegates to specialized components.

#### Interface

```typescript
interface GenerativeRendererProps {
  data: DeepPartial<AIResponse>;
  onReset: () => void;
  onDecision?: (choice: 'Strict' | 'Flexible') => void;
}
```

#### Implementation Logic

```typescript
export default function GenerativeRenderer({ data, onReset, onDecision }: GenerativeRendererProps) {
  // Handle undefined type (initial streaming state)
  if (!data?.type) {
    return <ReasoningTerminal />;
  }
  
  // Switch on discriminator
  switch (data.type) {
    case 'SAFE':
      return <SafeCard data={data} onReset={onReset} />;
    case 'RISK':
      return <RiskHierarchy data={data} onReset={onReset} />;
    case 'DECISION':
      return <DecisionFork data={data} onDecision={onDecision} onReset={onReset} />;
    case 'UNCERTAIN':
      return <UncertainCard data={data} onReset={onReset} />;
    default:
      return <ReasoningTerminal />;
  }
}
```

### 5. Result Components (Partial Data Handling)

Each result component must handle partial/undefined data gracefully.

#### SafeCard Partial Handling

```typescript
interface SafeCardProps {
  data: DeepPartial<SafeResponse>;
  onReset: () => void;
}

// Render with fallbacks
<p className="text-zinc-400">
  {data.summary || <TextSkeleton width="80%" />}
</p>
```

#### RiskHierarchy Partial Handling

```typescript
interface RiskHierarchyProps {
  data: DeepPartial<RiskResponse>;
  onReset: () => void;
}

// Handle empty array during streaming
{data.riskHierarchy?.length === 0 && <RiskSkeleton />}

// Animate items as they stream in
<AnimatePresence>
  {data.riskHierarchy?.map((risk, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
    >
      {/* Risk item content */}
    </motion.div>
  ))}
</AnimatePresence>
```

#### DecisionFork Partial Handling

```typescript
interface DecisionForkProps {
  data: DeepPartial<DecisionResponse>;
  onDecision: (choice: 'Strict' | 'Flexible') => void;
  onReset: () => void;
}

// Disable buttons until data is complete
<button
  disabled={!data.question || !data.options}
  onClick={() => onDecision('Strict')}
>
  {data.options?.[0] || 'Loading...'}
</button>
```

## Data Models

### DeepPartial Utility Type

```typescript
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
```

This utility type makes all properties and nested properties optional, essential for handling streaming data.

### Type Inference from Zod

```typescript
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type SafeResponse = z.infer<typeof SafeResponseSchema>;
export type RiskResponse = z.infer<typeof RiskResponseSchema>;
export type DecisionResponse = z.infer<typeof DecisionResponseSchema>;
export type UncertainResponse = z.infer<typeof UncertainResponseSchema>;
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Type Safety Across Codebase

*For any* TypeScript file in the codebase, the file should contain no `any` types and should pass strict type checking.

**Validates: Requirements 1.5, 11.3**

### Property 2: Schema Validation for All Responses

*For any* response generated by the AI model, when parsed against `AIResponseSchema`, the response should either validate successfully or be caught as invalid.

**Validates: Requirements 2.1, 2.7, 2.8**

### Property 3: API Request Acceptance

*For any* valid combination of `imageBase64` (non-empty string) and `userProfile` (DIABETIC, VEGAN, or PALEO), the API route should accept the request without throwing a validation error.

**Validates: Requirements 3.1**

### Property 4: System Prompt Completeness

*For any* user profile (DIABETIC, VEGAN, PALEO), the generated system prompt should contain the profile name, concerns list, safe ingredients list, and risky ingredients list.

**Validates: Requirements 3.5**

### Property 5: Image Data Transmission

*For any* valid base64 image string, when passed to the API, the image data should be included in the prompt sent to the AI model.

**Validates: Requirements 3.6**

### Property 6: Error Resilience

*For any* error condition (network failure, invalid API key, model unavailable, JSON parsing failure), the system should return an UNCERTAIN response type without crashing.

**Validates: Requirements 3.8, 8.4, 8.5, 8.6, 8.7**

### Property 7: Hook Data Flow

*For any* scan action triggered by the user, when the `submit` function is called, the streaming `object` should eventually be passed to the GenerativeRenderer component.

**Validates: Requirements 4.4, 4.8**

### Property 8: Loading State Exposure

*For any* active streaming session, the `isLoading` state should be true until the stream completes or errors.

**Validates: Requirements 4.6**

### Property 9: Error State Exposure

*For any* error that occurs during streaming, the `error` object should be populated and exposed by the hook.

**Validates: Requirements 4.7**

### Property 10: Partial Data Resilience

*For any* component receiving partial data (SafeCard, RiskHierarchy, DecisionFork, UncertainCard), when any expected field is undefined, the component should render without crashing and display appropriate placeholders.

**Validates: Requirements 5.9, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

### Property 11: Animation on Stream Updates

*For any* risk hierarchy array, when new items are added during streaming, each new item should trigger a Framer Motion animation.

**Validates: Requirements 5.8**

### Property 12: Skeleton Display for Missing Data

*For any* string field that is undefined during streaming, the component should display a skeleton loader or placeholder text.

**Validates: Requirements 7.3**

### Property 13: Branding Consistency

*For any* user-visible text in the application, the text should use "Sach.ai" and should not contain "TruthPulse" or "truthpulse".

**Validates: Requirements 9.3**

### Property 14: Layout Constraint Compliance

*For any* streaming data that causes content to grow, the layout should not cause horizontal scrolling beyond the viewport width.

**Validates: Requirements 10.4**

### Property 15: Type Inference from Schema

*For any* Zod schema defined in the system, TypeScript should correctly infer the type without requiring manual type annotations.

**Validates: Requirements 11.4**

### Property 16: DeepPartial Type Correctness

*For any* object type T, when wrapped in `DeepPartial<T>`, all properties and nested properties should be optional.

**Validates: Requirements 11.5**

## Error Handling

### Error Categories

1. **Network Errors**: Connection failures, timeouts, aborted requests
2. **API Errors**: Invalid API key, rate limiting, model unavailable
3. **Validation Errors**: Invalid request body, schema validation failures
4. **Streaming Errors**: Partial stream interruption, malformed JSON chunks
5. **Client Errors**: Component crashes, state management failures

### Error Handling Strategy

#### Backend Error Handling

```typescript
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        type: 'UNCERTAIN',
        rawText: 'Server configuration error: Missing API key'
      });
    }
    
    // Validate request
    const body = await request.json();
    const validatedRequest = AnalyzeRequestSchema.parse(body);
    
    // Stream object
    const result = await streamObject({
      model: google('gemini-2.5-flash-lite'),
      schema: AIResponseSchema,
      system: generateSystemPrompt(validatedRequest.userProfile),
      prompt: generateUserPrompt(validatedRequest.imageBase64),
    });
    
    return result.toDataStreamResponse();
    
  } catch (error) {
    // Log error for debugging
    console.error('Analysis error:', error);
    
    // Return UNCERTAIN response
    return NextResponse.json({
      type: 'UNCERTAIN',
      rawText: error instanceof Error 
        ? `Analysis failed: ${error.message}`
        : 'An unexpected error occurred'
    });
  }
}
```

#### Frontend Error Handling

```typescript
// Hook-level error handling
const { object, submit, isLoading, error } = useObject({
  api: '/api/analyze',
  schema: AIResponseSchema,
  onError: (error) => {
    console.error('Streaming error:', error);
  }
});

// Render error state
{error && (
  <Toast variant="destructive">
    Analysis failed. Please try again.
  </Toast>
)}
```

#### Component-level Error Boundaries

```typescript
// Wrap GenerativeRenderer in error boundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <GenerativeRenderer data={object} onReset={handleReset} />
</ErrorBoundary>
```

### Graceful Degradation

1. **Partial Data**: Components render with available data and show skeletons for missing fields
2. **Network Interruption**: Display last known state with retry option
3. **Invalid Schema**: Fall back to UNCERTAIN response type
4. **Component Crash**: Error boundary catches and displays fallback UI

## Testing Strategy

### Dual Testing Approach

This system requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Together: Comprehensive coverage (unit tests catch concrete bugs, property tests verify general correctness)

### Unit Testing

Unit tests focus on specific scenarios and integration points:

1. **Schema Validation Tests**
   - Test each response type validates correctly
   - Test invalid schemas are rejected
   - Test discriminated union switching

2. **Component Rendering Tests**
   - Test each component renders with complete data
   - Test each component renders with partial data
   - Test error states and loading states

3. **API Route Tests**
   - Test request validation
   - Test error responses
   - Test system prompt generation

4. **Hook Integration Tests**
   - Test submit function is called correctly
   - Test state updates during streaming
   - Test error handling

### Property-Based Testing

Property tests verify universal behaviors across many generated inputs:

**Testing Library**: Use `fast-check` for TypeScript property-based testing

**Configuration**: Each property test should run minimum 100 iterations

**Test Tagging**: Each test must reference its design property
- Format: `// Feature: generative-ui-streaming, Property N: [property text]`

#### Example Property Tests

**Property 1: Type Safety**
```typescript
// Feature: generative-ui-streaming, Property 1: Type Safety Across Codebase
test('no any types in codebase', () => {
  const files = getAllTypeScriptFiles();
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    expect(content).not.toMatch(/:\s*any\b/);
    expect(content).not.toMatch(/as\s+any\b/);
  }
});
```

**Property 3: API Request Acceptance**
```typescript
// Feature: generative-ui-streaming, Property 3: API Request Acceptance
fc.assert(
  fc.asyncProperty(
    fc.string({ minLength: 1 }),
    fc.constantFrom('DIABETIC', 'VEGAN', 'PALEO'),
    async (imageBase64, userProfile) => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ imageBase64, userProfile })
      });
      expect(response.ok).toBe(true);
    }
  ),
  { numRuns: 100 }
);
```

**Property 10: Partial Data Resilience**
```typescript
// Feature: generative-ui-streaming, Property 10: Partial Data Resilience
fc.assert(
  fc.property(
    fc.record({
      type: fc.constantFrom('SAFE', 'RISK', 'DECISION', 'UNCERTAIN'),
      summary: fc.option(fc.string()),
      headline: fc.option(fc.string()),
      riskHierarchy: fc.option(fc.array(fc.record({
        ingredient: fc.string(),
        severity: fc.constantFrom('high', 'med'),
        reason: fc.string()
      }))),
      question: fc.option(fc.string()),
      options: fc.option(fc.tuple(fc.constant('Strict'), fc.constant('Flexible'))),
      rawText: fc.option(fc.string())
    }),
    (partialData) => {
      const { container } = render(
        <GenerativeRenderer data={partialData} onReset={() => {}} />
      );
      expect(container).toBeTruthy();
      expect(() => container.querySelector('*')).not.toThrow();
    }
  ),
  { numRuns: 100 }
);
```

### Integration Testing

1. **End-to-End Streaming Test**
   - Mock Gemini API with streaming response
   - Verify frontend receives and renders partial data
   - Verify final state matches complete response

2. **Error Recovery Test**
   - Simulate network interruption mid-stream
   - Verify error state is displayed
   - Verify retry functionality works

3. **Mobile Layout Test**
   - Test on 430px viewport
   - Verify no horizontal scroll
   - Verify touch interactions work

### Manual Testing Checklist

- [ ] Test streaming with real Gemini API
- [ ] Test on actual mobile devices (iOS and Android)
- [ ] Test with slow network (throttled connection)
- [ ] Test with various image qualities
- [ ] Test all three user profiles
- [ ] Test error scenarios (invalid API key, network failure)
- [ ] Verify animations are smooth on mobile
- [ ] Verify safe area handling on notched devices

## Implementation Notes

### Migration Path

1. **Phase 1: Dependencies** - Install new packages, keep old code working
2. **Phase 2: Schema** - Update schemas to match new structure (already done)
3. **Phase 3: Backend** - Replace `generateContent` with `streamObject`
4. **Phase 4: Frontend** - Replace fetch with `useObject` hook
5. **Phase 5: Components** - Update components to handle partial data
6. **Phase 6: Cleanup** - Remove old dependencies and code

### Backward Compatibility

During migration, the system should maintain backward compatibility:
- Old API route can coexist with new streaming route temporarily
- Frontend can feature-flag between old and new implementations
- Gradual rollout to users to catch issues early

### Performance Considerations

1. **Streaming Overhead**: Streaming adds minimal overhead compared to blocking
2. **Animation Performance**: Use CSS transforms for animations (GPU-accelerated)
3. **Bundle Size**: Vercel AI SDK adds ~50KB gzipped
4. **Mobile Performance**: Test on low-end devices to ensure smooth experience

### Security Considerations

1. **API Key Protection**: Never expose Gemini API key to client
2. **Input Validation**: Validate all user inputs before processing
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Image Size Limits**: Limit base64 image size to prevent memory issues

### Accessibility

1. **Loading States**: Provide clear loading indicators for screen readers
2. **Error Messages**: Ensure error messages are announced to screen readers
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Focus Management**: Manage focus appropriately during state transitions
