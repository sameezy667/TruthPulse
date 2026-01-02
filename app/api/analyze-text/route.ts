/**
 * Server-only API route for text-based AI analysis
 * 
 * This route accepts OCR-extracted text (never images) and uses server-only
 * GEMINI_API_KEY to call Google Generative AI SDK for food analysis.
 * 
 * Security: Never send images to external AI services. Only text is transmitted.
 */

import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { AnalyzeTextRequestSchema, AIResponseSchema } from '@/lib/schemas';
import { generateSystemPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    // Check for server-only API key (never NEXT_PUBLIC_*)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Server-only GEMINI_API_KEY is not set in environment');
      return new Response(
        JSON.stringify({
          type: 'UNCERTAIN',
          rawText: 'Unable to analyze: Server configuration error. Please contact support.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedRequest = AnalyzeTextRequestSchema.parse(body);
    const { rawText, userProfile, barcode, ocrConfidence } = validatedRequest;

    // Log request metadata (never log full text to avoid PII exposure)
    console.log('Text analysis request:', {
      userProfile,
      textLength: rawText.length,
      hasBarcode: !!barcode,
      ocrConfidence,
      timestamp: new Date().toISOString(),
    });

    // Build system prompt with user profile context
    const systemPrompt = generateSystemPrompt(userProfile);

    // Build user message with OCR text and metadata
    const userMessage = `OCR-extracted text from product label:
${barcode ? `Barcode: ${barcode}\n` : ''}${ocrConfidence !== undefined ? `OCR Confidence: ${ocrConfidence.toFixed(1)}%\n` : ''}
---
${rawText}
---

Analyze this product for a ${userProfile} diet and return JSON only.`;

    // Call Gemini (Google GenAI) with TEXT ONLY (never images) using streaming API
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-flash-lite-latest';
    const config = { temperature: 0, thinkingConfig: { thinkingBudget: 0 } };

    // Gemini API only accepts 'user' and 'model' roles (not 'system')
    // Combine system prompt with user message
    const combinedMessage = `${systemPrompt}\n\n${userMessage}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: combinedMessage }],
      },
    ];

    // Stream the response and accumulate text
    const stream = await ai.models.generateContentStream({ model, config, contents });
    let accumulated = '';
    for await (const chunk of stream) {
      if (chunk.text) {
        accumulated += chunk.text;
      }
    }

    // Extract and parse JSON response from accumulated text
    const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response');
      return new Response(
        JSON.stringify({
          type: 'UNCERTAIN',
          rawText: 'Unable to parse AI response. Please try again or retake the photo.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validatedResponse = AIResponseSchema.parse(parsed);

    // Log response type (not full response to avoid logging sensitive data)
    console.log('Analysis completed:', {
      responseType: validatedResponse.type,
      timestamp: new Date().toISOString(),
    });

    return new Response(JSON.stringify(validatedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Text analysis error:', {
      message: error.message,
      name: error.name,
      timestamp: new Date().toISOString(),
    });

    // Return user-friendly error
    return new Response(
      JSON.stringify({
        type: 'UNCERTAIN',
        rawText: `Analysis failed: ${error.message || 'Unknown error'}. Please try again.`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
