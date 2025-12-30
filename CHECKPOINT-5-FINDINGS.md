# Checkpoint 5: Streaming Backend Verification

## Status: Issues Identified

### Summary
The streaming backend implementation is in place but encountering compatibility issues between the Vercel AI SDK's Zod schema translation and Google Gemini's structured output API.

### What Was Tested
1. ✅ API endpoint is accessible at `/api/analyze`
2. ✅ Environment variable configuration (updated from `GEMINI_API_KEY` to `GOOGLE_GENERATIVE_AI_API_KEY`)
3. ✅ Request validation working correctly
4. ✅ Error handling in place
5. ❌ Streaming response not working due to schema compatibility issues

### Issues Discovered

#### 1. Schema Compatibility Problem
**Error**: `Invalid JSON payload received. Unknown name "items" at 'generation_config.response_schema.one_of[2].properties[2].value': Proto field is not repeating, cannot start list.`

**Root Cause**: The Gemini API (v1beta) has limitations with how it handles:
- Arrays in discriminated unions
- Boolean literals (`z.literal(true)` was changed to `z.boolean()`)
- Complex nested schemas

**Affected Schema**: `RiskResponseSchema` with `riskHierarchy: z.array(RiskItemSchema)`

#### 2. API Rate Limiting
Hit rate limits on `gemini-2.0-flash-exp` during testing (free tier limitation)

#### 3. Model Naming Issues
- `gemini-2.5-flash-lite` - Not found
- `gemini-1.5-flash` - Not found for v1beta API
- `gemini-1.5-flash-latest` - Not found for v1beta API
- `gemini-1.5-pro-latest` - Works but has schema issues
- `gemini-2.0-flash-exp` - Works but hit rate limits

### Current Implementation

**File**: `app/api/analyze/route.ts`
```typescript
// Using streamObject with mode: 'json'
const result = streamObject({
  model: google('gemini-1.5-pro-latest'),
  schema: AIResponseSchema,
  mode: 'json',
  system: systemPrompt,
  messages: [...]
});

return result.toTextStreamResponse();
```

**Schema Changes Made**:
- Changed `safeBadge: z.literal(true)` to `safeBadge: z.boolean()` in `SafeResponseSchema`

### Possible Solutions

#### Option 1: Use JSON Mode Without Schema Validation
Remove the schema parameter and rely on prompt engineering:
```typescript
const result = streamText({
  model: google('gemini-1.5-pro-latest'),
  system: systemPrompt,
  messages: [...]
});
```
Then parse and validate the JSON on the client side.

#### Option 2: Simplify the Schema
- Remove discriminated unions
- Flatten the structure
- Avoid arrays in the schema

#### Option 3: Use a Different Model Provider
Switch to OpenAI or Anthropic which have better structured output support in the Vercel AI SDK.

#### Option 4: Use Gemini's Native SDK
Bypass the Vercel AI SDK and use `@google/generative-ai` directly with streaming.

### Recommendations

**Immediate**: 
1. Try Option 1 (JSON mode without schema) as it's the quickest path forward
2. Update the frontend to handle JSON parsing and validation
3. Keep the Zod schema for client-side validation

**Long-term**:
1. Monitor Vercel AI SDK updates for better Gemini schema support
2. Consider switching to a model provider with better structured output support
3. File an issue with Vercel AI SDK about Gemini schema translation

### Test Script Created
Created `test-api-streaming.js` to test the streaming endpoint independently.

### Next Steps
1. Decide on which solution approach to take
2. Implement the chosen solution
3. Re-test the streaming endpoint
4. Verify response conforms to AIResponseSchema (client-side validation)
5. Continue with frontend implementation (Task 6)

### Files Modified
- `app/api/analyze/route.ts` - Updated to use streamObject with Gemini
- `.env.local` - Changed `GEMINI_API_KEY` to `GOOGLE_GENERATIVE_AI_API_KEY`
- `lib/schemas.ts` - Changed `safeBadge` from `z.literal(true)` to `z.boolean()`
- `test-api-streaming.js` - Created test script

### Questions for User
1. Which solution approach would you prefer?
2. Are you open to switching model providers if needed?
3. Should we proceed with JSON mode (no schema validation) for now?
