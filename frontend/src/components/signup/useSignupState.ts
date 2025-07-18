import { useReducer } from 'react';
import { supabase } from '../../lib/supabase';

type SignupData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  companyIndustry: string;
  companySize: string;
};

type State = {
  step: number;
  data: SignupData;
  errors: Record<string, string>;
  loading: boolean;
  submitted: boolean;
};

const initialState: State = {
  step: 0,
  data: {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyIndustry: '',
    companySize: '',
  },
  errors: {},
  loading: false,
  submitted: false,
};

function validateStep(step: number, data: SignupData) {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!data.fullName) errors.fullName = 'Full name is required';
  }
  if (step === 1) {
    if (!data.email) errors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.email = 'Invalid email';
    // phone is optional
  }
  if (step === 2) {
    if (!data.password) errors.password = 'Password is required';
    if (!data.confirmPassword) errors.confirmPassword = 'Confirm your password';
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (data.password && data.password.length < 8) errors.password = 'Password must be at least 8 characters';
  }
  if (step === 3) {
    if (!data.companyName) errors.companyName = 'Company name is required';
    // companyIndustry is optional (could be required if you want)
    // companySize is optional
  }
  return errors;
}

function validateAll(data: SignupData) {
  let errors: Record<string, string> = {};
  for (let i = 0; i < 4; i++) {
    errors = { ...errors, ...validateStep(i, data) };
  }
  return errors;
}

function reducer(state: State, action: any): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, data: { ...state.data, [action.field]: action.value }, errors: { ...state.errors, [action.field]: undefined } };
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1, errors: {} };
    case 'PREV_STEP':
      return { ...state, step: state.step - 1, errors: {} };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_SUBMITTED':
      return { ...state, submitted: true, loading: false };
    default:
      return state;
  }
}

export function useSignupState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, data, errors, loading, submitted } = state;
  const isFirstStep = step === 0;
  const isLastStep = step === 3;
  const canPrev = !isFirstStep;
  const canNext = Object.keys(validateStep(step, data)).length === 0;

  function setField(field: keyof SignupData, value: string) {
    dispatch({ type: 'SET_FIELD', field, value });
  }

  function nextStep() {
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors: stepErrors });
      return;
    }
    dispatch({ type: 'NEXT_STEP' });
  }

  function prevStep() {
    if (!isFirstStep) dispatch({ type: 'PREV_STEP' });
  }

  async function validateStepAndSubmit() {
    const allErrors = validateAll(data);
    if (Object.keys(allErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors: allErrors });
      return false;
    }
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      // 1. Sign up user with Supabase Auth
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
        },
      });
      if (signUpError) {
        dispatch({ type: 'SET_ERRORS', errors: { email: signUpError.message } });
        dispatch({ type: 'SET_LOADING', loading: false });
        return false;
      }
      const userId = userData?.user?.id;
      if (!userId) {
        dispatch({ type: 'SET_ERRORS', errors: { email: 'Signup failed. Please try again.' } });
        dispatch({ type: 'SET_LOADING', loading: false });
        return false;
      }
      // 2. Create tenant
      const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const now = new Date();
      const addDays = (date: Date, days: number) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
      };
      const { data: tenantData, error: tenantError } = await supabase.from('tenants').insert([
        {
          name: data.companyName,
          slug: slugify(data.companyName),
          theme_color: '#6C2EBE',
          feature_flags: {
            cold_calls: true,
            chat: true,
            documents: false,
          },
          trial_start: now.toISOString(),
          trial_ends: addDays(now, 14).toISOString(),
          industry: data.companyIndustry,
          size: data.companySize,
        },
      ]).select().single();
      if (tenantError || !tenantData) {
        dispatch({ type: 'SET_ERRORS', errors: { companyName: tenantError?.message || 'Could not create tenant.' } });
        dispatch({ type: 'SET_LOADING', loading: false });
        return false;
      }
      // 3. Link user to tenant (update profiles or users table)
      const { error: profileError } = await supabase.from('profiles').update({
        tenant_id: tenantData.id,
        is_admin: true,
      }).eq('id', userId);
      if (profileError) {
        dispatch({ type: 'SET_ERRORS', errors: { fullName: profileError.message } });
        dispatch({ type: 'SET_LOADING', loading: false });
        return false;
      }
      dispatch({ type: 'SET_SUBMITTED' });
      return true;
    } catch (err: any) {
      dispatch({ type: 'SET_ERRORS', errors: { email: err.message || 'Signup failed.' } });
      dispatch({ type: 'SET_LOADING', loading: false });
      return false;
    }
  }

  return {
    step,
    data,
    errors,
    loading,
    submitted,
    setField,
    nextStep,
    prevStep,
    canNext,
    canPrev,
    isFirstStep,
    isLastStep,
    validateStep: validateStepAndSubmit,
  };
} 