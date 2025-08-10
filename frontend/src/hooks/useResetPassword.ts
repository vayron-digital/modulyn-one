import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { validatePassword, validatePasswordMatch, PasswordStrength } from '../utils/passwordValidation';

interface ResetPasswordState {
  loading: boolean;
  error: string | null;
  success: boolean;
  passwordStrength: PasswordStrength;
  passwordMatch: boolean;
}

interface ResetPasswordActions {
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string, confirmPassword: string) => Promise<void>;
  resendEmail: (email: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useResetPassword = (): ResetPasswordState & ResetPasswordActions => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<ResetPasswordState>({
    loading: false,
    error: null,
    success: false,
    passwordStrength: { score: 0, feedback: [], color: 'text-red-500', isValid: false },
    passwordMatch: false
  });

  // Check for access token in URL (from email link)
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  // Note: We don't automatically set the session here to prevent auto-login
  // The session will be set temporarily during password update in the component

  const resetPassword = async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message || 'Failed to send password reset email');
      }

      setState(prev => ({ ...prev, success: true, loading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'An unexpected error occurred. Please try again.',
        loading: false 
      }));
    }
  };

  const updatePassword = async (password: string, confirmPassword: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Validate password strength
      const strength = validatePassword(password);
      if (!strength.isValid) {
        throw new Error('Please choose a stronger password');
      }

      // Validate password match
      if (!validatePasswordMatch(password, confirmPassword)) {
        throw new Error('Passwords do not match');
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw new Error(error.message || 'Failed to update password');
      }

      setState(prev => ({ ...prev, success: true, loading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'An unexpected error occurred. Please try again.',
        loading: false 
      }));
    }
  };

  const resendEmail = async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message || 'Failed to resend email');
      }

      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to resend email. Please try again.',
        loading: false 
      }));
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  const clearSuccess = (): void => {
    setState(prev => ({ ...prev, success: false }));
  };

  // Update password strength when password changes
  const updatePasswordStrength = (password: string): void => {
    const strength = validatePassword(password);
    setState(prev => ({ ...prev, passwordStrength: strength }));
  };

  // Update password match when confirm password changes
  const updatePasswordMatch = (password: string, confirmPassword: string): void => {
    const match = validatePasswordMatch(password, confirmPassword);
    setState(prev => ({ ...prev, passwordMatch: match }));
  };

  return {
    ...state,
    resetPassword,
    updatePassword,
    resendEmail,
    clearError,
    clearSuccess,
    updatePasswordStrength,
    updatePasswordMatch
  };
};
