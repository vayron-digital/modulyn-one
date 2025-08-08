import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { DESIGN } from '../../lib/design';

interface LoginProps {
  logoutReason?: string | null;
}

export default function Login({ logoutReason }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const S = DESIGN.loginPage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: S.background }}>
      {/* Main Form Area (left, bold bg) */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 md:py-0 order-1 md:order-none" style={{ background: S.rightCol.background }}>
        <div className="w-full mx-auto" style={{ maxWidth: S.rightCol.maxWidth, padding: S.rightCol.padding, borderRadius: S.rightCol.borderRadius, boxShadow: S.rightCol.boxShadow, background: S.rightCol.background }}>
          <h1 className="text-hero font-black tracking-tighter mb-8 text-center" style={{ color: S.header.color }}>{'Welcome back to Modulyn One'}</h1>
          {logoutReason && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded-md text-xs sm:text-sm mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-yellow-700">{logoutReason}</p>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-md text-xs sm:text-sm mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm" style={{ color: S.error.color }}>{error}</p>
                </div>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div>
                <label htmlFor="email-address" className="text-label font-semibold tracking-wide mb-2" style={S.label}>
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full focus:outline-none focus:ring-0 transition"
                  style={S.input}
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="text-label font-semibold tracking-wide mb-2" style={S.label}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full focus:outline-none focus:ring-0 transition pr-10"
                  style={S.input}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-9 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <Link to="/forgot-password" className="font-medium" style={{ color: S.button.background }}>
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-text font-bold shadow-lg transition hover:opacity-90"
              style={S.button}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <div className="text-center mt-4">
              <span className="text-body font-medium" style={{ color: S.button.background }}>Don't have an account? </span>
              <Link to="/signup" className="text-body font-bold underline hover:text-white transition tracking-wide" style={{ color: S.button.background }}>Sign up</Link>
            </div>
          </form>
        </div>
      </div>
      {/* Branding/Contact (right, light bg) */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 order-2 md:order-none" style={{ background: S.leftCol.background }}>
        <div>
          <img src="/logoBW.png" alt="Modulyn One" style={{ height: S.leftCol.logoHeight, width: S.leftCol.logoWidth }} />
          <h2 className="text-headline font-bold tracking-tight mt-6" style={{ color: S.leftCol.brandColor }}>Modulyn One</h2>
          <p className="text-body font-medium mt-2" style={{ color: S.leftCol.textColor }}>The modular CRM for modern teams</p>
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
    </div>
  );
} 