import { supabase } from '../index';

export class ChatService {
  // Create a new chat thread
  static async createThread(participants: string[]): Promise<any> {
    // TODO: Use normalized participants table for scale
    const { data, error } = await supabase
      .from('chat_threads')
      .insert([{ participants: participants.join(',') }])
      .select();
    if (error) throw error;
    return data[0];
  }

  // Fetch threads for a user
  static async getThreadsForUser(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('chat_threads')
      .select('*')
      .ilike('participants', `%${userId}%`);
    if (error) throw error;
    return data;
  }

  // Send a message in a thread
  static async sendMessage(threadId: number, senderId: string, content: string, type = 'text'): Promise<any> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ thread_id: threadId, sender_id: senderId, content, type }])
      .select();
    if (error) throw error;
    return data[0];
  }

  // Fetch messages for a thread
  static async getMessages(threadId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  // Upload an attachment (placeholder, expects file_url)
  static async addAttachment(messageId: number, fileUrl: string, fileType: string, meta: any = {}): Promise<any> {
    const { data, error } = await supabase
      .from('chat_attachments')
      .insert([{ message_id: messageId, file_url: fileUrl, file_type: fileType, meta }])
      .select();
    if (error) throw error;
    return data[0];
  }

  // Share a CRM entity (lead, event, etc.)
  static async shareEntity(messageId: number, entityType: string, entityId: string, action: string, meta: any = {}): Promise<any> {
    const { data, error } = await supabase
      .from('chat_shared_entities')
      .insert([{ message_id: messageId, entity_type: entityType, entity_id: entityId, action, meta }])
      .select();
    if (error) throw error;
    return data[0];
  }
} 