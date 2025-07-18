import { supabase } from '@/lib/supabase';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

export const taskService = {
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;

    // Create notification for task assignment
    await supabase.rpc('create_notification', {
      p_user_id: task.assigned_to,
      p_type: 'task_assigned',
      p_title: 'New Task Assigned',
      p_message: `You have been assigned to "${task.title}"`,
      p_related_to_type: 'task',
      p_related_to_id: data.id,
      p_metadata: { task_id: data.id }
    });

    return data;
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const { data: oldTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create notifications for significant changes
    if (updates.status && updates.status !== oldTask.status) {
      await supabase.rpc('create_notification', {
        p_user_id: data.assigned_to,
        p_type: 'task_status_changed',
        p_title: 'Task Status Updated',
        p_message: `Task "${data.title}" status changed to ${updates.status}`,
        p_related_to_type: 'task',
        p_related_to_id: data.id,
        p_metadata: { task_id: data.id, old_status: oldTask.status, new_status: updates.status }
      });
    }

    if (updates.priority && updates.priority !== oldTask.priority) {
      await supabase.rpc('create_notification', {
        p_user_id: data.assigned_to,
        p_type: 'task_priority_changed',
        p_title: 'Task Priority Updated',
        p_message: `Task "${data.title}" priority changed to ${updates.priority}`,
        p_related_to_type: 'task',
        p_related_to_id: data.id,
        p_metadata: { task_id: data.id, old_priority: oldTask.priority, new_priority: updates.priority }
      });
    }

    return data;
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTasks(filters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigned_to?: string;
  }) {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  },

  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  },

  async addComment(taskId: string, userId: string, content: string) {
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('task_comments')
      .insert([
        {
          task_id: taskId,
          user_id: userId,
          content
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Create notification for new comment
    if (task.assigned_to !== userId) {
      await supabase.rpc('create_notification', {
        p_user_id: task.assigned_to,
        p_type: 'task_commented',
        p_title: 'New Comment',
        p_message: `New comment on task "${task.title}"`,
        p_related_to_type: 'task',
        p_related_to_id: taskId,
        p_metadata: { task_id: taskId, comment_id: data.id }
      });
    }

    return data;
  },

  async getComments(taskId: string) {
    const { data, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data;
  }
}; 