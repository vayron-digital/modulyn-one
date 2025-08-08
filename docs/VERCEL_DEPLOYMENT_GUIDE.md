# Vercel Deployment Guide for Modulyn CRM

This guide will walk you through deploying your Modulyn CRM to Vercel with FastSpring integration.

## 🚀 Quick Setup Overview

1. **Prepare Code** ✅ (Done)
2. **Push to GitHub** (This guide)
3. **Connect to Vercel** (This guide)
4. **Configure Environment Variables** (This guide)
5. **Deploy** (This guide)
6. **Connect Domain** (This guide)

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub with this structure:
```
vayron-crm/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   └── ...
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── vercel.json
└── README.md
```

### Step 2: Push to GitHub

```bash
# If you haven't already
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 3: Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your repository** (`vayron-crm`)
5. **Configure project settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

### Step 4: Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# FastSpring Configuration
FASTSPRING_PRIVATE_KEY=f7a9803577c7f08fd04d5550ea0c51f5
FASTSPRING_STORE_ID=usercentraltechnologies_store

# Frontend Environment Variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_FASTSPRING_STORE_ID=usercentraltechnologies_store

# Backend Configuration
PORT=3000
NODE_ENV=production
```

### Step 5: Deploy

1. **Click "Deploy"**
2. **Wait for build** (usually 2-3 minutes)
3. **Check deployment logs** for any errors

### Step 6: Configure Domain

1. **Go to Vercel dashboard** → **Settings** → **Domains**
2. **Add your domain**: `modulyn.vayronhq.com`
3. **Update DNS records** in Hostinger:
   - **Type**: CNAME
   - **Name**: `modulyn`
   - **Value**: `cname.vercel-dns.com`

## 🔧 Vercel-Specific Configuration

### API Routes
Your backend API will be available at:
- `https://modulyn.vayronhq.com/api/fastspring/webhook`
- `https://modulyn.vayronhq.com/api/leads`
- `https://modulyn.vayronhq.com/api/auth`
- etc.

### Frontend Routes
Your React app will be served at:
- `https://modulyn.vayronhq.com/` (Dashboard)
- `https://modulyn.vayronhq.com/settings/subscription` (Subscription page)
- etc.

## 🧪 Testing After Deployment

### 1. Test Frontend
```bash
# Visit your domain
https://modulyn.vayronhq.com
```

### 2. Test Backend API
```bash
# Test health endpoint
curl https://modulyn.vayronhq.com/api/health

# Test FastSpring webhook
curl -X POST https://modulyn.vayronhq.com/api/fastspring/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 3. Test FastSpring Integration
1. **Update FastSpring webhook URL** to: `https://modulyn.vayronhq.com/api/fastspring/webhook`
2. **Make a test purchase** in FastSpring
3. **Check Vercel logs** for webhook delivery

## 📊 Monitoring

### Vercel Dashboard
- **Functions**: Monitor API performance
- **Analytics**: Track usage and performance
- **Logs**: View real-time logs

### Environment Variables
- **Production**: Applied to live site
- **Preview**: Applied to preview deployments
- **Development**: Applied to local development

## 🔄 Continuous Deployment

Vercel automatically:
- **Deploys** when you push to GitHub
- **Creates previews** for pull requests
- **Rolls back** on deployment failures

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check `package.json` scripts
   - Verify all dependencies are installed
   - Check Vercel build logs

2. **API Routes Not Working**
   - Verify `vercel.json` configuration
   - Check environment variables
   - Test locally first

3. **Domain Not Working**
   - Verify DNS settings in Hostinger
   - Check domain configuration in Vercel
   - Wait for DNS propagation (up to 24 hours)

4. **FastSpring Webhook Fails**
   - Check webhook URL is correct
   - Verify environment variables
   - Check Vercel function logs

### Debug Commands:

```bash
# Test API locally
cd backend && npm start

# Test frontend locally
cd frontend && npm run dev

# Check Vercel deployment
vercel ls
```

## 🎯 Next Steps After Deployment

1. **Test the complete flow**:
   - User signup → Trial period
   - Upgrade to paid plan → FastSpring checkout
   - Webhook processing → Subscription activation

2. **Monitor performance**:
   - Check Vercel analytics
   - Monitor API response times
   - Track webhook delivery success

3. **Set up monitoring**:
   - Enable Vercel analytics
   - Set up error tracking
   - Monitor subscription events

## 📞 Support

If you encounter issues:
1. **Check Vercel deployment logs**
2. **Verify environment variables**
3. **Test API endpoints manually**
4. **Check FastSpring webhook configuration**

Your CRM will be live at `https://modulyn.vayronhq.com` once deployed! 🚀
