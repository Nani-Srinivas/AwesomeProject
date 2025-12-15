# APK Network Error Fix - Step by Step

## ✅ **What We Know:**
- ✅ Postman works with `http://xxx.xxx.42.136:3000` 
- ❌ Mobile app shows "Network Error"

**Diagnosis:** APK was built with **wrong API_URL**!

---

## 🎯 **The Problem:**

When you build an APK, the `API_URL` from `.env` gets **BAKED INTO the APK**.

**Example of what probably happened:**

1. You built the APK when `.env` had:
   ```env
   API_URL=http://192.168.1.100:8000  ← OLD/LOCAL
   ```

2. You installed that APK on phone

3. Later you changed `.env` to:
   ```env
   API_URL=http://xxx.xxx.42.136:3000  ← PRODUCTION
   ```

4. But the **INSTALLED APK still has the OLD URL**!

---

## ✅ **Solution: Rebuild APK with Correct URL**

### **Step 1: Verify Current .env**

```bash
cd AwesomeProject
type .env
# Or: cat .env (Linux/Mac)
```

**Should show EXACTLY:**
```env
API_URL=http://xxx.xxx.42.136:3000
```

**If it shows anything else, fix it:**
```bash
echo API_URL=http://xxx.xxx.42.136:3000 > .env
```

---

### **Step 2: Clean Previous Build**

```bash
cd AwesomeProject/android
./gradlew clean
```

---

### **Step 3: Rebuild APK**

```bash
# Still in android folder
./gradlew assembleRelease
```

**Wait for build to complete (~5-10 minutes)**

---

### **Step 4: Locate New APK**

```
AwesomeProject/android/app/build/outputs/apk/release/app-release.apk
```

---

### **Step 5: Install Fresh APK on Phone**

1. **Delete old app** from phone (important!)
2. Copy new `app-release.apk` to phone
3. Install it
4. Try login again

---

## 🔍 **How to Verify API_URL in Code:**

Add a console.log to see what URL the app is using:

**File:** `AwesomeProject/src/api/axiosInstance.ts`

Add this line at the top (after imports):
```typescript
console.log('🌐 API Base URL:', process.env.API_URL);
```

**Then check React Native logs:**
```bash
npx react-native log-android
# Should show: 🌐 API Base URL: http://xxx.xxx.42.136:3000
```

---

## ⚠️ **Common Mistakes:**

### **Mistake 1: Didn't Delete Old App**
- Old app still has old URL cached
- **Fix:** Uninstall app completely, then install new APK

### **Mistake 2: Wrong .env Format**
```env
# ❌ WRONG
API_URL="http://xxx.xxx.42.136:3000"  ← No quotes!
API_URL=http://xxx.xxx.42.136:3000/   ← No trailing slash!

# ✅ CORRECT
API_URL=http://xxx.xxx.42.136:3000
```

### **Mistake 3: Used npm run android Instead of Building APK**
- `npm run android` is for development
- For distribution, you MUST use `./gradlew assembleRelease`

---

## 📱 **Quick Test Checklist:**

Before installing on phone:

- [ ] `.env` has correct IP: `http://xxx.xxx.42.136:3000`
- [ ] No quotes in `.env`
- [ ] No trailing slash in URL
- [ ] Ran `./gradlew clean`
- [ ] Ran `./gradlew assembleRelease`
- [ ] APK built successfully
- [ ] Deleted old app from phone
- [ ] Installed fresh APK

---

## 🧪 **Alternative: Test Without Rebuilding**

If you want to test quickly without rebuilding APK:

**Use USB debugging:**
```bash
cd AwesomeProject

# 1. Update .env
echo API_URL=http://xxx.xxx.42.136:3000 > .env

# 2. Clear cache
npm start -- --reset-cache

# 3. Run on connected phone
npm run android
```

**If this works via USB but APK doesn't:**
→ Confirms APK has wrong URL baked in
→ Need to rebuild APK

---

## 🎯 **Expected Result:**

After rebuilding APK with correct URL:

1. Install on phone
2. Open app
3. Try login
4. **Should connect to Oracle server!** ✅
5. No more "Network Error"

---

## 📝 **Still Not Working?**

If you rebuild APK and still get network error, check:

1. **Phone has internet?**
   - Try opening browser on phone
   - Go to: `http://xxx.xxx.42.136:3000/admin`
   - Should load

2. **Port 3000 blocked by phone carrier?**
   - Some carriers block certain ports
   - Try using port 80 or 8080 instead

3. **CORS issue?**
   - Check server logs when app makes request
   - Should see request in server console

---

**Try rebuilding the APK with the steps above and let me know!** 🚀
