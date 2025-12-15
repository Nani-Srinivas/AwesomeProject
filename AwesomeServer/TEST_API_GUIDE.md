# Test API Endpoint - Debugging Guide

## ✅ **Test Endpoints Created**

I've added **4 test endpoints** with no authentication or rate limiting:

1. `GET /api/test`
2. `POST /api/test`
3. `GET /api/auth/test`
4. `POST /api/auth/test`

---

## 🧪 **How to Test:**

### **Test 1: Simple GET Request**
```bash
curl http://YOUR-PROD-IP:3000/api/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test endpoint working! Server is reachable.",
  "timestamp": "2025-12-08T18:17:34.123Z",
  "serverTime": "8/12/2025, 11:47:34 pm",
  "receivedData": {},
  "environment": "production"
}
```

---

### **Test 2: POST with Data**
```bash
curl -X POST http://YOUR-PROD-IP:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test":"data","user":"testuser"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test endpoint working! Server is reachable.",
  "timestamp": "2025-12-08T18:17:34.123Z",
  "serverTime": "8/12/2025, 11:47:34 pm",
  "receivedData": {
    "test": "data",
    "user": "testuser"
  },
  "environment": "production"
}
```

---

### **Test 3: Alternative Path**
```bash
curl http://YOUR-PROD-IP:3000/api/auth/test
```

---

## 📋 **Diagnostic Results:**

### **✅ If Test Works:**
```
Success! Server is reachable.
→ Issue is with specific endpoints (login/register)
→ Could be rate limiting or endpoint-specific issue
```

### **❌ If Test Fails:**
```
Connection timeout/refused
→ Firewall blocking port 3000
→ Server not running
→ Wrong IP address
```

---

## 🔍 **Check Server Logs:**

After deploying, watch the logs:

```bash
# On Oracle instance
pm2 logs --lines 50

# Hit the test endpoint
curl http://YOUR-PROD-IP:3000/api/test
```

**Should see in logs:**
```
✅ TEST ENDPOINT HIT!
Request headers: { ... }
Request body: {}
Request method: GET
Request URL: /api/test
```

---

## 🚀 **Deploy to Production:**

```bash
# On Oracle instance
cd /var/www/AwesomeServer
git pull
pm2 restart all

# Test immediately
curl http://YOUR-IP:3000/api/test
```

---

## 🎯 **What This Tells Us:**

| Test Result | Diagnosis | Next Step |
|-------------|-----------|-----------|
| **Test works, login fails** | Rate limiting or controller issue | Check rate limit, restart PM2 |
| **Test fails, timeout** | Firewall/network issue | Open port 3000 in firewall |
| **Test works locally only** | Production firewall blocking | Check Oracle Security List |
| **Both work in Postman** | Mobile app issue | Rebuild APK with correct URL |

---

**Deploy this and test all 4 endpoints!** This will tell us exactly where the problem is. 🔍
