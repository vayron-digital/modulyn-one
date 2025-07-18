import { Router, Request } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import { parse } from 'csv-parse';
import type { Multer } from 'multer';
import { stringify } from 'csv-stringify/sync';
import { NotificationService } from '../services/notificationService';

// @ts-ignore: No type declarations for 'multer'
const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// Get all cold calls (admin: all, agent: assigned only)
router.get('/', async (req, res, next) => {
  try {
    // TODO: Add role-based filtering (admin vs agent)
    const { data: coldCalls, error } = await supabase
      .from('cold_calls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: { coldCalls },
    });
  } catch (error) {
    next(error);
  }
});

// Get single cold call
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: coldCall, error } = await supabase
      .from('cold_calls')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new AppError(error.message, 400);
    if (!coldCall) throw new AppError('No cold call found with that ID', 404);
    res.status(200).json({ status: 'success', data: { coldCall } });
  } catch (error) {
    next(error);
  }
});

// Create new cold call (admin only)
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, agentId, source, status, priority, comments, date } = req.body;
    if (!name || !phone) throw new AppError('Name and phone are required', 400);
    const { data: coldCall, error } = await supabase
      .from('cold_calls')
      .insert([
        { name, email, phone, agent_id: agentId, source, status, priority, comments, date }
      ])
      .select()
      .single();
    if (error) throw new AppError(error.message, 400);
    res.status(201).json({ status: 'success', data: { coldCall } });
  } catch (error) {
    next(error);
  }
});

// Update cold call
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { data: coldCall, error } = await supabase
      .from('cold_calls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError(error.message, 400);
    if (!coldCall) throw new AppError('No cold call found with that ID', 404);
    if (coldCall && coldCall.agent_id) {
      await NotificationService.createNotification({
        userId: coldCall.agent_id,
        notificationType: 'cold_call_updated',
        title: 'Cold Call Updated',
        message: `A cold call (ID: ${coldCall.id}) has been updated.`,
        relatedToType: 'cold_call',
        relatedToId: coldCall.id
      });
    }
    res.status(200).json({ status: 'success', data: { coldCall } });
  } catch (error) {
    next(error);
  }
});

// Delete cold call (admin only)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('cold_calls').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
});

// Bulk assign agent (admin only)
router.post('/assign', async (req, res, next) => {
  try {
    const { ids, agentId } = req.body;
    if (!ids || !agentId) throw new AppError('ids and agentId required', 400);
    const { error } = await supabase
      .from('cold_calls')
      .update({ agent_id: agentId })
      .in('id', ids);
    if (error) throw new AppError(error.message, 400);
    if (ids && agentId) {
      for (const id of ids) {
        await NotificationService.createNotification({
          userId: agentId,
          notificationType: 'cold_call_assigned',
          title: 'Cold Call Assigned',
          message: `You have been assigned a new cold call (ID: ${id}).`,
          relatedToType: 'cold_call',
          relatedToId: id
        });
      }
    }
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
});

// Bulk delete (admin only)
router.post('/bulk-delete', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids) throw new AppError('ids required', 400);
    const { error } = await supabase
      .from('cold_calls')
      .delete()
      .in('id', ids);
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
});

// Export cold calls (admin only)
router.get('/export/csv', async (req, res, next) => {
  try {
    const { data: coldCalls, error } = await supabase
      .from('cold_calls')
      .select('*');
    if (error) throw new AppError(error.message, 400);
    // Convert to CSV
    const csv = stringify(coldCalls || [], {
      header: true,
      columns: [
        'id', 'name', 'email', 'phone', 'agent_id', 'source', 'status', 'priority', 'comments', 'date', 'is_converted', 'converted_by', 'converted_at', 'created_at'
      ]
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cold_calls_export.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
});

// Import CSV (admin only)
router.post('/import/csv', upload.single('file'), async (req: Request & { file?: Multer.File }, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const csvBuffer = req.file.buffer;
    const results: any[] = [];
    const errors: any[] = [];
    const parser = parse({ columns: true, trim: true });
    parser.on('readable', () => {
      let record;
      while ((record = parser.read())) {
        console.log('Parsed row:', record);
        // Validate required fields
        if (!record.name || !record.phone) {
          errors.push({ row: record, error: 'Missing name or phone' });
          continue;
        }
        results.push({
          name: record.name,
          email: record.email,
          phone: record.phone,
          agent_id: record.agent_id || null,
          source: record.source || null,
          status: record.status || 'pending',
          priority: record.priority || null,
          comments: record.comments || null,
          date: record.date || null,
        });
      }
    });
    parser.on('error', (err) => {
      console.error('CSV parse error:', err);
      return next(new AppError('CSV parse error: ' + err.message, 400));
    });
    parser.on('end', async () => {
      let inserted = 0;
      if (results.length > 0) {
        const { error, data } = await supabase.from('cold_calls').insert(results).select();
        if (error) {
          errors.push({ error: error.message });
          console.error('Insert error:', error.message);
        } else {
          inserted = data?.length || 0;
          console.log('Inserted rows:', inserted);
        }
      }
      res.status(200).json({
        status: 'success',
        imported: inserted,
        errors,
        parsed: results.length,
      });
    });
    parser.write(csvBuffer);
    parser.end();
  } catch (error) {
    next(error);
  }
});

// Convert cold call to lead (agent only)
router.post('/:id/convert', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { convertedBy } = req.body; // agent id
    // 1. Get cold call
    const { data: coldCall, error: getError } = await supabase
      .from('cold_calls')
      .select('*')
      .eq('id', id)
      .single();
    if (getError) throw new AppError(getError.message, 400);
    if (!coldCall) throw new AppError('No cold call found with that ID', 404);
    // 2. Insert into leads
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([
        {
          first_name: coldCall.name,
          email: coldCall.email,
          phone: coldCall.phone,
          source: coldCall.source,
          status: 'new',
          assigned_to: coldCall.agent_id,
          notes: coldCall.comments,
        },
      ])
      .select()
      .single();
    if (leadError) throw new AppError(leadError.message, 400);
    // 3. Mark cold call as converted
    const { error: updateError } = await supabase
      .from('cold_calls')
      .update({ is_converted: true, status: 'converted', converted_by: convertedBy, converted_at: new Date() })
      .eq('id', id);
    if (updateError) throw new AppError(updateError.message, 400);
    res.status(200).json({ status: 'success', data: { lead } });
  } catch (error) {
    next(error);
  }
});

export default router; 