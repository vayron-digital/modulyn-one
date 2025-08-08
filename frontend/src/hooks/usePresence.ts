import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PresenceState {
  isOnline: boolean;
  lastSeen: string | null;
}

export function usePresence(): PresenceState {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const updatePresence = async () => {
      if (!mounted) return;
      
      try {
        const { error } = await supabase
          .from('presence')
          .upsert({
            user_id: user.id,
            last_seen: new Date().toISOString(),
            is_online: true
          });

        if (error) throw error;
        if (mounted) {
          setIsOnline(true);
        }
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    const interval = setInterval(updatePresence, 30000); // Update every 30 seconds
    updatePresence(); // Initial update

    return () => {
      mounted = false;
      clearInterval(interval);
      // Set user as offline when component unmounts
      if (user?.id) {
        supabase
          .from('presence')
          .upsert({
            user_id: user.id,
            last_seen: new Date().toISOString(),
            is_online: false
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error setting user offline:', error);
            }
          });
      }
    };
  }, [user?.id]);

  return { isOnline, lastSeen };
} 