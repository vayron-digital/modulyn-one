import React, { useEffect } from 'react';
import { useSignup } from './SignupStepper';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import FullScreenLoader from '../FullScreenLoader';
import StepPersonalInfo from './steps/StepPersonalInfo';
import StepContactInfo from './steps/StepContactInfo';
import StepSecurity from './steps/StepSecurity';
import StepCompanyInfo from './steps/StepCompanyInfo';
import StepPayment from './steps/StepPayment';
import StepSuccess from './steps/StepSuccess';
import { DESIGN } from '../../lib/design';
import { Mail, Phone } from 'lucide-react';

const steps = [
  StepPersonalInfo,
  StepContactInfo,
  StepSecurity,
  StepCompanyInfo,
  StepPayment,
  StepSuccess,
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  const S = DESIGN.signupPage;
  const percent = ((step + 1) / total) * 100;
  return (
    <motion.div className="w-full rounded-full h-2 mb-6" style={{ background: '#F3F4F6' }}>
      <motion.div
        className="h-2 rounded-full transition-all duration-300"
        style={{ width: `${percent}%`, background: S.progress.dotActive }}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

export default function SignupForm() {
  const {
    step,
    nextStep,
    prevStep,
    canNext,
    canPrev,
    isLastStep,
    isFirstStep,
    validateStep,
    loading,
    submitted,
  } = useSignup();
  const StepComponent = steps[step];
  const S = DESIGN.signupPage;
  const navigate = useNavigate();

  useEffect(() => {
    if (submitted) {
      navigate('/', { replace: true });
    }
  }, [submitted, navigate]);

  // Ensure theme values are strings
  const primaryColor = typeof DESIGN.colors.primary === 'string' ? DESIGN.colors.primary : '#ff0141';
  const surfaceColor = typeof DESIGN.colors.surface === 'string' ? DESIGN.colors.surface : '#f4f4f6';
  const backgroundColor = typeof DESIGN.colors.background === 'string' ? DESIGN.colors.background : '#ffffff';

  const socialLinks = [
    { href: 'https://twitter.com/modulyn', icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg> },
    { href: 'https://www.linkedin.com/company/modulyn', icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><path d="M2 9h4v12H2z"/></svg> },
    { href: 'https://www.facebook.com/modulyn', icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Column */}
      <div className="hidden lg:flex lg:w-1/2 relative" style={{
        background: backgroundColor,
        backgroundImage: `linear-gradient(135deg, ${backgroundColor} 0%, ${surfaceColor} 100%)`
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          {/* Logo */}
          <div className="mb-12">
            <img 
              src="/logo.png" 
              alt="Modulyn One" 
              style={{ 
                height: DESIGN.logo.height, 
                width: DESIGN.logo.width 
              }} 
            />
          </div>

          {/* Brand Text */}
          <h1 className="text-4xl font-bold mb-6" style={{ color: primaryColor }}>
            Welcome to Modulyn One
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The modular CRM for modern teams. Streamline your sales process, manage leads, and close more deals.
          </p>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                background: surfaceColor,
                border: `1px solid ${primaryColor}`,
              }}>
                <Mail style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: primaryColor }}>Email</p>
                <p className="text-sm text-gray-600">support@modulyn.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                background: surfaceColor,
                border: `1px solid ${primaryColor}`,
              }}>
                <Phone style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: primaryColor }}>Phone</p>
                <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-12 flex space-x-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: surfaceColor,
                  border: `1px solid ${primaryColor}`,
                  color: primaryColor,
                }}
              >
                <link.icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12" style={{
        background: primaryColor,
        maxWidth: DESIGN.signupPage.rightCol.maxWidth,
        padding: DESIGN.signupPage.rightCol.padding,
        borderRadius: DESIGN.signupPage.rightCol.borderRadius,
        boxShadow: DESIGN.signupPage.rightCol.boxShadow,
      }}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{
              color: DESIGN.signupPage.header.color,
              fontSize: DESIGN.signupPage.header.fontSize,
              fontWeight: DESIGN.signupPage.header.fontWeight,
              marginBottom: DESIGN.signupPage.header.marginBottom,
              textAlign: 'center' as const,
            }}>
              Create Your Account
            </h2>
            <p className="text-lg opacity-90" style={{ color: DESIGN.signupPage.header.color }}>
              Start your 14-day free trial. No credit card required.
            </p>
          </div>
          {/* Loader Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm"
              >
                <FullScreenLoader />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Progress Indicator */}
          <ProgressBar step={step} total={steps.length} />
          {/* Step Content with Animation */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
          {/* Navigation Buttons - Only show for non-success steps */}
          {step < steps.length - 1 && (
            <div className="flex justify-between mt-8">
              {!isFirstStep && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={prevStep}
                  className="btn-secondary btn-text font-semibold"
                  style={{
                    borderRadius: DESIGN.signupPage.button.borderRadius,
                    color: primaryColor,
                    border: `2px solid ${primaryColor}`,
                    background: DESIGN.signupPage.button.background,
                    padding: DESIGN.signupPage.button.padding,
                    fontSize: DESIGN.signupPage.button.fontSize,
                  }}
                >
                  Back
                </motion.button>
              )}
              <div className="flex-1" />
              {!isLastStep && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={nextStep}
                  disabled={!canNext}
                  className="btn-primary btn-text font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderRadius: DESIGN.signupPage.button.borderRadius,
                    background: primaryColor,
                    color: DESIGN.signupPage.button.color,
                    padding: DESIGN.signupPage.button.padding,
                    fontSize: DESIGN.signupPage.button.fontSize,
                  }}
                >
                  {step === steps.length - 2 ? 'Complete Setup' : 'Next'}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 