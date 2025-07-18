import { Router } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all team members
router.get('/', async (req, res, next) => {
  try {
    const { data: teamMembers, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles (*),
        department:departments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: {
        teamMembers,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single team member
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: teamMember, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles (*),
        department:departments (*),
        projects (*),
        tasks (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!teamMember) throw new AppError('No team member found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        teamMember,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update team member
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: teamMember, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!teamMember) throw new AppError('No team member found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        teamMember,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all roles
router.get('/roles', async (req, res, next) => {
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: {
        roles,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new role
router.post('/roles', async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      throw new AppError('Please provide role name', 400);
    }

    const { data: role, error } = await supabase
      .from('roles')
      .insert([
        {
          name,
          description,
          permissions,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      status: 'success',
      data: {
        role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update role
router.patch('/roles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: role, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!role) throw new AppError('No role found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete role
router.delete('/roles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('roles').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Get all departments
router.get('/departments', async (req, res, next) => {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: {
        departments,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new department
router.post('/departments', async (req, res, next) => {
  try {
    const { name, description, managerId } = req.body;

    if (!name) {
      throw new AppError('Please provide department name', 400);
    }

    const { data: department, error } = await supabase
      .from('departments')
      .insert([
        {
          name,
          description,
          manager_id: managerId,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      status: 'success',
      data: {
        department,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update department
router.patch('/departments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: department, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!department) throw new AppError('No department found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        department,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete department
router.delete('/departments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('departments').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// --- DESIGNATIONS CRUD ---
// Get all designations
router.get('/designations', async (req, res, next) => {
  try {
    // Only admin/master
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { data, error } = await supabase.from('designations').select('*').order('name', { ascending: true });
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { designations: data } });
  } catch (error) { next(error); }
});
// Create designation
router.post('/designations', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { name, description } = req.body;
    if (!name) throw new AppError('Name required', 400);
    const { data, error } = await supabase.from('designations').insert([{ name, description }]).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(201).json({ status: 'success', data: { designation: data } });
  } catch (error) { next(error); }
});
// Update designation
router.patch('/designations/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { name, description } = req.body;
    const { data, error } = await supabase.from('designations').update({ name, description }).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { designation: data } });
  } catch (error) { next(error); }
});
// Delete designation
router.delete('/designations/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { error } = await supabase.from('designations').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) { next(error); }
});

// --- TEAMS CRUD ---
// Get all teams
router.get('/teams', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { data, error } = await supabase.from('teams').select('*').order('name', { ascending: true });
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { teams: data } });
  } catch (error) { next(error); }
});
// Create team
router.post('/teams', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { name, description } = req.body;
    if (!name) throw new AppError('Name required', 400);
    const { data, error } = await supabase.from('teams').insert([{ name, description }]).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(201).json({ status: 'success', data: { team: data } });
  } catch (error) { next(error); }
});
// Update team
router.patch('/teams/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { name, description } = req.body;
    const { data, error } = await supabase.from('teams').update({ name, description }).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { team: data } });
  } catch (error) { next(error); }
});
// Delete team
router.delete('/teams/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) { next(error); }
});

// --- TEAM HIERARCHY CRUD ---
// Get all team hierarchies
router.get('/team-hierarchy', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { data, error } = await supabase.from('team_hierarchy').select('*');
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { teamHierarchy: data } });
  } catch (error) { next(error); }
});
// Create team hierarchy
router.post('/team-hierarchy', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { team_id, parent_team_id } = req.body;
    if (!team_id) throw new AppError('team_id required', 400);
    const { data, error } = await supabase.from('team_hierarchy').insert([{ team_id, parent_team_id }]).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(201).json({ status: 'success', data: { teamHierarchy: data } });
  } catch (error) { next(error); }
});
// Update team hierarchy
router.patch('/team-hierarchy/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { team_id, parent_team_id } = req.body;
    const { data, error } = await supabase.from('team_hierarchy').update({ team_id, parent_team_id }).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { teamHierarchy: data } });
  } catch (error) { next(error); }
});
// Delete team hierarchy
router.delete('/team-hierarchy/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { error } = await supabase.from('team_hierarchy').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) { next(error); }
});

// --- TEAM REVENUE TRACKING CRUD ---
// Get all team revenue records
router.get('/team-revenue', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { data, error } = await supabase.from('team_revenue_tracking').select('*');
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { teamRevenue: data } });
  } catch (error) { next(error); }
});
// Create team revenue record
router.post('/team-revenue', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { team_id, month, revenue_target, revenue_actual } = req.body;
    if (!team_id || !month) throw new AppError('team_id and month required', 400);
    const { data, error } = await supabase.from('team_revenue_tracking').insert([{ team_id, month, revenue_target, revenue_actual }]).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(201).json({ status: 'success', data: { teamRevenue: data } });
  } catch (error) { next(error); }
});
// Update team revenue record
router.patch('/team-revenue/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { team_id, month, revenue_target, revenue_actual } = req.body;
    const { data, error } = await supabase.from('team_revenue_tracking').update({ team_id, month, revenue_target, revenue_actual }).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { teamRevenue: data } });
  } catch (error) { next(error); }
});
// Delete team revenue record
router.delete('/team-revenue/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { error } = await supabase.from('team_revenue_tracking').delete().eq('id', id);
    if (error) throw new AppError(error.message, 400);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) { next(error); }
});

// --- ADMIN USER CRUD ---
// List all users (with profile info)
router.get('/users', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    // Join profiles and user_details for full info
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_details: user_details (*),
        team_hierarchy: team_hierarchy (*),
        designation,
        reporting_person
      `)
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 400);
    // Flatten user_details into top-level fields for frontend
    const users = (data || []).map((u: any) => ({
      ...u,
      ...(u.user_details || {}),
      team_hierarchy: u.team_hierarchy || [],
    }));
    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) { next(error); }
});
// Get user by id
router.get('/users/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { user: data } });
  } catch (error) { next(error); }
});
// Create user (with extended fields)
router.post('/users', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    console.log('Incoming user creation request:', req.body);
    const { email, password, ...profileFields } = req.body;
    if (!email || !password) throw new AppError('Email and password required', 400);
    // Create auth user
    const { data: user, error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (authError) {
      console.error('Supabase auth error:', authError);
      throw new AppError(authError.message, 400);
    }
    console.log('New Supabase Auth user ID:', user.user.id);
    // Wait 200ms to ensure user is committed in users table (Supabase eventual consistency)
    await new Promise(resolve => setTimeout(resolve, 200));
    // Insert profile (minimal fields)
    const profileInsert = {
      id: user.user.id,
      email,
      role: profileFields.role,
      is_admin: profileFields.role === 'admin' || profileFields.role === 'master',
      full_name: [profileFields.first_name, profileFields.last_name].filter(Boolean).join(' '),
    };
    console.log('Profile insert:', profileInsert);
    const { error: profileError, data: profileData } = await supabase.from('profiles').insert([profileInsert]);
    console.log('Profile insert result:', profileData, profileError);
    if (profileError) {
      console.error('Supabase profile insert error:', profileError);
      throw new AppError(profileError.message, 400);
    }
    // Insert user_details (all extended fields)
    const userDetailsInsert = {
      id: user.user.id,
      first_name: profileFields.first_name,
      last_name: profileFields.last_name,
      phone: profileFields.phone,
      alt_contact: profileFields.alt_contact,
      dob: profileFields.dob,
      doj: profileFields.date_of_joining,
      blood_group: profileFields.blood_group,
      emergency_contact_name: profileFields.emergency_name,
      emergency_contact_number: profileFields.emergency_number,
      emergency_contact_relationship: profileFields.emergency_relation,
      address_uae: profileFields.address_uae,
      personal_email: profileFields.personal_email,
      nationality: profileFields.nationality,
      marital_status: profileFields.marital_status,
      medical_conditions: profileFields.medical_conditions,
      education_details: profileFields.education,
      bank_details: JSON.stringify({ bank_name: profileFields.bank_name, ifsc: profileFields.ifsc, iban: profileFields.iban, account: profileFields.bank_account }),
      passport_number: profileFields.passport_number,
      passport_expiry: profileFields.passport_expiry,
      visa_number: profileFields.visa_number,
      visa_type: profileFields.visa_type,
      visa_expiry: profileFields.visa_expiry,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      designation: profileFields.designation,
      reporting_to: profileFields.reporting_person,
      status: profileFields.status,
      availability: profileFields.availability,
      prev_employer: profileFields.prev_employer,
      allow_exclusion: profileFields.allow_exclusion,
      home_country_contact: profileFields.home_country_contact,
      profile_pic: profileFields.profile_pic,
    };
    console.log('User details insert:', userDetailsInsert);
    const { error: detailsError } = await supabase.from('user_details').insert([userDetailsInsert]);
    if (detailsError) {
      console.error('Supabase user_details insert error:', detailsError);
      throw new AppError(detailsError.message, 400);
    }
    res.status(201).json({ status: 'success', data: { user: { id: user.user.id, email, ...profileFields } } });
  } catch (error: any) {
    console.error('User creation error:', error);
    const status = typeof error.status === 'number' ? error.status : 500;
    res.status(status).json({ status: 'error', message: error.message, details: error });
  }
});
// Update user (profile fields)
router.patch('/users/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    const updateFields = req.body;
    const { data, error } = await supabase.from('profiles').update(updateFields).eq('id', id).select().single();
    if (error) throw new AppError(error.message, 400);
    res.status(200).json({ status: 'success', data: { user: data } });
  } catch (error) { next(error); }
});
// Delete user (auth + profile)
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (!['admin', 'master'].includes(req.user?.role)) throw new AppError('Forbidden', 403);
    const { id } = req.params;
    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw new AppError(authError.message, 400);
    // Delete profile
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
    if (profileError) throw new AppError(profileError.message, 400);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) { next(error); }
});

export default router; 