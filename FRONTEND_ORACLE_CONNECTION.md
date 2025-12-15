# Frontend → Oracle Production Server Connection Guide

## 🏗️ **Your Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S MOBILE APP                        │
│                   (React Native - Android)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API Calls
                       │ http://<oracle-ip>:3000/api/...
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              ORACLE COMPUTE INSTANCE (VM)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Your Server (Node.js/Fastify)                     │    │
│  │  Running on: http://0.0.0.0:3000                   │    │
│  │  Located: /var/www/AwesomeServer                   │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│                   │ MongoDB Connection                       │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│        ORACLE AUTONOMOUS JSON DATABASE                       │
│        (Managed MongoDB-compatible database)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 **How It Works:**

### **Backend (Server):**
- **Location:** Oracle Compute Instance (VM)
- **Server URL:** `http://<your-oracle-ip>:3000`
- **Database:** Oracle Autonomous JSON Database
- **Database URL in server `.env`:** `MONGO_URI=mongodb://...` (Oracle JSON DB)

### **Frontend (Mobile App):**
- **Needs to call:** `http://<your-oracle-ip>:3000/api/...`
- **Configure in:** `AwesomeProject/.env`

---

## ✅ **What You Need:**

### **1. Oracle Instance Public IP**
Get it from Oracle Cloud Console → Compute → Instances → Your Instance

Example: `132.145.XXX.XXX`

### **2. Open Firewall Port 3000**
Your Oracle instance needs to allow incoming traffic on port 3000:

**Security List Rules:**
- Protocol: TCP
- Source: 0.0.0.0/0 (or your specific IPs)
- Destination Port: 3000

---

## 🔧 **Update Frontend Configuration:**

### **File:** `AwesomeProject/.env`

```env
# Local Development
# API_URL=http://192.168.1.100:8000

# Production - Oracle Cloud
API_URL=http://132.145.XXX.XXX:3000

# Replace XXX.XXX with your actual Oracle instance IP
```

**Example:**
```env
API_URL=http://132.145.89.123:3000
```

---

## 🔒 **Important Security Notes:**

### **⚠️ Using HTTP (Not HTTPS)**

Since you're on a zero-budget MVP:
- You're using **HTTP** (not secure)
- This is **OK for testing** in Telangana region
- For production, you should use HTTPS

### **For Future (HTTPS):**
1. Get a domain name (free: Freenom, or cheap: Namecheap)
2. Point domain to Oracle IP
3. Install SSL certificate (free: Let's Encrypt)
4. Update `API_URL=https://yourdomain.com`

---

## 📝 **Step-by-Step Setup:**

### **Step 1: Get Oracle Instance IP**
```bash
# On your Oracle instance, run:
curl ifconfig.me

# Or check Oracle Console → Compute → Instance Details
```

### **Step 2: Open Port 3000 on Oracle**

**Oracle Cloud Console:**
1. Go to **Networking** → **Virtual Cloud Networks**
2. Click your VCN → **Security Lists**
3. Click **Default Security List**
4. Click **Add Ingress Rules**
5. Add:
   ```
   Source: 0.0.0.0/0
   Protocol: TCP
   Destination Port Range: 3000
   ```
6. Click **Add Ingress Rule**

**On the Oracle Instance (Linux firewall):**
```bash
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### **Step 3: Update Frontend `.env`**

**On your local machine:**
```bash
cd AwesomeProject

# Edit .env file
notepad .env
# Or: code .env
```

**Add:**
```env
API_URL=http://<your-oracle-ip>:3000
```

### **Step 4: Rebuild Mobile App**

```bash
cd AwesomeProject

# Clear cache
npm start -- --reset-cache

# Rebuild Android app
npm run android
```

---

## 🧪 **Test the Connection:**

### **1. Test from Browser (on your PC):**
```
http://<oracle-ip>:3000/admin
```
Should show AdminJS login

### **2. Test API Endpoint:**
```bash
curl http://<oracle-ip>:3000/api/user
```

### **3. Test from Mobile App:**
Open your app and try to login!

---

## 🎯 **Complete Configuration Example:**

### **Server (Oracle Instance) - `.env`:**
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://...oracle-autonomous-db.../grocery-db
ACCESS_TOKEN_SECRET=<generated-secret>
REFRESH_TOKEN_SECRET=<generated-secret>
COOKIE_PASSWORD=<generated-secret>
CORS_ORIGIN=*
```

### **Frontend (React Native) - `.env`:**
```env
API_URL=http://132.145.89.123:3000
```

---

## ❓ **Common Issues & Fixes:**

### **Issue 1: "Network Request Failed"**
**Cause:** Firewall blocking port 3000

**Fix:**
```bash
# Check if server is listening
sudo netstat -tlnp | grep 3000

# Check firewall
sudo firewall-cmd --list-all
```

### **Issue 2: "Connection Timeout"**
**Cause:** Oracle Security List not configured

**Fix:** Add ingress rule for port 3000 (see Step 2 above)

### **Issue 3: "Cannot connect from mobile"**
**Cause:** Mobile and Oracle not on same network

**Fix:** 
- Use Oracle **PUBLIC IP** (not private IP)
- Ensure port 3000 is open to internet (0.0.0.0/0)

---

## 🚀 **Quick Checklist:**

- [ ] Got Oracle instance public IP
- [ ] Opened port 3000 in Oracle Security List
- [ ] Opened port 3000 in Oracle instance firewall
- [ ] Updated `AwesomeProject/.env` with `API_URL`
- [ ] Rebuilt React Native app
- [ ] Tested API from browser
- [ ] Tested login from mobile app

---

## 💡 **Pro Tip:**

For easier testing, you can check your `.env` is loaded correctly:

**In `axiosInstance.ts`:**
```typescript
console.log('API_URL from .env:', process.env.API_URL);
```

Check React Native logs to verify the URL is correct!

---

## ✅ **Summary:**

1. **Backend** connects to Oracle Autonomous JSON DB (via MONGO_URI)
2. **Frontend** connects to Oracle Instance IP (via API_URL)
3. **Users** access your app → App calls `http://<oracle-ip>:3000` → Server running on Oracle VM

**That's it!** Your architecture is:
```
Mobile App → Oracle Instance (Server) → Oracle Autonomous DB
```
