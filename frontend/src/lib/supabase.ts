import { createClient } from '@supabase/supabase-js';

// Type declaration for import.meta.env
interface ImportMetaEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Get environment variables
const supabaseUrl = 'https://faaiwdffhwpfltzertki.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWl3ZGZmaHdwZmx0emVydGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Mzg0NzksImV4cCI6MjA2ODAxNDQ3OX0.Anu2HgO46lL4YBnrnAq0OSIzOa0-U5WECpIy7nEgMz8';

// Create Supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Log connection status
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', event);
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Session token refreshed');
  }
}); 