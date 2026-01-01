import Tesseract from 'tesseract.js';

/**
 * Extract text from an image using Tesseract.js OCR
 * @param imageData - Base64 encoded image or image URL
 * @returns Extracted text from the image
 */
export async function extractTextFromImage(imageData: string): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      imageData,
      'eng', // Language: English
      {
        logger: (m) => {
          // Optional: Log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    return result.data.text;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text with confidence scores
 * @param imageData - Base64 encoded image or image URL
 * @returns Object containing text and confidence score
 */
export async function extractTextWithConfidence(imageData: string): Promise<{
  text: string;
  confidence: number;
}> {
  try {
    const result = await Tesseract.recognize(imageData, 'eng');
    
    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract specific data like ingredients, nutrition facts, etc.
 * @param imageData - Base64 encoded image or image URL
 * @returns Structured data extracted from the image
 */
export async function extractProductInfo(imageData: string): Promise<{
  fullText: string;
  ingredients?: string;
  nutritionFacts?: string[];
  confidence: number;
}> {
  try {
    const result = await Tesseract.recognize(imageData, 'eng');
    const fullText = result.data.text;
    
    // Extract ingredients section
    const ingredientsMatch = fullText.match(/ingredients?:?\s*([^\n]+)/i);
    const ingredients = ingredientsMatch ? ingredientsMatch[1].trim() : undefined;
    
    // Extract nutrition facts (common patterns)
    const nutritionPatterns = [
      /calories?:?\s*(\d+)/i,
      /protein:?\s*([\d.]+\s*g)/i,
      /fat:?\s*([\d.]+\s*g)/i,
      /carb(?:ohydrate)?s?:?\s*([\d.]+\s*g)/i,
      /sugar:?\s*([\d.]+\s*g)/i,
      /sodium:?\s*([\d.]+\s*mg)/i,
    ];
    
    const nutritionFacts = nutritionPatterns
      .map(pattern => {
        const match = fullText.match(pattern);
        return match ? match[0] : null;
      })
      .filter((fact): fact is string => fact !== null);
    
    return {
      fullText,
      ingredients,
      nutritionFacts: nutritionFacts.length > 0 ? nutritionFacts : undefined,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract product info from image');
  }
}
