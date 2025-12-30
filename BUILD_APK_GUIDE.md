# 📱 Build APK Guide

## Prerequisites

1. **Android Studio** installed
2. **Java JDK 17** installed
3. **Android SDK** installed (via Android Studio)
4. **Environment variables** set:
   - `ANDROID_HOME` = path to Android SDK
   - `JAVA_HOME` = path to JDK

## Step-by-Step Build Process

### Step 1: Build Next.js App
```bash
npm run build
```

This creates the `out` folder with static files.

### Step 2: Sync with Capacitor
```bash
npx cap sync android
```

This copies the `out` folder to the Android project.

### Step 3: Open in Android Studio
```bash
npx cap open android
```

This opens the Android project in Android Studio.

### Step 4: Build APK in Android Studio

1. **Wait for Gradle sync** to complete (bottom right corner)
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. **Wait for build** to complete (2-5 minutes)
4. **Click "locate"** in the notification to find the APK

**APK Location:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 5: Install on Phone

**Option A: Via USB**
1. Enable USB debugging on phone
2. Connect phone to computer
3. Run: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

**Option B: Via File Transfer**
1. Copy APK to phone
2. Open APK on phone
3. Allow installation from unknown sources
4. Install

---

## Quick Build Commands

### Full Build (All Steps)
```bash
# Build Next.js
npm run build

# Sync with Capacitor
npx cap sync android

# Open Android Studio
npx cap open android
```

### Rebuild After Changes
```bash
# Rebuild Next.js
npm run build

# Sync changes
npx cap sync android
```

---

## Common Issues & Fixes

### Issue 1: "ANDROID_HOME not set"
**Fix:**
```bash
# Windows
setx ANDROID_HOME "C:\Users\YourName\AppData\Local\Android\Sdk"

# Mac/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### Issue 2: "Java version mismatch"
**Fix:**
- Install JDK 17
- Set JAVA_HOME to JDK 17 path

### Issue 3: "Gradle sync failed"
**Fix:**
1. Open `android/build.gradle`
2. Update Gradle version if needed
3. Sync again

### Issue 4: "App crashes on launch"
**Fix:**
- Check `android/app/src/main/AndroidManifest.xml`
- Ensure permissions are correct
- Check logs: `adb logcat`

### Issue 5: "API calls fail"
**Fix:**
- Add internet permission to AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

---

## Testing on Phone

### Via USB Debugging
```bash
# Check connected devices
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep "Capacitor"
```

### Via Wireless Debugging (Android 11+)
1. Enable wireless debugging on phone
2. Pair device: `adb pair <ip>:<port>`
3. Connect: `adb connect <ip>:<port>`
4. Install APK

---

## Production Build (Release APK)

### Step 1: Generate Signing Key
```bash
keytool -genkey -v -keystore sachai-release-key.keystore -alias sachai -keyalg RSA -keysize 2048 -validity 10000
```

### Step 2: Configure Signing
Create `android/key.properties`:
```properties
storePassword=your_password
keyPassword=your_password
keyAlias=sachai
storeFile=../sachai-release-key.keystore
```

### Step 3: Update build.gradle
Add to `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 4: Build Release APK
In Android Studio:
1. **Build → Generate Signed Bundle / APK**
2. **Select APK**
3. **Choose keystore**
4. **Select release build type**
5. **Build**

**Release APK Location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## App Permissions

The app requires these permissions (already configured):

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.VIBRATE" />
```

---

## Debugging on Phone

### View Console Logs
```bash
# All logs
adb logcat

# Filter Capacitor logs
adb logcat | grep "Capacitor"

# Filter app logs
adb logcat | grep "sachai"

# Clear logs
adb logcat -c
```

### Chrome DevTools
1. Open Chrome on computer
2. Go to `chrome://inspect`
3. Find your device
4. Click "inspect"
5. Use DevTools like web browser

---

## App Size Optimization

### Current APK Size
- Debug: ~50-70 MB
- Release: ~30-50 MB

### Reduce Size
1. **Enable ProGuard** (minification)
2. **Remove unused resources**
3. **Use WebP images**
4. **Enable code splitting**

---

## Testing Checklist

Before distributing APK:

- [ ] App launches successfully
- [ ] Profile selection works
- [ ] Camera opens and captures
- [ ] Barcode scanner works
- [ ] Image upload works
- [ ] AI analysis works
- [ ] Results display correctly
- [ ] Haptic feedback works
- [ ] Animations are smooth
- [ ] Back button works
- [ ] App doesn't crash
- [ ] Network errors handled
- [ ] Permissions requested properly

---

## Distribution

### Internal Testing
1. Share APK via Google Drive, Dropbox, etc.
2. Users install manually
3. Collect feedback

### Google Play (Beta)
1. Create Google Play Console account
2. Upload APK
3. Create internal testing track
4. Add testers
5. Distribute

### Direct Download
1. Host APK on your server
2. Share download link
3. Users install manually

---

## Troubleshooting

### App Won't Install
- Check Android version (minimum: Android 7.0)
- Enable "Install from unknown sources"
- Uninstall old version first

### App Crashes
- Check logs: `adb logcat`
- Verify API key is set
- Check network connectivity

### Camera Not Working
- Grant camera permission
- Check AndroidManifest.xml
- Test on different device

### Haptics Not Working
- Some devices don't support haptics
- Check device settings
- Haptics fail silently (by design)

---

## Next Steps

1. **Build debug APK** for testing
2. **Test on your phone**
3. **Fix any issues**
4. **Build release APK** for distribution
5. **Share with testers**

---

## Quick Reference

```bash
# Build everything
npm run build && npx cap sync android && npx cap open android

# Install on connected phone
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep "Capacitor"

# Uninstall from phone
adb uninstall com.sachai.app
```

---

## 🎯 Ready to Build?

Run these commands in order:

```bash
# 1. Build Next.js
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open Android Studio
npx cap open android
```

Then in Android Studio:
1. Wait for Gradle sync
2. Build → Build APK
3. Find APK in `android/app/build/outputs/apk/debug/`
4. Install on phone!

**Good luck! 🚀**
