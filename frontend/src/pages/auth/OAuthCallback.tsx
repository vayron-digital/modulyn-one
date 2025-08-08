import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { handleOAuthUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth callback - processing URL:', window.location.href);
        
        // Check if we have OAuth tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log('Found access token in URL, processing OAuth session...');
          
          // Set the session from the URL parameters
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || ''
          });
          
          if (error) {
            console.error('OAuth session error:', error);
            setError('Authentication failed. Please try again.');
            return;
          }

          if (session?.user) {
            console.log('OAuth user authenticated:', session.user.email);
            try {
              // Handle OAuth user
              const userData = await handleOAuthUser(session.user);
              console.log('handleOAuthUser completed, userData:', userData);
              
              if (userData?.needsAccountSetup) {
                console.log('User needs account setup, redirecting to preview...');
                navigate('/preview');
              } else {
                console.log('User profile complete, redirecting to dashboard...');
                navigate('/dashboard');
              }
            } catch (handleError) {
              console.error('Error in handleOAuthUser:', handleError);
              // Even if profile creation fails, still redirect to preview space
              // The auth context will handle creating the profile later
              console.log('Falling back to preview space despite profile creation error');
              navigate('/preview');
            }
          } else {
            console.log('No user in session, redirecting to login');
            navigate('/login');
          }
        } else {
          // No OAuth tokens, check if we already have a session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session check error:', error);
            setError('Authentication failed. Please try again.');
            return;
          }

          if (session?.user) {
            console.log('Existing session found, processing...');
            try {
              const userData = await handleOAuthUser(session.user);
              console.log('handleOAuthUser completed for existing session, userData:', userData);
              
              if (userData?.needsAccountSetup) {
                navigate('/preview');
              } else {
                navigate('/dashboard');
              }
            } catch (handleError) {
              console.error('Error in handleOAuthUser for existing session:', handleError);
              // Fallback to preview space
              navigate('/preview');
            }
          } else {
            console.log('No session found, redirecting to login');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        setError('Something went wrong. Please try again.');
      }
    };

    handleOAuthCallback();
  }, [navigate, handleOAuthUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Completing Sign In</h2>
        <p className="text-slate-600">Please wait while we set up your account...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
