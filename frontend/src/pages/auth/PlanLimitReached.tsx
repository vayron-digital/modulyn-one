import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Crown, 
  ArrowRight, 
  Building2, 
  Mail, 
  Shield,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface PlanDetails {
  currentPlan: {
    id: string;
    name: string;
    price: number;
    maxUsers: number | string;
  };
  currentUsers: number;
  recommendedPlans: Array<{
    id: string;
    name: string;
    price: number;
    maxUsers: number | string;
  }>;
  tenant: {
    id: string;
    name: string;
  };
}

const PlanLimitReached: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // In a real app, this would come from props or API call
  // For demo, we'll parse from URL params or use mock data
  const planDetailsParam = searchParams.get('planDetails');
  const mockPlanDetails: PlanDetails = {
    currentPlan: {
      id: 'starter',
      name: 'Starter',
      price: 29,
      maxUsers: 5
    },
    currentUsers: 5,
    recommendedPlans: [
      {
        id: 'professional',
        name: 'Professional',
        price: 79,
        maxUsers: 20
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        maxUsers: 'Unlimited'
      }
    ],
    tenant: {
      id: 'demo-tenant',
      name: 'Demo Company Inc.'
    }
  };

  const planDetails: PlanDetails = planDetailsParam 
    ? JSON.parse(decodeURIComponent(planDetailsParam))
    : mockPlanDetails;

  const handleContactAdmin = () => {
    const subject = encodeURIComponent(`Plan Upgrade Request - ${planDetails.tenant.name}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to join ${planDetails.tenant.name} but your current ${planDetails.currentPlan.name} plan has reached its user limit (${planDetails.currentUsers}/${planDetails.currentPlan.maxUsers} users).\n\nCould you please upgrade the plan so I can join the team?\n\nRecommended plans:\n${planDetails.recommendedPlans.map(plan => 
        `• ${plan.name} - $${plan.price}/month (${plan.maxUsers} users)`
      ).join('\n')}\n\nThanks!`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleBackToSignup = () => {
    navigate('/account-creation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Plan Limit Reached</h1>
              <p className="text-amber-100">Company workspace is at capacity</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Company Info */}
          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{planDetails.tenant.name}</h2>
                <div className="flex items-center gap-2 text-slate-600 mt-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    {planDetails.currentUsers}/{planDetails.currentPlan.maxUsers} users
                  </span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    {planDetails.currentPlan.name} Plan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Problem Explanation */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Unable to Join Workspace
            </h3>
            <p className="text-slate-600">
              {planDetails.tenant.name} has reached the maximum number of users allowed 
              on their current <strong>{planDetails.currentPlan.name}</strong> plan.
            </p>
          </div>

          {/* Current Plan Status */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-red-900">
                  Current Plan: {planDetails.currentPlan.name}
                </div>
                <div className="text-sm text-red-700">
                  ${planDetails.currentPlan.price}/month • Max {planDetails.currentPlan.maxUsers} users
                </div>
              </div>
              <div className="text-red-600 font-bold">
                {planDetails.currentUsers}/{planDetails.currentPlan.maxUsers}
              </div>
            </div>
          </div>

          {/* Recommended Plans */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">
              Recommended Plan Upgrades
            </h4>
            <div className="space-y-4">
              {planDetails.recommendedPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{plan.name}</div>
                        <div className="text-sm text-slate-600">
                          ${plan.price}/month • {plan.maxUsers} users
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={handleContactAdmin}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Notify Company Admin to Upgrade
              <ExternalLink className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-3">
                This will open your email client with a pre-written message to the company administrators.
              </p>
            </div>

            <button
              onClick={handleBackToSignup}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Account Creation
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">What happens next?</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Company admin receives upgrade notification</li>
              <li>• Once upgraded, you can complete your registration</li>
              <li>• You'll gain access to the full workspace</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlanLimitReached;
