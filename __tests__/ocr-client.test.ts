/**
 * Tests for OCR client-side functionality
 * 
 * Verifies:
 * 1. Native plugin dispatcher works on Android
 * 2. Tesseract.js WASM fallback works on web
 * 3. Confidence scoring is normalized (0-100)
 * 4. Error handling and retries
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractTextFromImage,
  extractTextWithConfidence,
  extractProductInfo,
  isOCRConfidenceAcceptable,
} from '@/lib/ocr';
import { DEFAULT_OCR_CONFIDENCE_THRESHOLD } from '@/lib/schemas';

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web'),
    Plugins: {},
  },
}));

// Mock Tesseract.js
vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn().mockResolvedValue({
      data: {
        text: 'Ingredients: wheat flour, sugar, salt\nCalories: 150\nProtein: 3g',
        confidence: 85.5,
      },
    }),
  },
}));

describe('OCR Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractTextWithConfidence', () => {
    it('should use Tesseract.js on web platform', async () => {
      const result = await extractTextWithConfidence('data:image/png;base64,test');
      
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should return normalized confidence score', async () => {
      const result = await extractTextWithConfidence('data:image/png;base64,test');
      
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBe(85.5);
    });

    it('should use native plugin on Android when available', async () => {
      const { Capacitor } = await import('@capacitor/core');
      (Capacitor.isNativePlatform as any).mockReturnValue(true);
      (Capacitor.getPlatform as any).mockReturnValue('android');
      (Capacitor as any).Plugins = {
        TesseractPlugin: {
          recognizeImage: vi.fn().mockResolvedValue({
            text: 'Native OCR result',
            confidence: 92.0,
          }),
        },
      };

      const result = await extractTextWithConfidence('data:image/png;base64,test');

      expect(result.text).toBe('Native OCR result');
      expect(result.confidence).toBe(92.0);
      expect((Capacitor as any).Plugins.TesseractPlugin.recognizeImage).toHaveBeenCalled();
    });

    it('should fall back to Tesseract.js when native plugin fails', async () => {
      const { Capacitor } = await import('@capacitor/core');
      (Capacitor.isNativePlatform as any).mockReturnValue(true);
      (Capacitor.getPlatform as any).mockReturnValue('android');
      (Capacitor as any).Plugins = {}; // No plugin available

      const result = await extractTextWithConfidence('data:image/png;base64,test');

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('confidence');
    });

    it('should handle OCR errors gracefully', async () => {
      const Tesseract = (await import('tesseract.js')).default;
      (Tesseract.recognize as any).mockRejectedValueOnce(new Error('OCR failed'));

      await expect(extractTextWithConfidence('invalid-data')).rejects.toThrow(
        'Failed to extract text from image'
      );
    });
  });

  describe('extractTextFromImage', () => {
    it('should return only text string', async () => {
      const text = await extractTextFromImage('data:image/png;base64,test');
      
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('extractProductInfo', () => {
    it('should extract ingredients from text', async () => {
      const result = await extractProductInfo('data:image/png;base64,test');
      
      expect(result).toHaveProperty('fullText');
      expect(result).toHaveProperty('ingredients');
      expect(result).toHaveProperty('confidence');
      expect(result.ingredients).toContain('wheat flour');
    });

    it('should extract nutrition facts', async () => {
      const result = await extractProductInfo('data:image/png;base64,test');
      
      expect(result).toHaveProperty('nutritionFacts');
      expect(result.nutritionFacts).toContain('Calories: 150');
      expect(result.nutritionFacts).toContain('Protein: 3g');
    });

    it('should handle missing ingredients section', async () => {
      const Tesseract = (await import('tesseract.js')).default;
      (Tesseract.recognize as any).mockResolvedValueOnce({
        data: {
          text: 'Product Name: Test\nBrand: TestCo',
          confidence: 75.0,
        },
      });

      const result = await extractProductInfo('data:image/png;base64,test');
      
      expect(result.ingredients).toBeUndefined();
    });
  });

  describe('isOCRConfidenceAcceptable', () => {
    it('should accept confidence above threshold', () => {
      expect(isOCRConfidenceAcceptable(DEFAULT_OCR_CONFIDENCE_THRESHOLD)).toBe(true);
      expect(isOCRConfidenceAcceptable(85)).toBe(true);
      expect(isOCRConfidenceAcceptable(100)).toBe(true);
    });

    it('should reject confidence below threshold', () => {
      expect(isOCRConfidenceAcceptable(DEFAULT_OCR_CONFIDENCE_THRESHOLD - 1)).toBe(false);
      expect(isOCRConfidenceAcceptable(50)).toBe(false);
      expect(isOCRConfidenceAcceptable(0)).toBe(false);
    });

    it('should use correct default threshold', () => {
      expect(DEFAULT_OCR_CONFIDENCE_THRESHOLD).toBe(70);
    });
  });
});
