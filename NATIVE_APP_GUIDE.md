# Sach.ai Native App Build Guide

## 🚨 Prerequisites

### 1. Upgrade Node.js to v22+
Capacitor 8.x requires Node.js 22 or higher.

**Windows:**
```powershell
# Download from nodejs.org
# Or use nvm-windows:
nvm install 22
nvm use 22
```

**Mac/Linux:**
```bash
# Using nvm:
nvm install 22
nvm use 22
```

Verify:
```powershell
node --version  # Should show v22.x.x
```

---

## 📱 Native App Setup (After Node 22 Upgrade)

### Step 1: Add Native Platforms

```powershell
cd "c:\Visual Studio Code\Sach.ai"

# Add iOS platform (Mac only)
npm run cap:add:ios

# Add Android platform
npm run cap:add:android
```

This creates:
- `ios/` folder with Xcode project
- `android/` folder with Android Studio project

---

### Step 2: Development Mode (Run from localhost)

The app is currently configured to run against `http://localhost:3000` during development.

#### Terminal 1: Start Next.js Server
```powershell
npm run dev
```

#### Terminal 2: Open Native App
```powershell
# iOS (Mac only)
npm run cap:ios

# Android
npm run cap:android
```

**What This Does:**
- Opens Xcode/Android Studio
- App loads from your local dev server
- Hot reload works
- Full API access (Gemini AI analysis)

---

### Step 3: iOS Setup (Mac Required)

1. **Open in Xcode:**
   ```bash
   npm run cap:ios
   ```

2. **Configure Project:**
   - Select project in left sidebar
   - Go to "Signing & Capabilities"
   - Select your Team
   - Change Bundle Identifier: `com.sachai.app`

3. **Add Camera Permission:**
   - Open `ios/App/App/Info.plist`
   - Add these keys:
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>Sach.ai needs camera access to scan food labels and analyze ingredients</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>Sach.ai needs photo access to analyze saved food images</string>
   ```

4. **Run on Device/Simulator:**
   - Select target device
   - Click ▶️ Run button
   - App should launch and connect to `localhost:3000`

---

### Step 4: Android Setup

1. **Open in Android Studio:**
   ```powershell
   npm run cap:android
   ```

2. **Configure Project:**
   - Open `android/app/build.gradle`
   - Verify `applicationId "com.sachai.app"`

3. **Camera Permission (Auto-Added):**
   Capacitor Camera plugin automatically adds:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   ```

4. **Run on Device/Emulator:**
   - Select target device
   - Click ▶️ Run button
   - App launches and connects to your dev server

---

## 🌐 Network Configuration for Testing

### Windows Firewall (Important!)
Allow Node.js through firewall so mobile devices can access `localhost:3000`:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Node.js Dev Server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

### Find Your Local IP:
```powershell
ipconfig | Select-String "IPv4"
```

### Update Capacitor Config:
Edit `capacitor.config.json`:
```json
{
  "server": {
    "url": "http://YOUR_LOCAL_IP:3000",
    "cleartext": true
  }
}
```

Then sync:
```powershell
npm run cap:sync
```

---

## 📦 Production Build (Standalone App)

For a standalone app that doesn't need localhost, you need to deploy the API separately.

### Option A: Use Vercel for API + Static Frontend

1. **Deploy API to Vercel:**
   ```powershell
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

2. **Update API Base URL:**
   Edit `app/page.tsx`:
   ```typescript
   const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://your-vercel-domain.vercel.app';
   
   const response = await fetch(`${API_BASE}/api/analyze`, {
     method: 'POST',
     // ...
   });
   ```

3. **Build Static Export:**
   ```powershell
   # Update next.config.js
   output: 'export'
   
   # Build
   npm run build
   ```

4. **Sync to Native:**
   ```powershell
   npm run cap:sync
   ```

### Option B: Bundle API with Native App (Not Recommended)

This requires running a Node.js server inside the app, which is complex and not officially supported.

---

## 🧪 Testing the Camera

### On Simulator/Emulator:
- iOS Simulator: Camera picker shows
- Android Emulator: Camera works if emulator has camera enabled

### On Real Device:
1. Connect device via USB
2. Enable Developer Mode
3. Select device in Xcode/Android Studio
4. Run app
5. Grant camera permissions when prompted

### Test Flow:
1. Select profile (e.g., "Vegan")
2. Tap "Open Camera" button
3. Take photo of food label
4. Watch reasoning terminal
5. See generative UI result (Safe/Risk/Decision/Uncertain)

---

## 🎨 Customizing the Native App

### App Icon (iOS)
1. Generate icons: https://www.appicon.co/
2. Replace: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### App Icon (Android)
1. Generate icons: https://www.appicon.co/
2. Replace: `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Launch Screen (iOS)
Edit: `ios/App/App/Base.lproj/LaunchScreen.storyboard`

### Launch Screen (Android)
Edit: `android/app/src/main/res/values/styles.xml`

---

## 🚀 App Store Deployment

### iOS App Store

1. **Archive in Xcode:**
   - Product → Archive
   - Distribute App → App Store Connect

2. **App Store Connect:**
   - Create new app
   - Fill metadata (screenshots, description)
   - Submit for review

3. **Review Tips:**
   - Provide test account if needed
   - Explain AI-generated content
   - Include privacy policy URL

### Google Play Store

1. **Generate Signed APK:**
   - Build → Generate Signed Bundle/APK
   - Create new keystore
   - Build release bundle

2. **Google Play Console:**
   - Create new app
   - Upload AAB file
   - Fill store listing
   - Submit for review

---

## 🐛 Troubleshooting

### "Cannot connect to localhost"
- Ensure dev server is running: `npm run dev`
- Check firewall allows Node.js
- Use local IP instead of localhost in capacitor.config.json

### "Camera not working"
- Check permissions in Info.plist (iOS)
- Verify AndroidManifest.xml has camera permission (Android)
- Test on real device (simulators have limited camera)

### "API key invalid"
- Ensure `.env.local` exists
- Verify `GEMINI_API_KEY` is set
- API routes only work with dev server running

### "Module not found: @capacitor/camera"
```powershell
npm install @capacitor/camera @capacitor/core
npm run cap:sync
```

---

## 📊 Architecture Overview

```
Mobile App (Native)
     ↓
Capacitor WebView
     ↓
Next.js Frontend (React)
     ↓
API Route (/api/analyze)
     ↓
Gemini AI (Google)
```

**Development Flow:**
1. Native app loads from `localhost:3000`
2. User captures image with native camera
3. Image sent to Next.js API route
4. API calls Gemini AI
5. Generative UI renders based on response

**Production Flow:**
1. Frontend deployed as static files (Vercel/Netlify)
2. API deployed separately (Vercel Serverless)
3. Native app makes cross-origin requests
4. Requires CORS configuration

---

## ✅ Quick Start Checklist

- [ ] Upgrade to Node.js 22+
- [ ] Run `npm install`
- [ ] Add native platforms: `npm run cap:add:ios` / `npm run cap:add:android`
- [ ] Start dev server: `npm run dev`
- [ ] Open Xcode/Android Studio: `npm run cap:ios` / `npm run cap:android`
- [ ] Configure signing & bundle ID
- [ ] Add camera permissions
- [ ] Test on real device
- [ ] Deploy API to Vercel
- [ ] Update API base URL
- [ ] Build and submit to app stores

---

## 🔗 Useful Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Capacitor Camera**: https://capacitorjs.com/docs/apis/camera
- **Next.js + Capacitor**: https://capacitorjs.com/solution/nextjs
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Google Play Guidelines**: https://play.google.com/about/developer-content-policy/

---

## Current Status

✅ Next.js app configured  
✅ Capacitor config ready  
✅ Camera plugin integrated  
✅ API routes functional  
⏳ **Waiting for Node.js 22 upgrade**  
⏳ Native platforms to be added  

**Next Command (After Node 22):**
```powershell
npm run cap:add:ios
npm run cap:add:android
```
