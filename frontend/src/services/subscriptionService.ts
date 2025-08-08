import { supabase } from '../lib/supabase';

export interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: string;
  trial_days: number;
  max_users: number;
  max_leads: number;
  max_properties: number;
  features: Record<string, any>;
  is_active: boolean;
}

export interface TenantSubscription {
  id: string;
  subscription_status: string;
  subscription_plan: string;
  subscription_id: string;
  fastspring_customer_id: string;
  is_paid: boolean;
  trial_start: string | null;
  trial_ends: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  last_payment_date: string | null;
  next_billing_date: string | null;
}

export class SubscriptionService {
  // Get all available subscription plans
  static async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Get tenant subscription status
  static async getTenantSubscription(tenantId: string): Promise<TenantSubscription | null> {
    try {
      const { data, error } = await supabase
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
      return data;
    } catch (error) {
      console.error('Error fetching tenant subscription:', error);
      throw error;
    }
  }

  // Create FastSpring checkout session
  static async createCheckoutSession(planId: string, tenantId: string, userEmail: string): Promise<{ checkoutUrl: string }> {
    try {
      // This would typically call your backend to create a FastSpring checkout session
      // For now, we'll use a direct FastSpring URL (you'll need to configure this)
      
      const fastspringStoreId = process.env.VITE_FASTSPRING_STORE_ID || 'your-store-id';
      const productId = planId; // Assuming plan_id matches FastSpring product ID
      
      const checkoutUrl = `https://sites.fastspring.com/${fastspringStoreId}/product/${productId}?referrer=${encodeURIComponent(userEmail)}&customer_email=${encodeURIComponent(userEmail)}&customer_id=${tenantId}`;
      
      return { checkoutUrl };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Redirect to FastSpring checkout
  static redirectToCheckout(planId: string, tenantId: string, userEmail: string): void {
    this.createCheckoutSession(planId, tenantId, userEmail)
      .then(({ checkoutUrl }) => {
        window.location.href = checkoutUrl;
      })
      .catch((error) => {
        console.error('Error redirecting to checkout:', error);
        // Handle error (show toast, etc.)
      });
  }

  // Check if tenant has access to a feature
  static async hasFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await this.getTenantSubscription(tenantId);
      if (!subscription) return false;

      // If trial is active, allow access
      if (subscription.trial_ends && new Date(subscription.trial_ends) > new Date()) {
        return true;
      }

      // If paid subscription is active, check plan features
      if (subscription.is_paid && subscription.subscription_status === 'active') {
        const plans = await this.getPlans();
        const currentPlan = plans.find(p => p.plan_id === subscription.subscription_plan);
        
        if (currentPlan && currentPlan.features[feature]) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  // Get current plan limits
  static async getPlanLimits(tenantId: string): Promise<{
    maxUsers: number;
    maxLeads: number;
    maxProperties: number;
    currentUsers?: number;
    currentLeads?: number;
    currentProperties?: number;
  }> {
    try {
      const subscription = await this.getTenantSubscription(tenantId);
      if (!subscription) {
        return { maxUsers: 0, maxLeads: 0, maxProperties: 0 };
      }

      const plans = await this.getPlans();
      const currentPlan = plans.find(p => p.plan_id === subscription.subscription_plan);
      
      if (!currentPlan) {
        return { maxUsers: 0, maxLeads: 0, maxProperties: 0 };
      }

      // Get current usage
      const [usersCount, leadsCount, propertiesCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
        supabase.from('leads').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
        supabase.from('properties').select('id', { count: 'exact' }).eq('tenant_id', tenantId)
      ]);

      return {
        maxUsers: currentPlan.max_users,
        maxLeads: currentPlan.max_leads,
        maxProperties: currentPlan.max_properties,
        currentUsers: usersCount.count || 0,
        currentLeads: leadsCount.count || 0,
        currentProperties: propertiesCount.count || 0
      };
    } catch (error) {
      console.error('Error getting plan limits:', error);
      return { maxUsers: 0, maxLeads: 0, maxProperties: 0 };
    }
  }

  // Check if tenant is approaching limits
  static async isApproachingLimits(tenantId: string, threshold: number = 0.8): Promise<{
    users: boolean;
    leads: boolean;
    properties: boolean;
  }> {
    try {
      const limits = await this.getPlanLimits(tenantId);
      
      return {
        users: limits.currentUsers! / limits.maxUsers > threshold,
        leads: limits.currentLeads! / limits.maxLeads > threshold,
        properties: limits.currentProperties! / limits.maxProperties > threshold
      };
    } catch (error) {
      console.error('Error checking limits:', error);
      return { users: false, leads: false, properties: false };
    }
  }

  // Cancel subscription (redirect to FastSpring customer portal)
  static async cancelSubscription(tenantId: string): Promise<{ portalUrl: string }> {
    try {
      const subscription = await this.getTenantSubscription(tenantId);
      if (!subscription?.fastspring_customer_id) {
        throw new Error('No active subscription found');
      }

      const fastspringStoreId = process.env.VITE_FASTSPRING_STORE_ID || 'your-store-id';
      const portalUrl = `https://sites.fastspring.com/${fastspringStoreId}/account`;
      
      return { portalUrl };
    } catch (error) {
      console.error('Error creating cancellation portal:', error);
      throw error;
    }
  }

  // Redirect to FastSpring customer portal
  static redirectToCustomerPortal(tenantId: string): void {
    this.cancelSubscription(tenantId)
      .then(({ portalUrl }) => {
        window.location.href = portalUrl;
      })
      .catch((error) => {
        console.error('Error redirecting to customer portal:', error);
        // Handle error (show toast, etc.)
      });
  }
}
