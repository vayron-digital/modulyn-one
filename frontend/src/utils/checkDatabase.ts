import { supabase } from '../lib/supabase';

export async function checkDatabaseStructure() {
  try {
    console.log('Checking database structure...');
    
    // First verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication check failed:', authError);
      return {
        success: false,
        error: 'Authentication error: ' + authError.message,
        details: {
          auth: authError
        }
      };
    }
    
    if (!user) {
      return {
        success: false,
        error: 'No authenticated user found',
        details: {
          auth: 'No user'
        }
      };
    }

    console.log('Authenticated as user:', user.id);
    
    // Check if we can access the profiles table
    const { data: profilesCheck, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Profiles table check failed:', profilesError);
      return {
        success: false,
        error: 'Failed to access profiles table: ' + profilesError.message,
        details: {
          profiles: profilesError
        }
      };
    }

    console.log('Successfully accessed profiles table');
    
    // Check if the current user has a profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userProfileError) {
      console.error('User profile check failed:', userProfileError);
    }

    // If user doesn't have a profile, create one
    if (!userProfile) {
      console.log('Creating profile for user:', user.id);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            full_name: user.email?.split('@')[0] || 'New User'
          }
        ]);
      
      if (insertError) {
        console.error('Profile creation failed:', insertError);
        return {
          success: false,
          error: 'Failed to create user profile: ' + insertError.message,
          details: {
            insert: insertError
          }
        };
      }
      console.log('Successfully created user profile');
    }
    
    return {
      success: true,
      details: {
        profilesAccessible: true,
        userProfile: userProfile || 'Created',
        userId: user.id
      }
    };
  } catch (error: any) {
    console.error('Database structure check failed:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
} 