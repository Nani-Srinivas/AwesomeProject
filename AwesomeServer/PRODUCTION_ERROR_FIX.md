# Production Deployment Error - Quick Fix Guide

## 🚨 **Critical Error: MongoDB Connection Failed**

Your error shows:
```
Error: Error connecting to db: getaddrinfo EAI_AGAIN oracle
```

**Problem:** The server is trying to connect to a host named "oracle" instead of MongoDB Atlas.

---

## 🔧 **Root Cause:**

The `MONGO_URI` environment variable on your production server is **NOT set correctly** or **NOT set at all**.

---

## ✅ **SOLUTION - Fix MongoDB Connection**

### **Step 1: Check Your Render.com Environment Variables**

1. Go to your Render.com dashboard
2. Click your service → **Environment** tab
3. Look for `MONGO_URI` variable

### **Step 2: Verify MONGO_URI Format**

Your `MONGO_URI` should look like this:

```
mongodb+srv://groceryapp:<password>@grocery-app-mvp.xxxxx.mongodb.net/grocery-db?retryWrites=true&w=majority
```

**NOT like this:**
```
mongodb://localhost:27017/grocery-db  ❌
mongodb://oracle/grocery-db           ❌
```

### **Step 3: Get Correct MongoDB Atlas Connection String**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your actual database password

**Example:**
```
mongodb+srv://groceryapp:MySecretPass123@grocery-app-mvp.abc123.mongodb.net/grocery-db?retryWrites=true&w=majority
```

### **Step 4: Update on Render.com**

1. In Render.com → Environment tab
2. Find `MONGO_URI` or add it if missing
3. Paste the correct connection string
4. Click **Save Changes**
5. Server will restart automatically

---

## 🔍 **Secondary Issue: Duplicate Mongoose Index**

The warning:
```
Duplicate schema index on {"businessDate":1}
```

This is **non-critical** but should be fixed.

### **Cause:**
Some model has duplicate index definitions.

### **Quick Fix:**

I'll search for businessDate index duplicates and fix them after we resolve the MongoDB connection.

---

## 📋 **Complete Environment Variables Checklist**

Make sure you have ALL these in Render.com:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://groceryapp:<password>@grocery-app-mvp.xxxxx.mongodb.net/grocery-db?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=<your-generated-secret>
REFRESH_TOKEN_SECRET=<your-generated-secret>
CORS_ORIGIN=*
```

**Optional (if using email):**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
BASE_URL=https://your-app.onrender.com
```

---

## 🚀 **Quick Test After Fix**

After updating MONGO_URI, wait for server to restart (2-3 minutes), then test:

```bash
# Check if server is running
curl https://your-app.onrender.com/health

# Should return server health status
```

---

## ⚡ **Immediate Action Required:**

1. ✅ Get MongoDB Atlas connection string
2. ✅ Add/Update `MONGO_URI` in Render.com environment variables
3. ✅ Save and wait for restart
4. ✅ Check logs for "DB CONNECTED ✅"

The "oracle" error will disappear once `MONGO_URI` is set correctly!
