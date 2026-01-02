/**
 * Client-side helper to submit OCR-extracted text for server-side AI analysis
 * 
 * SECURITY: This module NO LONGER calls Gemini directly or uses client-side API keys.
 * All AI analysis happens server-side via the /api/analyze-text endpoint.
 * 
 * Flow:
 * 1. Client performs OCR on-device (lib/ocr.ts)
 * 2. Client calls submitTextForAnalysis() with extracted text
 * 3. Server receives text and uses server-only GEMINI_API_KEY
 * 4. Server returns analysis, client renders UI
 */

import { AIResponse, AnalyzeTextRequest } from './schemas';
import { UserProfile } from './types';

/**
 * Submit OCR-extracted text for server-side AI analysis
 * @param rawText - OCR-extracted text from product label
 * @param userProfile - User dietary profile
 * @param barcode - Optional barcode if scanned
 * @param ocrConfidence - Optional OCR confidence score (0-100)
 * @returns AI analysis response
 */
export async function submitTextForAnalysis(
  rawText: string,
  userProfile: UserProfile,
  barcode?: string,
  ocrConfidence?: number
): Promise<AIResponse> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Text is required for analysis');
  }

  const payload: AnalyzeTextRequest = {
    rawText: rawText.trim(),
    userProfile,
    barcode,
    ocrConfidence,
  };

  try {
    const response = await fetch('/api/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as AIResponse;
  } catch (error: any) {
    console.error('Failed to submit text for analysis:', error);
    
    // Return friendly error response
    return {
      type: 'UNCERTAIN',
      rawText: `Failed to analyze text: ${error.message || 'Network error'}. Please check your connection and try again.`,
    };
  }
}
