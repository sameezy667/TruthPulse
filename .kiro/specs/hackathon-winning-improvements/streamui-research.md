# Vercel AI SDK streamUI Research

## Research Date
January 1, 2026

## Current Implementation Status

### What We're Using Now
- **Package**: `ai` v6.0.3 and `@ai-sdk/react` v3.0.3
- **Backend**: `streamText()` with `Output.object()` for structured streaming
- **Frontend**: `experimental_useObject()` hook for consuming streams
- **Model**: Google Gemini 2.5 Flash Lite via `@ai-sdk/google`

### Current Architecture
```typescript
// Backend (app/api/analyze/route.ts)
const result = streamText({
  model: google('gemini-2.5-flash-lite'),
  output: Output.object({
    schema: AIResponseSchema,
  }),
  messages: [...]
});
return result.toUIMessageStreamResponse();

// Frontend (app/page.tsx)
const { object, submit, isLoading, error } = useObject({
  api: '/api/analyze',
  schema: AIResponseSchema,
});
```

## streamUI Overview

### What is streamUI?

`streamUI` is a React Server Components (RSC) feature in the Vercel AI SDK that allows the AI model to directly generate and stream React components instead of just data. It's part of the `ai/rsc` package.

### Key Differences: streamText vs streamUI

| Feature | streamText + Output.object() | streamUI |
|---------|------------------------------|----------|
| **Output** | Structured JSON data | React components |
| **Use Case** | Data streaming with client-side rendering | Server-generated UI streaming |
| **Client Handling** | useObject hook parses JSON | Direct component rendering |
| **Flexibility** | Client decides UI based on data | Server decides UI structure |
| **Type Safety** | Zod schema validation | TypeScript component props |
| **Complexity** | Simpler, separation of concerns | More complex, tighter coupling |

### streamUI API Structure

```typescript
import { streamUI } from 'ai/rsc';

const result = await streamUI({
  model: google('gemini-2.5-flash-lite'),
  messages: [...],
  text: ({ content, done }) => {
    // Render text as it streams
    if (!done) {
      return <ReasoningDisplay text={content} />;
    }
  },
  tools: {
    displaySafeProduct: {
      description: 'Show that a product is safe',
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
      description: 'Show risky ingredients',
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

## Google Gemini Compatibility

### ✅ Compatible Features
- **Text Streaming**: Fully supported
- **Structured Output**: Supported via `Output.object()`
- **Vision (Image Input)**: Fully supported
- **Function Calling**: Supported (required for streamUI tools)

### ⚠️ Considerations
- **Function Calling**: Gemini supports function calling, which is the foundation for streamUI tools
- **Streaming**: Gemini has excellent streaming support
- **React Server Components**: Requires Next.js App Router (we have this ✅)

### Compatibility Verdict
**YES - Google Gemini is compatible with streamUI**

The Gemini models support function calling, which is what streamUI uses under the hood. The AI SDK treats tools as function calls that the model can invoke.

## Decision: streamUI vs Custom Engine

### Option A: Use streamUI

#### Pros
- ✅ Built-in by Vercel, well-tested
- ✅ Automatic component streaming
- ✅ Type-safe with TypeScript
- ✅ Handles serialization automatically
- ✅ Progressive rendering out of the box

#### Cons
- ❌ Requires React Server Components (RSC)
- ❌ More complex mental model
- ❌ Tighter coupling between AI and UI
- ❌ Harder to test components in isolation
- ❌ Less control over streaming behavior
- ❌ May require significant refactoring

### Option B: Custom Generative UI Engine

#### Pros
- ✅ Full control over UI generation logic
- ✅ Can work with current architecture
- ✅ Easier to test and debug
- ✅ Separation of concerns (AI → Data → UI)
- ✅ Can adapt complexity-based UI selection
- ✅ Simpler mental model

#### Cons
- ❌ Need to build streaming logic ourselves
- ❌ More code to maintain
- ❌ Need to handle serialization manually

## Recommendation: Custom Generative UI Engine

### Rationale

1. **Current Architecture Works Well**: We already have streaming working with `streamText` + `Output.object()` + `useObject()`. This is proven and tested.

2. **Separation of Concerns**: Our current approach separates:
   - AI reasoning (backend)
   - Data structure (schemas)
   - UI rendering (frontend)
   
   This makes testing and debugging easier.

3. **Flexibility**: A custom engine gives us more control over:
   - Complexity-based UI selection
   - Animation timing
   - Component composition
   - Error handling

4. **Time Constraint**: For a hackathon, refactoring to RSC and streamUI would take significant time. Our current approach is already 90% there.

5. **Generative UI Definition**: "Generative UI" doesn't require streamUI specifically. It means the AI decides the UI structure dynamically. We can achieve this by:
   - Having the AI return UI component specifications in the data
   - Building a renderer that interprets those specifications
   - Streaming the specifications progressively

### Implementation Strategy

Instead of using streamUI, we'll enhance our current approach:

```typescript
// Enhanced Schema with UI Metadata
export const SafeResponseSchema = z.object({
  type: z.literal('SAFE'),
  summary: z.string(),
  confidence: z.number(),
  // NEW: UI generation hints
  uiHints: z.object({
    complexity: z.enum(['minimal', 'standard', 'rich']),
    components: z.array(z.object({
      type: z.enum(['badge', 'text', 'card', 'chart']),
      props: z.record(z.any()),
      order: z.number()
    }))
  }).optional()
});
```

Then build a `DynamicRenderer` that interprets these hints:

```typescript
// components/results/DynamicRenderer.tsx
export default function DynamicRenderer({ data, uiHints }) {
  if (!uiHints) {
    // Fallback to default rendering
    return <DefaultRenderer data={data} />;
  }
  
  // Render components based on AI's hints
  return (
    <AnimatePresence>
      {uiHints.components
        .sort((a, b) => a.order - b.order)
        .map((comp, i) => {
          const Component = componentMap[comp.type];
          return (
            <motion.div key={i} {...animationProps}>
              <Component {...comp.props} />
            </motion.div>
          );
        })}
    </AnimatePresence>
  );
}
```

### Why This Approach is "Generative UI"

1. **AI Decides Structure**: The AI determines which components to use and in what order
2. **Dynamic Composition**: Components are composed at runtime based on AI output
3. **Adaptive Complexity**: UI adapts to product complexity automatically
4. **Progressive Rendering**: Components stream in as AI generates them
5. **No Static Templates**: The UI structure is not predetermined

## Alternative: Hybrid Approach

If we want to use streamUI for specific features:

1. **Keep current approach for main analysis** (proven, working)
2. **Use streamUI for specific interactions** like:
   - Clarification questions
   - Follow-up explanations
   - Interactive decision trees

This gives us the best of both worlds without a full rewrite.

## Implementation Plan

### Phase 2 Revised Approach

1. **Enhance AIResponseSchema** with optional `uiHints` field
2. **Update System Prompt** to include UI generation instructions
3. **Build DynamicRenderer** component that interprets UI hints
4. **Create Atomic Components** (badge, text, card, chart)
5. **Add Complexity Analyzer** to determine UI strategy
6. **Test with various product types**

### Time Estimate
- Original estimate with streamUI: 6 hours
- Revised estimate with custom engine: 4-5 hours (less refactoring)

## Conclusion

**Decision: Build a Custom Generative UI Engine**

**Reasoning:**
- Faster to implement (less refactoring)
- More control and flexibility
- Works with our proven streaming architecture
- Easier to test and debug
- Still achieves "true generative UI" goal
- Better separation of concerns

**Next Steps:**
1. Document this decision in tasks.md
2. Update Phase 2 tasks to reflect custom engine approach
3. Begin implementation with enhanced schemas
4. Build DynamicRenderer component
5. Test with real products

## References

- Vercel AI SDK Documentation: https://sdk.vercel.ai/docs
- streamUI Guide: https://sdk.vercel.ai/docs/ai-sdk-rsc/streaming-react-components
- Google Gemini Function Calling: https://ai.google.dev/gemini-api/docs/function-calling
- Current Implementation: app/api/analyze/route.ts, app/page.tsx
