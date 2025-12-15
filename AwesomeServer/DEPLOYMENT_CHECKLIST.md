# Server Production Deployment - Required Files Checklist

## ✅ **REQUIRED FILES - Must Upload**

### **1. Core Application Files**
```
AwesomeServer/
├── app.js                    ✅ Main entry point
├── package.json             ✅ Dependencies list
├── package-lock.json        ✅ Exact dependency versions
└── .gitignore              ✅ Prevent secrets in git
```

### **2. Source Code Directory**
```
AwesomeServer/src/           ✅ ENTIRE src folder
├── config/                  ✅ Database & app config
│   ├── config.js
│   ├── connect.js
│   └── setup.js
├── controllers/             ✅ All business logic
│   ├── auth/
│   ├── Inventory/
│   ├── Store/
│   └── ... (all controllers)
├── middleware/              ✅ Auth & validation
│   └── auth.js
├── models/                  ✅ Database schemas
│   ├── User/
│   ├── Product/
│   ├── Order/
│   └── ... (all models)
└── routes/                  ✅ API endpoints
    ├── index.js
    ├── auth.js
    └── ... (all routes)
```

---

## 🚫 **DO NOT UPLOAD - Exclude These**

### **Never Upload:**
```
❌ node_modules/           # Install on server with npm install
❌ .env                    # Create new on server with production values
❌ .adminjs/               # Generated automatically
❌ JWT_SECRETS.md          # Documentation only, not needed
❌ debugProductFilter.js   # Development debugging scripts
❌ migrateStoreId.js       # Migration scripts (run manually if needed)
❌ seedData.js             # Development seed data
❌ seedScript.js           # Development scripts
❌ scripts/                # Migration/utility scripts
❌ src copy/               # Backup folder, not needed
❌ attendance.md           # Documentation only
```

---

## 📝 **CREATE ON SERVER - Production Environment**

### **1. Create `.env` file on server:**
```env
# NEVER copy your local .env to production!
# Create fresh with production values:

NODE_ENV=production
PORT=10000

# MongoDB Atlas Connection (from PRODUCTION_SETUP.md step 4)
MONGO_URI=mongodb+srv://groceryapp:<password>@grocery-app-mvp.xxxxx.mongodb.net/grocery-db?retryWrites=true&w=majority

# Generate NEW JWT Secrets for production (different from development!)
ACCESS_TOKEN_SECRET=<generate-new-production-secret>
REFRESH_TOKEN_SECRET=<generate-new-production-secret>

# Email Configuration (if using email verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Base URL (your Render.com URL)
BASE_URL=https://grocery-backend-mvp.onrender.com

# CORS
CORS_ORIGIN=*
```

**How to generate production JWT secrets:**
```bash
# Run on your LOCAL machine, then copy to server .env
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📦 **Deployment Steps for Render.com**

### **Option 1: GitHub Deploy (Recommended)**

1. **Push ONLY these files to GitHub:**
   ```bash
   cd AwesomeServer
   
   # Verify .gitignore is correct
   cat .gitignore
   
   # Check what will be committed
   git status
   
   # Should show:
   # ✅ app.js
   # ✅ package.json
   # ✅ package-lock.json
   # ✅ src/ folder
   # ❌ NOT .env
   # ❌ NOT node_modules
   
   # Commit and push
   git add .
   git commit -m "Server ready for production"
   git push origin main
   ```

2. **On Render.com:**
   - Connect your GitHub repository
   - Render will automatically:
     - Read `package.json`
     - Run `npm install`
     - Start with `npm start`

3. **Add Environment Variables in Render Dashboard:**
   - Go to Environment → Add Environment Variable
   - Add each line from your `.env` file
   - Click "Save Changes"

### **Option 2: Manual Deploy (Alternative)**

If you can't use GitHub, create this structure on the server:

```
your-server/
├── app.js
├── package.json
├── package-lock.json
├── .env (create manually)
└── src/ (entire folder)
```

Then run:
```bash
npm install
npm start
```

---

## 🔧 **Production package.json Modifications**

Your current `package.json` has `nodemon`. For production, you should modify the start script:

### **Current (Development):**
```json
"scripts": {
  "start": "nodemon app.js"
}
```

### **Better for Production:**
```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

**Why?** `nodemon` is for development (auto-restart on changes). In production, use plain `node`.

**Update this before deploying!**

---

## 📋 **Complete Upload Checklist**

### **Before Upload:**
- [ ] Update `package.json` start script to use `node` instead of `nodemon`
- [ ] Verify `.gitignore` excludes `.env` and `node_modules`
- [ ] Test locally that app works with `node app.js` (not nodemon)
- [ ] Generate NEW JWT secrets for production
- [ ] Have MongoDB Atlas connection string ready

### **Files to Upload (if manual):**
- [ ] `app.js`
- [ ] `package.json` (modified)
- [ ] `package-lock.json`
- [ ] Entire `src/` folder with all subdirectories

### **On Production Server:**
- [ ] Create `.env` file with production values
- [ ] Run `npm install --production`
- [ ] Start server with `npm start`
- [ ] Test health endpoint: `curl https://your-server.com/health`

---

## 🎯 **File Size Reference**

Here's what you're uploading (approximate):

| Item | Size |
|------|------|
| `app.js` | 2.6 KB |
| `package.json` | 1 KB |
| `package-lock.json` | 387 KB |
| `src/` folder | ~500 KB |
| **Total** | **~1 MB** |

**Note:** `node_modules` (NOT uploaded) is ~200+ MB

---

## 🚀 **Quick Deploy Command Summary**

```bash
# 1. Verify your files
cd AwesomeServer
ls -la

# 2. Check gitignore working
git status

# 3. Push to GitHub
git add app.js package.json package-lock.json src/
git commit -m "Production ready server"
git push origin main

# 4. On Render.com:
#    - Connect GitHub repo
#    - Set environment variables
#    - Deploy!
```

---

## ⚠️ **CRITICAL SECURITY REMINDERS**

1. ✅ **NEVER** commit `.env` to GitHub
2. ✅ **ALWAYS** use different JWT secrets for production vs development
3. ✅ **CREATE** `.env` directly on server (don't upload from local)
4. ✅ **USE** MongoDB Atlas connection (not localhost)
5. ✅ **SET** NODE_ENV=production

---

## 🆘 **Troubleshooting Common Issues**

### **Issue: "Cannot find module"**
**Solution:** Run `npm install` on server

### **Issue: "Port already in use"**
**Solution:** Render.com sets PORT automatically, use `process.env.PORT`

### **Issue: "MongoDB connection failed"**
**Solution:** Check MONGO_URI in server .env, verify Atlas IP whitelist (set to 0.0.0.0/0)

### **Issue: "JWT secret not set"**
**Solution:** Add ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET to server environment variables

---

## 📞 **Ready to Deploy?**

Follow the [PRODUCTION_SETUP.md](file:///c:/Users/LionO/Downloads/Awesome/PRODUCTION_SETUP.md) guide for step-by-step Render.com deployment!

Your server is **production-ready** with all security fixes applied! 🚀
