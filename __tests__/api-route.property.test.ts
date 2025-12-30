import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

// Feature: generative-ui-streaming, Property 3: API Request Acceptance
// Validates: Requirements 3.1

// Feature: generative-ui-streaming, Property 6: Error Resilience
// Validates: Requirements 3.8, 8.4, 8.5, 8.6, 8.7

// Mock the AI SDK
vi.mock('ai', () => ({
  streamObject: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(),
}));

describe('Property-Based API Request Acceptance', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Set API key for tests
    process.env.GEMINI_API_KEY = 'test-api-key';
    
    // Mock streamObject to return a valid response
    const aiModule = await import('ai');
    vi.mocked(aiModule.streamObject).mockResolvedValue({
      toDataStreamResponse: () => new Response('stream'),
    } as any);
  });

  it('Property 3: For any valid imageBase64 and userProfile, API should accept the request', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.constantFrom('DIABETIC', 'VEGAN', 'PALEO'),
        async (imageBase64, userProfile) => {
          const validRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(validRequest),
          });

          const response = await POST(request);
          
          // Should not return a 400 error
          expect(response.status).not.toBe(400);
          
          // If it's a JSON response, it should either be streaming or UNCERTAIN
          if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            // If it's an error, it should be UNCERTAIN type
            if (data.type) {
              expect(['SAFE', 'RISK', 'DECISION', 'UNCERTAIN']).toContain(data.type);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: For any valid base64-encoded image string and userProfile, API should accept', () => {
    fc.assert(
      fc.asyncProperty(
        fc.base64String({ minLength: 10, maxLength: 100 }),
        fc.constantFrom('DIABETIC', 'VEGAN', 'PALEO'),
        async (imageBase64, userProfile) => {
          const validRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(validRequest),
          });

          const response = await POST(request);
          
          // Should not return a validation error
          expect(response.status).not.toBe(400);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: For any valid data URL format image and userProfile, API should accept', () => {
    fc.assert(
      fc.asyncProperty(
        fc.base64String({ minLength: 10, maxLength: 100 }),
        fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
        fc.constantFrom('DIABETIC', 'VEGAN', 'PALEO'),
        async (base64Data, mimeType, userProfile) => {
          const imageBase64 = `data:${mimeType};base64,${base64Data}`;
          
          const validRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(validRequest),
          });

          const response = await POST(request);
          
          // Should not return a validation error
          expect(response.status).not.toBe(400);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: For any empty or whitespace-only imageBase64, API should reject', () => {
    fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', '   ', '\t', '\n'),
        fc.constantFrom('DIABETIC', 'VEGAN', 'PALEO'),
        async (imageBase64, userProfile) => {
          const invalidRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(invalidRequest),
          });

          const response = await POST(request);
          const data = await response.json();
          
          // Should return UNCERTAIN type for invalid input
          expect(data.type).toBe('UNCERTAIN');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 3: For any invalid userProfile, API should reject', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.string().filter(s => !['DIABETIC', 'VEGAN', 'PALEO'].includes(s)),
        async (imageBase64, userProfile) => {
          const invalidRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(invalidRequest),
          });

          const response = await POST(request);
          const data = await response.json();
          
          // Should return UNCERTAIN type for invalid profile
          expect(data.type).toBe('UNCERTAIN');
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property-Based Error Resilience', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('Property 6: For any error condition, system should return UNCERTAIN without crashing', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.constantFrom('DIABETIC', 'VEGAN', 'PALEO'),
        fc.constantFrom(
          'API key not valid',
          'API_KEY_INVALID',
          'Model gemini-2.5-flash-lite is not available',
          'Network error during streaming',
          'Connection timeout',
          'Rate limit exceeded',
          'Internal server error',
          'Unexpected error'
        ),
        async (imageBase64, userProfile, errorMessage) => {
          process.env.GEMINI_API_KEY = 'test-api-key';

          const validRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(validRequest),
          });

          // Mock streamObject to throw various errors
          const aiModule = await import('ai');
          vi.mocked(aiModule.streamObject).mockRejectedValue(new Error(errorMessage));

          const response = await POST(request);
          
          // Should not crash - must return a response
          expect(response).toBeDefined();
          
          // Should return JSON response
          expect(response.headers.get('content-type')).toContain('application/json');
          
          const data = await response.json();
          
          // Should return UNCERTAIN type
          expect(data.type).toBe('UNCERTAIN');
          
          // Should have rawText field
          expect(data.rawText).toBeDefined();
          expect(typeof data.rawText).toBe('string');
          expect(data.rawText.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: For missing API key, system should return UNCERTAIN without crashing', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.constantFrom('DIABETIC', 'VEGAN', 'PALEO'),
        async (imageBase64, userProfile) => {
          delete process.env.GEMINI_API_KEY;

          const validRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(validRequest),
          });

          const response = await POST(request);
          
          // Should not crash
          expect(response).toBeDefined();
          
          const data = await response.json();
          
          // Should return UNCERTAIN type
          expect(data.type).toBe('UNCERTAIN');
          expect(data.rawText).toContain('GEMINI_API_KEY');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 6: For validation errors, system should return UNCERTAIN without crashing', () => {
    fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(undefined),
          fc.constant(null),
          fc.constant(''),
          fc.constant('   ')
        ),
        fc.oneof(
          fc.constant(undefined),
          fc.constant(null),
          fc.constant('INVALID'),
          fc.string().filter(s => !['DIABETIC', 'VEGAN', 'PALEO'].includes(s))
        ),
        async (imageBase64, userProfile) => {
          process.env.GEMINI_API_KEY = 'test-api-key';

          const invalidRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(invalidRequest),
          });

          const response = await POST(request);
          
          // Should not crash
          expect(response).toBeDefined();
          
          const data = await response.json();
          
          // Should return UNCERTAIN type
          expect(data.type).toBe('UNCERTAIN');
          expect(data.rawText).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: For any non-Error thrown object, system should return UNCERTAIN', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.constantFrom('DIABETIC', 'VEGAN', 'PALEO'),
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.constant(null),
          fc.constant(undefined),
          fc.record({ message: fc.string() })
        ),
        async (imageBase64, userProfile, thrownValue) => {
          process.env.GEMINI_API_KEY = 'test-api-key';

          const validRequest = {
            imageBase64,
            userProfile,
          };

          const request = new NextRequest('http://localhost:3000/api/analyze', {
            method: 'POST',
            body: JSON.stringify(validRequest),
          });

          // Mock streamObject to throw non-Error values
          const aiModule = await import('ai');
          vi.mocked(aiModule.streamObject).mockRejectedValue(thrownValue);

          const response = await POST(request);
          
          // Should not crash
          expect(response).toBeDefined();
          
          const data = await response.json();
          
          // Should return UNCERTAIN type
          expect(data.type).toBe('UNCERTAIN');
          expect(data.rawText).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
