import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type ActivityType = 'lead' | 'property' | 'task' | 'document';

interface ActivityMetadata {
  [key: string]: any;
}

export const useActivityLog = () => {
  const logActivity = useCallback(async (
    type: ActivityType,
    action: string,
    description: string,
    metadata: ActivityMetadata = {}
  ) => {
    try {
      const { error } = await supabase.rpc('log_activity', {
        p_type: type,
        p_action: action,
        p_description: description,
        p_metadata: metadata
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, []);

  return { logActivity };
}; 