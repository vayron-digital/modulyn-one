import React from 'react';
import { useSignup } from '../SignupStepper';
import { DESIGN } from '../../../lib/design';

const industries = [
  '',
  'Technology',
  'Real Estate',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Other',
];

export default function StepCompanyInfo() {
  const { data, setField, errors } = useSignup();
  const S = DESIGN.signupPage;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <label className="block font-semibold mb-2" style={S.label}>Company Name</label>
        <input
          value={data.companyName}
          onChange={e => setField('companyName', e.target.value)}
          className="w-full focus:outline-none focus:ring-0 transition"
          style={S.input}
          placeholder="Your company name"
        />
        {errors.companyName && <div style={S.error}>{errors.companyName}</div>}
      </div>
      <div>
        <label className="block font-semibold mb-2" style={S.label}>Industry</label>
        <select
          value={data.companyIndustry}
          onChange={e => setField('companyIndustry', e.target.value)}
          className="w-full focus:outline-none focus:ring-0 transition"
          style={S.input}
        >
          {industries.map((ind) => (
            <option key={ind} value={ind}>{ind || 'Select industry'}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-2" style={S.label}>Company Size <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          value={data.companySize}
          onChange={e => setField('companySize', e.target.value)}
          className="w-full focus:outline-none focus:ring-0 transition"
          style={S.input}
          placeholder="e.g. 1-10, 11-50, 51-200, ..."
        />
      </div>
    </div>
  );
} 