import { NextRequest } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { AnalyzeRequestSchema, AIResponseSchema } from '@/lib/schemas';
import { generateSystemPrompt } from '@/lib/prompts';
import { getProductByBarcode } from '@/lib/openfoodfacts-db';
import { analyzeProductLocally } from '@/lib/product-analyzer';
import { extractProductInfo } from '@/lib/ocr';

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
        
        return new Response(
          JSON.stringify(analysis),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
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
    
    // Use generateText (blocking) since streamObject doesn't work with Gemini's schema constraints
    const result = await generateText({
      model: google('gemini-2.5-flash-lite'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: systemPrompt + '\n\nIMPORTANT: Return ONLY valid JSON matching one of the four scenarios. No markdown, no code blocks, just raw JSON.',
            },
            {
              type: 'image',
              image: base64Data,
            },
          ],
        },
      ],
    });

    console.log('Gemini response:', result.text);

    // Parse and validate the JSON response
    try {
      // Remove markdown code blocks if present
      let jsonText = result.text.trim();
      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
      
      // Try to extract JSON object
      const objectMatch = jsonText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonText = objectMatch[0];
      }

      const parsed = JSON.parse(jsonText);
      const validated = AIResponseSchema.parse(parsed);
      
      console.log('Validated response:', validated);
      
      return new Response(
        JSON.stringify(validated),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Raw text:', result.text);
      
      return new Response(
        JSON.stringify({
          type: 'UNCERTAIN',
          rawText: 'Unable to parse AI response. Please try again.'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
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
