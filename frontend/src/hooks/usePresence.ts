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
    if (!user) return;

    const updatePresence = async () => {
      try {
        const { error } = await supabase
          .from('presence')
          .upsert({
            user_id: user.id,
            last_seen: new Date().toISOString(),
            is_online: true
          });

        if (error) throw error;
        setIsOnline(true);
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    const interval = setInterval(updatePresence, 30000); // Update every 30 seconds
    updatePresence(); // Initial update

    return () => {
      clearInterval(interval);
      // Set user as offline when component unmounts
      if (user) {
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
  }, [user]);

  return { isOnline, lastSeen };
} 