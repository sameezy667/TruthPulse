import { NextRequest } from 'next/server';
import { google } from '@ai-sdk/google';
import { streamText, generateObject, Output } from 'ai';
import { AnalyzeRequestSchema, AIResponseSchema } from '@/lib/schemas';
import { generateSystemPrompt } from '@/lib/prompts';
import { getProductByBarcode } from '@/lib/openfoodfacts-db';
import { analyzeProductLocally } from '@/lib/product-analyzer';
import { extractProductInfo } from '@/lib/ocr';
import { generateUISync } from '@/lib/generative-ui-engine';
import { UserProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set in environment');
      return new Response(
        JSON.stringify({
          type: 'UNCERTAIN',
          rawText: 'Unable to analyze: Server is missing GOOGLE_GENERATIVE_AI_API_KEY.'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedRequest = AnalyzeRequestSchema.parse(body);
    const { imageBase64, userProfile } = validatedRequest;

    // Check if barcode is provided (from barcode scanner)
    const barcode = (body as any).barcode;
    if (barcode) {
      console.log('Barcode detected:', barcode);
      const product = getProductByBarcode(barcode);
      
      if (product) {
        console.log('Product found in local database:', product.name);
        const analysis = analyzeProductLocally(product, userProfile);
        
        // Generate UI components for local analysis
        try {
          const uiComponents = await generateUISync(analysis, userProfile);
          return new Response(
            JSON.stringify({ ...analysis, uiComponents }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        } catch (uiError) {
          console.error('UI generation failed for local analysis:', uiError);
          // Return analysis without UI components
          return new Response(
            JSON.stringify(analysis),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      } else {
        console.log('Barcode not found in local database, falling back to AI');
      }
    }

    // Optional: Use OCR for faster text extraction (can be used alongside AI)
    // This is useful for extracting ingredients and nutrition facts quickly
    const useOCR = (body as any).useOCR === true;
    let ocrData: { fullText: string; ingredients?: string; nutritionFacts?: string[]; confidence: number } | null = null;
    
    if (useOCR) {
      try {
        console.log('Extracting text with OCR...');
        ocrData = await extractProductInfo(imageBase64);
        console.log('OCR extraction complete:', {
          textLength: ocrData.fullText.length,
          confidence: ocrData.confidence,
          hasIngredients: !!ocrData.ingredients,
          nutritionFactsCount: ocrData.nutritionFacts?.length || 0
        });
      } catch (ocrError) {
        console.warn('OCR extraction failed, continuing with AI only:', ocrError);
      }
    }

    // Generate system prompt based on profile
    let systemPrompt = generateSystemPrompt(userProfile);
    
    // If OCR data is available, include it in the prompt for better analysis
    if (ocrData && ocrData.confidence > 60) {
      systemPrompt += `\n\nOCR-extracted text from the image (confidence: ${ocrData.confidence.toFixed(1)}%):\n${ocrData.fullText}`;
      if (ocrData.ingredients) {
        systemPrompt += `\n\nDetected ingredients: ${ocrData.ingredients}`;
      }
      if (ocrData.nutritionFacts && ocrData.nutritionFacts.length > 0) {
        systemPrompt += `\n\nDetected nutrition facts:\n${ocrData.nutritionFacts.join('\n')}`;
      }
    }

    // Prepare the image data
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    console.log('Calling Gemini API...');
    
    // Use generateObject for reliable analysis
    try {
      const { object: analysis } = await generateObject({
        model: google('gemini-2.5-flash-lite'),
        schema: AIResponseSchema,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: systemPrompt,
              },
              {
                type: 'image',
                image: base64Data,
              },
            ],
          },
        ],
      });
      
      console.log('Analysis complete:', analysis.type);
      
      // Return analysis as JSON
      return new Response(
        JSON.stringify(analysis),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Check if it's a quota/rate limit error
      const errorMessage = aiError instanceof Error ? aiError.message : '';
      const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429');
      
      if (isQuotaError) {
        return new Response(
          JSON.stringify({
            type: 'UNCERTAIN',
            rawText: '⏱️ API Rate Limit Reached\n\nYou\'ve reached the free tier limit (20 requests/day) for the Gemini API.\n\nOptions:\n• Wait ~10 minutes and try again\n• Use a different API key\n• Upgrade to a paid plan\n\nFor demo purposes, you can use previously analyzed products or test with the barcode scanner feature.'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Return UNCERTAIN response if AI fails
      return new Response(
        JSON.stringify({
          type: 'UNCERTAIN',
          rawText: 'Unable to analyze this product. The image may be unclear or the label is not readable. Please try:\n\n• Taking a clearer photo with better lighting\n• Focusing on the ingredients label\n• Ensuring the text is readable'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Analysis error:', error);

    return new Response(
      JSON.stringify({
        type: 'UNCERTAIN',
        rawText: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
