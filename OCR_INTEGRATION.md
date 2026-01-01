# OCR Integration with Tesseract.js

This project now includes Tesseract.js for fast, client-side OCR (Optical Character Recognition) to extract text from food product images.

## Features

- **Fast Text Extraction**: Extract text from images without API calls
- **Product Info Detection**: Automatically identify ingredients and nutrition facts
- **Confidence Scoring**: Get confidence levels for extracted text
- **Hybrid Approach**: Use OCR alongside AI for better accuracy

## Usage

### Basic Text Extraction

```typescript
import { extractTextFromImage } from '@/lib/ocr';

const text = await extractTextFromImage(imageBase64);
console.log('Extracted text:', text);
```

### Extract with Confidence Score

```typescript
import { extractTextWithConfidence } from '@/lib/ocr';

const result = await extractTextWithConfidence(imageBase64);
console.log('Text:', result.text);
console.log('Confidence:', result.confidence);
```

### Extract Product Information

```typescript
import { extractProductInfo } from '@/lib/ocr';

const productInfo = await extractProductInfo(imageBase64);
console.log('Full text:', productInfo.fullText);
console.log('Ingredients:', productInfo.ingredients);
console.log('Nutrition facts:', productInfo.nutritionFacts);
console.log('Confidence:', productInfo.confidence);
```

## API Integration

The `/api/analyze` endpoint now supports an optional `useOCR` parameter:

```typescript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageBase64: 'data:image/jpeg;base64,...',
    userProfile: { /* ... */ },
    useOCR: true  // Enable OCR preprocessing
  })
});
```

When `useOCR` is enabled:
1. OCR extracts text from the image
2. Extracted text is included in the AI prompt
3. AI uses both visual and textual information for better analysis

## Benefits

- **Faster Processing**: OCR can quickly extract text without waiting for AI
- **Reduced API Costs**: Less reliance on AI for simple text extraction
- **Better Accuracy**: AI can use OCR-extracted text as additional context
- **Offline Capability**: OCR works without internet (when running client-side)

## Performance Tips

- OCR works best with clear, high-contrast images
- Ensure text is not blurry or at extreme angles
- Good lighting improves OCR accuracy
- Confidence scores above 60% are generally reliable

## Language Support

Currently configured for English (`eng`). To add more languages:

```typescript
const result = await Tesseract.recognize(
  imageData,
  'eng+spa+fra', // English, Spanish, French
  { /* options */ }
);
```

## Dependencies

- `tesseract.js`: ^5.x - OCR engine for JavaScript
