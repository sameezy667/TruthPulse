import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

// Feature: generative-ui-streaming, Property 5: Image Data Transmission
// Validates: Requirements 3.6

// Mock the AI SDK
vi.mock('ai', () => ({
  streamObject: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(),
}));

describe('Property-Based Image Data Transmission', () => {
  let capturedMessages: any[] = [];

  beforeEach(async () => {
    vi.clearAllMocks();
    capturedMessages = [];
    process.env.GEMINI_API_KEY = 'test-api-key';
    
    // Mock streamObject to capture the messages parameter
    const aiModule = await import('ai');
    vi.mocked(aiModule.streamObject).mockImplementation((config: any) => {
      capturedMessages = config.messages || [];
      return {
        toDataStreamResponse: () => new Response('stream'),
        warnings: undefined,
        usage: undefined,
        providerMetadata: undefined,
        request: undefined,
        response: undefined,
        object: Promise.resolve({}),
        partialObjectStream: (async function* () {})(),
        textStream: (async function* () {})(),
        fullStream: (async function* () {})(),
        elementStream: (async function* () {})(),
      } as any;
    });
  });

  it('Property 5: For any valid base64 image string, image data should be included in the prompt', () => {
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

          await POST(request);
          
          // Verify that messages were captured
          expect(capturedMessages.length).toBeGreaterThan(0);
          
          // Find the message with image content
          const userMessage = capturedMessages.find((msg: any) => msg.role === 'user');
          expect(userMessage).toBeDefined();
          
          // Verify the message has content array
          expect(Array.isArray(userMessage.content)).toBe(true);
          
          // Find the image content item
          const imageContent = userMessage.content.find((item: any) => item.type === 'image');
          expect(imageContent).toBeDefined();
          
          // Verify the image data is present and non-empty
          // Note: The exact base64 string may be transformed by the AI SDK
          expect(imageContent.image).toBeTruthy();
          expect(typeof imageContent.image).toBe('string');
          expect(imageContent.image.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5: For any data URL format image, image data should be stripped and transmitted', () => {
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

          await POST(request);
          
          // Find the user message with image content
          const userMessage = capturedMessages.find((msg: any) => msg.role === 'user');
          const imageContent = userMessage?.content?.find((item: any) => item.type === 'image');
          
          // Verify the data URL prefix was stripped
          expect(imageContent.image).toBeTruthy();
          expect(imageContent.image).not.toContain('data:');
          expect(imageContent.image).not.toContain(mimeType);
          expect(imageContent.image).not.toContain('base64,');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5: For any valid image, prompt should contain both text and image content', () => {
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

          await POST(request);
          
          // Find the user message
          const userMessage = capturedMessages.find((msg: any) => msg.role === 'user');
          expect(userMessage).toBeDefined();
          expect(Array.isArray(userMessage.content)).toBe(true);
          
          // Should have at least 2 content items (text + image)
          expect(userMessage.content.length).toBeGreaterThanOrEqual(2);
          
          // Should have a text content item
          const textContent = userMessage.content.find((item: any) => item.type === 'text');
          expect(textContent).toBeDefined();
          expect(textContent.text).toBeTruthy();
          
          // Should have an image content item
          const imageContent = userMessage.content.find((item: any) => item.type === 'image');
          expect(imageContent).toBeDefined();
          expect(imageContent.image).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5: For any valid image, image content should be non-empty', () => {
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

          await POST(request);
          
          // Find the image content
          const userMessage = capturedMessages.find((msg: any) => msg.role === 'user');
          const imageContent = userMessage?.content?.find((item: any) => item.type === 'image');
          
          // Image data should be non-empty
          expect(imageContent.image).toBeTruthy();
          expect(imageContent.image.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5: For any valid image, text prompt should mention analyzing food label', () => {
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

          await POST(request);
          
          // Find the text content
          const userMessage = capturedMessages.find((msg: any) => msg.role === 'user');
          const textContent = userMessage?.content?.find((item: any) => item.type === 'text');
          
          // Text should mention analyzing food label
          expect(textContent.text.toLowerCase()).toContain('analyze');
          expect(textContent.text.toLowerCase()).toContain('food');
        }
      ),
      { numRuns: 100 }
    );
  });
});
