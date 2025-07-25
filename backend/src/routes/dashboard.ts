import { Router } from 'express';
import { getDashboardKPIs } from '../services/dashboardService';
import {
  getJourneyCards,
  createJourneyCard,
  updateJourneyCard,
  deleteJourneyCard,
  reorderJourneyCards,
  getJourneys,
  createJourney,
  updateJourney,
  deleteJourney,
  getJourneyColumns,
  createJourneyColumn,
  updateJourneyColumn,
  deleteJourneyColumn,
  reorderJourneyColumns
} from '../services/journeyCardService';

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

// GET /dashboard/journeys
router.get('/journeys', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });
    const journeys = await getJourneys(userId);
    res.json({ success: true, data: journeys });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /dashboard/journeys
router.post('/journeys', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    const journey = await createJourney(userId, name, description);
    res.json({ success: true, data: journey });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /dashboard/journeys/:id
router.put('/journeys/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });
    const { id } = req.params;
    const data = req.body;
    const journey = await updateJourney(userId, id, data);
    res.json({ success: true, data: journey });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /dashboard/journeys/:id
router.delete('/journeys/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });
    const { id } = req.params;
    await deleteJourney(userId, id);
    res.json({ success: true, message: 'Journey deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Journey Columns (per board)
router.get('/journeys/:journeyId/columns', async (req, res) => {
  try {
    const { journeyId } = req.params;
    const columns = await getJourneyColumns(journeyId);
    res.json({ success: true, data: columns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/journeys/:journeyId/columns', async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { name, position } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    const column = await createJourneyColumn(journeyId, name, position ?? 1);
    res.json({ success: true, data: column });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/journeys/:journeyId/columns/:columnId', async (req, res) => {
  try {
    const { columnId } = req.params;
    const data = req.body;
    const column = await updateJourneyColumn(columnId, data);
    res.json({ success: true, data: column });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/journeys/:journeyId/columns/:columnId', async (req, res) => {
  try {
    const { columnId } = req.params;
    await deleteJourneyColumn(columnId);
    res.json({ success: true, message: 'Column deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/journeys/:journeyId/columns/reorder', async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { newOrder } = req.body; // array of column IDs in new order
    await reorderJourneyColumns(journeyId, newOrder);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /dashboard/journey-cards?journeyId=...
router.get('/journey-cards', async (req, res) => {
  try {
    const userId = req.user?.id;
    const journeyId = req.query.journeyId as string;
    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });
    if (!journeyId) return res.status(400).json({ success: false, error: 'journeyId is required' });
    const cards = await getJourneyCards(userId, journeyId);
    res.json({ success: true, data: cards });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /dashboard/journey-cards
router.post('/journey-cards', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { title, stage, avatar_url, status } = req.body;
    if (!title || !stage) {
      return res.status(400).json({ success: false, error: 'Title and stage are required' });
    }

    const card = await createJourneyCard(userId, { title, stage, avatar_url, status });
    res.json({ success: true, data: card });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /dashboard/journey-cards/:id
router.put('/journey-cards/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { title, stage, avatar_url, status, completed, highlight, pill } = req.body;

    const card = await updateJourneyCard(userId, id, {
      title, stage, avatar_url, status, completed, highlight, pill
    });
    res.json({ success: true, data: card });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /dashboard/journey-cards/:id
router.delete('/journey-cards/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { id } = req.params;
    await deleteJourneyCard(userId, id);
    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /dashboard/journey-cards/reorder
router.post('/journey-cards/reorder', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { sourceStage, destinationStage, sourceIndex, destinationIndex, cardId } = req.body;

    const cards = await reorderJourneyCards(userId, {
      sourceStage,
      destinationStage,
      sourceIndex,
      destinationIndex,
      cardId
    });

    res.json({ success: true, data: cards });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router; 