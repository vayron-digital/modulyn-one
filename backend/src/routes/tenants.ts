import { Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { supabase } from '../lib/supabase';

const router = Router();

// Plan limits configuration
const PLAN_LIMITS = {
  starter: { maxUsers: 5, name: 'Starter', price: 29 },
  professional: { maxUsers: 20, name: 'Professional', price: 79 },
  enterprise: { maxUsers: 999999, name: 'Enterprise', price: 199 }
};

// Search tenants (public endpoint for company selection during registration)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Query must be at least 2 characters long' 
      });
    }

    // Search for active tenants by name
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        logo_url,
        slug,
        subscription_status,
        profiles!tenant_id(count)
      `)
      .ilike('name', `%${query.trim()}%`)
      .in('subscription_status', ['active', 'trialing'])
      .order('name')
      .limit(Math.min(parseInt(limit as string) || 10, 50));

    if (error) {
      console.error('Error searching tenants:', error);
      return res.status(500).json({ error: 'Failed to search companies' });
    }

    // Format response with member count
    const formattedTenants = tenants?.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      logo_url: tenant.logo_url,
      slug: tenant.slug,
      member_count: tenant.profiles?.[0]?.count || 0
    })) || [];

    res.json({ tenants: formattedTenants });
  } catch (error) {
    console.error('Tenant search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tenant details (requires authentication)
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        logo_url,
        slug,
        theme_color,
        feature_flags,
        subscription_status,
        subscription_plan,
        trial_start,
        trial_ends,
        created_at,
        profiles!tenant_id(count)
      `)
      .eq('id', id)
      .single();

    if (error || !tenant) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const formattedTenant = {
      ...tenant,
      member_count: tenant.profiles?.[0]?.count || 0
    };

    res.json({ tenant: formattedTenant });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check user limits for a tenant
router.get('/:id/check-limits', async (req: Request, res: Response) => {
  try {
    const { id: tenantId } = req.params;

    // Get tenant with current user count
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        subscription_plan,
        subscription_status,
        profiles!tenant_id(count)
      `)
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Determine current plan (default to starter if not set)
    const currentPlan = tenant.subscription_plan || 'starter';
    const planConfig = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter;
    
    const currentUsers = tenant.profiles?.[0]?.count || 0;
    const limitReached = currentUsers >= planConfig.maxUsers;

    // Get recommended plans if limit reached
    let recommendedPlans: any[] = [];
    if (limitReached) {
      recommendedPlans = Object.entries(PLAN_LIMITS)
        .filter(([planKey, planData]) => 
          planData.maxUsers > currentUsers && planKey !== currentPlan
        )
        .map(([planKey, planData]) => ({
          id: planKey,
          name: planData.name,
          price: planData.price,
          maxUsers: planData.maxUsers === 999999 ? 'Unlimited' : planData.maxUsers
        }));
    }

    res.json({
      limitReached,
      currentUsers,
      maxUsers: planConfig.maxUsers,
      currentPlan: {
        id: currentPlan,
        name: planConfig.name,
        price: planConfig.price,
        maxUsers: planConfig.maxUsers === 999999 ? 'Unlimited' : planConfig.maxUsers
      },
      recommendedPlans,
      tenant: {
        id: tenant.id,
        name: tenant.name
      }
    });
  } catch (error) {
    console.error('Error checking user limits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create join request (requires authentication)
router.post('/:id/join-requests', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id: tenantId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if user is already a member
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .eq('tenant_id', tenantId)
      .single();

    if (existingProfile) {
      return res.status(400).json({ error: 'You are already a member of this company' });
    }

    // For now, we'll auto-approve join requests
    // In a full implementation, you'd create a join_requests table
    // and require admin approval
    
    // Update user's profile to join the tenant
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tenant_id: tenantId,
        is_admin: false // Joining users are not admins by default
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return res.status(500).json({ error: 'Failed to join company' });
    }

    res.json({ 
      message: 'Successfully joined company',
      tenant: {
        id: tenant.id,
        name: tenant.name
      }
    });
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
