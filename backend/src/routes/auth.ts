import { Router } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName) {
      throw new AppError('Please provide email, password and full name', 400);
    }

    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role || 'user',
        },
      },
    });

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // --- DEV HACK: Hardcoded admin login ---
    if (email === 'admin@123.com' && password === '123') {
      // You can generate a real JWT if needed, but for now, return a fake token
      return res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: 'admin-dev',
            email: 'admin@123.com',
            role: 'admin',
            full_name: 'Admin User',
            is_admin: true,
            // Fake token for dev, replace with real JWT if needed
            access_token: 'dev-admin-token',
            // Add any other fields your frontend expects
          },
        },
      });
    }
    // --- END DEV HACK ---

    const { data: user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new AppError(error.message, 401);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout user
router.post('/logout', async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new AppError(error.message, 401);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router; 