# Domain Setup Guide: modulyn.vayronhq.com → Vercel

This guide will walk you through connecting your Hostinger domain to Vercel for your Modulyn CRM.

## 🌐 Domain Connection Overview

```
modulyn.vayronhq.com → Vercel → Your CRM
```

## 📋 Step-by-Step Setup

### Step 1: Add Domain in Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Domains**
   - Click **Settings** tab
   - Click **Domains** in the left sidebar

3. **Add Your Domain**
   - Click **Add Domain**
   - Enter: `modulyn.vayronhq.com`
   - Click **Add**

4. **Vercel Shows DNS Configuration**
   - Vercel will display the required DNS records
   - Keep this page open for reference

### Step 2: Configure DNS in Hostinger

#### Option A: CNAME Method (Recommended)

1. **Login to Hostinger**
   - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
   - Login with your credentials

2. **Access DNS Management**
   - Click **Domains** → **Manage**
   - Find `vayronhq.com`
   - Click **DNS** → **Manage**

3. **Add CNAME Record**
   ```
   Type: CNAME
   Name: modulyn
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

4. **Save and Wait**
   - Click **Save**
   - DNS propagation takes 5-30 minutes

#### Option B: Nameserver Method (Alternative)

If CNAME doesn't work, use nameservers:

1. **In Hostinger DNS Management**
   - Add these NS records:
   ```
   Type: NS
   Name: modulyn
   Value: ns1.vercel-dns.com
   ```

   ```
   Type: NS  
   Name: modulyn
   Value: ns2.vercel-dns.com
   ```

### Step 3: Verify Connection

1. **Check Vercel Dashboard**
   - Go back to Vercel → Settings → Domains
   - Status should show "Valid Configuration"

2. **Test Domain**
   ```bash
   # Test DNS propagation
   nslookup modulyn.vayronhq.com
   
   # Should return Vercel's IP addresses
   ```

3. **Wait for Propagation**
   - DNS changes can take up to 24 hours
   - Usually works within 30 minutes

## 🔧 How Vercel Handles Your Monorepo

### Backend (Node.js API)
```
modulyn.vayronhq.com/api/* → backend/src/index.ts
```

**What happens:**
1. Vercel detects `backend/src/index.ts`
2. Uses `@vercel/node` builder
3. Deploys as serverless function
4. Routes `/api/*` requests to your Express app

### Frontend (React App)
```
modulyn.vayronhq.com/* → frontend/dist/*
```

**What happens:**
1. Vercel detects `frontend/package.json`
2. Runs `npm run build` in frontend directory
3. Serves static files from `frontend/dist`
4. Routes all non-API requests to React app

### File Structure Vercel Sees:
```
vayron-crm/
├── backend/src/index.ts     ← API routes (/api/*)
├── frontend/package.json    ← Frontend build
├── frontend/dist/           ← Built React app
└── vercel.json             ← Configuration
```

## 🧪 Testing Your Setup

### 1. Test Domain Connection
```bash
# Should return Vercel IPs
dig modulyn.vayronhq.com

# Should work in browser
curl https://modulyn.vayronhq.com
```

### 2. Test Backend API
```bash
# Test API endpoint
curl https://modulyn.vayronhq.com/api/health

# Test FastSpring webhook
curl -X POST https://modulyn.vayronhq.com/api/fastspring/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 3. Test Frontend
```bash
# Should load React app
curl https://modulyn.vayronhq.com

# Should load subscription page
curl https://modulyn.vayronhq.com/settings/subscription
```

## 🚨 Troubleshooting

### Domain Not Working?

1. **Check DNS Records**
   ```bash
   # Verify CNAME record
   nslookup modulyn.vayronhq.com
   
   # Should show: cname.vercel-dns.com
   ```

2. **Check Vercel Configuration**
   - Go to Vercel → Settings → Domains
   - Status should be "Valid Configuration"

3. **Wait Longer**
   - DNS propagation can take 24 hours
   - Try again in 30 minutes

### API Routes Not Working?

1. **Check vercel.json**
   - Ensure backend route is configured
   - Verify `backend/src/index.ts` exists

2. **Check Environment Variables**
   - Verify all required env vars are set
   - Check Vercel function logs

3. **Test Locally First**
   ```bash
   cd backend && npm start
   curl http://localhost:3000/api/health
   ```

### Frontend Not Loading?

1. **Check Build Process**
   - Verify `frontend/package.json` has build script
   - Check Vercel build logs

2. **Check Static Files**
   - Ensure `frontend/dist/` contains built files
   - Verify `index.html` exists

## 📊 Monitoring

### Vercel Dashboard
- **Functions**: Monitor API performance
- **Analytics**: Track domain usage
- **Logs**: View real-time logs

### DNS Health
- **Vercel**: Domain status and configuration
- **Hostinger**: DNS record management
- **External**: Use tools like [whatsmydns.net](https://whatsmydns.net)

## 🎯 Final URLs

After setup, your CRM will be available at:

- **Main App**: `https://modulyn.vayronhq.com`
- **API**: `https://modulyn.vayronhq.com/api/*`
- **FastSpring Webhook**: `https://modulyn.vayronhq.com/api/fastspring/webhook`
- **Subscription Page**: `https://modulyn.vayronhq.com/settings/subscription`

## 📞 Support

If you encounter issues:

1. **Check Vercel deployment logs**
2. **Verify DNS configuration**
3. **Test endpoints manually**
4. **Contact Vercel support** if needed

Your domain will be live and serving your CRM once DNS propagates! 🚀
