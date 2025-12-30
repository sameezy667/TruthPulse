# APK Build Guide

## Two Types of APKs

### 1. Development APK (Live Reload) - For Testing on Your Network

**Use when:** Testing on your own phone while developing

**Features:**
- ✅ Live reload (changes appear instantly)
- ✅ Full AI analysis with Gemini
- ✅ All 50 database products
- ❌ Only works on your WiFi network
- ❌ Requires dev server running

**Build Steps:**

1. **Configure for live reload:**
   ```json
   // capacitor.config.json
   {
     "webDir": ".next",
     "server": {
       "url": "http://192.168.29.10:3002",
       "cleartext": true
     }
   }
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Build APK:**
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

4. **Install:**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

---

### 2. Standalone APK (Database Only) - For Sharing

**Use when:** Sharing with friends on different networks

**Features:**
- ✅ Works on any network
- ✅ Works offline
- ✅ All 50 database products with barcode scanning
- ❌ No AI analysis for unknown products
- ❌ No live reload
- ❌ Larger file size (~100MB vs 63MB)

**Build Steps:**

1. **Remove server config:**
   ```json
   // capacitor.config.json
   {
     "webDir": ".next"
     // Remove "server" section
   }
   ```

2. **Build production:**
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

3. **Share APK:**
   - File: `android/app/build/outputs/apk/debug/app-debug.apk`
   - Send via WhatsApp, Drive, etc.

---

## Current Configuration

**Status:** Development APK (Live Reload)

**Your dev server:** `http://192.168.29.10:3002`

**To switch to standalone:**
1. Edit `capacitor.config.json` - remove `server` section
2. Rebuild: `npm run build && npx cap sync android`
3. In Android Studio or terminal: `cd android && ./gradlew assembleDebug`

---

## Quick Commands

```bash
# Development APK (current)
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# Install on phone
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Check APK size
dir android\app\build\outputs\apk\debug\app-debug.apk
```

---

## Troubleshooting

**Black screen on friend's phone:**
- They're on a different network
- APK is trying to connect to `http://192.168.29.10:3002`
- Solution: Build standalone APK OR have them connect to your WiFi

**"Unable to analyze" error in standalone:**
- Expected behavior - standalone only works with database products
- Scan one of the 12 featured products with barcodes

**APK too large:**
- Development APK: ~63MB
- Standalone APK: ~100MB (includes Next.js runtime)
- Normal for React/Next.js apps

---

## Recommended Workflow

**For you (development):**
- Use live reload APK
- Keep dev server running
- Instant updates

**For friends (testing):**
- Build standalone APK
- Share via file transfer
- They can only scan database products
- Or: Invite them to your WiFi and share dev APK

---

## Future: Production APK

For a real production app, you'd:
1. Deploy Next.js to Vercel/server
2. Update `server.url` to your production URL
3. Build release APK with signing key
4. Publish to Google Play Store

But for now, dev APK works great for testing!
