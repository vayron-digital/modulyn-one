import { Router } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all projects
router.get('/', async (req, res, next) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        properties (*),
        team_members (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: {
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single project
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        properties (*),
        team_members (*),
        tasks (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!project) throw new AppError('No project found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new project
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      budget,
      location,
      teamMembers,
      properties,
    } = req.body;

    if (!name || !description) {
      throw new AppError('Please provide required fields', 400);
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          status: status || 'planning',
          start_date: startDate,
          end_date: endDate,
          budget,
          location,
          team_members: teamMembers,
          properties,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      status: 'success',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update project
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!project) throw new AppError('No project found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Add team member to project
router.post('/:id/team-members', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      throw new AppError('Please provide user ID and role', 400);
    }

    const { data: teamMember, error } = await supabase
      .from('project_team_members')
      .insert([
        {
          project_id: id,
          user_id: userId,
          role,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      status: 'success',
      data: {
        teamMember,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Remove team member from project
router.delete('/:id/team-members/:userId', async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const { error } = await supabase
      .from('project_team_members')
      .delete()
      .eq('project_id', id)
      .eq('user_id', userId);

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