import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  phone: string;
  jobTitle: string;
}

const AccountCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'professional';
  const source = searchParams.get('source'); // 'preview' if coming from preview space
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPreviewUpgrade = source === 'preview';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [oauthUserData, setOauthUserData] = useState<any>(null);
  
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    jobTitle: ''
  });

  const plans = {
    starter: { name: 'Starter', price: 29, features: ['Up to 5 team members', 'Basic features', 'Email support'] },
    professional: { name: 'Professional', price: 79, features: ['Up to 20 team members', 'Advanced features', 'Priority support'] },
    enterprise: { name: 'Enterprise', price: 199, features: ['Unlimited team members', 'All features', 'Dedicated support'] }
  };

  const selectedPlanData = plans[selectedPlan as keyof typeof plans];

  const updateUserDetails = (field: keyof UserDetails, value: string) => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateUserDetails = () => {
    if (!userDetails.firstName || !userDetails.lastName || !userDetails.email || !userDetails.company) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!isOAuthUser) {
      if (!userDetails.password || !userDetails.confirmPassword) {
        setError('Please fill in all required fields');
        return false;
      }

      if (userDetails.password !== userDetails.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (userDetails.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateUserDetails()) return;
    if (currentStep === 2 && !acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  // Check if user came from OAuth/preview and pre-fill form
  useEffect(() => {
    const checkUserAndPreFill = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check if this is an OAuth user
          const isOAuth = session.user.app_metadata?.provider === 'google';
          
          if (isOAuth) {
            setIsOAuthUser(true);
            setOauthUserData(session.user);
          }

          // Check if user already has a profile (preview users)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
              
          if (profile?.tenant_id) {
            // User already has complete setup, redirect to dashboard
            navigate('/dashboard');
            return;
          }

          // Pre-fill form data
          if (profile) {
            // Existing preview user - pre-fill from profile
            const [firstName = '', ...lastNameParts] = (profile.full_name || '').split(' ');
            const lastName = lastNameParts.join(' ');
            
            setUserDetails(prev => ({
              ...prev,
              firstName,
              lastName,
              email: profile.email || session.user.email || '',
              phone: profile.phone || '',
              jobTitle: profile.designation || '',
              // For OAuth users, no password needed
              password: isOAuth ? 'oauth-user' : '',
              confirmPassword: isOAuth ? 'oauth-user' : '',
            }));
          } else if (isOAuth) {
            // New OAuth user - pre-fill from OAuth data
            const fullName = session.user.user_metadata?.full_name || '';
            const [firstName = '', ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ');
            
            setUserDetails(prev => ({
              ...prev,
              firstName,
              lastName,
              email: session.user.email || '',
              // OAuth users don't need passwords
              password: 'oauth-user',
              confirmPassword: 'oauth-user',
            }));
          }
        }

        // Check for pending payment (user returned from FastSpring)
        const pendingData = localStorage.getItem('pendingAccountCreation');
        if (pendingData) {
          const { timestamp } = JSON.parse(pendingData);
          // If pending data is older than 1 hour, clear it
          if (Date.now() - timestamp > 60 * 60 * 1000) {
            localStorage.removeItem('pendingAccountCreation');
          } else {
            setError('Your payment is being processed. Please wait or contact support if you completed payment.');
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };
    
    checkUserAndPreFill();
  }, [navigate]);

  const processPayment = async (plan: string, userDetails: any, tenantData: any): Promise<boolean> => {
    try {
      // Generate FastSpring checkout URL
      const fastspringStoreId = 'usercentraltechnologies_store';
      const productId = plan === 'professional' ? 'modulyn-one-plus' : 'modulyn-one-pro';
      
      const returnUrl = `${window.location.origin}/payment/callback`;
      const checkoutUrl = `https://sites.fastspring.com/${fastspringStoreId}/product/${productId}?` +
        `referrer=${encodeURIComponent(userDetails.email)}&` +
        `customer_email=${encodeURIComponent(userDetails.email)}&` +
        `customer_id=${tenantData.id}&` +
        `customer_company=${encodeURIComponent(userDetails.company)}&` +
        `customer_first_name=${encodeURIComponent(userDetails.firstName)}&` +
        `customer_last_name=${encodeURIComponent(userDetails.lastName)}&` +
        `return_url=${encodeURIComponent(returnUrl)}`;
      
      console.log('Redirecting to FastSpring checkout:', checkoutUrl);
      
      // Check if this is an upgrade (existing profile) or new signup
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userDetails.userId || user?.id)
        .single();

      const isUpgrade = !!existingProfile;

      // Store the pending state in localStorage for when user returns
      localStorage.setItem('pendingAccountCreation', JSON.stringify({
        tenantId: tenantData.id,
        userDetails,
        selectedPlan: plan,
        isUpgrade,
        timestamp: Date.now()
      }));
      
      // Redirect to FastSpring checkout
      window.location.href = checkoutUrl;
      
      // Return true since we're redirecting (actual payment validation happens on return)
      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create tenant and complete account setup
      const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const now = new Date();
      const addDays = (date: Date, days: number) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
      };

      // Create tenant
      const { data: tenantData, error: tenantError } = await supabase.from('tenants').insert([
        {
          name: userDetails.company,
          slug: slugify(userDetails.company),
          theme_color: '#6C2EBE',
          feature_flags: {
            cold_calls: true,
            chat: true,
            documents: false,
          },
          trial_start: now.toISOString(),
          trial_ends: addDays(now, 14).toISOString(),
          industry: 'Real Estate', // Default, can be updated later
          size: 'Small', // Default, can be updated later
        },
      ]).select().single();

      if (tenantError || !tenantData) {
        throw new Error(tenantError?.message || 'Could not create tenant.');
      }

      // Update or create profile with tenant and additional details
      const userId = oauthUserData?.id || user?.id;
      
      // Check if profile already exists (for preview users)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        // Update existing profile (preview users upgrading)
        const updateData: any = {
          tenant_id: tenantData.id,
          full_name: `${userDetails.firstName} ${userDetails.lastName}`,
          phone: userDetails.phone || null,
          designation: userDetails.jobTitle || null,
          is_admin: true, // First user is admin
        };

        // For OAuth users, also update OAuth fields if missing
        if (isOAuthUser && oauthUserData) {
          updateData.oauth_provider = updateData.oauth_provider || 'google';
          updateData.oauth_id = updateData.oauth_id || oauthUserData.user_metadata?.sub;
          updateData.profile_image_url = updateData.profile_image_url || oauthUserData.user_metadata?.avatar_url;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (profileError) {
          throw new Error(profileError.message);
        }
      } else {
        // Create new profile (fresh signup)
        const profileData: any = {
          id: userId,
          tenant_id: tenantData.id,
          email: (oauthUserData?.email || user?.email || userDetails.email),
          full_name: `${userDetails.firstName} ${userDetails.lastName}`,
          phone: userDetails.phone || null,
          designation: userDetails.jobTitle || null,
          is_admin: true,
        };

        // Add OAuth fields if applicable
        if (isOAuthUser && oauthUserData) {
          profileData.oauth_provider = 'google';
          profileData.oauth_id = oauthUserData.user_metadata?.sub;
          profileData.profile_image_url = oauthUserData.user_metadata?.avatar_url;
        }

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      // Process payment via FastSpring
      const success = await processPayment(selectedPlan, userDetails, tenantData);
      if (!success) {
        throw new Error('Payment processing failed. Please try again.');
      }
      
    } catch (error: any) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Account Details', icon: User },
    { number: 2, title: 'Terms', icon: Shield },
    { number: 3, title: 'Complete', icon: CheckCircle }
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
                Creating your Professional account
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

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep >= step.number 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-slate-300 text-slate-500'
              }`}>
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-16 h-px mx-6 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-slate-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Details</h2>
                  <p className="text-slate-600">Tell us about yourself and your company</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={userDetails.firstName}
                      onChange={(e) => updateUserDetails('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={userDetails.lastName}
                      onChange={(e) => updateUserDetails('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={userDetails.email}
                      onChange={(e) => updateUserDetails('email', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userDetails.phone}
                      onChange={(e) => updateUserDetails('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={userDetails.company}
                      onChange={(e) => updateUserDetails('company', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={userDetails.jobTitle}
                      onChange={(e) => updateUserDetails('jobTitle', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your job title"
                    />
                  </div>
                  
                  {/* OAuth User Notice */}
                  {isOAuthUser && (
                    <div className="md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-700 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Signed in with Google - Password not required</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Pre-filled Notice for Preview Users */}
                  {isPreviewUpgrade && (
                    <div className="md:col-span-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Account details pre-filled from your preview profile</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Terms & Conditions</h2>
                  <p className="text-slate-600">Please review and accept our terms</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Modulyn Terms of Service</h3>
                  <div className="space-y-4 text-sm text-slate-600">
                    <p>By using Modulyn, you agree to these terms...</p>
                    <p>Your privacy and data security are our top priorities...</p>
                    <p>Payment processing is handled securely by FastSpring...</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-700">
                    I agree to the terms and conditions and privacy policy
                  </label>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Setup</h2>
                  <p className="text-slate-600">Review your information and complete payment</p>
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <Shield className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-2">Secure Payment Processing</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Your payment will be processed securely by FastSpring, our trusted payment partner. 
                        We never store your credit card information on our servers.
                      </p>
                      <p className="text-sm text-green-700">
                        After clicking "Complete Setup", you'll be redirected to FastSpring's secure checkout page 
                        to complete your payment safely.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">{selectedPlanData.name} Plan</span>
                      <span className="font-medium">${selectedPlanData.price}/month</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Free Trial</span>
                      <span className="font-medium">14 days</span>
                    </div>
                    <hr className="border-slate-200" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${selectedPlanData.price}/month</span>
                    </div>
                  </div>
                </div>

                {/* Next Step Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Next: You'll be redirected to FastSpring's secure payment page
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : currentStep === 3 ? (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCreation;
