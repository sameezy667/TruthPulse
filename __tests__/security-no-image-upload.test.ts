/**
 * Security verification: Ensure images NEVER reach Gemini
 * 
 * This test suite verifies that the architecture makes it impossible
 * for image data to be transmitted to external AI services.
 */

import { describe, it, expect, vi } from 'vitest';
import { submitTextForAnalysis } from '@/lib/client-ai';
import { analyzeClientSide } from '@/lib/client-analyzer';
import { UserProfile } from '@/lib/types';

// Mock fetch to verify no image data is sent
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock OCR to bypass actual image processing
vi.mock('@/lib/ocr', () => ({
  extractTextWithConfidence: vi.fn().mockResolvedValue({
    text: 'Ingredients: Sugar, Water, Natural Flavors',
    confidence: 85,
  }),
  isOCRConfidenceAcceptable: vi.fn().mockReturnValue(true),
}));

// Mock OpenFoodFacts client to prevent network calls during tests
vi.mock('@/lib/off-client', () => ({
  fetchOffProduct: vi.fn().mockResolvedValue(null), // No OFF product found
  clearOffCache: vi.fn(),
  getOffCacheStats: vi.fn().mockReturnValue({ size: 0, expired: 0 }),
}));

describe('Security: Image Upload Prevention', () => {
  const testProfile: UserProfile = 'vegan';
  const testImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'SAFE',
        rawText: 'Analysis result',
      }),
    });
  });

  it('should NEVER send image data to /api/analyze-text endpoint', async () => {
    await submitTextForAnalysis(
      'Test ingredients text',
      testProfile,
      undefined,
      85
    );

    // Verify fetch was called
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Get the request body
    const fetchCall = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);

    // CRITICAL: Verify NO image data in request
    expect(requestBody).not.toHaveProperty('imageBase64');
    expect(requestBody).not.toHaveProperty('image');
    expect(requestBody).not.toHaveProperty('imageData');
    expect(requestBody).not.toHaveProperty('base64');
    
    // Verify only text is sent
    expect(requestBody).toHaveProperty('rawText');
    expect(typeof requestBody.rawText).toBe('string');
    expect(requestBody.rawText).toBe('Test ingredients text');
  });

  it('should only call /api/analyze-text endpoint (not /api/analyze)', async () => {
    await submitTextForAnalysis(
      'Test ingredients',
      testProfile
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    
    const fetchCall = mockFetch.mock.calls[0];
    const url = fetchCall[0];
    
    // Verify correct endpoint
    expect(url).toBe('/api/analyze-text');
    expect(url).not.toBe('/api/analyze');
  });

  it('should perform OCR client-side and only send extracted text', async () => {
    await analyzeClientSide(testImageBase64, testProfile);

    // Verify fetch was called
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const fetchCall = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);

    // CRITICAL: Image was processed locally, only text sent to server
    expect(requestBody).not.toHaveProperty('imageBase64');
    expect(requestBody.rawText).toBe('Ingredients: Sugar, Water, Natural Flavors');
  });

  it('should verify request payload structure matches AnalyzeTextRequest schema', async () => {
    await submitTextForAnalysis(
      'Ingredients: Water, Sugar',
      testProfile,
      '1234567890123',
      92
    );

    const fetchCall = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);

    // Verify exact schema (no extra fields that could contain images)
    const allowedKeys = ['rawText', 'userProfile', 'barcode', 'ocrConfidence'];
    const actualKeys = Object.keys(requestBody);
    
    for (const key of actualKeys) {
      expect(allowedKeys).toContain(key);
    }

    // Verify types
    expect(typeof requestBody.rawText).toBe('string');
    expect(typeof requestBody.userProfile).toBe('string');
    expect(typeof requestBody.barcode).toBe('string');
    expect(typeof requestBody.ocrConfidence).toBe('number');
  });
});

describe('Architecture Verification', () => {
  it('should verify client-ai module has no Gemini SDK imports', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const clientAiPath = path.join(process.cwd(), 'lib/client-ai.ts');
    const content = fs.readFileSync(clientAiPath, 'utf-8');

    // Should NOT import any Gemini/AI SDK
    expect(content).not.toMatch(/@google\/genai/);
    expect(content).not.toMatch(/@ai-sdk\/google/);
    expect(content).not.toMatch(/google.*generative.*ai/i);
  });

  it('should verify analyze-text route only accepts text in request schema', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const schemaPath = path.join(process.cwd(), 'lib/schemas.ts');
    const content = fs.readFileSync(schemaPath, 'utf-8');

    // Verify AnalyzeTextRequestSchema exists
    expect(content).toMatch(/AnalyzeTextRequestSchema/);
    expect(content).toMatch(/rawText.*z\.string/);
    
    // Verify old AnalyzeRequestSchema with imageBase64 was removed
    expect(content).not.toMatch(/AnalyzeRequestSchema\s*=\s*z\.object.*imageBase64/s);
  });

  it('should verify /api/analyze-text route sends only text to Gemini', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const routePath = path.join(process.cwd(), 'app/api/analyze-text/route.ts');
    const content = fs.readFileSync(routePath, 'utf-8');

    // Should send text messages only
    expect(content).toMatch(/parts:.*text:/);
    
    // Should NEVER send image parts
    expect(content).not.toMatch(/type:\s*['"]image['"]/);
    expect(content).not.toMatch(/image:\s*base64/);
    expect(content).not.toMatch(/imageData/);
  });

  it('should verify old /api/analyze route was deleted', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const oldRoutePath = path.join(process.cwd(), 'app/api/analyze/route.ts');
    
    // File should not exist
    expect(fs.existsSync(oldRoutePath)).toBe(false);
  });
});
