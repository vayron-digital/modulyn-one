import React, { createContext, useContext } from 'react';
import { useSignupState } from './useSignupState';
import { DESIGN } from '../../lib/design';

const SignupContext = createContext<any>(null);

export function SignupStepper({ children }: { children: React.ReactNode }) {
  const state = useSignupState();
  const { step } = state;
  const totalSteps = 4;
  const S = DESIGN.signupPage;

  return (
    <SignupContext.Provider value={state}>
      <div className="min-h-screen flex flex-col md:flex-row" style={{ background: S.background }}>
        {/* Left Side (Desktop Only) */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-12" style={{ background: S.leftCol.background }}>
          <div>
            <img src="/logo.png" alt="Modulyn One" style={{ height: S.leftCol.logoHeight, width: S.leftCol.logoWidth }} />
            <h2 className="mt-6 font-bold" style={{ color: S.leftCol.brandColor, fontSize: S.leftCol.brandFontSize }}>Modulyn One</h2>
            <p className="mt-2" style={{ color: S.leftCol.textColor, fontSize: S.leftCol.contactBlock.fontSize }}>The modular CRM for modern teams</p>
          </div>
          <div className="space-y-4 text-sm" style={{ color: S.leftCol.textColor, fontSize: S.leftCol.contactBlock.fontSize }}>
            <div><span className="font-semibold" style={{ color: S.leftCol.contactBlock.labelColor }}>Email:</span> <span style={{ color: S.leftCol.contactBlock.valueColor }}>hello@modulyn.com</span></div>
            <div><span className="font-semibold" style={{ color: S.leftCol.contactBlock.labelColor }}>Office:</span> <span style={{ color: S.leftCol.contactBlock.valueColor }}>Dubai, UAE</span></div>
            <div><span className="font-semibold" style={{ color: S.leftCol.contactBlock.labelColor }}>Phone:</span> <span style={{ color: S.leftCol.contactBlock.valueColor }}>+971 123 456 789</span></div>
            {/* Social icons placeholder */}
            <div className="flex gap-3 mt-2">
              <span className="inline-block" style={{ width: S.leftCol.socialIcon.size, height: S.leftCol.socialIcon.size, background: S.leftCol.socialIcon.bg, border: S.leftCol.socialIcon.border, borderRadius: S.leftCol.socialIcon.radius, margin: S.leftCol.socialIcon.margin }} />
              <span className="inline-block" style={{ width: S.leftCol.socialIcon.size, height: S.leftCol.socialIcon.size, background: S.leftCol.socialIcon.bg, border: S.leftCol.socialIcon.border, borderRadius: S.leftCol.socialIcon.radius, margin: S.leftCol.socialIcon.margin }} />
              <span className="inline-block" style={{ width: S.leftCol.socialIcon.size, height: S.leftCol.socialIcon.size, background: S.leftCol.socialIcon.bg, border: S.leftCol.socialIcon.border, borderRadius: S.leftCol.socialIcon.radius, margin: S.leftCol.socialIcon.margin }} />
            </div>
          </div>
        </div>
        {/* Main Form Area */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 md:py-0" style={{ background: S.rightCol.background }}>
          <div className="w-full mx-auto" style={{ maxWidth: S.rightCol.maxWidth, padding: S.rightCol.padding, borderRadius: S.rightCol.borderRadius, boxShadow: S.rightCol.boxShadow }}>
            <h1 className="font-bold mb-8 text-center" style={{ ...S.header }}>
              Tell us a little more about yourself and we’ll get the ball rolling.
            </h1>
            {children}
            {/* Dot-based Progress Tracker */}
            <div className="flex justify-center items-center" style={{ gap: S.progress.spacing, marginTop: S.progress.marginTop }}>
              {[...Array(totalSteps)].map((_, i) => (
                <span
                  key={i}
                  className={`transition-all duration-200 ${i === step ? 'scale-110 shadow-lg' : ''}`}
                  style={{ width: S.progress.size, height: S.progress.size, borderRadius: '50%', background: i === step ? S.progress.dotActive : S.progress.dotInactive }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SignupContext.Provider>
  );
}

export function useSignup() {
  return useContext(SignupContext);
} 