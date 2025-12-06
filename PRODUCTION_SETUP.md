# Production Setup Guide - MVP Deployment (Zero Budget)

> **Target:** Deploy grocery delivery app for MVP testing in Telangana with zero budget

---

## Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment (Render.com)](#backend-deployment-rendercom)
4. [Mobile App Production Build](#mobile-app-production-build)
5. [APK Distribution](#apk-distribution)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Testing Strategy](#testing-strategy)
8. [Launch Checklist](#launch-checklist)

---

## Tech Stack Overview

| Component | Service | Free Tier Limit | Status |
|-----------|---------|-----------------|--------|
| Backend Hosting | Render.com | 750 hrs/month | ✅ Recommended |
| Database | MongoDB Atlas | 512 MB | ✅ Sufficient |
| Error Tracking | Sentry | 5K errors/month | ✅ Essential |
| Analytics | Google Analytics 4 | Unlimited | ✅ Free forever |
| Uptime Monitor | UptimeRobot | 50 monitors | ✅ Optional |
| APK Distribution | Firebase App Distribution | Unlimited | ✅ Recommended |
| Push Notifications | Firebase Cloud Messaging | Unlimited | ⏳ Phase 2 |

**Estimated capacity:** 500+ customers, 2,000+ orders, 5,000+ products

---

## MongoDB Atlas Setup

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google/GitHub (faster)
3. Choose **Free M0 Cluster**

### Step 2: Create Cluster
```
Cluster Name: grocery-app-mvp
Provider: AWS
Region: Mumbai (ap-south-1) - Closest to Telangana
Tier: M0 Sandbox (FREE)
```

### Step 3: Configure Security
1. **Database Access:**
   - Username: `groceryapp`
   - Password: Generate strong password (save it!)
   - Role: `Atlas admin`

2. **Network Access:**
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For MVP only! Restrict later.

### Step 4: Get Connection String
```
mongodb+srv://groceryapp:<password>@grocery-app-mvp.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
Replace `<password>` with your actual password.

### Step 5: Set Up Alerts
1. Go to "Alerts" → "Settings"
2. Enable "Cluster Storage" alert at 80%
3. Add your email for notifications

**✅ MongoDB Atlas is ready!**

---

## Backend Deployment (Render.com)

### Step 1: Prepare Backend Code

#### 1.1 Update `AwesomeServer/package.json`
Ensure start script is present:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

Move all dependencies from `devDependencies` to `dependencies`:
```bash
cd AwesomeServer
# Check all packages are in dependencies
npm install --production
```

#### 1.2 Create `AwesomeServer/.env.production`
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://groceryapp:<password>@grocery-app-mvp.xxxxx.mongodb.net/grocery-db?retryWrites=true&w=majority
JWT_SECRET=<generate-strong-random-string-here>
JWT_REFRESH_SECRET=<generate-another-strong-random-string>
CORS_ORIGIN=*
```

**Generate JWT secrets:**
```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 1.3 Update Server CORS Configuration
In `AwesomeServer/src/index.js` or main server file:
```javascript
// Update CORS to use environment variable
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};
app.use(cors(corsOptions));
```

### Step 2: Push to GitHub
```bash
cd AwesomeServer
git init
git add .
git commit -m "Initial backend setup for production"
git branch -M main
git remote add origin https://github.com/yourusername/grocery-backend.git
git push -u origin main
```

### Step 3: Deploy to Render.com

1. **Create Account**
   - Go to [Render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `AwesomeServer` repository

3. **Configure Service**
   ```
   Name: grocery-backend-mvp
   Region: Singapore (closest to India)
   Branch: main
   Root Directory: (leave empty or specify if backend is in subdirectory)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables**
   - Click "Environment" tab
   - Add all variables from `.env.production`:
     ```
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your-secret
     JWT_REFRESH_SECRET=your-refresh-secret
     CORS_ORIGIN=*
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first build
   - You'll get a URL: `https://grocery-backend-mvp.onrender.com`

### Step 4: Test Backend
```bash
# Test health endpoint
curl https://grocery-backend-mvp.onrender.com/health

# Test login endpoint
curl -X POST https://grocery-backend-mvp.onrender.com/api/customer/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**✅ Backend is live!**

---

## Mobile App Production Build

### Step 1: Remove Development Code

#### 1.1 Remove Dummy Credentials
**File:** `AwesomeProject/src/screens/Auth/LoginScreen.tsx`

**REMOVE these lines:**
```typescript
// ❌ DELETE THESE
const testEmail = 'test@example.com';
const testPassword = 'password';
```

#### 1.2 Remove Auto-Login Code
**File:** `AwesomeProject/src/navigation/AppNavigator.tsx`

**REMOVE:**
```typescript
// ❌ DELETE THIS
// setIsLoggedIn(true);
```

### Step 2: Configure Production Environment

#### 2.1 Update `.env`
**File:** `AwesomeProject/.env`
```env
# Production API URL from Render.com
API_URL=https://grocery-backend-mvp.onrender.com

# For testing on physical device, use your machine IP
# API_URL=http://192.168.x.x:8000
```

#### 2.2 Update `axiosInstance.ts`
**File:** `AwesomeProject/src/api/axiosInstance.ts`

Remove development fallbacks:
```typescript
import Config from 'react-native-config';

const API_URL = Config.API_URL || 'https://grocery-backend-mvp.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increase timeout for free tier cold starts
});
```

### Step 3: Generate Signing Key

```bash
cd AwesomeProject/android/app

# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 -keystore grocery-release-key.keystore -alias grocery-key -keyalg RSA -keysize 2048 -validity 10000

# You'll be asked:
# Keystore password: <choose-strong-password>
# Re-enter: <same-password>
# First and Last name: Your Name
# Org Unit: Your Company
# Org: Your Company
# City: Hyderabad
# State: Telangana
# Country: IN
```

**⚠️ IMPORTANT:** Save the password securely! You'll need it for every release.

**🔒 Security:** Add to `.gitignore`:
```bash
echo "*.keystore" >> AwesomeProject/android/.gitignore
echo "*.jks" >> AwesomeProject/android/.gitignore
```

### Step 4: Configure Release Build

#### 4.1 Update `android/gradle.properties`
**File:** `AwesomeProject/android/gradle.properties`

Add at the end:
```properties
MYAPP_RELEASE_STORE_FILE=grocery-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=grocery-key
MYAPP_RELEASE_STORE_PASSWORD=<your-keystore-password>
MYAPP_RELEASE_KEY_PASSWORD=<your-keystore-password>
```

**⚠️ Don't commit this file with passwords!**

#### 4.2 Update `android/app/build.gradle`
**File:** `AwesomeProject/android/app/build.gradle`

Add signing config:
```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

Update version:
```gradle
defaultConfig {
    applicationId "com.awesomeproject" // Change this to your unique ID
    minSdkVersion 21
    targetSdkVersion 34
    versionCode 1
    versionName "1.0.0"
}
```

### Step 5: Build Release APK

```bash
cd AwesomeProject

# Clean previous builds
cd android && ./gradlew clean && cd ..

# Build release APK
cd android && ./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

**Build time:** 5-10 minutes

### Step 6: Test Release APK

1. Copy APK to your phone
2. Install (you may need to enable "Install from Unknown Sources")
3. Test all core features:
   - ✅ Login/Register
   - ✅ Product browsing
   - ✅ Add to cart
   - ✅ Place order
   - ✅ Delivery partner features

**✅ Production APK ready!**

---

## APK Distribution

### Option A: Firebase App Distribution (Recommended)

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name: `grocery-app-mvp`
4. Disable Analytics (for MVP) or enable if you want
5. Create project

#### Step 2: Add Android App
1. In Firebase Console, click Android icon
2. Package name: `com.awesomeproject` (must match your app)
3. Download `google-services.json`
4. Place in `AwesomeProject/android/app/`

#### Step 3: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### Step 4: Install App Distribution Plugin
**File:** `AwesomeProject/android/build.gradle`
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
        classpath 'com.google.firebase:firebase-appdistribution-gradle:4.0.1'
    }
}
```

**File:** `AwesomeProject/android/app/build.gradle`
```gradle
apply plugin: 'com.google.gms.google-services'
apply plugin: 'com.google.firebase.appdistribution'
```

#### Step 5: Upload APK
```bash
cd AwesomeProject

firebase appdistribution:distribute \
  android/app/build/outputs/apk/release/app-release.apk \
  --app <your-firebase-app-id> \
  --release-notes "MVP Version 1.0.0 - Initial Release" \
  --groups testers
```

#### Step 6: Invite Testers
1. Go to Firebase Console → App Distribution
2. Click "Testers & Groups"
3. Add tester emails
4. They'll receive email with download link

**✅ Professional distribution setup!**

---

### Option B: Direct APK Sharing (Quick & Simple)

1. **Upload to Google Drive**
   ```
   - Create folder: "Grocery App Beta"
   - Upload app-release.apk
   - Set sharing: Anyone with link can view
   - Copy link
   ```

2. **Create Installation Guide** (share with testers)
   ```
   Installation Instructions:
   
   1. Download APK: [Your Google Drive Link]
   2. On your Android phone:
      - Go to Settings → Security
      - Enable "Install from Unknown Sources"
   3. Open downloaded APK
   4. Click "Install"
   5. Open app and register
   
   For support: [Your WhatsApp/Email]
   ```

3. **Distribution Channels**
   - WhatsApp groups
   - Telegram channels
   - Email to beta testers

**✅ Simple distribution ready!**

---

## Monitoring & Analytics

### 1. Sentry (Error Tracking)

#### Backend Setup
```bash
cd AwesomeServer
npm install @sentry/node @sentry/profiling-node
```

**File:** `AwesomeServer/src/index.js`
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

#### Mobile App Setup
```bash
cd AwesomeProject
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p android
```

**Get DSN from:** https://sentry.io → Create Project → Copy DSN

### 2. Google Analytics

```bash
cd AwesomeProject
npm install @react-native-firebase/app @react-native-firebase/analytics
```

**Configure in Firebase Console** → Analytics → Enable

Track key events:
```typescript
import analytics from '@react-native-firebase/analytics';

// Track screen views
analytics().logScreenView({ screen_name: 'ProductList' });

// Track events
analytics().logEvent('add_to_cart', { product_id: '123' });
```

### 3. UptimeRobot (Server Monitoring)

1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Add monitor:
   ```
   Type: HTTP(s)
   URL: https://grocery-backend-mvp.onrender.com/health
   Interval: 5 minutes
   Alert: Email when down
   ```

**✅ Monitoring setup complete!**

---

## Testing Strategy

### Phase 1: Internal Testing (Week 1)
**Goal:** Find critical bugs

**Testers:** 5-10 people you know
- Friends/family
- Colleagues

**Focus:**
- Can users login/register?
- Can they browse products?
- Can they add to cart and checkout?
- Does delivery partner flow work?

**Tools:**
- Google Forms for feedback
- WhatsApp group for quick bug reports

### Phase 2: Limited Beta (Week 2-3)
**Goal:** Real-world validation

**Testers:** 30-50 real users
- Partner with 2-3 grocery stores
- Recruit 5-10 delivery partners
- Focus on 1-2 areas in Hyderabad

**Focus:**
- Real orders and deliveries
- Payment flows
- User experience issues
- Performance problems

### Phase 3: Expanded Beta (Week 4-6)
**Goal:** Scale testing

**Testers:** 100-200 users
- Expand to more areas
- More stores and delivery partners

**Focus:**
- Server performance
- Database scaling
- Business model validation
- User retention

---

## Launch Checklist

### Pre-Launch (DO THIS FIRST!)

#### Security
- [ ] Remove dummy credentials from `LoginScreen.tsx`
- [ ] Remove auto-login code from `AppNavigator.tsx`
- [ ] Generate strong JWT secrets
- [ ] Configure CORS properly
- [ ] Review all API endpoints for authentication

#### Backend
- [ ] MongoDB Atlas cluster created
- [ ] Database alerts configured (80% storage)
- [ ] Backend deployed to Render.com
- [ ] Environment variables configured
- [ ] Health endpoint tested
- [ ] API endpoints tested

#### Mobile App
- [ ] Production `.env` configured
- [ ] Release keystore generated and secured
- [ ] Version code/name updated
- [ ] Release APK built successfully
- [ ] APK tested on 3+ different devices
- [ ] ProGuard enabled for smaller size

#### Distribution
- [ ] Firebase project created (if using App Distribution)
- [ ] APK uploaded and tested
- [ ] Tester invitation process ready
- [ ] Installation guide prepared
- [ ] Support channel setup (WhatsApp/Email)

#### Monitoring
- [ ] Sentry configured (backend)
- [ ] Sentry configured (mobile app)
- [ ] Google Analytics setup
- [ ] UptimeRobot monitoring active
- [ ] Error alert emails configured

#### Documentation
- [ ] Tester recruitment plan
- [ ] Feedback collection form
- [ ] Bug report template
- [ ] Installation instructions
- [ ] FAQ document

### Launch Day
- [ ] Final APK build
- [ ] Upload to distribution channel
- [ ] Invite first batch of testers (5-10)
- [ ] Monitor Sentry for errors
- [ ] Check server logs
- [ ] Be available for support

### Post-Launch (Week 1)
- [ ] Review crash reports daily
- [ ] Respond to tester feedback
- [ ] Fix critical bugs immediately
- [ ] Release hotfix if needed
- [ ] Track key metrics:
  - Daily active users
  - Crash rate
  - Order completion rate
  - User retention

---

## Free Tier Limitations & Workarounds

### Render.com Sleep Issue
**Problem:** Server sleeps after 15 mins of inactivity
**Impact:** First request takes 30-60 seconds

**Workarounds:**
1. Set up UptimeRobot to ping every 14 minutes (keeps awake)
2. Show "Loading..." message in app for first request
3. Implement optimistic UI where possible

### MongoDB 512MB Limit
**Problem:** Limited storage

**Workarounds:**
1. Monitor usage weekly
2. Set up alerts at 80%
3. Implement data archiving strategy
4. Clean up old logs/test data
5. Upgrade to $9/month when needed

### Firebase App Distribution
**Problem:** Requires Google sign-in

**Workaround:**
1. Provide direct APK download as alternative
2. Clear instructions for testers
3. WhatsApp support for installation issues

---

## Upgrade Path (When You Scale)

| Milestone | Recommended Upgrades | Cost |
|-----------|---------------------|------|
| **100 DAU** | Render Starter Plan | $7/month |
| **500 Customers** | MongoDB M2 (2GB) | $9/month |
| **Revenue: ₹10k/month** | Google Play Developer | $25 one-time |
| **1000 DAU** | Render Professional | $25/month |
| **5GB Database** | MongoDB M10 | $57/month |
| **iOS Launch** | Apple Developer | $99/year |

DAU = Daily Active Users

---

## Support & Resources

### Documentation
- [Render.com Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)

### Communities
- [Render Community](https://community.render.com/)
- [MongoDB Community](https://www.mongodb.com/community/forums/)
- [React Native Discord](https://discord.gg/react-native)

### Tools
- [Sentry](https://sentry.io)
- [UptimeRobot](https://uptimerobot.com)
- [Google Analytics](https://analytics.google.com)

---

## Next Steps

1. **Read this entire document**
2. **Start with MongoDB Atlas setup** (15 mins)
3. **Deploy backend to Render.com** (30 mins)
4. **Build production APK** (1 hour)
5. **Set up distribution** (30 mins)
6. **Configure monitoring** (30 mins)
7. **Invite first testers** (Day 1)

**Total setup time: ~3 hours**

---

## Quick Commands Reference

```bash
# Build Release APK
cd AwesomeProject/android && ./gradlew assembleRelease

# Find APK
# Location: android/app/build/outputs/apk/release/app-release.apk

# Test Backend
curl https://your-backend-url.onrender.com/health

# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Check APK Size
ls -lh android/app/build/outputs/apk/release/app-release.apk

# Firebase Deploy
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk --app YOUR_APP_ID
```

---

**Good luck with your MVP launch! 🚀**

For questions or issues during setup, refer back to this guide or consult the official documentation linked above.
