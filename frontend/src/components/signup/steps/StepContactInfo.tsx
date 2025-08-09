import React from 'react';
import { useSignup } from '../SignupStepper';
import { DESIGN } from '../../../lib/design';
import { PhoneInput } from '../../ui/PhoneInput';

export default function StepContactInfo() {
  const { data, setField, errors } = useSignup();
  const S = DESIGN.signupPage;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <label className="block font-semibold mb-2" style={S.label}>Email</label>
        <input
          value={data.email}
          onChange={e => setField('email', e.target.value)}
          className="w-full focus:outline-none focus:ring-0 transition"
          style={S.input}
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
        />
        {errors.email && <div style={S.error}>{errors.email}</div>}
      </div>
      <div className="phone-input-container">
        <PhoneInput
          value={data.phone || ''}
          onChange={(phone, fullNumber, countryCode) => {
            setField('phone', phone);
            setField('fullPhoneNumber', fullNumber);
            setField('phoneCountryCode', countryCode);
          }}
          className="signup-phone-input"
        />
        <style>{`
          .signup-phone-input label {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: ${S.label.color};
          }
          .signup-phone-input input {
            background: ${S.input.background};
            border: ${S.input.border};
            border-radius: ${S.input.borderRadius};
            padding: ${S.input.padding};
            font-size: ${S.input.fontSize};
          }
        `}</style>
      </div>
    </div>
  );
} 