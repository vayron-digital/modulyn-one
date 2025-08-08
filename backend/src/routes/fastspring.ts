import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

const router = Router();

// FastSpring webhook signature verification (MD5-based)
const verifyWebhookSignature = (params: any, privateKey: string): boolean => {
  try {
    // Sort all parameters by name (ordinal value sorting)
    const sortedKeys = Object.keys(params).sort();
    let data = '';
    
    // Concatenate all parameter values except security_request_hash
    for (const key of sortedKeys) {
      if (key !== 'security_request_hash') {
        data += params[key] || '';
      }
    }
    
    // Append private key
    data += privateKey;
    
    // Generate MD5 hash
    const expectedHash = crypto.createHash('md5').update(data).digest('hex');
    const receivedHash = params.security_request_hash;
    
    return expectedHash === receivedHash;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

// Process FastSpring webhook events
const processWebhookEvent = async (eventData: any) => {
  const {
    name: customerName,
    quantity,
    reference: orderId,
    email: customerEmail,
    company: customerCompany,
    referrer,
    product: productId,
    sku,
    tags,
    attributes,
    test: isTestOrder,
    subscription: subscriptionId,
    sequence,
    periods,
    security_request_hash,
    ...rest
  } = eventData;

  try {
    // Find tenant by email (since FastSpring sends email)
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('billing_email', customerEmail)
      .single();

    if (tenantError) {
      console.error('Tenant not found for email:', customerEmail);
      // For new customers, we'll handle this in order completion
      return;
    }

    // Store the webhook event
    const { error: eventError } = await supabase
      .from('subscription_events')
      .insert({
        tenant_id: tenant?.id,
        event_type: 'order.completed', // FastSpring sends order completion events
        event_id: orderId,
        fastspring_order_id: orderId,
        fastspring_subscription_id: subscriptionId,
        customer_id: customerEmail, // Use email as customer ID
        product_id: productId,
        status: 'active',
        amount: 9.00, // Default amount for Modulyn One+
        currency: 'USD',
        event_data: eventData
      });

    if (eventError) {
      console.error('Error storing webhook event:', eventError);
      return;
    }

    // Process order completion (FastSpring sends this when subscription is created)
    await handleOrderCompleted(eventData, tenant);

    // Mark event as processed
    await supabase
      .from('subscription_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', orderId);

  } catch (error) {
    console.error('Error processing webhook event:', error);
  }
};

// Handle order completion (first purchase)
const handleOrderCompleted = async (eventData: any, tenant: any) => {
  const { 
    email: customerEmail, 
    subscription: subscriptionId, 
    product: productId,
    company: customerCompany,
    name: customerName
  } = eventData;
  
  // Map FastSpring product ID to our plan ID
  const planMapping: { [key: string]: string } = {
    'modulyn-one-plus': 'modulyn-one-plus',
    'modulyn-one-pro': 'modulyn-one-pro'
  };
  
  const planId = planMapping[productId] || 'modulyn-one-plus';
  
  if (tenant) {
    // Update existing tenant
    await supabase
      .from('tenants')
      .update({
        subscription_status: 'active',
        subscription_plan: planId,
        subscription_id: subscriptionId,
        fastspring_customer_id: customerEmail, // Use email as customer ID
        billing_email: customerEmail,
        is_paid: true,
        subscription_start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      })
      .eq('id', tenant.id);
  } else {
    // Create new tenant for new customer
    console.log('Creating new tenant for customer:', customerEmail);
    
    const { data: newTenant, error: createError } = await supabase
      .from('tenants')
      .insert({
        name: customerCompany || customerName || 'New Customer',
        slug: `customer-${Date.now()}`,
        subscription_status: 'active',
        subscription_plan: planId,
        subscription_id: subscriptionId,
        fastspring_customer_id: customerEmail,
        billing_email: customerEmail,
        is_paid: true,
        subscription_start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating new tenant:', createError);
    }
  }
};

// Handle subscription activation
const handleSubscriptionActivated = async (eventData: any, tenant: any) => {
  if (!tenant) return;
  
  await supabase
    .from('tenants')
    .update({
      subscription_status: 'active',
      is_paid: true,
      subscription_start_date: new Date().toISOString()
    })
    .eq('id', tenant.id);
};

// Handle subscription deactivation
const handleSubscriptionDeactivated = async (eventData: any, tenant: any) => {
  if (!tenant) return;
  
  await supabase
    .from('tenants')
    .update({
      subscription_status: 'inactive',
      is_paid: false
    })
    .eq('id', tenant.id);
};

// Handle subscription updates
const handleSubscriptionUpdated = async (eventData: any, tenant: any) => {
  if (!tenant) return;
  
  const { product: productId } = eventData;
  const planMapping: { [key: string]: string } = {
    'modulyn-one-plus': 'modulyn-one-plus',
    'modulyn-one-pro': 'modulyn-one-pro'
  };
  
  const planId = planMapping[productId] || tenant.subscription_plan;
  
  await supabase
    .from('tenants')
    .update({
      subscription_plan: planId,
      subscription_status: 'active',
      is_paid: true
    })
    .eq('id', tenant.id);
};

// Handle subscription cancellation
const handleSubscriptionCancelled = async (eventData: any, tenant: any) => {
  if (!tenant) return;
  
  await supabase
    .from('tenants')
    .update({
      subscription_status: 'cancelled',
      is_paid: false,
      subscription_end_date: eventData.endDate ? new Date(eventData.endDate).toISOString() : null
    })
    .eq('id', tenant.id);
};

// Handle successful subscription charge
const handleSubscriptionChargeCompleted = async (eventData: any, tenant: any) => {
  if (!tenant) return;
  
  await supabase
    .from('tenants')
    .update({
      last_payment_date: new Date().toISOString(),
      next_billing_date: eventData.nextChargeDate ? new Date(eventData.nextChargeDate).toISOString() : null,
      subscription_status: 'active',
      is_paid: true
    })
    .eq('id', tenant.id);
};

// Handle failed subscription charge
const handleSubscriptionChargeFailed = async (eventData: any, tenant: any) => {
  if (!tenant) return;
  
  await supabase
    .from('tenants')
    .update({
      subscription_status: 'past_due',
      is_paid: false
    })
    .eq('id', tenant.id);
};

// FastSpring webhook endpoint
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const privateKey = process.env.FASTSPRING_PRIVATE_KEY;

    if (!privateKey) {
      throw new AppError('FastSpring private key not configured', 500);
    }

    // Verify webhook signature using FastSpring's MD5 method
    if (!verifyWebhookSignature(req.body, privateKey)) {
      throw new AppError('Invalid webhook signature', 401);
    }

    // Process the webhook asynchronously
    processWebhookEvent(req.body);

    // Return success response (FastSpring expects this)
    res.status(200).send('SUCCESS');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('ERROR');
  }
});

// Get subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;

    res.json({ status: 'success', data: plans });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get tenant subscription status
router.get('/subscription/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select(`
        id,
        subscription_status,
        subscription_plan,
        subscription_id,
        fastspring_customer_id,
        is_paid,
        trial_start,
        trial_ends,
        subscription_start_date,
        subscription_end_date,
        last_payment_date,
        next_billing_date
      `)
      .eq('id', tenantId)
      .single();

    if (error) throw error;

    res.json({ status: 'success', data: tenant });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
