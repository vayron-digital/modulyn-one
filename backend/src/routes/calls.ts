import { Router } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';
import { NotificationService } from '../services/notificationService';

const router = Router();

// Get all calls
router.get('/', async (req, res, next) => {
  try {
    const { data: calls, error } = await supabase
      .from('calls')
      .select(`
        *,
        user:users (*),
        lead:leads (*),
        project:projects (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: {
        calls,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single call
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: call, error } = await supabase
      .from('calls')
      .select(`
        *,
        user:users (*),
        lead:leads (*),
        project:projects (*),
        notes (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!call) throw new AppError('No call found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        call,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new call
router.post('/', async (req, res, next) => {
  try {
    const {
      type,
      status,
      duration,
      notes,
      userId,
      leadId,
      projectId,
      scheduledAt,
      outcome,
      followUpDate,
    } = req.body;

    if (!type || !userId) {
      throw new AppError('Please provide required fields', 400);
    }

    const { data: call, error } = await supabase
      .from('calls')
      .insert([
        {
          type,
          status: status || 'scheduled',
          duration,
          notes,
          user_id: userId,
          lead_id: leadId,
          project_id: projectId,
          scheduled_at: scheduledAt,
          outcome,
          follow_up_date: followUpDate,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    if (call && call.user_id) {
      await NotificationService.createNotification({
        userId: call.user_id,
        notificationType: 'call_scheduled',
        title: 'Call Scheduled',
        message: `A new call has been scheduled.`,
        relatedToType: 'call',
        relatedToId: call.id
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        call,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update call
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: call, error } = await supabase
      .from('calls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!call) throw new AppError('No call found with that ID', 404);

    if (call && call.user_id) {
      await NotificationService.createNotification({
        userId: call.user_id,
        notificationType: 'call_updated',
        title: 'Call Updated',
        message: `A call has been updated.`,
        relatedToType: 'call',
        relatedToId: call.id
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        call,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete call
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('calls').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Add note to call
router.post('/:id/notes', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, userId } = req.body;

    if (!content || !userId) {
      throw new AppError('Please provide content and user ID', 400);
    }

    const { data: note, error } = await supabase
      .from('call_notes')
      .insert([
        {
          call_id: id,
          content,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      status: 'success',
      data: {
        note,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Remove note from call
router.delete('/:id/notes/:noteId', async (req, res, next) => {
  try {
    const { id, noteId } = req.params;

    const { error } = await supabase
      .from('call_notes')
      .delete()
      .eq('call_id', id)
      .eq('id', noteId);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router; 