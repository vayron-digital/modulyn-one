# FastSpring Integration Setup Guide

Complete guide for setting up FastSpring subscription management in your Modulyn CRM.

## 🚀 Quick Setup Overview

1. **Environment Variables** ✅ (Updated with API credentials)
2. **Database Migration** ✅ (Ready)
3. **Backend Integration** ✅ (Ready)
4. **Frontend Integration** ✅ (Ready)
5. **FastSpring Configuration** ✅ (Ready)
6. **Testing** (This guide)

## 🔧 Environment Variables Setup

Add these to your Vercel environment variables:

```env
# FastSpring Configuration
FASTSPRING_PRIVATE_KEY=f7a9803577c7f08fd04d5550ea0c51f5
FASTSPRING_STORE_ID=usercentraltechnologies_store

# FastSpring API Credentials (NEW!)
FASTSPRING_API_USERNAME=GWKCY0EYR9M7OTGXFA9DSG
FASTSPRING_API_PASSWORD=djadImxaTYaIhV2lUsJBLg

# Frontend FastSpring
VITE_FASTSPRING_STORE_ID=usercentraltechnologies_store
```

## 📋 FastSpring Dashboard Configuration

### 1. Product Configuration ✅ (Done)
- **Product Name**: Modulyn One+
- **Price**: $9/month
- **Fulfillment**: SaaS

### 2. Fulfillment Configuration ✅ (Done)
- **Generator**: Remote Server Request
- **URL**: `https://modulyn.vayronhq.com/api/fastspring/webhook`
- **Method**: HTTP POST
- **Encoding**: UTF-8
- **Output Format**: Single License Only
- **Private Key**: `f7a9803577c7f08fd04d5550ea0c51f5`

### 3. Webhook Events to Configure

In FastSpring dashboard, configure these webhook events:

#### Required Events:
- ✅ `order.completed` (Already configured via Remote Server Request)
- 🔄 `subscription.activated`
- 🔄 `subscription.deactivated`
- 🔄 `subscription.updated`
- 🔄 `subscription.cancelled`
- 🔄 `subscription.charge.completed`
- 🔄 `subscription.charge.failed`

#### Webhook URL for Events:
```
https://modulyn.vayronhq.com/api/fastspring/webhook
```

## 🔐 API Integration (Enhanced)

With your API credentials, you can now:

### 1. Fetch Customer Data
```javascript
// Get customer subscription details
const customer = await fetch(`https://api.fastspring.com/companies/usercentraltechnologies_store/customers/${customerId}`, {
  headers: {
    'Authorization': 'Basic ' + btoa('GWKCY0EYR9M7OTGXFA9DSG:djadImxaTYaIhV2lUsJBLg')
  }
});
```

### 2. Manage Subscriptions
```javascript
// Update subscription status
const updateSubscription = await fetch(`https://api.fastspring.com/companies/usercentraltechnologies_store/subscriptions/${subscriptionId}`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Basic ' + btoa('GWKCY0EYR9M7OTGXFA9DSG:djadImxaTYaIhV2lUsJBLg'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'active'
  })
});
```

## 🧪 Testing Your Integration

### 1. Test Webhook Endpoint
```bash
# Test webhook locally
curl -X POST http://localhost:3000/api/fastspring/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "product": "modulyn-one-plus",
    "reference": "TEST-ORDER-123",
    "security_request_hash": "test-hash"
  }'

# Test webhook on production
curl -X POST https://modulyn.vayronhq.com/api/fastspring/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "product": "modulyn-one-plus",
    "reference": "TEST-ORDER-123",
    "security_request_hash": "test-hash"
  }'
```

### 2. Test FastSpring Checkout
1. **Go to your CRM**: `https://modulyn.vayronhq.com/settings/subscription`
2. **Click "Upgrade"** on any plan
3. **Complete test purchase** in FastSpring
4. **Check webhook delivery** in Vercel logs

### 3. Test API Integration
```bash
# Test API credentials
curl -u "GWKCY0EYR9M7OTGXFA9DSG:djadImxaTYaIhV2lUsJBLg" \
  https://api.fastspring.com/companies/usercentraltechnologies_store/customers
```

## 📊 Monitoring & Debugging

### Vercel Function Logs
1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Click "Functions"**
4. **View logs** for `/api/fastspring/webhook`

### FastSpring Dashboard
1. **Orders**: Monitor test purchases
2. **Subscriptions**: Track subscription status
3. **Webhooks**: Check delivery status

### Database Monitoring
```sql
-- Check subscription events
SELECT * FROM subscription_events ORDER BY created_at DESC LIMIT 10;

-- Check tenant subscriptions
SELECT id, name, subscription_status, subscription_plan, is_paid 
FROM tenants 
WHERE subscription_status != 'trial';
```

## 🚨 Troubleshooting

### Webhook Not Receiving Events?
1. **Check URL**: Ensure `https://modulyn.vayronhq.com/api/fastspring/webhook`
2. **Check Vercel logs**: Look for function errors
3. **Test endpoint**: Use curl to verify it's working
4. **Check FastSpring**: Verify webhook is configured

### Signature Verification Failing?
1. **Verify private key**: `f7a9803577c7f08fd04d5550ea0c51f5`
2. **Check MD5 hash**: Ensure using MD5, not SHA256
3. **Test signature**: Use FastSpring's test tools

### API Calls Failing?
1. **Verify credentials**: `GWKCY0EYR9M7OTGXFA9DSG:djadImxaTYaIhV2lUsJBLg`
2. **Check permissions**: Ensure API access is enabled
3. **Test authentication**: Use curl with basic auth

### Subscription Not Updating?
1. **Check database**: Verify `subscription_events` table
2. **Check tenant update**: Verify `tenants` table updates
3. **Check webhook processing**: Look for errors in logs

## 🎯 Complete Flow Testing

### 1. User Signup Flow
1. **User signs up** → Gets 14-day trial
2. **Trial expires** → User sees upgrade prompt
3. **User clicks upgrade** → Redirected to FastSpring
4. **User completes purchase** → Webhook received
5. **Subscription activated** → User gets paid features

### 2. Subscription Management Flow
1. **User visits subscription page** → Sees current plan
2. **User upgrades/downgrades** → Redirected to FastSpring
3. **User manages billing** → Uses FastSpring customer portal
4. **Subscription changes** → Webhook updates CRM

## 📞 Support Resources

- **FastSpring Documentation**: [docs.fastspring.com](https://docs.fastspring.com)
- **FastSpring API Reference**: [api.fastspring.com](https://api.fastspring.com)
- **Vercel Function Logs**: Check deployment dashboard
- **Database Queries**: Use Supabase dashboard

## 🔒 Security Notes

- **Keep API credentials secure** - Store in environment variables only
- **Never commit credentials** to git
- **Rotate credentials** periodically
- **Monitor webhook security** - Verify signatures always

Your FastSpring integration is now complete with API access! 🚀
