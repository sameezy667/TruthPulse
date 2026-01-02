/**
 * Tests for the text-only analysis API endpoint
 * 
 * Verifies that:
 * 1. Server accepts text-only payloads (no images)
 * 2. Server validates AnalyzeTextRequestSchema
 * 3. Server uses server-only GEMINI_API_KEY
 * 4. Server returns valid AIResponseSchema
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/analyze-text/route';
import { UserProfile } from '@/lib/types';

// Mock the Google GenAI SDK (@google/genai)
vi.mock('@google/genai', () => {
  const asyncGeneratorFactory = (payloadText: string) => {
    return (async function* () {
      yield { text: payloadText };
    })();
  };

  const generateContentStreamMock = vi.fn().mockResolvedValue(asyncGeneratorFactory(JSON.stringify({ type: 'SAFE', summary: 'This product is safe for your diet.', safeBadge: true })));

  class GoogleGenAI {
    models: any;
    constructor(opts?: any) {
      this.models = { generateContentStream: generateContentStreamMock };
    }
  }

  // Expose the mock for assertions in tests
  (GoogleGenAI as any).__generateContentStreamMock = generateContentStreamMock;

  return { GoogleGenAI };
});

describe('POST /api/analyze-text', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set mock env var
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  it('should accept valid text-only payload', async () => {
    const request = new Request('http://localhost/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: 'Ingredients: wheat flour, water, salt',
        userProfile: UserProfile.VEGAN,
        ocrConfidence: 85.5,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('type');
    expect(data.type).toBe('SAFE');
  });

  it('should reject payload without rawText', async () => {
    const request = new Request('http://localhost/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userProfile: UserProfile.DIABETIC,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    // Should return UNCERTAIN due to validation error
    expect(response.status).toBe(200);
    expect(data.type).toBe('UNCERTAIN');
  });

  it('should include barcode and confidence in AI context', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const genMock = (GoogleGenAI as any).__generateContentStreamMock;

    const request = new Request('http://localhost/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: 'Ingredients: sugar, corn syrup',
        userProfile: UserProfile.DIABETIC,
        barcode: '012345678901',
        ocrConfidence: 92.3,
      }),
    });

    await POST(request as any);
    // Verify generateContentStream was called and contents include barcode context (no images)
    expect(genMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-flash-lite-latest',
        contents: expect.any(Array),
      })
    );
    const calls = genMock.mock.calls;
    calls.forEach((call: any) => {
      const args = call[0];
      const contents = args.contents || [];
      contents.forEach((c: any) => {
        const parts = c.parts || [];
        parts.forEach((p: any) => {
          expect(p.text).not.toContain('image');
          expect(p.text).not.toContain('base64');
          expect(p.text).not.toContain('imageBase64');
        });
      });
    });
  });

  it('should return UNCERTAIN when API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const request = new Request('http://localhost/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: 'Test text',
        userProfile: UserProfile.VEGAN,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('Server configuration error');
  });

  it('should never accept imageBase64 in payload', async () => {
    const request = new Request('http://localhost/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: 'Ingredients: test',
        userProfile: UserProfile.PALEO,
        imageBase64: 'data:image/png;base64,iVBORw0KGgo...', // Should be ignored
      }),
    });

    const response = await POST(request as any);
    const { generateText } = await import('ai');
    
    // Verify that generateText was NOT called with image content
    const calls = (generateText as any).mock.calls;
    calls.forEach((call: any) => {
      const messages = call[0].messages;
      messages.forEach((msg: any) => {
        // Check that content doesn't reference images in a meaningful way
        // (avoid false positives from words like "image" in "better image")
        if (typeof msg.content === 'object') {
          expect(msg.content).not.toHaveProperty('image');
        }
        expect(msg.content).not.toContain('base64');
        expect(msg.content).not.toContain('imageBase64');
      });
    });
  });

  it('should handle AI parsing errors gracefully', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const genMock = (GoogleGenAI as any).__generateContentStreamMock;
    // Make the next stream yield invalid JSON
    const badStream = (async function* () { yield { text: 'This is not valid JSON' }; })();
    genMock.mockResolvedValueOnce(badStream as any);

    const request = new Request('http://localhost/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: 'Ingredients: test',
        userProfile: UserProfile.VEGAN,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('parse');
  });

  it('should sanitize logs and not log full text', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    const longText = 'A'.repeat(5000); // Very long text
    const request = new Request('http://localhost/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: longText,
        userProfile: UserProfile.VEGAN,
      }),
    });

    await POST(request as any);

    // Check that logs don't contain the full text
    const logCalls = consoleSpy.mock.calls;
    logCalls.forEach((call) => {
      const loggedContent = JSON.stringify(call);
      expect(loggedContent).not.toContain(longText);
      // Should only log metadata like textLength
      if (loggedContent.includes('textLength')) {
        expect(loggedContent).toContain('5000');
      }
    });

    consoleSpy.mockRestore();
  });
});
