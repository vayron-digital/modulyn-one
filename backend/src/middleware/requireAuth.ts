import { Request, Response, NextFunction } from 'express';
import { supabase } from '../index';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token', 401);
    }
    const token = authHeader.replace('Bearer ', '');
    // Validate JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new AppError('Invalid or expired token', 401);
    // Fetch profile (with tenant_id)
    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profileError || !profile) throw new AppError('Profile not found', 401);
    // Fetch tenant
    const { data: tenant, error: tenantError } = await supabase.from('tenants').select('*').eq('id', profile.tenant_id).single();
    if (tenantError || !tenant) throw new AppError('Tenant not found', 401);

    // Trial enforcement
    const now = new Date();
    if (tenant.trial_ends && new Date(tenant.trial_ends) < now && !tenant.is_paid) {
      return res.status(402).json({
        status: 'error',
        message: 'Your trial has expired. Upgrade to Modulyn One+ to unlock all features.',
        upgradeUrl: '/upgrade'
      });
    }
    req.user = profile;
    req.tenant = tenant;
    next();
  } catch (err) {
    next(err);
  }
}; 