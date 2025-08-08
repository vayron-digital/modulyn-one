import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Building, 
  Phone, 
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

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingAddress: string;
  city: string;
  zipCode: string;
  country: string;
}

const AccountCreation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'professional';
  const navigate = useNavigate();
  const { user, handleOAuthUser } = useAuth();
  
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
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: ''
  });

  // Check if user came from OAuth and handle accordingly
  useEffect(() => {
    const checkOAuthUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check if this is an OAuth user
          const isOAuth = session.user.app_metadata?.provider === 'google';
          
          if (isOAuth) {
            setIsOAuthUser(true);
            setOauthUserData(session.user);
            
            // Pre-fill user details from OAuth data
            const fullName = session.user.user_metadata?.full_name || '';
            const [firstName = '', lastName = ''] = fullName.split(' ');
            
            setUserDetails(prev => ({
              ...prev,
              firstName,
              lastName,
              email: session.user.email || '',
              // Don't pre-fill password for OAuth users
              password: '',
              confirmPassword: '',
            }));
            
            // Check if user already has a complete profile
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
          }
        }
      } catch (error) {
        console.error('Error checking OAuth user:', error);
      }
    };
    
    checkOAuthUser();
  }, [navigate]);

  const plans = {
    starter: { name: 'Starter', price: 29, features: ['Up to 5 team members', 'Basic features', 'Email support'] },
    professional: { name: 'Professional', price: 79, features: ['Up to 20 team members', 'Advanced features', 'Priority support'] },
    enterprise: { name: 'Enterprise', price: 199, features: ['Unlimited team members', 'All features', 'Dedicated support'] }
  };

  const selectedPlanData = plans[selectedPlan as keyof typeof plans];

  const updateUserDetails = (field: keyof UserDetails, value: string) => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
  };

  const updatePaymentDetails = (field: keyof PaymentDetails, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateUserDetails = () => {
    if (!userDetails.firstName || !userDetails.lastName || !userDetails.email || !userDetails.company) {
      setError('Please fill in all required fields');
      return false;
    }
    
    // Only validate password for non-OAuth users
    if (!isOAuthUser) {
      if (!userDetails.password || !userDetails.confirmPassword) {
        setError('Please fill in all required fields');
        return false;
      }
      if (userDetails.password !== userDetails.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (userDetails.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const validatePaymentDetails = () => {
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || 
        !paymentDetails.cvv || !paymentDetails.cardholderName) {
      setError('Please fill in all payment details');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateUserDetails()) return;
    if (currentStep === 2 && !validatePaymentDetails()) return;
    if (currentStep === 3 && !acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    if (currentStep < 4) {
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

      // Update user profile with tenant and additional details
      const { error: profileError } = await supabase.from('profiles').update({
        tenant_id: tenantData.id,
        full_name: `${userDetails.firstName} ${userDetails.lastName}`,
        phone: userDetails.phone || null,
        designation: userDetails.jobTitle || null,
        is_admin: true, // First user is admin
        is_active: true,
      }).eq('id', oauthUserData?.id || user?.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page
      navigate('/account-creation-success', { 
        state: { 
          plan: selectedPlan,
          userDetails,
          paymentDetails,
          isOAuthUser
        }
      });
    } catch (error: any) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Account Details', icon: User },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Terms', icon: Shield },
    { number: 4, title: 'Complete', icon: CheckCircle }
  ];

  // Show loading while checking OAuth status
  if (!oauthUserData && isOAuthUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

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
                Creating your {selectedPlanData.name} account
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-500'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-slate-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
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
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h2>
                  <p className="text-slate-600">Tell us about yourself to get started</p>
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
                  {!isOAuthUser && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={userDetails.password}
                          onChange={(e) => updateUserDetails('password', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Create a password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          value={userDetails.confirmPassword}
                          onChange={(e) => updateUserDetails('confirmPassword', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </>
                  )}
                  {isOAuthUser && (
                    <div className="md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-700 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Signed in with Google - No password required</span>
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
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Information</h2>
                  <p className="text-slate-600">Secure payment powered by Stripe</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => updatePaymentDetails('cardNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => updatePaymentDetails('expiryDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.cvv}
                      onChange={(e) => updatePaymentDetails('cvv', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.cardholderName}
                      onChange={(e) => updatePaymentDetails('cardholderName', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter cardholder name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Billing Address *
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.billingAddress}
                      onChange={(e) => updatePaymentDetails('billingAddress', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter billing address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.city}
                      onChange={(e) => updatePaymentDetails('city', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.zipCode}
                      onChange={(e) => updatePaymentDetails('zipCode', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter ZIP code"
                    />
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
                    <div className="flex justify-between">
                      <span className="text-slate-600">Free Trial</span>
                      <span className="text-green-600 font-medium">14 days</span>
                    </div>
                    <hr className="border-slate-200" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="font-semibold text-slate-900">${selectedPlanData.price}/month</span>
                    </div>
                  </div>
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
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Terms & Conditions</h2>
                  <p className="text-slate-600">Please review and accept our terms</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Terms of Service</h3>
                  <div className="space-y-4 text-sm text-slate-700">
                    <p>
                      By creating an account with Modulyn, you agree to the following terms and conditions:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>You will use the service in compliance with all applicable laws and regulations</li>
                      <li>You are responsible for maintaining the security of your account credentials</li>
                      <li>You agree to pay the monthly subscription fee as outlined in your selected plan</li>
                      <li>You can cancel your subscription at any time through your account settings</li>
                      <li>We reserve the right to modify these terms with 30 days notice</li>
                      <li>Your data is protected according to our privacy policy and GDPR compliance</li>
                    </ul>
                    <p>
                      For the complete terms of service, please visit our website or contact our support team.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-700">
                    I have read and agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Complete</h2>
                  <p className="text-slate-600">
                    Review your information and complete your account creation
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 text-left">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Name:</span>
                      <span className="ml-2 font-medium">{userDetails.firstName} {userDetails.lastName}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Email:</span>
                      <span className="ml-2 font-medium">{userDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Company:</span>
                      <span className="ml-2 font-medium">{userDetails.company}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Plan:</span>
                      <span className="ml-2 font-medium">{selectedPlanData.name} - ${selectedPlanData.price}/month</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCreation;
