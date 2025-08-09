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
  AlertCircle,
  Mail,
  Globe,
  ExternalLink,
  Users,
  Crown
} from 'lucide-react';
import { CompanySelector } from '../../components/auth/CompanySelector';
import { PhoneInput } from '../../components/ui/PhoneInput';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  phone: string;
  phoneCountryCode: string;
  fullPhoneNumber: string;
  jobTitle: string;
  customSlug?: string;
  companyEmail?: string;
}

interface SelectedTenant {
  id: string;
  name: string;
  logo_url?: string;
  slug: string;
  member_count?: number;
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
  const [companyMode, setCompanyMode] = useState<'create' | 'join'>('create');
  const [selectedTenant, setSelectedTenant] = useState<SelectedTenant | null>(null);
  const [slugConflict, setSlugConflict] = useState<{exists: boolean, tenant?: SelectedTenant} | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [planLimitReached, setPlanLimitReached] = useState<{reached: boolean, planDetails?: any} | null>(null);
  
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    phoneCountryCode: 'AE',
    fullPhoneNumber: '',
    jobTitle: '',
    customSlug: '',
    companyEmail: ''
  });

  const plans = {
    starter: { name: 'Starter', price: 29, features: ['Up to 5 team members', 'Basic features', 'Email support'] },
    professional: { name: 'Professional', price: 79, features: ['Up to 20 team members', 'Advanced features', 'Priority support'] },
    enterprise: { name: 'Enterprise', price: 199, features: ['Unlimited team members', 'All features', 'Dedicated support'] }
  };

  const selectedPlanData = plans[selectedPlan as keyof typeof plans];

  const updateUserDetails = (field: keyof UserDetails, value: string) => {
    setUserDetails(prev => ({ ...prev, [field]: value }));
    
    // Real-time slug validation for custom slug input
    if (field === 'customSlug' && value.trim()) {
      validateCustomSlug(value.trim());
    }
    
    // Clear slug conflict when company name changes in create mode
    if (field === 'company' && companyMode === 'create') {
      setSlugConflict(null);
    }
  };
  
  // Validate custom slug in real-time
  const validateCustomSlug = async (slug: string) => {
    try {
      const slugified = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id, name, slug, logo_url')
        .eq('slug', slugified)
        .maybeSingle();
        
      if (existingTenant) {
        setSlugConflict({
          exists: true,
          tenant: existingTenant
        });
      } else {
        setSlugConflict({ exists: false });
      }
    } catch (error) {
      console.error('Error validating slug:', error);
    }
  };
  
  // Send email verification for joining company
  const sendEmailVerification = async (email: string, tenantId: string) => {
    try {
      setLoading(true);
      
      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store verification attempt in localStorage (in real app, use backend)
      const verificationData = {
        email,
        tenantId,
        code,
        timestamp: Date.now(),
        attempts: 0
      };
      
      localStorage.setItem('emailVerification', JSON.stringify(verificationData));
      
      // TODO: Send actual email through backend API
      console.log('🔐 Verification code for', email, ':', code);
      
      setEmailVerificationSent(true);
      setError('');
    } catch (error) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify email code
  const verifyEmailCode = () => {
    try {
      const stored = localStorage.getItem('emailVerification');
      if (!stored) {
        setError('Verification session expired. Please try again.');
        return false;
      }
      
      const verificationData = JSON.parse(stored);
      
      // Check if verification is expired (10 minutes)
      if (Date.now() - verificationData.timestamp > 10 * 60 * 1000) {
        setError('Verification code expired. Please request a new one.');
        localStorage.removeItem('emailVerification');
        setEmailVerificationSent(false);
        return false;
      }
      
      if (verificationCode !== verificationData.code) {
        setError('Invalid verification code. Please try again.');
        return false;
      }
      
      setEmailVerified(true);
      setError('');
      localStorage.removeItem('emailVerification');
      return true;
    } catch (error) {
      setError('Verification failed. Please try again.');
      return false;
    }
  };
  
  // Check user limits for tenant
  const checkUserLimits = async (tenantId: string) => {
    try {
      const response = await api.get(`/tenants/${tenantId}/check-limits`);
      
      if (response.data.limitReached) {
        setPlanLimitReached({
          reached: true,
          planDetails: response.data.planDetails
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking user limits:', error);
      // Allow proceeding if we can't check limits
      return true;
    }
  };

  const validateUserDetails = () => {
    console.log('🔍 Validating user details:', userDetails);
    console.log('🔑 isOAuthUser:', isOAuthUser);
    console.log('🏢 companyMode:', companyMode);
    console.log('📧 emailVerified:', emailVerified);
    
    const missingFields = [];
    if (!userDetails.firstName) missingFields.push('First Name');
    if (!userDetails.lastName) missingFields.push('Last Name');
    if (!userDetails.email) missingFields.push('Email');
    if (!userDetails.company) missingFields.push('Company');
    
    // Additional validations for create mode
    if (companyMode === 'create') {
      if (!userDetails.customSlug) missingFields.push('Company URL');
      
      // Check for slug conflict
      if (slugConflict?.exists) {
        setError('Company URL already exists. Please choose a different one or join the existing company.');
        return false;
      }
    }
    
    // Additional validations for join mode
    if (companyMode === 'join') {
      if (!selectedTenant) {
        setError('Please select a company to join');
        return false;
      }
      if (!userDetails.companyEmail) missingFields.push('Company Email');
      if (!emailVerified) {
        setError('Please verify your company email address');
        return false;
      }
    }
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (!isOAuthUser) {
      if (!userDetails.password || !userDetails.confirmPassword) {
        console.log('❌ Missing passwords for non-OAuth user');
        setError('Please fill in all required fields');
        return false;
      }

      if (userDetails.password !== userDetails.confirmPassword) {
        console.log('❌ Passwords do not match');
        setError('Passwords do not match');
        return false;
      }

      if (userDetails.password.length < 6) {
        console.log('❌ Password too short');
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    console.log('✅ Validation passed');
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
              phone: profile.phone ? profile.phone.replace(/^\+\d+\s*/, '') : '', // Remove country code
              fullPhoneNumber: profile.phone || '',
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
        companyMode,
        selectedTenant,
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
    console.log('🚀 handleSubmit called');
    console.log('📋 userDetails:', userDetails);
    console.log('🏢 companyMode:', companyMode);
    console.log('🎯 selectedTenant:', selectedTenant);
    console.log('✅ acceptedTerms:', acceptedTerms);
    
    // Validate required fields
    if (!userDetails.company) {
      setError('Please enter a company name');
      return;
    }
    
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    setLoading(true);
    try {
      let tenantData;
      
      if (companyMode === 'join' && selectedTenant) {
        // Check user limits before proceeding
        const canJoin = await checkUserLimits(selectedTenant.id);
        if (!canJoin) {
          // Redirect to plan limit reached page
          const planDetailsParam = encodeURIComponent(JSON.stringify(planLimitReached?.planDetails));
          navigate(`/plan-limit-reached?planDetails=${planDetailsParam}`);
          setLoading(false);
          return;
        }
        
        // Joining existing tenant
        tenantData = selectedTenant;
        console.log('Joining existing tenant:', selectedTenant);
      } else {
        // Create new tenant with unique slug handling
        const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const now = new Date();
        const addDays = (date: Date, days: number) => {
          const d = new Date(date);
          d.setDate(d.getDate() + days);
          return d;
        };

        // Use custom slug if provided, otherwise generate from company name
        const customSlug = userDetails.customSlug ? slugify(userDetails.customSlug) : slugify(userDetails.company);
        
        console.log('🏷️ Using custom slug:', customSlug);

        const { data: newTenantData, error: tenantError } = await supabase.from('tenants').insert([
          {
            name: userDetails.company,
            slug: customSlug,
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

        if (tenantError || !newTenantData) {
          throw new Error(tenantError?.message || 'Could not create tenant.');
        }
        
        tenantData = newTenantData;
      }

      // Update or create profile with tenant and additional details
      const userId = oauthUserData?.id || user?.id;
      
      // Check if profile already exists (for preview users)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid 400 error when no record exists

      if (existingProfile) {
        // Update existing profile (preview users upgrading)
        const updateData: any = {
          tenant_id: tenantData.id,
          full_name: `${userDetails.firstName} ${userDetails.lastName}`,
          phone: userDetails.phone || null,
          designation: userDetails.jobTitle || null,
          is_admin: companyMode === 'create', // Only admin if creating new company
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
          is_admin: companyMode === 'create', // Only admin if creating new company
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

      // Handle payment based on mode
      if (companyMode === 'create') {
        // New company needs payment
        const success = await processPayment(selectedPlan, userDetails, tenantData);
        if (!success) {
          throw new Error('Payment processing failed. Please try again.');
        }
      } else {
        // Joining existing company - redirect to success or pending approval
        navigate('/account-creation-success', {
          state: {
            paymentSuccess: false,
            isJoiningCompany: true,
            companyName: selectedTenant?.name,
            pendingApproval: true
          }
        });
      }
      
    } catch (error: any) {
      console.error('❌ Error in handleSubmit:', error);
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
                    <PhoneInput
                      value={userDetails.phone}
                      onChange={(phone, fullNumber, countryCode) => {
                        setUserDetails(prev => ({
                          ...prev,
                          phone,
                          fullPhoneNumber: fullNumber,
                          phoneCountryCode: countryCode
                        }));
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <CompanySelector
                      value={userDetails.company}
                      onChange={(companyName, tenant) => {
                        updateUserDetails('company', companyName);
                        setSelectedTenant(tenant || null);
                      }}
                      onModeChange={(mode) => {
                        setCompanyMode(mode);
                        setSlugConflict(null);
                        setEmailVerificationSent(false);
                        setEmailVerified(false);
                      }}
                      mode={companyMode}
                      customSlug={userDetails.customSlug}
                      onSlugChange={(slug) => updateUserDetails('customSlug', slug)}
                      slugConflict={slugConflict}
                      onSlugConflictAction={(action) => {
                        if (action === 'join' && slugConflict?.tenant) {
                          setCompanyMode('join');
                          setSelectedTenant(slugConflict.tenant);
                          updateUserDetails('company', slugConflict.tenant.name);
                          setSlugConflict(null);
                        } else if (action === 'change') {
                          updateUserDetails('customSlug', '');
                          setSlugConflict(null);
                        }
                      }}
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
                  
                  {/* Company Email Verification for Join Mode */}
                  {companyMode === 'join' && selectedTenant && (
                    <div className="md:col-span-2">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Company Email Address *
                          </label>
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                              </div>
                              <input
                                type="email"
                                value={userDetails.companyEmail}
                                onChange={(e) => updateUserDetails('companyEmail', e.target.value)}
                                disabled={emailVerified}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                                placeholder={`Enter your ${selectedTenant.name} email`}
                              />
                            </div>
                            {!emailVerificationSent && !emailVerified && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (userDetails.companyEmail && selectedTenant) {
                                    sendEmailVerification(userDetails.companyEmail, selectedTenant.id);
                                  } else {
                                    setError('Please enter your company email address');
                                  }
                                }}
                                disabled={loading || !userDetails.companyEmail}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                              >
                                {loading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Send Code'
                                )}
                              </button>
                            )}
                            {emailVerified && (
                              <div className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Verified
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            We'll send a verification code to confirm you work at {selectedTenant.name}
                          </p>
                        </div>
                        
                        {/* Verification Code Input */}
                        {emailVerificationSent && !emailVerified && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-blue-700">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Verification code sent to {userDetails.companyEmail}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="Enter 6-digit code"
                                  className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  maxLength={6}
                                />
                                <button
                                  type="button"
                                  onClick={verifyEmailCode}
                                  disabled={verificationCode.length !== 6}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Verify
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEmailVerificationSent(false);
                                  setVerificationCode('');
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 underline"
                              >
                                Didn't receive code? Try again
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Email Verified Success */}
                        {emailVerified && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Email verified! You can now join {selectedTenant.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
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

                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Legal Agreement</h3>
                  <div className="space-y-4 text-sm text-slate-600">
                    <p>
                      By creating an account, you agree to our comprehensive legal terms that govern 
                      your use of the Modulyn CRM platform.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a 
                        href="/terms-of-service" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
                      >
                        View Terms of Service
                      </a>
                      <a 
                        href="/privacy-policy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
                      >
                        View Privacy Policy
                      </a>
                    </div>
                    <p className="text-xs">
                      These documents detail your rights, our responsibilities, data handling practices, 
                      and the terms governing your subscription.
                    </p>
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
                    I have read and agree to the{' '}
                    <a 
                      href="/terms-of-service" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a 
                      href="/privacy-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Privacy Policy
                    </a>
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
