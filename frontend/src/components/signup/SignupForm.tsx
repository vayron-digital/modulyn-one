import React, { useEffect } from 'react';
import { useSignup } from './SignupStepper';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import FullScreenLoader from '../FullScreenLoader';
import StepPersonalInfo from './steps/StepPersonalInfo';
import StepContactInfo from './steps/StepContactInfo';
import StepSecurity from './steps/StepSecurity';
import StepCompanyInfo from './steps/StepCompanyInfo';
import { DESIGN } from '../../lib/design';

const steps = [
  StepPersonalInfo,
  StepContactInfo,
  StepSecurity,
  StepCompanyInfo,
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

  return (
    <div className="mx-auto shadow-lg relative" style={{ maxWidth: S.rightCol.maxWidth, padding: S.rightCol.padding, borderRadius: S.rightCol.borderRadius, background: S.rightCol.background, boxShadow: S.rightCol.boxShadow }}>
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
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {!isFirstStep && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={prevStep}
            className="btn-secondary btn-text font-semibold"
            style={{
              borderRadius: S.button.borderRadius,
              color: DESIGN.colors.primary,
              border: `2px solid ${DESIGN.colors.primary}`,
              background: S.button.background,
              fontSize: S.button.fontSize,
              fontWeight: S.button.fontWeight,
              padding: S.button.padding,
              boxShadow: S.button.boxShadow,
            }}
            type="button"
          >
            Back
          </motion.button>
        )}
        <div className="flex-1" />
        {!isLastStep ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={nextStep}
            className="btn-primary btn-text text-white font-semibold"
            style={{
              background: S.button.background,
              borderRadius: S.button.borderRadius,
              color: S.button.color,
              fontSize: S.button.fontSize,
              fontWeight: S.button.fontWeight,
              padding: S.button.padding,
              boxShadow: S.button.boxShadow,
            }}
            disabled={!canNext || loading}
            type="button"
          >
            Next
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={validateStep}
            className="btn-primary btn-text text-white font-semibold"
            style={{
              background: S.button.background,
              borderRadius: S.button.borderRadius,
              color: S.button.color,
              fontSize: S.button.fontSize,
              fontWeight: S.button.fontWeight,
              padding: S.button.padding,
              boxShadow: S.button.boxShadow,
            }}
            disabled={loading}
            type="button"
          >
            {loading ? 'Creating Account...' : 'Create Account (Start Free 14-Day Trial)'}
          </motion.button>
        )}
      </div>
      {submitted && <div style={{ color: S.error.color, fontSize: S.error.fontSize, marginTop: S.error.marginTop, textAlign: 'center' }}>Signup complete! (Supabase integration coming next)</div>}
    </div>
  );
} 