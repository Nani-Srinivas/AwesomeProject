# Production AdminJS Troubleshooting Checklist

## ❓ **What "Not Working" Means - Please Check:**

When you try to access `http://<oracle-ip>:3000/admin`, what happens?

### **Option A: Connection Timeout**
```
This site can't be reached
<oracle-ip> took too long to respond
ERR_CONNECTION_TIMED_OUT
```
→ **Cause:** Firewall blocking port 3000

### **Option B: Connection Refused**
```
This site can't be reached
<oracle-ip> refused to connect
ERR_CONNECTION_REFUSED
```
→ **Cause:** Server not running or not listening on 0.0.0.0

### **Option C: Loads but shows error**
```
Page loads but shows error message
```
→ **Cause:** Application error

---

## ✅ **Troubleshooting Steps:**

### **Step 1: Check if Server is Running**

**On Oracle instance:**
```bash
# Check if server process is running
ps aux | grep node

# Should see: node app.js (or similar)
```

**If NOT running:**
```bash
cd /var/www/AwesomeServer
npm start
# Or however you're starting it
```

---

### **Step 2: Check if Port 3000 is Open (Most Common Issue)**

**On Oracle instance:**
```bash
# Check if server is listening
sudo netstat -tlnp | grep 3000

# Should show:
# tcp  0.0.0.0:3000  LISTEN
```

**If shows `127.0.0.1:3000` instead of `0.0.0.0:3000`:**
Your server is only listening on localhost! Check `app.js`:
```javascript
// Should be:
app.listen({ port: PORT, host: '0.0.0.0' })

// NOT:
app.listen({ port: PORT, host: 'localhost' })
```

---

### **Step 3: Check Oracle Cloud Firewall**

**Oracle Console → Networking:**

1. Go to **Virtual Cloud Networks** → Your VCN
2. Click **Security Lists** → Default Security List
3. Check **Ingress Rules**
4. Look for rule with:
   ```
   Source: 0.0.0.0/0
   Protocol: TCP
   Destination Port: 3000
   ```

**If missing, add it:**
- Click **Add Ingress Rules**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `3000`
- Click **Add Ingress Rules**

---

### **Step 4: Check Oracle Instance Firewall**

**On Oracle instance:**
```bash
# Check firewall status
sudo firewall-cmd --list-all

# Should show port 3000 in 'ports:'
```

**If port 3000 not listed:**
```bash
# Add port 3000
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-all
```

---

### **Step 5: Check if Latest Code is Deployed**

**On Oracle instance:**
```bash
cd /var/www/AwesomeServer

# Pull latest changes
git pull

# Restart server
# (Use whatever command you use to start it)
npm start
```

---

### **Step 6: Test from Oracle Instance Itself**

**On Oracle instance:**
```bash
# Test locally on the server
curl http://localhost:3000/admin

# Should return HTML (AdminJS page)
```

**If this works but external access doesn't:**
→ Firewall issue (see Steps 3 & 4)

**If this doesn't work:**
→ Server configuration issue

---

### **Step 7: Check Server Logs**

**On Oracle instance:**
```bash
# If using npm start
# Check terminal output

# If using PM2
pm2 logs

# If using systemd
sudo journalctl -u your-service-name -f
```

Look for:
```
DB CONNECTED ✅
Grocery App running on http://localhost:3000/admin
```

---

## 🔍 **Quick Diagnostic Commands:**

Run these on your **Oracle instance** and share the output:

```bash
# 1. Is server running?
ps aux | grep node

# 2. Is port open?
sudo netstat -tlnp | grep 3000

# 3. Can access locally?
curl -I http://localhost:3000/admin

# 4. Firewall status?
sudo firewall-cmd --list-all | grep 3000
```

---

## 🎯 **Most Common Issue:**

**90% of the time it's:** Oracle Security List doesn't have port 3000 open!

**Quick fix:**
1. Oracle Console → Networking → Security Lists
2. Add Ingress Rule for port 3000
3. Wait 1-2 minutes
4. Try accessing `http://<oracle-ip>:3000/admin` again

---

## ✅ **Once Working:**

You should be able to access:
- `http://<oracle-ip>:3000/admin` - AdminJS panel
- `http://<oracle-ip>:3000/api/user` - API endpoint

From **anywhere** with internet access!

---

## 📝 **Share These Details:**

Please share:
1. **What error do you see** when accessing `http://<oracle-ip>:3000/admin`?
2. **Output of:** `sudo netstat -tlnp | grep 3000` (from Oracle instance)
3. **Is port 3000 in your Security List?** (Screenshot or yes/no)

This will help me pinpoint the exact issue! 🔍
