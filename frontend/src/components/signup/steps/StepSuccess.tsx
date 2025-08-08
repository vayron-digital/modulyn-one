import React, { useEffect } from 'react';
import { useSignup } from '../SignupStepper';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight, Zap, Users, Building } from 'lucide-react';

const StepSuccess: React.FC = () => {
  const { formData } = useSignup();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const selectedPlan = formData.selectedPlan || 'professional';
  const planNames = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise'
  };

  const nextSteps = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'Verify Your Email',
      description: 'Check your inbox for a verification email to activate your account'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Invite Your Team',
      description: 'Add team members and start collaborating on your real estate projects'
    },
    {
      icon: <Building className="w-5 h-5" />,
      title: 'Add Your Properties',
      description: 'Start managing your property listings and lead generation'
    }
  ];

  return (
    <div className="text-center space-y-8">
      {/* Success Animation */}
      <div className="flex justify-center">
        <div className="relative">
          <CheckCircle className="w-20 h-20 text-green-500 animate-pulse" />
          <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping"></div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to Modulyn! 🎉
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your account has been successfully created and your payment has been processed. 
          You're now ready to transform your real estate business!
        </p>
      </div>

      {/* Account Details */}
      <div className="bg-blue-50 p-6 rounded-lg max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium">{planNames[selectedPlan as keyof typeof planNames]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="text-green-600 font-medium">Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Trial Period:</span>
            <span className="font-medium">14 days remaining</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">What's Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nextSteps.map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <div className="text-blue-600">
                  {step.icon}
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-4 h-4 mr-2" />
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-4 h-4 mr-2" />
            Invite Team Members
          </button>
        </div>
      </div>

      {/* Auto-redirect Notice */}
      <div className="bg-yellow-50 p-4 rounded-lg max-w-md mx-auto">
        <p className="text-sm text-yellow-800">
          You'll be automatically redirected to your dashboard in a few seconds...
        </p>
      </div>

      {/* Support Information */}
      <div className="border-t pt-6">
        <p className="text-sm text-gray-600 mb-2">
          Need help getting started?
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <a href="#" className="text-blue-600 hover:text-blue-700">Documentation</a>
          <a href="#" className="text-blue-600 hover:text-blue-700">Video Tutorials</a>
          <a href="#" className="text-blue-600 hover:text-blue-700">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default StepSuccess;
