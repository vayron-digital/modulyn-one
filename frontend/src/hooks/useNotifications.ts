import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  notification_type: 'task_assigned' | 'task_updated' | 'task_due_soon' | 'task_overdue' | 'task_commented' | 'task_status_changed' | 'task_priority_changed';
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  related_to_type?: 'task' | 'lead' | 'property' | 'document';
  related_to_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  read_at?: string;
  archived_at?: string;
  user_id: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => n.status === 'unread').length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId
      });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'read', read_at: new Date().toISOString() }
            : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
      toast({
        title: 'Success',
        description: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const archive = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase.rpc('archive_notification', {
        p_notification_id: notificationId
      });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'archived', archived_at: new Date().toISOString() }
            : n
        )
      );

      if (notifications.find(n => n.id === notificationId)?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast({
        title: 'Success',
        description: 'Notification archived'
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive notification',
        variant: 'destructive'
      });
    }
  }, [notifications, toast]);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications
        .filter(n => n.status === 'unread')
        .map(n => n.id);

      await Promise.all(unreadIds.map(id => markAsRead(id)));
      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    }
  }, [notifications, markAsRead, toast]);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        payload => {
          const newNotification = payload.new as Notification;
          if (!user || newNotification.user_id !== user.id) return; // Only notify the intended user
          setNotifications(prev => [newNotification, ...prev]);
          if (newNotification.status === 'unread') {
            setUnreadCount(prev => prev + 1);
            toast({
              title: newNotification.title,
              description: newNotification.message
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, toast, user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    archive,
    markAllAsRead,
    refresh: fetchNotifications
  };
}; 