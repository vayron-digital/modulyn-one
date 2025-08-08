import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthContextType } from '../types/auth';
import { useCurrencyStore } from '../utils/currency';
import { authApi } from '../lib/api';

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log('AuthProvider user:', user, 'loading:', loading, 'error:', error);
  const setCurrency = useCurrencyStore(state => state.setCurrency);
  const setSecondaryCurrencies = useCurrencyStore(state => state.setSecondaryCurrencies);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      console.log('Initializing auth...');
      try {
        // Check active sessions and sets the user (Supabase)
        let session;
        try {
          const { data } = await supabase.auth.getSession();
          session = data.session;
          console.log('Supabase session:', session);
        } catch (err) {
          console.error('Error getting Supabase session:', err);
        }
        if (!mounted) return;

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          console.log('Supabase profile:', profile, 'profileError:', profileError);

          if (profileError) throw profileError;

          setUser({
            id: session.user.id,
            email: session.user.email!,
            is_admin: profile.is_admin,
            is_active: profile.is_active,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            full_name: profile.full_name,
            role: profile.role
          });
        } else {
          // --- Backend token fallback for admin login ---
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const response = await authApi.getCurrentUser();
              const user = response.data.data.user || response.data.data;
              setUser({
                id: user.id,
                email: user.email,
                is_admin: user.is_admin ?? true,
                is_active: true,
                created_at: user.created_at ?? '',
                updated_at: user.updated_at ?? '',
                full_name: user.full_name ?? 'Admin User',
                role: user.role ?? 'admin',
                profile_image_url: user.profile_image_url ?? undefined,
              });
            } catch (err) {
              // Token invalid or expired, clear it
              localStorage.removeItem('token');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;

          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) throw profileError;

            setUser({
              id: session.user.id,
              email: session.user.email!,
              is_admin: profile.is_admin,
              is_active: profile.is_active,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              full_name: profile.full_name,
              role: profile.role
            });
          } else {
            setUser(null);
          }
        });
        
        authSubscription = subscription;
        console.log('Auth initialized');
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error as string);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const fetchUserSettings = async () => {
      try {
        const { data: userSettings, error } = await supabase
          .from('user_settings')
          .select('currency, secondary_currencies')
          .eq('user_id', user.id)
          .single();
        
        if (!mounted) return;
        
        if (!error && userSettings) {
          if (userSettings.currency) setCurrency(userSettings.currency);
          if (userSettings.secondary_currencies) setSecondaryCurrencies(userSettings.secondary_currencies);
        } else {
          // Set defaults if no settings found
          setCurrency('AED');
          setSecondaryCurrencies(['USD', 'GBP', 'EUR']);
        }
      } catch (error) {
        if (!mounted) return;
        console.warn('Error loading user settings:', error);
        // Set defaults on error
        setCurrency('AED');
        setSecondaryCurrencies(['USD', 'GBP', 'EUR']);
      }
    };

    fetchUserSettings();

    return () => {
      mounted = false;
    };
  }, [user?.id, setCurrency, setSecondaryCurrencies]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      // --- Dual login logic ---
      if (email === 'admin@123.com' && password === '123') {
        // Use backend API for hardcoded admin
        const response = await authApi.login({ email, password });
        const { user, token } = response.data.data.token
          ? { user: response.data.data.user, token: response.data.data.token }
          : { user: response.data.data.user, token: response.data.data.user.access_token };
        // Normalize user object for context
        setUser({
          id: user.id,
          email: user.email,
          is_admin: user.is_admin ?? true,
          is_active: true,
          created_at: user.created_at ?? '',
          updated_at: user.updated_at ?? '',
          full_name: user.full_name ?? 'Admin User',
          role: user.role ?? 'admin',
          profile_image_url: user.profile_image_url ?? undefined,
        });
        if (token) localStorage.setItem('token', token);
        return;
      }
      // --- Default: Supabase login ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      // If no profile exists, create one
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: data.user.email?.split('@')[0] || 'New User',
              email: data.user.email,
              is_admin: false,
              is_active: true
            }
          ]);
        if (insertError) throw insertError;
      }
    } catch (error) {
      setError(error as string);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: data.user.email?.split('@')[0] || 'New User',
              email: data.user.email,
              is_admin: false,
              is_active: true
            }
          ]);

        if (profileError) throw profileError;
      }
    } catch (error) {
      setError(error as string);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      setError(error as string);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      
      // The redirect will happen automatically
      return data;
    } catch (error) {
      setError(error as string);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthUser = async (user: any) => {
    try {
      // Check if user has a complete profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If no profile exists, create a basic one
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
              email: user.email,
              is_admin: false,
              is_active: true,
              profile_image_url: user.user_metadata?.avatar_url || null,
              oauth_provider: 'google',
              oauth_id: user.user_metadata?.sub || null,
            }
          ]);
        
        if (insertError) throw insertError;
        
        // Return user with incomplete profile flag
        return {
          ...user,
          hasCompleteProfile: false,
          needsAccountSetup: true
        };
      }

      // Check if profile is complete (has tenant_id and other required fields)
      const hasCompleteProfile = profile.tenant_id && profile.full_name && profile.email;
      
      return {
        ...user,
        hasCompleteProfile,
        needsAccountSetup: !hasCompleteProfile
      };
    } catch (error) {
      console.error('Error handling OAuth user:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    register,
    logout,
    signOut,
    signInWithGoogle,
    handleOAuthUser,
  }), [user, loading, error, login, register, logout, signOut, signInWithGoogle, handleOAuthUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 