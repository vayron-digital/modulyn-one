# FastSpring Integration Setup Guide

This guide will walk you through setting up FastSpring for your Modulyn One+ CRM subscription management.

## 🚀 Quick Setup Overview

1. **FastSpring Account Setup** ✅ (You've done this)
2. **Product Configuration** ✅ (You've created "Modulyn One+")
3. **Fulfillment Configuration** (This guide)
4. **Webhook Setup** (This guide)
5. **Environment Variables** (This guide)
6. **Database Migration** (This guide)
7. **Testing** (This guide)

## 📋 Step-by-Step Setup

### 1. FastSpring Fulfillment Configuration

**About the Generator question:** Yes, it's essential! Choose "Webhook" as the generator for SaaS products.

1. In your FastSpring dashboard, go to **Products** → **Modulyn One+**
2. Click on **Fulfillment** tab
3. Select **SaaS** from the dropdown
4. Choose **Webhook** as the Generator
5. Configure the webhook URL: `https://your-domain.com/api/fastspring/webhook`
6. Set the webhook secret (you'll use this in environment variables)

### 2. Environment Variables Setup

Add these to your backend `.env` file:

```env
# FastSpring Configuration
FASTSPRING_PRIVATE_KEY=f7a9803577c7f08fd04d5550ea0c51f5
FASTSPRING_STORE_ID=your_store_id_here

# Frontend FastSpring Store ID
VITE_FASTSPRING_STORE_ID=your_store_id_here
```

**Important**: The `FASTSPRING_PRIVATE_KEY` is the private key shown in your FastSpring configuration (f7a9803577c7f08fd04d5550ea0c51f5).

### 3. Database Migration

Run the subscription migration:

```sql
-- Run this in your Supabase SQL Editor
-- File: db-migrations/048_add_subscription_fields.sql
```

This creates:
- Subscription fields in `tenants` table
- `subscription_events` table for webhook tracking
- `subscription_plans` table with default plans
- Helper functions for subscription management

### 4. FastSpring Product Configuration

In your FastSpring dashboard:

1. **Product ID**: Set to `modulyn-one-plus` (matches our plan ID)
2. **Price**: $9/month (as you've set)
3. **Billing**: Monthly subscription
4. **Trial**: 14 days (matches our database default)

### 5. Webhook Events to Configure

In FastSpring, enable these webhook events:

- `order.completed` - When customer first purchases
- `subscription.activated` - When subscription becomes active
- `subscription.deactivated` - When subscription is deactivated
- `subscription.updated` - When subscription is modified
- `subscription.cancelled` - When subscription is cancelled
- `subscription.charge.completed` - When payment is successful
- `subscription.charge.failed` - When payment fails

### 6. Testing the Integration

#### Test Webhook Endpoint

```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/fastspring/webhook \
  -H "Content-Type: application/json" \
  -H "x-fs-signature: test_signature" \
  -d '{
    "id": "test_event_123",
    "type": "order.completed",
    "customer": "test_customer_123",
    "product": "modulyn-one-plus",
    "subscription": "test_sub_123",
    "status": "active",
    "total": 9.00,
    "currency": "USD"
  }'
```

#### Test Subscription Plans API

```bash
# Get available plans
curl https://your-domain.com/api/fastspring/plans
```

### 7. Frontend Integration

The subscription management page is available at:
- **URL**: `/settings/subscription`
- **Access**: Admin users only
- **Features**: 
  - View current plan and usage
  - Upgrade/downgrade plans
  - Manage subscription
  - View billing information

### 8. Subscription Flow

#### New Customer Flow:
1. User signs up → Gets 14-day trial
2. User upgrades → Redirected to FastSpring checkout
3. Payment successful → Webhook updates tenant subscription
4. User gets access to paid features

#### Existing Customer Flow:
1. User visits subscription page
2. Can upgrade/downgrade → Redirected to FastSpring
3. Changes processed via webhooks
4. Feature access updated automatically

### 9. Feature Access Control

The system automatically controls feature access based on:

```typescript
// Check if user has access to a feature
const hasAccess = await SubscriptionService.hasFeatureAccess(tenantId, 'chat');

// Check plan limits
const limits = await SubscriptionService.getPlanLimits(tenantId);
```

### 10. Plan Limits Enforcement

The system enforces limits for:
- **Users**: Max users per plan
- **Leads**: Max leads per plan  
- **Properties**: Max properties per plan
- **Features**: Feature flags per plan

### 11. Troubleshooting

#### Common Issues:

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check server logs for errors

2. **Subscription not updating**
   - Verify tenant has `fastspring_customer_id`
   - Check webhook event processing
   - Review subscription_events table

3. **Feature access issues**
   - Check tenant subscription status
   - Verify plan features configuration
   - Review trial expiration dates

#### Debug Commands:

```sql
-- Check subscription status
SELECT * FROM tenants WHERE id = 'your_tenant_id';

-- Check webhook events
SELECT * FROM subscription_events 
WHERE tenant_id = 'your_tenant_id' 
ORDER BY created_at DESC;

-- Check plan details
SELECT * FROM subscription_plans WHERE plan_id = 'modulyn-one-plus';
```

### 12. Monitoring

Monitor these metrics:
- Webhook delivery success rate
- Subscription conversion rate
- Trial to paid conversion
- Churn rate
- Revenue per customer

### 13. Security Considerations

1. **Webhook Signature Verification**: Always verify FastSpring signatures
2. **HTTPS Only**: Use HTTPS for all webhook endpoints
3. **Rate Limiting**: Implement rate limiting on webhook endpoints
4. **Logging**: Log all webhook events for audit trail

### 14. Production Checklist

- [ ] Webhook endpoint is publicly accessible
- [ ] Environment variables are set
- [ ] Database migration is applied
- [ ] FastSpring products are configured
- [ ] Webhook events are enabled
- [ ] Test webhook delivery
- [ ] Test subscription flow
- [ ] Monitor error logs
- [ ] Set up alerts for webhook failures

## 🎯 Next Steps

1. **Deploy the changes** to your production environment
2. **Test the complete flow** with a test customer
3. **Monitor webhook delivery** for the first few days
4. **Set up monitoring** for subscription events
5. **Train your team** on subscription management

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for errors
3. Verify FastSpring configuration
4. Test webhook endpoints manually

The integration is designed to be robust and handle edge cases automatically. The webhook system ensures your CRM stays in sync with FastSpring subscription changes.
