import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { SubscriptionService, SubscriptionPlan, TenantSubscription } from '../../services/subscriptionService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../hooks/useToast';
import PaymentManagement from '../../components/settings/PaymentManagement';

interface PlanLimits {
  maxUsers: number;
  maxLeads: number;
  maxProperties: number;
  currentUsers?: number;
  currentLeads?: number;
  currentProperties?: number;
}

export default function Subscription() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      loadSubscriptionData();
    }
  }, [tenant?.id]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData, limitsData] = await Promise.all([
        SubscriptionService.getPlans(),
        SubscriptionService.getTenantSubscription(tenant!.id),
        SubscriptionService.getPlanLimits(tenant!.id)
      ]);

      setPlans(plansData);
      setSubscription(subscriptionData);
      setLimits(limitsData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!user?.email || !tenant?.id) return;

    try {
      setUpgrading(true);
      SubscriptionService.redirectToCheckout(planId, tenant.id, user.email);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Error",
        description: "Failed to redirect to checkout",
        variant: "destructive"
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = () => {
    if (!tenant?.id) return;
    SubscriptionService.redirectToCustomerPortal(tenant.id);
  };

  const getCurrentPlan = () => {
    if (!subscription || !plans.length) return null;
    return plans.find(plan => plan.plan_id === subscription.subscription_plan);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trialing': return 'secondary';
      case 'past_due': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0; // Unlimited
    return Math.round((current / max) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your Modulyn One+ subscription and billing</p>
      </div>

      {/* Current Subscription Status */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Current Plan</h2>
          <Badge variant={getStatusBadgeVariant(subscription?.subscription_status || 'trial')}>
            {subscription?.subscription_status === 'trialing' ? 'Trial' : 
             subscription?.subscription_status === 'active' ? 'Active' :
             subscription?.subscription_status === 'past_due' ? 'Past Due' :
             subscription?.subscription_status === 'cancelled' ? 'Cancelled' : 'Trial'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Plan Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{currentPlan?.name || 'Trial Plan'}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">
                  {currentPlan?.price === 0 ? 'Free' : `$${currentPlan?.price}/month`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Billing Cycle:</span>
                <span className="font-medium capitalize">{currentPlan?.billing_cycle || 'monthly'}</span>
              </div>
              {subscription?.next_billing_date && (
                <div className="flex justify-between">
                  <span>Next Billing:</span>
                  <span className="font-medium">{formatDate(subscription.next_billing_date)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Usage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Users</span>
                  <span>{limits?.currentUsers || 0} / {limits?.maxUsers === -1 ? '∞' : limits?.maxUsers || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${getUsagePercentage(limits?.currentUsers || 0, limits?.maxUsers || 1)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Leads</span>
                  <span>{limits?.currentLeads || 0} / {limits?.maxLeads === -1 ? '∞' : limits?.maxLeads || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${getUsagePercentage(limits?.currentLeads || 0, limits?.maxLeads || 1)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Properties</span>
                  <span>{limits?.currentProperties || 0} / {limits?.maxProperties === -1 ? '∞' : limits?.maxProperties || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${getUsagePercentage(limits?.currentProperties || 0, limits?.maxProperties || 1)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {subscription?.subscription_status === 'active' && (
            <Button onClick={handleManageSubscription} variant="outline">
              Manage Subscription
            </Button>
          )}
          {subscription?.subscription_status === 'trialing' && (
            <Button onClick={() => handleUpgrade('modulyn-one-plus')} disabled={upgrading}>
              {upgrading ? 'Redirecting...' : 'Upgrade Now'}
            </Button>
          )}
        </div>
      </Card>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.subscription_plan === plan.plan_id;
            const isUpgrade = currentPlan && plan.price > currentPlan.price;
            
            return (
              <Card key={plan.plan_id} className={`p-6 ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">👥</span>
                    <span>{plan.max_users === -1 ? 'Unlimited' : plan.max_users} Users</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2">📊</span>
                    <span>{plan.max_leads === -1 ? 'Unlimited' : plan.max_leads} Leads</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2">🏠</span>
                    <span>{plan.max_properties === -1 ? 'Unlimited' : plan.max_properties} Properties</span>
                  </div>
                  {Object.entries(plan.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center text-sm">
                      <span className="mr-2">{enabled ? '✅' : '❌'}</span>
                      <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan || upgrading}
                  onClick={() => !isCurrentPlan && handleUpgrade(plan.plan_id)}
                >
                  {isCurrentPlan ? 'Current Plan' : 
                   isUpgrade ? 'Upgrade' : 'Downgrade'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trial Information */}
      {subscription?.trial_ends && new Date(subscription.trial_ends) > new Date() && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Trial Period</h3>
              <p className="text-blue-700 text-sm">
                Your trial ends on {formatDate(subscription.trial_ends)}. 
                Upgrade to continue using all features.
              </p>
            </div>
            <Button onClick={() => handleUpgrade('modulyn-one-plus')} disabled={upgrading}>
              {upgrading ? 'Redirecting...' : 'Upgrade Now'}
            </Button>
          </div>
        </Card>
      )}

      {/* Payment Management */}
      {subscription?.subscription_status === 'active' && (
        <div className="mb-8">
          <PaymentManagement 
            tenantId={tenant?.id || ''} 
            customerId={subscription?.fastspring_customer_id}
            subscriptionId={subscription?.subscription_id}
          />
        </div>
      )}
    </div>
  );
}
