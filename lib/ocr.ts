/**
 * On-device OCR with native Capacitor plugin fallback to Tesseract.js WASM
 * 
 * Flow:
 * 1. Check if running on native Android with Tesseract plugin available -> use native
 * 2. Otherwise, use Tesseract.js WASM (browser/web fallback)
 * 
 * Native plugin provides better performance and lower latency on Android.
 * Tesseract.js ensures cross-platform compatibility.
 */

import Tesseract from 'tesseract.js';
import { Capacitor } from '@capacitor/core';
import { DEFAULT_OCR_CONFIDENCE_THRESHOLD } from './schemas';

// Capacitor plugin interface (will be implemented in native Android code)
interface TesseractPlugin {
  recognizeImage(options: { imageData: string }): Promise<{
    text: string;
    confidence: number;
  }>;
}

// Check if native Tesseract plugin is available
function isNativeOCRAvailable(): boolean {
  try {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      // Check if the plugin is registered
      const plugins = (Capacitor as any).Plugins;
      return plugins && plugins.TesseractPlugin !== undefined;
    }
    return false;
  } catch (error) {
    console.warn('Error checking native OCR availability:', error);
    return false;
  }
}

// Get native plugin instance
function getNativeOCRPlugin(): TesseractPlugin | null {
  try {
    if (isNativeOCRAvailable()) {
      return (Capacitor as any).Plugins.TesseractPlugin as TesseractPlugin;
    }
    return null;
  } catch (error) {
    console.error('Error accessing native OCR plugin:', error);
    return null;
  }
}

// Preprocess image in-browser to improve OCR accuracy:
// - Ensure data URL format
// - Resize/upscale to a reasonable width
// - Convert to grayscale and apply light contrast
// Returns a data URL suitable for Tesseract.js
async function preprocessImageForOCR(imageData: string): Promise<string> {
  try {
    let dataUrl = imageData;
    if (!dataUrl.startsWith('data:')) {
      dataUrl = `data:image/jpeg;base64,${imageData}`;
    }

    // Only run heavy preprocessing in browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return dataUrl;
    }

    // Create an Image element and wait for it to load
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = dataUrl;
    });

    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    // Target width: upscale small images, cap at 1600px for performance
    const targetWidth = Math.min(1600, Math.max(800, origW));
    const targetHeight = Math.round((origH * targetWidth) / origW);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;

    // Draw the image resized
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Get image data for basic grayscale + contrast
    const imageDataObj = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageDataObj.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // Luma conversion
      let v = 0.299 * r + 0.587 * g + 0.114 * b;
      // Simple contrast adjustment
      v = Math.min(255, Math.max(0, (v - 128) * 1.15 + 128));
      data[i] = data[i + 1] = data[i + 2] = v;
    }
    ctx.putImageData(imageDataObj, 0, 0);

    // Optionally apply a slight unsharp mask using globalAlpha overlay (cheap)
    // Not using convolution for performance and compatibility
    ctx.globalAlpha = 0.98;
    ctx.drawImage(canvas, 0, 0);
    ctx.globalAlpha = 1.0;

    return canvas.toDataURL('image/jpeg', 0.92);
  } catch (err) {
    console.warn('Image preprocessing failed, falling back to original data:', err);
    return imageData;
  }
}

/**
 * Extract text from image using native OCR (Android) or Tesseract.js (fallback)
 * @param imageData - Base64 encoded image or image URL
 * @returns Extracted text from the image
 */
export async function extractTextFromImage(imageData: string): Promise<string> {
  const result = await extractTextWithConfidence(imageData);
  return result.text;
}

/**
 * Extract text with confidence scores using native or WASM OCR
 * @param imageData - Base64 encoded image or image URL
 * @returns Object containing text and confidence score (0-100)
 */
export async function extractTextWithConfidence(imageData: string): Promise<{
  text: string;
  confidence: number;
}> {
  try {
    // Try native plugin first (Android)
    const nativePlugin = getNativeOCRPlugin();
    if (nativePlugin) {
      console.log('Using native Android Tesseract plugin');
      const result = await nativePlugin.recognizeImage({ imageData });
      return {
        text: result.text,
        confidence: result.confidence,
      };
    }

    // Fallback to Tesseract.js (WASM)
    console.log('Using Tesseract.js WASM fallback');
    
    // Ensure imageData has proper data URL format and preprocess it for OCR
    let processedImageData = imageData;
    if (!imageData.startsWith('data:')) {
      processedImageData = `data:image/jpeg;base64,${imageData}`;
    }

    // Run lightweight preprocessing in browser to improve OCR results
    processedImageData = await preprocessImageForOCR(processedImageData);

    const result = await Tesseract.recognize(processedImageData, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

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
    const result = await extractTextWithConfidence(imageData);
    const fullText = result.text;
    
    // Extract ingredients section
    const ingredientsMatch = fullText.match(/ingredients?:?\s+([^\n]+)/i);
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
      confidence: result.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract product info from image');
  }
}

/**
 * Check if OCR confidence meets the minimum threshold
 * @param confidence - OCR confidence score (0-100)
 * @returns true if confidence is acceptable, false otherwise
 */
export function isOCRConfidenceAcceptable(confidence: number): boolean {
  return confidence >= DEFAULT_OCR_CONFIDENCE_THRESHOLD;
}
