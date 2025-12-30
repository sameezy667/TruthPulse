# Deploy to Vercel + Build Production APK

## Step 1: Deploy to Vercel

### Option A: Via Vercel CLI (Fastest)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow prompts
   - Select "yes" to link to existing project or create new
   - It will deploy and give you a URL like: `https://your-app.vercel.app`

4. **Add Environment Variable:**
   ```bash
   vercel env add GOOGLE_GENERATIVE_AI_API_KEY
   ```
   - Paste your API key: `AIzaSyB6ELAbt2GFOWPFLSc7bpluoZEQfNH47CU`
   - Select "Production"

5. **Redeploy with env var:**
   ```bash
   vercel --prod
   ```

### Option B: Via Vercel Dashboard (Easier)

1. **Go to:** https://vercel.com/new

2. **Import Git Repository:**
   - Connect your GitHub/GitLab
   - Select this repository
   - Click "Import"

3. **Configure:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variable:**
   - Click "Environment Variables"
   - Name: `GOOGLE_GENERATIVE_AI_API_KEY`
   - Value: `AIzaSyB6ELAbt2GFOWPFLSc7bpluoZEQfNH47CU`
   - Select: **Production**, **Preview**, **Development**

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a URL like: `https://truth-pulse.vercel.app`

---

## Step 2: Update Capacitor Config

Once deployed, update `capacitor.config.json`:

```json
{
  "appId": "com.sachai.app",
  "appName": "Sach.ai",
  "webDir": ".next",
  "server": {
    "url": "https://your-app.vercel.app",
    "cleartext": false
  },
  "bundledWebRuntime": false,
  "plugins": {
    "Camera": {
      "permissions": ["camera", "photos"]
    },
    "Haptics": {}
  }
}
```

**Replace** `https://your-app.vercel.app` with your actual Vercel URL.

**Note:** `cleartext: false` because Vercel uses HTTPS.

---

## Step 3: Build Production APK

```bash
# Sync with new URL
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug

# Or build release (signed):
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Step 4: Test

1. **Install APK on any phone:**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Test on different networks:**
   - Your WiFi ✅
   - Friend's WiFi ✅
   - Mobile data ✅
   - Anywhere with internet ✅

---

## Benefits of This Approach

✅ **Works everywhere** - Any network, any country
✅ **Secure** - API key stays on server
✅ **Easy updates** - Just redeploy Vercel, no new APK
✅ **Fast** - Vercel's global CDN
✅ **Free** - Vercel free tier is generous
✅ **Professional** - This is how real apps work

---

## Development vs Production

### Development (Current)
```json
"server": {
  "url": "http://192.168.29.10:3002",
  "cleartext": true
}
```
- For you only
- Live reload
- Local testing

### Production (After Vercel)
```json
"server": {
  "url": "https://your-app.vercel.app",
  "cleartext": false
}
```
- For everyone
- Works anywhere
- Production ready

---

## Quick Commands

```bash
# Deploy to Vercel
vercel --prod

# Update Capacitor config with Vercel URL
# (edit capacitor.config.json manually)

# Sync and build
npx cap sync android
cd android && ./gradlew assembleDebug

# Install on phone
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## Troubleshooting

**"Failed to fetch" in APK:**
- Check Vercel URL is correct
- Ensure `cleartext: false` for HTTPS
- Verify environment variable is set in Vercel

**API key not working:**
- Go to Vercel dashboard → Settings → Environment Variables
- Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set
- Redeploy: `vercel --prod`

**APK still shows black screen:**
- Check Capacitor config has correct URL
- Run `npx cap sync android` after changing config
- Rebuild APK

---

## Next Steps

1. Deploy to Vercel (5 minutes)
2. Get your production URL
3. Update `capacitor.config.json`
4. Build new APK
5. Share with friends! 🚀

---

## Cost

- **Vercel:** Free tier (100GB bandwidth/month)
- **Gemini API:** Free tier (50 requests/day)
- **Total:** $0/month for testing

For production with more users, you'd upgrade both.
