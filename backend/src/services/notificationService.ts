import { supabase } from '../lib/supabase';

export class NotificationService {
  private static instance: NotificationService;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCheckingReminders();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private startCheckingReminders() {
    // Check every minute for reminders
    this.checkInterval = setInterval(async () => {
      await this.checkReminders();
    }, 60000);
  }

  private async checkReminders() {
    try {
      const now = new Date().toISOString();

      // Find notifications that need to be reminded
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .lt('remind_later', now)
        .eq('is_dismissed', true);

      if (error) throw error;

      // Create new notifications for each reminder
      for (const notification of notifications || []) {
        let type = 'task_reminder';
        let message = `Reminder: ${notification.message}`;
        let insertData: any = {
          user_id: notification.user_id,
          is_dismissed: false,
          remind_later: null,
          message,
        };
        if (notification.task_id) {
          insertData.task_id = notification.task_id;
          insertData.type = 'task_reminder';
        } else if (notification.lead_id) {
          insertData.lead_id = notification.lead_id;
          insertData.type = notification.type === 'lead_followup' ? 'lead_followup' : 'lead_updated';
          insertData.message = notification.type === 'lead_followup'
            ? `Follow-up Reminder: ${notification.message}`
            : `Lead Updated: ${notification.message}`;
        } else if (notification.event_id) {
          insertData.event_id = notification.event_id;
          insertData.type = 'event_reminder';
          insertData.message = `Event Reminder: ${notification.message}`;
        }
        // Add metadata if present
        if (notification.metadata) {
          insertData.metadata = notification.metadata;
        }
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(insertData);

        if (insertError) {
          console.error('Error creating reminder notification:', insertError);
          continue;
        }

        // Delete the old notification
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notification.id);

        if (deleteError) {
          console.error('Error deleting old notification:', deleteError);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  public stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public static async createNotification({
    userId,
    notificationType,
    title,
    message,
    relatedToType = null,
    relatedToId = null,
    metadata = {}
  }: {
    userId: string,
    notificationType: string,
    title: string,
    message: string,
    relatedToType?: string | null,
    relatedToId?: string | null,
    metadata?: any
  }) {
    const { error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_notification_type: notificationType,
      p_title: title,
      p_message: message,
      p_related_to_type: relatedToType,
      p_related_to_id: relatedToId,
      p_metadata: metadata
    });
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
} 