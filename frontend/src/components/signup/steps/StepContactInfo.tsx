import React from 'react';
import { useSignup } from '../SignupStepper';
import { DESIGN } from '../../../lib/design';

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
      <div>
        <label className="block font-semibold mb-2" style={S.label}>Phone <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          value={data.phone}
          onChange={e => setField('phone', e.target.value)}
          className="w-full focus:outline-none focus:ring-0 transition"
          style={S.input}
          placeholder="+1 (555) 000-0000"
          type="tel"
          autoComplete="tel"
        />
      </div>
    </div>
  );
} 