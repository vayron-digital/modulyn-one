import React from 'react';
import { useSignup } from '../SignupStepper';
import { DESIGN } from '../../../lib/design';

export default function StepSecurity() {
  const { data, setField, errors } = useSignup();
  const S = DESIGN.signupPage;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <label className="block font-semibold mb-2" style={S.label}>Password</label>
        <input
          value={data.password}
          onChange={e => setField('password', e.target.value)}
          className="w-full focus:outline-none focus:ring-0 transition"
          style={S.input}
          placeholder="Create a password"
          type="password"
          autoComplete="new-password"
        />
        {errors.password && <div style={S.error}>{errors.password}</div>}
      </div>
      <div>
        <label className="block font-semibold mb-2" style={S.label}>Confirm Password</label>
        <input
          value={data.confirmPassword}
          onChange={e => setField('confirmPassword', e.target.value)}
          className="w-full focus:outline-none focus:ring-0 transition"
          style={S.input}
          placeholder="Re-enter your password"
          type="password"
          autoComplete="new-password"
        />
        {errors.confirmPassword && <div style={S.error}>{errors.confirmPassword}</div>}
      </div>
    </div>
  );
} 