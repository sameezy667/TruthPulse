# 📱 Mobile Testing Guide (Simplified)

## The Challenge

Next.js with API routes cannot be exported as static files, which Capacitor requires for APK builds. 

## Solution: Live Reload Development

Instead of building an APK, we'll use **Capacitor Live Reload** to test on your phone in real-time.

---

## Option 1: Live Reload (Recommended for Testing)

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Step 2: Update Capacitor Config

Edit `capacitor.config.json`:
```json
{
  "appId": "com.sachai.app",
  "appName": "Sach.ai",
  "webDir": ".next",
  "server": {
    "url": "http://YOUR_IP_HERE:3002",
    "cleartext": true
  },
  "plugins": {
    "Camera": {
      "permissions": ["camera", "photos"]
    },
    "Haptics": {}
  }
}
```

Replace `YOUR_IP_HERE` with your computer's IP (e.g., `192.168.1.100`)

### Step 3: Start Dev Server
```bash
npm run dev
```

Server will run on `http://YOUR_IP:3002`

### Step 4: Sync and Open Android Studio
```bash
npx cap sync android
npx cap open android
```

### Step 5: Build and Install APK

In Android Studio:
1. Wait for Gradle sync
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for build (2-5 minutes)
4. Find APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 6: Install on Phone

**Via USB:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Via File Transfer:**
1. Copy APK to phone
2. Open and install

### Step 7: Test!

- Make sure phone and computer are on **same WiFi**
- Open app on phone
- It will connect to your dev server
- Changes update in real-time!

---

## Option 2: Standalone APK (For Distribution)

For a standalone APK that doesn't need the dev server, you need to deploy the API to a server first.

### Step 1: Deploy API to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

You'll get a URL like: `https://your-app.vercel.app`

### Step 2: Update API Calls

In your app, update the API endpoint:
```typescript
// Instead of '/api/analyze'
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/analyze';

fetch(API_URL, {...})
```

### Step 3: Build APK

Update `capacitor.config.json`:
```json
{
  "appId": "com.sachai.app",
  "appName": "Sach.ai",
  "webDir": ".next",
  "plugins": {...}
}
```

Remove the `server` section.

Then:
```bash
npm run build
npx cap sync android
npx cap open android
```

Build APK in Android Studio.

---

## Quick Testing Setup

### 1. Update Config
```json
{
  "appId": "com.sachai.app",
  "appName": "Sach.ai",
  "webDir": ".next",
  "server": {
    "url": "http://192.168.29.10:3002",
    "cleartext": true
  },
  "plugins": {
    "Camera": {"permissions": ["camera", "photos"]},
    "Haptics": {}
  }
}
```

### 2. Run Commands
```bash
# Start dev server
npm run dev

# In another terminal
npx cap sync android
npx cap open android
```

### 3. Build APK in Android Studio
- Build → Build APK
- Install on phone
- Test!

---

## Troubleshooting

### App Shows "Unable to connect"
- Check phone and computer are on same WiFi
- Check firewall isn't blocking port 3002
- Verify IP address is correct

### App Crashes
- Check Android Studio logs
- Run: `adb logcat | grep "Capacitor"`

### Camera Not Working
- Grant camera permission in phone settings
- Check AndroidManifest.xml has camera permission

### Haptics Not Working
- Some devices don't support haptics
- This is normal, app will work without it

---

## Testing Checklist

- [ ] Phone and computer on same WiFi
- [ ] Dev server running (`npm run dev`)
- [ ] Capacitor config has correct IP
- [ ] APK built and installed
- [ ] App opens successfully
- [ ] Profile selection works
- [ ] Camera opens
- [ ] Barcode scanner works
- [ ] AI analysis works
- [ ] Results display correctly

---

## Alternative: Test in Browser

For quick testing without building APK:

1. Start dev server: `npm run dev`
2. Open on phone browser: `http://YOUR_IP:3002`
3. Test all features (except camera/haptics)

---

## 🎯 Recommended Approach

**For Hackathon Demo:**
1. Use **Live Reload** for testing on your phone
2. Keep dev server running during demo
3. Show app on your phone
4. Explain it's a "development build"

**For Production:**
1. Deploy API to Vercel
2. Build standalone APK
3. Distribute to users

---

## Summary

**Quick Test (5 minutes):**
```bash
# 1. Update capacitor.config.json with your IP
# 2. Start server
npm run dev

# 3. Sync and build
npx cap sync android
npx cap open android

# 4. Build APK in Android Studio
# 5. Install on phone
# 6. Test!
```

**Your phone will connect to your computer's dev server and work like a native app!** 🚀
