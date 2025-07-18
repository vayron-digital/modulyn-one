import { Router } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';
const { matchPropertiesToLead } = require('../services/matchService');
import { NotificationService } from '../services/notificationService';

const router = Router();

// Get all leads
router.get('/', async (req, res, next) => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: {
        leads,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single lead
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!lead) throw new AppError('No lead found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new lead
router.post('/', async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      source,
      status,
      notes,
      assignedTo,
    } = req.body;

    if (!firstName || !lastName || !email) {
      throw new AppError('Please provide required fields', 400);
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          source,
          status: status || 'new',
          notes,
          assigned_to: assignedTo,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    if (lead && lead.assigned_to) {
      await NotificationService.createNotification({
        userId: lead.assigned_to,
        notificationType: 'lead_created',
        title: 'New Lead Assigned',
        message: `A new lead (${lead.first_name} ${lead.last_name}) has been assigned to you.`,
        relatedToType: 'lead',
        relatedToId: lead.id
      });
    }

    res.status(201).json({
      status: 'success',
      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update lead
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!lead) throw new AppError('No lead found with that ID', 404);

    if (lead && lead.assigned_to) {
      await NotificationService.createNotification({
        userId: lead.assigned_to,
        notificationType: 'lead_updated',
        title: 'Lead Updated',
        message: `Lead (${lead.first_name} ${lead.last_name}) has been updated.`,
        relatedToType: 'lead',
        relatedToId: lead.id
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete lead
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('leads').delete().eq('id', id);

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