import React from 'react';
import { useSignup } from '../SignupStepper';
import { DESIGN } from '../../../lib/design';

export default function StepPersonalInfo() {
  const { data, setField, errors } = useSignup();
  const S = DESIGN.signupPage;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <label className="block font-semibold mb-2" style={S.label}>Full Name</label>
        <input
          value={data.fullName}
          onChange={e => setField('fullName', e.target.value)}
          className="w-full focus:outline-none focus:ring-0 transition"
          style={S.input}
          placeholder="Your name"
        />
        {errors.fullName && <div style={S.error}>{errors.fullName}</div>}
      </div>
    </div>
  );
} 