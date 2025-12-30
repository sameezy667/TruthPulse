/**
 * Client-side AI analysis for standalone APK
 * WARNING: API key is exposed in the bundle
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { AIResponseSchema } from './schemas';
import { UserProfile } from './types';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export async function analyzeWithAI(
  imageBase64: string,
  profile: UserProfile,
  barcode?: string
): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const contextMap = {
    [UserProfile.VEGAN]: 'strict vegan (no animal products)',
    [UserProfile.DIABETIC]: 'diabetic (low sugar, low glycemic index)',
    [UserProfile.PALEO]: 'paleo diet (no grains, legumes, or dairy)',
  };

  const userContext = contextMap[profile];

  const prompt = `You are analyzing a food product label for someone who follows a ${userContext} diet.

${barcode ? `Product barcode: ${barcode}` : ''}

Analyze the image and provide:
1. Product name
2. Whether it's SAFE, CAUTION, or UNSAFE for this diet
3. Key concerns (if any)
4. Specific problematic ingredients (if any)
5. A brief explanation

Return ONLY valid JSON matching this schema:
{
  "productName": "string",
  "verdict": "SAFE" | "CAUTION" | "UNSAFE",
  "concerns": ["string"],
  "problematicIngredients": ["string"],
  "explanation": "string"
}`;

  try {
    const result = await generateText({
      model: google('gemini-2.0-flash-exp'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              image: imageBase64,
            },
          ],
        },
      ],
      maxRetries: 3,
    });

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return AIResponseSchema.parse(parsed);
  } catch (error: any) {
    console.error('Client AI analysis error:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}
