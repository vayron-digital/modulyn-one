export interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  isValid: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  errors: string[];
}

export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('At least one lowercase letter');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('At least one uppercase letter');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('At least one number');
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('At least one special character');
  }

  // Determine color and validity
  let color = 'text-red-500';
  let isValid = false;

  if (score >= 4) {
    color = 'text-green-500';
    isValid = true;
  } else if (score >= 3) {
    color = 'text-yellow-500';
    isValid = true;
  } else if (score >= 2) {
    color = 'text-orange-500';
  }

  return { score, feedback, color, isValid };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const getPasswordStrengthText = (score: number): string => {
  if (score >= 4) return 'Strong';
  if (score >= 3) return 'Good';
  if (score >= 2) return 'Fair';
  return 'Weak';
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score >= 4) return 'bg-green-500';
  if (score >= 3) return 'bg-yellow-500';
  if (score >= 2) return 'bg-orange-500';
  return 'bg-red-500';
};

export const validatePasswordRequirements = (password: string): PasswordValidationResult => {
  const strength = validatePassword(password);
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: strength.isValid,
    strength,
    errors
  };
};
