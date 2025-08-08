import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

const router = Router();

// FastSpring API credentials
const FASTSPRING_API_USERNAME = process.env.FASTSPRING_API_USERNAME;
const FASTSPRING_API_PASSWORD = process.env.FASTSPRING_API_PASSWORD;
const FASTSPRING_STORE_ID = process.env.FASTSPRING_STORE_ID;

// Helper function to make authenticated API calls to FastSpring
const fastspringApiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
  if (!FASTSPRING_API_USERNAME || !FASTSPRING_API_PASSWORD) {
    throw new Error('FastSpring API credentials not configured');
  }

  const auth = Buffer.from(`${FASTSPRING_API_USERNAME}:${FASTSPRING_API_PASSWORD}`).toString('base64');
  
  const response = await fetch(`https://api.fastspring.com/companies/${FASTSPRING_STORE_ID}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`FastSpring API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

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

// Get customer subscription details from FastSpring
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customerData = await fastspringApiCall(`/customers/${customerId}`);
    
    res.json({
      status: 'success',
      data: customerData
    });
  } catch (error: any) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch customer data'
    });
  }
});

// Get subscription details from FastSpring
router.get('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscriptionData = await fastspringApiCall(`/subscriptions/${subscriptionId}`);
    
    res.json({
      status: 'success',
      data: subscriptionData
    });
  } catch (error: any) {
    console.error('Error fetching subscription data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscription data'
    });
  }
});

// Update subscription status in FastSpring
router.put('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status, reason } = req.body;
    
    const updateData = await fastspringApiCall(`/subscriptions/${subscriptionId}`, 'PUT', {
      status,
      reason
    });
    
    res.json({
      status: 'success',
      data: updateData
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update subscription'
    });
  }
});

// Get all customers from FastSpring
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const customersData = await fastspringApiCall(`/customers?page=${page}&limit=${limit}`);
    
    res.json({
      status: 'success',
      data: customersData
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch customers'
    });
  }
});

// Get all subscriptions from FastSpring
router.get('/subscriptions', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    
    let endpoint = `/subscriptions?page=${page}&limit=${limit}`;
    if (status) {
      endpoint += `&status=${status}`;
    }
    
    const subscriptionsData = await fastspringApiCall(endpoint);
    
    res.json({
      status: 'success',
      data: subscriptionsData
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subscriptions'
    });
  }
});

// Sync tenant with FastSpring customer data
router.post('/sync-tenant/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Get tenant from database
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    if (tenantError || !tenant) {
      return res.status(404).json({
        status: 'error',
        message: 'Tenant not found'
      });
    }
    
    if (!tenant.fastspring_customer_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Tenant has no FastSpring customer ID'
      });
    }
    
    // Get customer data from FastSpring
    const customerData: any = await fastspringApiCall(`/customers/${tenant.fastspring_customer_id}`);
    
    // Update tenant with latest FastSpring data
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        subscription_status: customerData.subscription?.status || 'trial',
        subscription_plan: customerData.subscription?.product || 'trial',
        subscription_metadata: customerData,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId);
    
    if (updateError) {
      throw updateError;
    }
    
    res.json({
      status: 'success',
      message: 'Tenant synced with FastSpring data',
      data: customerData
    });
  } catch (error) {
    console.error('Error syncing tenant:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync tenant'
    });
  }
});

export default router;
