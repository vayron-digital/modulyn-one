import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Mail, 
  Users, 
  Building, 
  ArrowRight, 
  Zap,
  Shield,
  Clock
} from 'lucide-react';

interface LocationState {
  plan: string;
  userDetails: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
  };
  paymentDetails: {
    cardholderName: string;
  };
}

const AccountCreationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  
  const state = location.state as LocationState;
  const plan = state?.plan || 'professional';
  const userDetails = state?.userDetails;
  const paymentDetails = state?.paymentDetails;

  const plans = {
    starter: { name: 'Starter', price: 29, features: ['Up to 5 team members', 'Basic features', 'Email support'] },
    professional: { name: 'Professional', price: 79, features: ['Up to 20 team members', 'Advanced features', 'Priority support'] },
    enterprise: { name: 'Enterprise', price: 199, features: ['Unlimited team members', 'All features', 'Dedicated support'] }
  };

  const selectedPlanData = plans[plan as keyof typeof plans];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const nextSteps = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Verify Your Email',
      description: 'Check your inbox for a verification email to activate your account',
      action: 'Check Email'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Invite Your Team',
      description: 'Add team members and start collaborating on your real estate projects',
      action: 'Invite Team'
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: 'Add Your Properties',
      description: 'Start managing your property listings and lead generation',
      action: 'Add Properties'
    }
  ];

  const quickActions = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Go to Dashboard',
      description: 'Start using your new CRM',
      action: () => navigate('/dashboard'),
      primary: true
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Invite Team Members',
      description: 'Get your team onboarded',
      action: () => navigate('/settings?tab=users'),
      primary: false
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'View Account Settings',
      description: 'Configure your preferences',
      action: () => navigate('/settings'),
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-blue-600"
              >
                Modulyn
              </button>
              <div className="text-sm text-slate-500">
                Account Created Successfully
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">
                {selectedPlanData.name} Plan
              </div>
              <div className="text-sm text-slate-500">
                ${selectedPlanData.price}/month
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to Modulyn! 🎉
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            Your account has been successfully created and your payment has been processed. 
            You're now ready to transform your real estate business!
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Payment Successful</span>
            </div>
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Account Holder</label>
                <p className="text-lg font-semibold text-slate-900">
                  {userDetails?.firstName} {userDetails?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                <p className="text-lg font-semibold text-slate-900">{userDetails?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Company</label>
                <p className="text-lg font-semibold text-slate-900">{userDetails?.company}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Selected Plan</label>
                <p className="text-lg font-semibold text-slate-900">{selectedPlanData.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Monthly Price</label>
                <p className="text-lg font-semibold text-slate-900">${selectedPlanData.price}/month</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Trial Period</label>
                <p className="text-lg font-semibold text-green-600">14 days remaining</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What's Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <div key={index} className="text-center p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <div className="text-blue-600">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{step.description}</p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  {step.action}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`p-6 text-left border rounded-lg transition-all hover:shadow-md ${
                  action.primary 
                    ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${
                  action.primary ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600">{action.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Auto-redirect Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Auto-redirect in progress</span>
          </div>
          <p className="text-yellow-700">
            You'll be automatically redirected to the landing page in{' '}
            <span className="font-bold">{countdown}</span> seconds.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-yellow-800 hover:text-yellow-900 font-medium transition-colors"
          >
            Go now
          </button>
        </motion.div>

        {/* Support Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-8"
        >
          <p className="text-slate-600 mb-4">
            Need help getting started?
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Documentation</a>
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Video Tutorials</a>
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">Contact Support</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountCreationSuccess;
