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
      {/* Navigation Buttons - Only show for non-success steps */}
      {step < steps.length - 1 && (
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
                padding: S.button.padding,
                fontSize: S.button.fontSize,
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
                borderRadius: S.button.borderRadius,
                background: DESIGN.colors.primary,
                color: S.button.textColor,
                padding: S.button.padding,
                fontSize: S.button.fontSize,
              }}
            >
              {step === steps.length - 2 ? 'Complete Setup' : 'Next'}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
} 