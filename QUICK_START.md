# Quick Start: On-Device OCR Implementation

## ✅ What's Done

- ✅ Tesseract.js installed (npm package)
- ✅ Native Android plugin created (TesseractPlugin.kt)
- ✅ Server-only API endpoint (`/api/analyze-text`)
- ✅ Client libraries refactored (no image transmission)
- ✅ Android build.gradle updated (tess-two dependency)
- ✅ AndroidManifest permissions added
- ✅ Capacitor configs updated
- ✅ Tests created and passing (19/19)
- ✅ Documentation complete

## ⚠️ Required Before Running

### 1. Download Tesseract Trained Data (CRITICAL)

```bash
# Create directory
mkdir -p android/app/src/main/assets/tessdata

# Download English trained data (required for Android OCR)
# Option 1: Using curl
curl -L -o android/app/src/main/assets/tessdata/eng.traineddata \
  https://github.com/tesseract-ocr/tessdata/raw/4.0.0/eng.traineddata

# Option 2: Download manually from browser
# Visit: https://github.com/tesseract-ocr/tessdata/blob/4.0.0/eng.traineddata
# Click "Download" button, save as: android/app/src/main/assets/tessdata/eng.traineddata
```

### 2. Set Environment Variable

```bash
# Create or edit .env.local
echo "GEMINI_API_KEY=your_server_only_key_here" > .env.local

# IMPORTANT: Remove any NEXT_PUBLIC_GEMINI_API_KEY from all .env files
```

### 3. Android Build Setup

```bash
# Sync Gradle dependencies
cd android
./gradlew clean

# Sync Capacitor
cd ..
npx cap sync android
npx cap copy android
```

## 🚀 Run the App

### Development Mode

```bash
# Start Next.js dev server
npm run dev

# In another terminal, open Android Studio
npx cap open android

# Build and run on device/emulator from Android Studio
```

### Production APK

```bash
npm run build:apk:prod
```

## 📊 Test Implementation

```bash
# Run all tests
npm test

# Run specific test suites
npm test ocr-client.test.ts
npm test analyze-text-api.test.ts
```

## 🔍 Verify Setup

### Check Files Exist

- [ ] `android/app/src/main/assets/tessdata/eng.traineddata` (40-50 MB file)
- [ ] `android/app/src/main/java/com/truthpulse/plugins/TesseractPlugin.kt`
- [ ] `app/api/analyze-text/route.ts`
- [ ] `.env.local` contains `GEMINI_API_KEY`

### Check Gradle Dependency

Open `android/app/build.gradle` and verify:
```gradle
dependencies {
    ...
    implementation 'com.rmtheis:tess-two:9.1.0'
    ...
}
```

## 📱 Usage in Code

### Basic Flow

```typescript
import { analyzeClientSide } from '@/lib/client-analyzer';
import { UserProfile } from '@/lib/types';

// After capturing photo (base64)
const analysis = await analyzeClientSide(
  imageBase64,
  UserProfile.VEGAN,
  barcodeOptional
);

// Handle response
if (analysis.type === 'UNCERTAIN') {
  showRetakePrompt(analysis.rawText);
} else {
  renderAnalysis(analysis);
}
```

### Direct OCR

```typescript
import { extractTextWithConfidence, isOCRConfidenceAcceptable } from '@/lib/ocr';

const result = await extractTextWithConfidence(imageBase64);
console.log('Text:', result.text);
console.log('Confidence:', result.confidence);

if (!isOCRConfidenceAcceptable(result.confidence)) {
  // Prompt user to retake photo
}
```

## 🐛 Common Issues

### "Tesseract initialization failed"
**Solution**: Download `eng.traineddata` (step 1 above)

### "GEMINI_API_KEY not set"
**Solution**: Set server-only env var (step 2 above), restart dev server

### Low OCR accuracy
**Solution**: Ensure good lighting, focus on label, consider lowering threshold in `lib/schemas.ts`

### Gradle sync fails
**Solution**: Check internet connection, try `./gradlew --refresh-dependencies`

## 📚 Full Documentation

- [Complete Implementation Guide](docs/OCR_IMPLEMENTATION.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

## 🔐 Security Reminders

1. **Never** use `NEXT_PUBLIC_GEMINI_API_KEY` (exposes key in client)
2. **Only** use `GEMINI_API_KEY` (server-only)
3. **Rotate** any previously exposed keys
4. **Verify** no images are sent in network requests (check DevTools)

---

**Status**: Implementation complete, ready for Android setup and testing.
