import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-red-500'
  });

  // Check for access token in URL (from email link)
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const [isValidResetLink, setIsValidResetLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);

  useEffect(() => {
    const validateResetLink = async () => {
      console.log('Validating reset link with tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      
      if (accessToken && refreshToken) {
        try {
          // Set the session temporarily to validate the reset link
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Session validation error:', error);
            setError('Invalid or expired reset link. Please request a new one.');
            setIsValidResetLink(false);
          } else {
            console.log('Reset link validated successfully');
            setIsValidResetLink(true);
            // Immediately sign out to prevent auto-login
            await supabase.auth.signOut();
            console.log('Signed out after validation');
          }
        } catch (error) {
          console.error('Validation error:', error);
          setError('Invalid or expired reset link. Please request a new one.');
          setIsValidResetLink(false);
        }
      } else {
        console.log('No tokens found in URL');
        setError('Invalid reset link. Please request a new password reset.');
        setIsValidResetLink(false);
      }
      setIsCheckingLink(false);
    };

    validateResetLink();
  }, [accessToken, refreshToken]);

  const validatePassword = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one uppercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one special character');
    }

    let color = 'text-red-500';
    if (score >= 4) color = 'text-green-500';
    else if (score >= 3) color = 'text-yellow-500';
    else if (score >= 2) color = 'text-orange-500';

    return { score, feedback, color };
  };

  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: 'text-red-500' });
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!password.trim()) {
      setError('Please enter a new password');
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // First, set the session with the reset tokens
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          throw new Error('Invalid or expired reset link. Please request a new one.');
        }

        // Now update the password
        const { error } = await supabase.auth.updateUser({
          password: password
        });

        if (error) {
          console.error('Error updating password:', error);
          throw new Error(error.message || 'Failed to update password');
        }

        // Sign out after successful password update
        await supabase.auth.signOut();

        setSuccess(true);
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password has been reset successfully. Please log in with your new password.' }
          });
        }, 3000);
      } else {
        throw new Error('Invalid reset link. Please request a new password reset.');
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking reset link
  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Validating reset link...
              </h2>
              <p className="text-slate-600">
                Please wait while we verify your password reset link.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Password updated successfully!
              </h2>
              <p className="text-slate-600 mb-6">
                Your password has been reset. You'll be redirected to the login page shortly.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Go to login now
              </Link>

              <div className="text-sm text-slate-500">
                Redirecting in 3 seconds...
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-blue-600">Modulyn</h1>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Set new password
          </h2>
          <p className="text-slate-600">
            Please enter your new password below.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
                  placeholder="Enter your new password"
                  disabled={loading || !isValidResetLink}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${passwordStrength.color}`} />
                  <span className={`text-sm font-medium ${passwordStrength.color}`}>
                    Password Strength: {passwordStrength.score}/5
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 4 ? 'bg-green-500' :
                      passwordStrength.score >= 3 ? 'bg-yellow-500' :
                      passwordStrength.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-slate-600 space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="text-red-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
                  placeholder="Confirm your new password"
                  disabled={loading || !isValidResetLink}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 text-sm ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {password === confirmPassword ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Invalid Link Error */}
            {!isValidResetLink && !isCheckingLink && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-red-800">Invalid Reset Link</h3>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  The password reset link is invalid or has expired. Please request a new password reset.
                </p>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Request new password reset
                </Link>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || passwordStrength.score < 3 || password !== confirmPassword || !isValidResetLink}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg"
        >
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Security Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a strong, unique password</li>
            <li>• Don't reuse passwords from other accounts</li>
            <li>• Consider using a password manager</li>
            <li>• Enable two-factor authentication if available</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword; 