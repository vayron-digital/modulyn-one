import { Router } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';
import { NotificationService } from '../services/notificationService';

const router = Router();

// Get all tasks
router.get('/', async (req, res, next) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to:users (*),
        project:projects (*),
        lead:leads (*)
      `)
      .order('due_date', { ascending: true });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single task
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to:users (*),
        project:projects (*),
        lead:leads (*),
        comments (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!task) throw new AppError('No task found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new task
router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      projectId,
      leadId,
      tags,
    } = req.body;

    if (!title || !description) {
      throw new AppError('Please provide required fields', 400);
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          description,
          status: status || 'todo',
          priority: priority || 'medium',
          due_date: dueDate,
          assigned_to: assignedTo,
          project_id: projectId,
          lead_id: leadId,
          tags,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    if (task && task.assigned_to) {
      await NotificationService.createNotification({
        userId: task.assigned_to,
        notificationType: 'task_assigned',
        title: 'Task Assigned',
        message: `A new task (${task.title}) has been assigned to you.`,
        relatedToType: 'task',
        relatedToId: task.id
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!task) throw new AppError('No task found with that ID', 404);

    if (task && task.assigned_to) {
      await NotificationService.createNotification({
        userId: task.assigned_to,
        notificationType: 'task_updated',
        title: 'Task Updated',
        message: `Task (${task.title}) has been updated.`,
        relatedToType: 'task',
        relatedToId: task.id
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Add comment to task
router.post('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, userId } = req.body;

    if (!content || !userId) {
      throw new AppError('Please provide content and user ID', 400);
    }

    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert([
        {
          task_id: id,
          content,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    if (comment && comment.user_id) {
      await NotificationService.createNotification({
        userId: comment.user_id,
        notificationType: 'task_commented',
        title: 'Task Commented',
        message: `A comment was added to your task.`,
        relatedToType: 'task',
        relatedToId: comment.task_id
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        comment,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Remove comment from task
router.delete('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('task_id', id)
      .eq('id', commentId);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Test endpoint to create a test task and notification
router.post('/test-notification', async (req, res) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Not authenticated');

    // Create a test task due in 1 hour
    const dueDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: 'Test Task',
        description: 'This is a test task to demonstrate notifications',
        due_date: dueDate,
        status: 'pending',
        priority: 'high',
        created_by: user.id,
        assigned_to: user.id
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // Create a test notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        task_id: task.id,
        message: `Test Task "${task.title}" is due in 1 hour`
      });

    if (notificationError) throw notificationError;

    res.json({ success: true, task, message: 'Test notification created' });
  } catch (error: any) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 