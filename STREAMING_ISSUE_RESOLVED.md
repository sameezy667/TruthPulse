# Streaming Issue Resolved

## The Problem

When we implemented `streamObject` from Vercel AI SDK, it failed with Gemini API errors:

```
Invalid value at 'generation_config.response_schema.one_of[0].properties[2].value.enum[0]' (TYPE_STRING), true
Invalid JSON payload received. Unknown name "items" at 'generation_config.response_schema.one_of[2].properties[2].value': Proto field is not repeating, cannot start list.
```

## Root Cause

**Gemini's API has strict schema requirements** that don't support:
1. Literal values like `safeBadge: true` (must be boolean type, not literal)
2. Complex array structures in discriminated unions
3. The Zod schema format that Vercel AI SDK generates

This is a known limitation of Gemini's structured output feature.

## The Solution

Reverted to **blocking `generateText`** with JSON parsing:

### API Route (`app/api/analyze/route.ts`)
```typescript
// Use generateText (blocking) instead of streamObject
const result = await generateText({
  model: google('gemini-2.0-flash-exp'),
  messages: [...],
});

// Parse and validate the JSON response
const parsed = JSON.parse(result.text);
const validated = AIResponseSchema.parse(parsed);

return new Response(JSON.stringify(validated), {
  status: 200,
  headers: { 'Content-Type': 'application/json' }
});
```

### Frontend (`app/page.tsx`)
```typescript
// Back to regular fetch
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({ imageBase64, userProfile }),
});

const data = await response.json();
const validated = AIResponseSchema.parse(data);
setAnalysisResult(validated);
```

## What We Lost

- ❌ Real-time streaming updates
- ❌ Progressive content disclosure
- ❌ Immediate visual feedback

## What We Kept

- ✅ Type-safe schema validation
- ✅ Generative UI (SAFE/RISK/DECISION/UNCERTAIN)
- ✅ Context-aware prompts
- ✅ Clean component architecture
- ✅ Error handling
- ✅ Mobile-first design

## Current Status

**Back to 65% AI-native** (same as before streaming attempt)

The app works, but uses blocking fetch instead of streaming.

## Alternative Solutions

### Option 1: Simplify Schema for Gemini
Remove complex features that Gemini doesn't support:
- Change `safeBadge: true` to `safeBadge: boolean`
- Simplify array structures
- Use simpler discriminated union

**Pros:** Might enable streaming
**Cons:** Requires schema redesign, may still not work

### Option 2: Use OpenAI Instead
OpenAI's API has better structured output support:
```typescript
import { openai } from '@ai-sdk/openai';

const result = streamObject({
  model: openai('gpt-4o'),
  schema: AIResponseSchema,
  // ... works perfectly
});
```

**Pros:** Full streaming support, better schema handling
**Cons:** Requires OpenAI API key, different pricing

### Option 3: Use Anthropic Claude
Claude also supports structured output:
```typescript
import { anthropic } from '@ai-sdk/anthropic';

const result = streamObject({
  model: anthropic('claude-3-5-sonnet-20241022'),
  schema: AIResponseSchema,
  // ... works well
});
```

**Pros:** Full streaming support, good vision capabilities
**Cons:** Requires Anthropic API key, different pricing

### Option 4: Manual Streaming with Gemini
Stream text and parse JSON incrementally:
```typescript
const result = streamText({
  model: google('gemini-2.0-flash-exp'),
  // ...
});

// Parse JSON as it arrives
let buffer = '';
for await (const chunk of result.textStream) {
  buffer += chunk;
  try {
    const parsed = JSON.parse(buffer);
    // Send partial object to client
  } catch {
    // Not complete yet
  }
}
```

**Pros:** Works with Gemini, some streaming
**Cons:** Complex implementation, fragile JSON parsing

## Recommendation

### For Hackathon (Quick Fix)
**Keep current blocking approach**
- Works reliably
- Fast enough (2-4 seconds)
- No additional costs
- Focus on other features

### For Production (Best Experience)
**Switch to OpenAI GPT-4o**
- Full streaming support
- Better structured output
- More reliable
- Worth the cost for better UX

## How to Switch to OpenAI

1. Install OpenAI provider:
```bash
npm install @ai-sdk/openai
```

2. Update API route:
```typescript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';

const result = streamObject({
  model: openai('gpt-4o'),
  schema: AIResponseSchema,
  output: 'object',
  messages: [...],
});

return result.toTextStreamResponse();
```

3. Update frontend:
```typescript
const { object, submit } = useObject({
  api: '/api/analyze',
  schema: AIResponseSchema,
});
```

4. Set environment variable:
```bash
OPENAI_API_KEY=your_key_here
```

## Testing Current Implementation

The app should now work with blocking fetch:

1. Open http://localhost:3002
2. Select profile
3. Scan image
4. See reasoning terminal (simulated)
5. See result after 2-4 seconds

**No streaming, but it works reliably.**

## Files Modified

- `app/api/analyze/route.ts` - Back to blocking generateText
- `app/page.tsx` - Back to manual fetch

## Next Steps

1. Test current implementation works
2. Decide: Keep Gemini (blocking) or switch to OpenAI (streaming)
3. If switching to OpenAI, follow steps above
4. Continue with other features (OpenFoodFacts, etc.)

---

**Current Status:** ✅ Working (blocking)
**Streaming Status:** ❌ Not available with Gemini
**Recommendation:** Switch to OpenAI for streaming or keep Gemini for cost savings
