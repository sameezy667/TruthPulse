import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

// Mock the AI SDK
vi.mock('ai', () => ({
  streamObject: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(),
}));

describe('API Route Request Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set API key for tests
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  it('should accept valid imageBase64 and userProfile', async () => {
    const validRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'DIABETIC',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    // Mock streamObject to return a valid response
    const { streamObject } = await import('ai');
    (streamObject as any).mockResolvedValue({
      toDataStreamResponse: () => new Response('stream'),
    });

    const response = await POST(request);
    
    // Should not return an error response
    expect(response).toBeDefined();
    expect(response.status).not.toBe(400);
  });

  it('should accept VEGAN profile', async () => {
    const validRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'VEGAN',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    const { streamObject } = await import('ai');
    (streamObject as any).mockResolvedValue({
      toDataStreamResponse: () => new Response('stream'),
    });

    const response = await POST(request);
    
    expect(response).toBeDefined();
    expect(response.status).not.toBe(400);
  });

  it('should accept PALEO profile', async () => {
    const validRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'PALEO',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    const { streamObject } = await import('ai');
    (streamObject as any).mockResolvedValue({
      toDataStreamResponse: () => new Response('stream'),
    });

    const response = await POST(request);
    
    expect(response).toBeDefined();
    expect(response.status).not.toBe(400);
  });

  it('should reject request with missing imageBase64', async () => {
    const invalidRequest = {
      userProfile: 'DIABETIC',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('Unable to analyze');
  });

  it('should reject request with empty imageBase64', async () => {
    const invalidRequest = {
      imageBase64: '',
      userProfile: 'DIABETIC',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('Unable to analyze');
  });

  it('should reject request with missing userProfile', async () => {
    const invalidRequest = {
      imageBase64: 'base64encodedimagedata',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('Unable to analyze');
  });

  it('should reject request with invalid userProfile', async () => {
    const invalidRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'INVALID_PROFILE',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
    });

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('Unable to analyze');
  });

  it('should return UNCERTAIN when API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    const validRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'DIABETIC',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('GEMINI_API_KEY');
  });

  it('should return UNCERTAIN when API key is invalid', async () => {
    process.env.GEMINI_API_KEY = 'invalid-key';

    const validRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'DIABETIC',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    // Mock streamObject to throw an API key error
    const { streamObject } = await import('ai');
    (streamObject as any).mockRejectedValue(new Error('API key not valid'));

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('API key is invalid');
  });

  it('should return UNCERTAIN when model is unavailable', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    const validRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'DIABETIC',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    // Mock streamObject to throw a model unavailable error
    const { streamObject } = await import('ai');
    (streamObject as any).mockRejectedValue(new Error('Model gemini-2.5-flash-lite is not available'));

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('Unable to analyze');
  });

  it('should return UNCERTAIN when streaming fails', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    const validRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'DIABETIC',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    // Mock streamObject to throw a streaming error
    const { streamObject } = await import('ai');
    (streamObject as any).mockRejectedValue(new Error('Network error during streaming'));

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('Unable to analyze');
  });

  it('should return UNCERTAIN for unexpected errors', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    const validRequest = {
      imageBase64: 'base64encodedimagedata',
      userProfile: 'DIABETIC',
    };

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validRequest),
    });

    // Mock streamObject to throw an unexpected error
    const { streamObject } = await import('ai');
    (streamObject as any).mockRejectedValue(new Error('Unexpected internal error'));

    const response = await POST(request);
    const data = await response.json();
    
    expect(data.type).toBe('UNCERTAIN');
    expect(data.rawText).toContain('Unable to analyze');
  });
});
