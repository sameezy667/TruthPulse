# On-Device Tesseract OCR + Text-Only AI Analysis

## Overview

TruthPulse now performs **on-device OCR** using native Tesseract (Android) and Tesseract.js (web), then sends **only extracted text** (never images) to the server for AI analysis with Gemini.

### Security & Privacy Benefits
- ✅ **No API key exposure**: Client never uses `NEXT_PUBLIC_GEMINI_API_KEY`
- ✅ **No image transmission**: Only OCR-extracted text is sent to server
- ✅ **On-device processing**: OCR happens locally on user's device
- ✅ **Server-only AI**: Gemini API key stays server-side only

---

## Implementation Summary

### Architecture Flow

```
1. User captures product photo
2. Client runs OCR on-device:
   - Android: Native Tesseract via Capacitor plugin (tess-two)
   - Web: Tesseract.js WASM fallback
3. Client checks OCR confidence:
   - If confidence >= 70%: Submit text to server
   - If confidence < 70%: Prompt user to retake photo
4. Server receives text + user profile
5. Server calls Gemini with TEXT ONLY (no images)
6. Server returns AI analysis
7. Client renders UI
```

### Key Files Modified

| File | Changes |
|------|---------|
| [lib/schemas.ts](lib/schemas.ts) | Added `AnalyzeTextRequestSchema` and `DEFAULT_OCR_CONFIDENCE_THRESHOLD` |
| [lib/prompts.ts](lib/prompts.ts) | Updated prompts to accept OCR text instead of images |
| [lib/ocr.ts](lib/ocr.ts) | Refactored to dispatch to native plugin or Tesseract.js |
| [lib/client-ai.ts](lib/client-ai.ts) | Replaced direct Gemini calls with `submitTextForAnalysis()` |
| [lib/client-analyzer.ts](lib/client-analyzer.ts) | Updated flow: barcode lookup → OCR → server AI |
| [app/api/analyze-text/route.ts](app/api/analyze-text/route.ts) | **New** server-only text analysis endpoint |
| [android/.../TesseractPlugin.kt](android/app/src/main/java/com/truthpulse/plugins/TesseractPlugin.kt) | **New** Capacitor plugin for native Android OCR |
| [android/app/build.gradle](android/app/build.gradle) | Added `tess-two:9.1.0` dependency |
| [android/.../AndroidManifest.xml](android/app/src/main/AndroidManifest.xml) | Added CAMERA and storage permissions |
| [capacitor.config*.json](capacitor.config.json) | Registered `TesseractPlugin` |

---

## Setup Instructions

### 1. Install Dependencies

Already completed:
```bash
npm install tesseract.js
```

### 2. Android Native Setup

#### a) Tesseract Trained Data

Download English trained data and place in assets:

```bash
# Create tessdata directory
mkdir -p android/app/src/main/assets/tessdata

# Download eng.traineddata (Tesseract 4.0)
# Option 1: Download from GitHub
curl -o android/app/src/main/assets/tessdata/eng.traineddata \
  https://github.com/tesseract-ocr/tessdata/raw/4.0.0/eng.traineddata

# Option 2: Download manually
# Visit: https://github.com/tesseract-ocr/tessdata/blob/4.0.0/eng.traineddata
# Save to: android/app/src/main/assets/tessdata/eng.traineddata
```

#### b) Gradle Sync

```bash
cd android
./gradlew clean
./gradlew build
```

#### c) Capacitor Sync

```bash
npx cap sync android
npx cap copy android
```

### 3. Environment Variables

**IMPORTANT**: Remove any `NEXT_PUBLIC_GEMINI_API_KEY` from `.env` files and use **server-only** env var:

```bash
# .env.local (for local dev)
GEMINI_API_KEY=your_server_only_api_key_here

# DO NOT USE:
# NEXT_PUBLIC_GEMINI_API_KEY=... (this exposes the key in client bundle)
```

**Production Deployment**:
- Set `GEMINI_API_KEY` in your hosting platform (Vercel, etc.)
- Rotate any previously exposed `NEXT_PUBLIC_*` keys

### 4. Build & Run

#### Development (with dev server)
```bash
npm run dev

# On Android device/emulator
npx cap open android
```

#### Production APK
```bash
npm run build:apk:prod
```

---

## Usage in Code

### Client-side OCR + Analysis

```typescript
import { analyzeClientSide } from '@/lib/client-analyzer';
import { UserProfile } from '@/lib/types';

// After capturing photo (base64 image)
const analysis = await analyzeClientSide(
  imageBase64,
  UserProfile.VEGAN,
  barcodeOptional
);

// Handle response
if (analysis.type === 'UNCERTAIN') {
  // Low confidence or error - prompt user to retake
  showRetakePrompt(analysis.rawText);
} else {
  // Render analysis UI
  renderAnalysis(analysis);
}
```

### Direct OCR (for custom flows)

```typescript
import { extractTextWithConfidence, isOCRConfidenceAcceptable } from '@/lib/ocr';

const result = await extractTextWithConfidence(imageBase64);

if (isOCRConfidenceAcceptable(result.confidence)) {
  console.log('Text:', result.text);
  console.log('Confidence:', result.confidence);
} else {
  console.warn('Low confidence, suggest retake');
}
```

### Server-side Text Analysis (manual)

```typescript
import { submitTextForAnalysis } from '@/lib/client-ai';
import { UserProfile } from '@/lib/types';

const analysis = await submitTextForAnalysis(
  'Ingredients: wheat flour, sugar, salt',
  UserProfile.DIABETIC,
  '012345678901', // optional barcode
  85.5 // optional OCR confidence
);
```

---

## Testing

### Run Tests

```bash
npm test
```

### Key Test Files

- [__tests__/analyze-text-api.test.ts](__tests__/analyze-text-api.test.ts) - Server API tests
- [__tests__/ocr-client.test.ts](__tests__/ocr-client.test.ts) - OCR client tests

### Manual Testing Checklist

- [ ] Install APK on Android device with tessdata included
- [ ] Capture clear product label → verify high OCR confidence → verify analysis
- [ ] Capture blurred label → verify low confidence prompt to retake
- [ ] Scan barcode → verify local DB lookup (offline)
- [ ] Test on web browser → verify Tesseract.js fallback works
- [ ] Verify server logs do NOT contain imageBase64 or full text
- [ ] Verify network requests to `/api/analyze-text` contain only text payload

---

## Configuration

### OCR Confidence Threshold

Default: **70%**

To adjust:
```typescript
// lib/schemas.ts
export const DEFAULT_OCR_CONFIDENCE_THRESHOLD = 75; // Change this value
```

### Supported Languages

Current: **English only** (`eng`)

To add more languages:
1. Download additional `.traineddata` files
2. Place in `android/app/src/main/assets/tessdata/`
3. Update `TesseractPlugin.kt` language constant

---

## Troubleshooting

### Android Build Errors

**Error**: `Could not find com.rmtheis:tess-two:9.1.0`
- **Solution**: Check internet connection, sync Gradle, or use version `9.0.0`

**Error**: `tessdata not found`
- **Solution**: Verify `eng.traineddata` is in `android/app/src/main/assets/tessdata/`

### OCR Low Confidence

**Issue**: Always getting "low confidence" warnings
- **Solution**: 
  - Ensure good lighting when capturing photos
  - Focus on ingredients label (not entire product)
  - Lower `DEFAULT_OCR_CONFIDENCE_THRESHOLD` (not recommended below 60)

### Server API Errors

**Error**: `GEMINI_API_KEY not set`
- **Solution**: Set server-only env var (see section 3 above)

**Error**: `Analysis failed: Network error`
- **Solution**: Check dev server is running and client can reach `/api/analyze-text`

---

## Security Notes

### What Changed
- ❌ **Removed**: Client-side `NEXT_PUBLIC_GEMINI_API_KEY` usage
- ❌ **Removed**: Sending images to external AI services
- ✅ **Added**: Server-only `GEMINI_API_KEY` environment variable
- ✅ **Added**: Text-only payloads to AI (no images)
- ✅ **Added**: On-device OCR to minimize data transmission

### Action Items
1. **Rotate exposed keys**: If you previously used `NEXT_PUBLIC_GEMINI_API_KEY`, rotate it immediately
2. **Audit logs**: Ensure no full text or imageBase64 is logged
3. **Update CI/CD**: Set `GEMINI_API_KEY` in deployment environment

---

## Performance

### Native OCR (Android)
- **Latency**: ~500ms - 2s (depends on image size)
- **Accuracy**: 85-95% for clear labels
- **Offline**: ✅ Works without internet

### Tesseract.js (Web)
- **Latency**: ~2s - 5s (WASM initialization + OCR)
- **Accuracy**: 80-90% for clear labels
- **Offline**: ✅ Works in browser (WASM loads once)

### Server AI Analysis
- **Latency**: ~1s - 3s (Gemini API call)
- **Requires**: Internet connection

---

## Migration Guide (for existing code)

### Replace Direct Gemini Calls

**Before**:
```typescript
import { analyzeWithAI } from '@/lib/client-ai';
const analysis = await analyzeWithAI(imageBase64, profile, barcode);
```

**After**:
```typescript
import { analyzeClientSide } from '@/lib/client-analyzer';
const analysis = await analyzeClientSide(imageBase64, profile, barcode);
```

### Update Environment Variables

**Before**:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=ya29.exposed_key
```

**After**:
```bash
GEMINI_API_KEY=ya29.server_only_key
```

### Update API Calls (if manually calling)

**Before**:
```typescript
fetch('/api/analyze', {
  body: JSON.stringify({ imageBase64, userProfile })
});
```

**After**:
```typescript
fetch('/api/analyze-text', {
  body: JSON.stringify({ rawText, userProfile, ocrConfidence })
});
```

---

## Additional Resources

- [Tesseract OCR Documentation](https://github.com/tesseract-ocr/tesseract)
- [tess-two Android Library](https://github.com/rmtheis/tess-two)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [Capacitor Plugin Guide](https://capacitorjs.com/docs/plugins)

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review test files for usage examples
3. Check server logs for detailed error messages
4. Ensure tessdata files are correctly placed in Android assets
