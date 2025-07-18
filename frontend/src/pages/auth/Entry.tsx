import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DESIGN } from '../../lib/design';

export default function Entry() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white" style={{ background: DESIGN.colors.background }}>
      <div className="text-center mb-10">
        <img src="/logo.png" alt="Modulyn One" style={{ height: DESIGN.logo.height, width: DESIGN.logo.width, margin: '0 auto' }} />
        <h1 className="mt-6 font-bold" style={{ fontSize: '2rem', color: DESIGN.colors.primary }}>Welcome to Modulyn One</h1>
        <p className="mt-2 text-gray-600" style={{ fontSize: DESIGN.fontSize.base }}>The modular CRM for modern teams</p>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <button
          className="w-full py-3 rounded font-semibold text-white shadow-lg transition hover:opacity-90"
          style={{ background: DESIGN.colors.primary, fontSize: DESIGN.fontSize.title, borderRadius: DESIGN.borderRadius }}
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
        <button
          className="w-full py-3 rounded font-semibold text-white shadow-lg border-2 border-solid transition hover:opacity-90"
          style={{ background: DESIGN.colors.accent, color: DESIGN.colors.primary, borderColor: DESIGN.colors.primary, fontSize: DESIGN.fontSize.title, borderRadius: DESIGN.borderRadius }}
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
} 