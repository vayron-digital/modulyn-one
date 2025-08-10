import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Alert, AlertDescription } from '../../ui/alert';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Key
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { validatePassword, validatePasswordMatch, PasswordStrength } from '../../utils/passwordValidation';

interface PasswordChangeProps {
  onSuccess?: () => void;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-red-500',
    isValid: false
  });

  // Update password strength when new password changes
  React.useEffect(() => {
    if (newPassword) {
      setPasswordStrength(validatePassword(newPassword));
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: 'text-red-500', isValid: false });
    }
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate current password
    if (!currentPassword.trim()) {
      setError('Please enter your current password');
      setLoading(false);
      return;
    }

    // Validate new password
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      setLoading(false);
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (!validatePasswordMatch(newPassword, confirmPassword)) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password');
      setLoading(false);
      return;
    }

    try {
      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update password');
      }

      // Success
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength({ score: 0, feedback: [], color: 'text-red-500', isValid: false });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    setPasswordStrength({ score: 0, feedback: [], color: 'text-red-500', isValid: false });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure. Make sure to use a strong, unique password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Enter your current password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={loading}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Enter your new password"
                  disabled={loading}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={loading}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
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

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Confirm your new password"
                  disabled={loading}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 text-sm ${
                  validatePasswordMatch(newPassword, confirmPassword) ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {validatePasswordMatch(newPassword, confirmPassword) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {validatePasswordMatch(newPassword, confirmPassword) ? 'Passwords match' : 'Passwords do not match'}
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password updated successfully! Your new password is now active.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword || !passwordStrength.isValid || !validatePasswordMatch(newPassword, confirmPassword)}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Password Security Tips
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
              <li>• Avoid using personal information like your name or birthdate</li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Consider using a password manager for better security</li>
            </ul>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              Forgot your password?{' '}
              <a 
                href="/forgot-password" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Reset it here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PasswordChange;
