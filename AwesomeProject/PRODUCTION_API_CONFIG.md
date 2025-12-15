# Production Frontend Configuration Example

## Update Your Frontend .env File

**File:** `AwesomeProject/.env`

**Add this line (replace with your actual Oracle IP):**

```env
API_URL=http://132.145.XXX.XXX:3000
```

**Example:**
```env
API_URL=http://132.145.89.123:3000
```

---

## How to Get Your Oracle IP:

1. **Oracle Cloud Console:**
   - Go to Compute → Instances
   - Click your instance name
   - Find "Public IP Address"

2. **Or run on Oracle instance:**
   ```bash
   curl ifconfig.me
   ```

---

## After Updating .env:

```bash
cd AwesomeProject

# Restart Metro bundler
npm start -- --reset-cache

# Rebuild app
npm run android
```

---

Your mobile app will now connect to your Oracle production server! 🚀
