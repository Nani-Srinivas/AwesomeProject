# APK Network Error - Android Cleartext Traffic Fix

## 🔒 **Problem: Android Blocks HTTP Traffic**

By default, Android 9+ blocks all HTTP (non-HTTPS) connections for security.

Your production server uses: `http://152.67.XX.XXX:3000` (HTTP, not HTTPS)

This causes **network error** in release APKs!

---

## ✅ **Fix Applied:**

### **File:** `android/app/build.gradle`

Added this line to `defaultConfig`:
```gradle
manifestPlaceholders = [usesCleartextTraffic:"true"]
```

This tells Android to **allow HTTP connections** for your app.

---

## 🚀 **Rebuild APK:**

```bash
cd AwesomeProject/android

# Clean previous build
./gradlew clean

# Build release APK
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📱 **Install & Test:**

1. Delete old app from phone
2. Install new APK
3. Try register/login
4. Should work now! ✅

---

## 🔍 **Verify .env is Correct:**

Before building, double-check:

```bash
cd AwesomeProject
type .env
```

**Should show EXACTLY:**
```
API_URL=http://152.67.XX.XXX:3000
```

**No quotes, no spaces, no trailing slash!**

---

## ⚠️ **For Production with HTTPS (Future):**

When you add SSL certificate and use HTTPS:

1. Change `API_URL` to `https://yourdomain.com`
2. Set `usesCleartextTraffic:"false"` (more secure)
3. Rebuild APK

**For MVP with HTTP:** Keep `usesCleartextTraffic:"true"`

---

This fix should resolve the network error! 🚀
