import { Router } from 'express';
import { getDashboardKPIs } from '../services/dashboardService';

const router = Router();

// GET /dashboard/kpis
router.get('/kpis', async (req, res) => {
  try {
    // Optionally, get userId from auth middleware or query param
    const userId = req.user?.id || req.query.userId;
    const kpis = await getDashboardKPIs(userId);
    res.json({ success: true, data: kpis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router; 