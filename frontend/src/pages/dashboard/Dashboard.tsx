import React, { useState, useEffect, useCallback } from 'react';
import { useLayout } from '../../components/layout/DashboardLayout';
import styles from '../../components/layout/DashboardLayout.module.css';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from '../../components/common/LoadingState';
import api from '../../lib/api';
import ColdCallsWidget from '../../widgets/ColdCallsWidget';
import NewLeadsWidget from '../../widgets/NewLeadsWidget';
import TotalLeadsWidget from '../../widgets/TotalLeadsWidget';
import ActiveTasksWidget from '../../widgets/ActiveTasksWidget';
import OverdueTasksWidget from '../../widgets/OverdueTasksWidget';
import { dashboardApi } from '../../lib/api';
import RecentActivityWidget from '../../widgets/RecentActivityWidget';
import { journeysApi } from '../../lib/api';
import { journeyColumnsApi } from '../../lib/api';
import { Plus, TrendingUp, TrendingDown, Users, DollarSign, Target, Clock, Calendar, Bell, Settings, BarChart3, Activity, Zap, Brain, ArrowRight, Eye, EyeOff, RefreshCw, Maximize2, Minimize2, Phone, CheckCircle } from 'lucide-react';
import Widget from '../../components/ui/widget';
import theme from '../../lib/theme.js';



interface JourneyCard {
  id: string;
  title: string;
  stage: 'awareness' | 'consideration' | 'decision' | 'retention';
  avatar_url?: string;
  status: 'green' | 'blue' | 'red' | 'yellow';
  completed: boolean;
  highlight: boolean;
  pill: boolean;
  position: number;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  editing?: boolean; // Added editing property
  pending?: boolean; // Added pending property
  tempId?: string; // Added tempId property
  value?: number; // Add value for kanban card
}

interface JourneyStage {
  title: string;
  stage: 'awareness' | 'consideration' | 'decision' | 'retention';
  cards: JourneyCard[];
}

const statusColors = {
  green: theme.semantic.states.success,
  blue: theme.semantic.states.info,
  red: theme.semantic.states.error,
  yellow: theme.semantic.states.warning
};

const fadeInKeyframes = `@keyframes fadeInCard { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }`;

const DragHandle = () => (
  <span 
    style={{ 
      cursor: 'grab', 
      marginRight: theme.spacing.sm, 
      fontSize: theme.typography.fontSize.xl, 
      color: theme.functional.onSurface.soft, 
      userSelect: 'none', 
      display: 'flex', 
      alignItems: 'center',
      fontFamily: theme.typography.fontFamily.body
    }} 
    title="Drag"
  >
    <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="5" cy="5" r="1.5"/><circle cx="5" cy="9" r="1.5"/><circle cx="5" cy="13" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="13" cy="9" r="1.5"/><circle cx="13" cy="13" r="1.5"/></svg>
  </span>
);

// Add Journey (Board) type
interface Journey {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

// Add JourneyColumn type
interface JourneyColumn {
  id: string;
  journey_id: string;
  name: string;
  position: number;
  created_at: string;
}

const Dashboard = () => {
  const { setHeader } = useLayout();
  const { user, loading: authLoading, error: authError } = useAuthLoading();
  
  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>([]);
  const [modalCard, setModalCard] = useState<JourneyCard | null>(null);
  const [editCard, setEditCard] = useState<{ colIdx: number; cardIdx: number; card: JourneyCard } | null>(null);
  const [deleteCard, setDeleteCard] = useState<{ colIdx: number; cardIdx: number; card: JourneyCard } | null>(null);
  const [addCardCol, setAddCardCol] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add a pendingCards state to track cards being updated
  const [pendingCards, setPendingCards] = useState<string[]>([]);
  // Add dragVersion state to force re-render after drop
  const [dragVersion, setDragVersion] = useState(0);
  // Add a tempId counter for new cards
  const [tempId, setTempId] = useState(0);
  const [kpis, setKpis] = useState<any>(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  
  // Add dashboard layer state
  const [dashboardLayer, setDashboardLayer] = useState<'overview' | 'analytics' | 'team' | 'automation' | 'insights'>('overview');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Dashboard layer configurations
  const dashboardLayers = {
    overview: {
      title: 'Dashboard Overview',
      description: 'Your command center for daily operations',
      icon: '🏠'
    },
    analytics: {
      title: 'Analytics & Reports',
      description: 'Deep insights and performance metrics',
      icon: '📊'
    },
    team: {
      title: 'Team Performance',
      description: 'Team collaboration and productivity',
      icon: '👥'
    },
    automation: {
      title: 'Automation Hub',
      description: 'Smart workflows and automation',
      icon: '⚡'
    },
    insights: {
      title: 'AI Insights',
      description: 'Predictive analytics and recommendations',
      icon: '🤖'
    }
  };

  // Enhanced sidebar navigation for dashboard
  const dashboardNavItems = [
    { id: 'overview', label: 'Overview', icon: '🏠', color: 'blue' },
    { id: 'analytics', label: 'Analytics', icon: '📊', color: 'purple' },
    { id: 'team', label: 'Team', icon: '👥', color: 'green' },
    { id: 'automation', label: 'Automation', icon: '⚡', color: 'orange' },
    { id: 'insights', label: 'AI Insights', icon: '🤖', color: 'indigo' }
  ];
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentActivityLoading, setRecentActivityLoading] = useState(true);
  const [recentActivityError, setRecentActivityError] = useState<string | null>(null);

  // Add at the top of the component:
  const [drawerTab, setDrawerTab] = useState<'Details' | 'Subtasks' | 'Comments' | 'Activity'>('Details');
  const [drawerDescription, setDrawerDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'journeys'>('overview');
  const [journeyView, setJourneyView] = useState<'kanban' | 'list'>('kanban');
  const [journeySearchTerm, setJourneySearchTerm] = useState('');
  const [journeySortBy, setJourneySortBy] = useState<'name' | 'value' | 'date'>('name');

  // When opening the drawer (setModalCard), also set drawerTab and drawerDescription
  // Replace all modalCard._tab with drawerTab
  // Replace all modalCard.description with drawerDescription
  // On tab switch, use setDrawerTab(tab)
  // On description change, use setDrawerDescription(value)
  // Remove all direct references to _tab and description on JourneyCard

  // Initialize stages structure - matching the deal pipeline structure
  const initializeStages = (): JourneyStage[] => [
    { title: 'Early', stage: 'awareness' as const, cards: [] },
    { title: 'Review', stage: 'consideration' as const, cards: [] },
    { title: 'Negotiation', stage: 'decision' as const, cards: [] },
    { title: 'Due Diligence', stage: 'decision' as const, cards: [] },
    { title: 'Approved', stage: 'retention' as const, cards: [] }
  ];

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(true);
  const [showCreateJourney, setShowCreateJourney] = useState(false);
  const [newJourneyName, setNewJourneyName] = useState('');
  const [newJourneyDesc, setNewJourneyDesc] = useState('');

  // Dynamic columns state
  const [columns, setColumns] = useState<JourneyColumn[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editedColumnName, setEditedColumnName] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Fetch journeys (boards)
  const fetchJourneys = useCallback(async () => {
    setJourneyLoading(true);
    try {
      const res = await journeysApi.getAll();
      setJourneys(res.data.data || []);
    } catch (err) {
      setJourneys([]);
    } finally {
      setJourneyLoading(false);
    }
  }, []);

  // Fetch cards for selected journey
  const fetchJourneyCards = useCallback(async (journeyId?: string) => {
    if (!journeyId && !selectedJourney) return;
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getJourneyCards(journeyId || selectedJourney?.id!);
      if (res.data.success) {
        const cardsByColumn: { [columnId: string]: JourneyCard[] } = res.data.data;
        // Map cards to columns
        const stages = columns.map(col => ({
          title: col.name,
          stage: col.id as any, // use column id as stage
          cards: (cardsByColumn[col.id] || []).sort((a, b) => a.position - b.position)
        }));
        setJourneyStages(stages);
      } else {
        setError('Failed to fetch journey cards');
      }
    } catch (err) {
      setError('Error loading journey cards');
    } finally {
      setLoading(false);
    }
  }, [selectedJourney, columns]);

  // On mount, fetch journeys
  useEffect(() => {
    if (activeTab === 'journeys') fetchJourneys();
  }, [activeTab, fetchJourneys]);

  // When selectedJourney changes, fetch its cards
  useEffect(() => {
    if (selectedJourney) fetchJourneyCards(selectedJourney.id);
  }, [selectedJourney, fetchJourneyCards]);

  // Create new journey (board)
  const handleCreateJourney = async () => {
    try {
      const res = await journeysApi.create({ name: 'Blank Journey' });
      if (res.data.success) {
        await fetchJourneys();
        // Find the new journey and select it
        const newJourney = res.data.data;
        setSelectedJourney(newJourney);
        setShowCreateJourney(false);
        setNewJourneyName('');
        setNewJourneyDesc('');
      }
    } catch {}
  };

  // Fetch journey cards from backend
  const handleAddCardModal = useCallback(async () => {
    if (addCardCol === null || !newCardTitle.trim()) return;
    
    try {
      const stage = journeyStages[addCardCol].stage;
      const response = await api.post('/dashboard/journey-cards', {
        title: newCardTitle,
        stage,
        status: 'blue'
      });
      
      if (response.data.success) {
        await fetchJourneyCards(); // Refresh the data
        setAddCardCol(null);
        setNewCardTitle('');
      } else {
        setError('Failed to create card');
      }
    } catch (err) {
      setError('Error creating card');
      console.error('Error creating card:', err);
    }
  }, [addCardCol, newCardTitle, journeyStages, fetchJourneyCards]);

  // Update card
  const handleEditSave = useCallback(async () => {
    if (!editCard) return;
    
    try {
      const response = await api.put(`/dashboard/journey-cards/${editCard.card.id}`, {
        title: editCard.card.title,
        status: editCard.card.status
      });
      
      if (response.data.success) {
        await fetchJourneyCards(); // Refresh the data
        setEditCard(null);
      } else {
        setError('Failed to update card');
      }
    } catch (err) {
      setError('Error updating card');
      console.error('Error updating card:', err);
    }
  }, [editCard, fetchJourneyCards]);

  // Delete card
  const handleDeleteCard = useCallback(async () => {
    if (!deleteCard) return;
    
    try {
      const response = await api.delete(`/dashboard/journey-cards/${deleteCard.card.id}`);
      
      if (response.data.success) {
        await fetchJourneyCards(); // Refresh the data
        setDeleteCard(null);
      } else {
        setError('Failed to delete card');
      }
    } catch (err) {
      setError('Error deleting card');
      console.error('Error deleting card:', err);
    }
  }, [deleteCard, fetchJourneyCards]);

  // Optimistic drag-and-drop
  const onDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return;

    const sourceStageIndex = parseInt(result.source.droppableId);
    const destStageIndex = parseInt(result.destination.droppableId);
    const cardId = result.draggableId;

    // Optimistically update UI (deep copy, no mutation)
    setJourneyStages(prevStages => {
      const newStages = prevStages.map(stage => ({ ...stage, cards: stage.cards.map(card => ({ ...card })) }));
      const [movedCard] = newStages[sourceStageIndex].cards.splice(result.source.index, 1);
      if (!movedCard) return prevStages;
      movedCard.stage = newStages[destStageIndex].stage;
      newStages[destStageIndex].cards.splice(result.destination.index, 0, movedCard);
      // Recalculate positions
      newStages.forEach(stage => {
        stage.cards.forEach((card, idx) => { card.position = idx; });
      });
      return newStages;
    });
    setPendingCards(prev => [...prev, cardId]);
    setDragVersion(v => v + 1); // force re-render

    // Background API update
    try {
      const response = await api.post('/dashboard/journey-cards/reorder', {
        sourceStage: journeyStages[sourceStageIndex].stage,
        destinationStage: journeyStages[destStageIndex].stage,
        sourceIndex: result.source.index,
        destinationIndex: result.destination.index,
        cardId
      });
      if (!response.data.success) throw new Error('Failed to reorder cards');
    } catch (err) {
      // Revert UI on error
      await fetchJourneyCards();
      alert('Failed to update card position. Please try again.');
    } finally {
      setPendingCards(prev => prev.filter(id => id !== cardId));
    }
  }, [journeyStages, fetchJourneyCards]);

  const handleEditCard = useCallback((colIdx: number, cardIdx: number) => {
    setEditCard({ colIdx, cardIdx, card: { ...journeyStages[colIdx].cards[cardIdx] } });
  }, [journeyStages]);

  // Sample titles for new cards
  const sampleTitles = ['Blank Agenda', 'Kickoff Note', 'Quick Task', 'Untitled Card', 'New Journey'];

  // In handleAddCardInstant, pick a random sample title
  const handleAddCardInstant = (colIdx: number) => {
    const sampleTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    const tempCardId = `temp-${tempId}`;
    setJourneyStages(prevStages => {
      const newStages = prevStages.map((stage, idx) => {
        if (idx !== colIdx) return stage;
        return {
          ...stage,
          cards: [
            {
              id: tempCardId,
              title: sampleTitle,
              stage: stage.stage,
              status: 'blue' as 'blue',
              completed: false,
              highlight: false,
              pill: false,
              position: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              tenant_id: '',
              editing: true,
              pending: true,
              tempId: tempCardId,
            },
            ...stage.cards.map(card => ({ ...card, position: card.position + 1 }))
          ]
        };
      });
      return newStages;
    });
    setPendingCards(prev => [...prev, tempCardId]);
    setTempId(id => id + 1);
  };

  // In handleSaveNewCard, replace temp card by tempId, not by index
  const handleSaveNewCard = async (colIdx: number, cardIdx: number, title: string) => {
    const card = journeyStages[colIdx].cards[cardIdx];
    if (!title.trim()) {
      // Remove the card if empty
      setJourneyStages(prevStages => {
        const newStages = prevStages.map((stage, idx) => {
          if (idx !== colIdx) return stage;
          return { ...stage, cards: stage.cards.filter((_, i) => i !== cardIdx) };
        });
        return newStages;
      });
      setPendingCards(prev => prev.filter(id => id !== card.id));
      return;
    }
    // Optimistically update
    setJourneyStages(prevStages => {
      const newStages = prevStages.map((stage, idx) => {
        if (idx !== colIdx) return stage;
        return {
          ...stage,
          cards: stage.cards.map((c, i) => i === cardIdx ? { ...c, title, editing: false, pending: true } : c)
        };
      });
      return newStages;
    });
    // Call backend
    try {
      const stage = journeyStages[colIdx].stage;
      const response = await api.post('/dashboard/journey-cards', {
        title,
        stage,
        status: 'blue'
      });
      if (response.data.success) {
        const realCard: JourneyCard = response.data.data;
        // Replace temp card with real card by tempId
        setJourneyStages(prevStages => {
          const newStages = prevStages.map((stage, idx) => {
            if (idx !== colIdx) return stage;
            return {
              ...stage,
              cards: stage.cards.map((c) =>
                c.tempId === card.id ? { ...realCard, editing: false, pending: false } : c
              )
            };
          });
          return newStages;
        });
        setPendingCards(prev => prev.filter(id => id !== card.id));
      } else {
        throw new Error('Failed to create card');
      }
    } catch (err) {
      // On error, revert
      setJourneyStages(prevStages => {
        const newStages = prevStages.map((stage, idx) => {
          if (idx !== colIdx) return stage;
          return { ...stage, cards: stage.cards.filter((_, i) => i !== cardIdx) };
        });
        return newStages;
      });
      setPendingCards(prev => prev.filter(id => id !== card.id));
      alert('Failed to create card.');
    }
  };

  // Helper function to get card positions for SVG connectors
  const getCardPositions = useCallback((stages: JourneyStage[]) => {
    const positions: Array<{ left: number; top: number }> = [];
    let currentLeft = 0;
    
    stages.forEach((stage, stageIndex) => {
      stage.cards.forEach((card, cardIndex) => {
        positions.push({
          left: currentLeft + (cardIndex * 320) + (stageIndex * 48),
          top: cardIndex * 86
        });
      });
      currentLeft += stage.cards.length * 320;
    });
    
    return positions;
  }, []);

  // Sample data for bottom section
  const knowledgeRows = [
    { subject: 'Product Demo', status: 'Executed', start: '2024-01-15', end: '2024-01-20', user: 'John Doe' },
    { subject: 'Market Research', status: 'Active', start: '2024-01-10', end: '2024-01-25', user: 'Jane Smith' },
    { subject: 'Client Meeting', status: 'Executed', start: '2024-01-12', end: '2024-01-12', user: 'Mike Johnson' },
    { subject: 'Proposal Review', status: 'Active', start: '2024-01-18', end: '2024-01-30', user: 'Sarah Wilson' }
  ];

  useEffect(() => {
    let mounted = true;

    async function fetchKPIs() {
      try {
        setKpisLoading(true);
        setKpisError(null);
        const response = await dashboardApi.getKPIs();
        if (mounted && response.data && response.data.success) {
          setKpis(response.data.data);
        }
      } catch (err) {
        if (mounted) {
          setKpisError('Failed to load analytics.');
        }
      } finally {
        if (mounted) {
          setKpisLoading(false);
        }
      }
    }
    fetchKPIs();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    let mounted = true;

    async function fetchRecentActivity() {
      try {
        setRecentActivityLoading(true);
        setRecentActivityError(null);
        // TODO: Replace with real API call if available
        // const response = await api.get('/dashboard/recent-activity');
        // setRecentActivity(response.data.data);
        if (mounted) {
          setRecentActivity([
            { icon: '🟢', text: 'Lead added: John Doe', time: '2 hours ago', avatar: '/default-avatar.png' },
            { icon: '📞', text: 'Cold call made: Acme Corp', time: '3 hours ago', avatar: '/default-avatar.png' },
            { icon: '✅', text: 'Task completed: Follow up', time: '5 hours ago', avatar: '/default-avatar.png' },
            { icon: '🏷️', text: 'Status changed: Lead to Opportunity', time: 'Yesterday', avatar: '/default-avatar.png' },
            { icon: '📄', text: 'Document uploaded: NDA.pdf', time: 'Yesterday', avatar: '/default-avatar.png' },
          ]);
        }
      } catch (err) {
        if (mounted) {
          setRecentActivityError('Failed to load recent activity.');
        }
      } finally {
        if (mounted) {
          setRecentActivityLoading(false);
        }
      }
    }
    fetchRecentActivity();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  React.useEffect(() => {
    if (user?.id) {
      fetchJourneyCards();
    }
    setHeader({
      title: 'Overview',
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Overview' }
      ],
      tabs: [],
    });
  }, [user?.id, setHeader, fetchJourneyCards]);

  // Fix: getCardPositions returns a flat array, but we want to connect each card to the first card in the next stage
  const cardPositions = getCardPositions(journeyStages);

  const handleRetry = () => {
    if (selectedJourney) fetchJourneyCards(selectedJourney.id);
    else fetchJourneys();
  };

  // Add state and handlers for inline editing:
  const [editingJourneyName, setEditingJourneyName] = useState(false);
  const [editedJourneyName, setEditedJourneyName] = useState('');
  const saveJourneyName = async () => {
    if (!selectedJourney || !editedJourneyName.trim()) {
      setEditingJourneyName(false);
      return;
    }
    try {
      const res = await journeysApi.update(selectedJourney.id, { name: editedJourneyName });
      if (res.data.success) {
        setSelectedJourney({ ...selectedJourney, name: editedJourneyName });
        fetchJourneys();
      }
    } catch {}
    setEditingJourneyName(false);
  };

  // Fetch columns for selected journey
  const fetchColumns = useCallback(async (journeyId?: string) => {
    if (!journeyId && !selectedJourney) return;
    setColumnsLoading(true);
    try {
      const res = await journeyColumnsApi.getAll(journeyId || selectedJourney?.id!);
      if (res.data.success) {
        setColumns(res.data.data.sort((a: JourneyColumn, b: JourneyColumn) => a.position - b.position));
        setColumnOrder(res.data.data.map((col: JourneyColumn) => col.id));
      } else {
        setColumns([]);
        setColumnOrder([]);
      }
    } catch {
      setColumns([]);
      setColumnOrder([]);
    } finally {
      setColumnsLoading(false);
    }
  }, [selectedJourney]);

  // Fetch columns when journey changes
  useEffect(() => {
    if (selectedJourney) fetchColumns(selectedJourney.id);
  }, [selectedJourney, fetchColumns]);

  // Add column
  const handleAddColumn = async () => {
    if (!selectedJourney || !newColumnName.trim()) return;
    setAddingColumn(true);
    try {
      const res = await journeyColumnsApi.create(selectedJourney.id, { name: newColumnName, position: columns.length });
      if (res.data.success) {
        await fetchColumns(selectedJourney.id);
        setNewColumnName('');
      }
    } finally {
      setAddingColumn(false);
    }
  };

  // Remove column
  const handleRemoveColumn = async (columnId: string) => {
    if (!selectedJourney) return;
    await journeyColumnsApi.delete(selectedJourney.id, columnId);
    await fetchColumns(selectedJourney.id);
  };

  // Inline edit column name
  const handleEditColumnName = (column: JourneyColumn) => {
    setEditingColumnId(column.id);
    setEditedColumnName(column.name);
  };
  const handleSaveColumnName = async (column: JourneyColumn) => {
    if (!selectedJourney || !editedColumnName.trim()) {
      setEditingColumnId(null);
      return;
    }
    await journeyColumnsApi.update(selectedJourney.id, column.id, { name: editedColumnName });
    await fetchColumns(selectedJourney.id);
    setEditingColumnId(null);
  };

  // Reorder columns (drag & drop)
  const onColumnDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(columnOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setColumnOrder(newOrder);
    if (selectedJourney) await journeyColumnsApi.reorder(selectedJourney.id, newOrder);
    await fetchColumns(selectedJourney?.id);
  };

  // When columns change, refetch cards for the selected journey
  useEffect(() => {
    if (selectedJourney && columns.length > 0) fetchJourneyCards(selectedJourney.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // New state for enhanced dashboard features
  const [dashboardView, setDashboardView] = useState<'overview' | 'analytics' | 'team' | 'automation' | 'insights'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [widgetsExpanded, setWidgetsExpanded] = useState<{[key: string]: boolean}>({});
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [customizationMode, setCustomizationMode] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'quarter'>('week');
  const [roleBasedView, setRoleBasedView] = useState<'founder' | 'manager' | 'sales' | 'admin'>('founder');

  // Enhanced KPI data with trends and sparklines
  const [enhancedKpis, setEnhancedKpis] = useState({
    totalLeads: { value: 0, trend: 12.5, sparkline: [12, 19, 15, 22, 18, 24, 20] },
    newLeadsToday: { value: 0, trend: 18.7, sparkline: [8, 12, 15, 18, 22, 25, 28] },
    conversionRate: { value: 0, trend: 5.2, sparkline: [68, 72, 75, 78, 82, 85, 88] },
    avgLeadValue: { value: 0, trend: 8.3, sparkline: [2500, 2800, 3200, 3500, 3800, 4200, 4500] },
    activeTasks: { value: 0, trend: 5.2, sparkline: [45, 52, 48, 55, 62, 58, 65] },
    overdueTasks: { value: 0, trend: -2.7, sparkline: [12, 8, 15, 10, 7, 13, 9] },
    totalRevenue: { value: 0, trend: 15.8, sparkline: [45000, 52000, 48000, 55000, 62000, 58000, 65000] },
    pipelineValue: { value: 0, trend: 22.1, sparkline: [120000, 135000, 150000, 165000, 180000, 195000, 210000] }
  });

  // Real-time activity feed
  const [realTimeActivity, setRealTimeActivity] = useState([
    { id: 1, type: 'lead', action: 'New lead added', details: 'John Doe from TechCorp', time: '2 min ago', priority: 'high', avatar: '/default-avatar.png' },
    { id: 2, type: 'call', action: 'Call completed', details: 'Follow-up with Sarah Wilson', time: '5 min ago', priority: 'medium', avatar: '/default-avatar.png' },
    { id: 3, type: 'task', action: 'Task overdue', details: 'Send proposal to Acme Corp', time: '15 min ago', priority: 'high', avatar: '/default-avatar.png' },
    { id: 4, type: 'meeting', action: 'Meeting scheduled', details: 'Demo with Enterprise Client', time: '1 hour ago', priority: 'medium', avatar: '/default-avatar.png' },
    { id: 5, type: 'deal', action: 'Deal closed', details: 'Property sale - $450K', time: '2 hours ago', priority: 'high', avatar: '/default-avatar.png' }
  ]);

  // Upcoming events and tasks
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, type: 'meeting', title: 'Client Demo - TechCorp', time: '10:00 AM', duration: '1 hour', attendees: 3, priority: 'high' },
    { id: 2, type: 'call', title: 'Follow-up Call', time: '2:00 PM', duration: '30 min', attendees: 1, priority: 'medium' },
    { id: 3, type: 'task', title: 'Send Proposal', time: '4:00 PM', duration: '1 hour', attendees: 0, priority: 'high' },
    { id: 4, type: 'meeting', title: 'Team Standup', time: '9:00 AM tomorrow', duration: '15 min', attendees: 5, priority: 'low' }
  ]);

  // AI Insights and recommendations
  const [aiInsights, setAiInsights] = useState([
    { id: 1, type: 'opportunity', title: 'High-value leads need attention', description: '3 leads in your pipeline show strong buying signals', priority: 'high', action: 'Review Pipeline' },
    { id: 2, type: 'optimization', title: 'Email timing optimization', description: 'Sending emails at 2 PM increases open rates by 15%', priority: 'medium', action: 'Update Schedule' },
    { id: 3, type: 'alert', title: 'Task completion rate declining', description: 'Team task completion dropped 8% this week', priority: 'high', action: 'Check Workload' },
    { id: 4, type: 'insight', title: 'Best performing time slots', description: 'Tuesday and Thursday afternoons show highest conversion rates', priority: 'low', action: 'View Analytics' }
  ]);

  // Enhanced KPI Card Component - Updated Typography
  const KPICard = ({ title, value, trend, sparkline, icon, onClick }: any) => (
    <div 
      className="bg-surface-primary/10 backdrop-blur-sm rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-surface-primary/20 hover:scale-[1.02] border border-surface-primary/20 group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
          <div className="p-3 bg-surface-primary/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            {icon}
                    </div>
                    <div>
            <p className="text-sm text-text-on-dark font-medium tracking-wide">{title}</p>
            <p className="text-2xl text-text-on-dark font-extrabold tracking-tight">{value}</p>
                    </div>
                    </div>
        <div className="flex items-center space-x-2">
          {trend > 0 ? (
            <TrendingUp className="h-5 w-5 text-states-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-states-error" />
          )}
          <span className={`text-xs font-semibold ${trend > 0 ? 'text-states-success' : 'text-states-error'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
                  </div>
                    </div>
      
      {/* Sparkline Chart - Simplified */}
      <div className="flex items-end space-x-1 h-12">
        {sparkline.map((point: number, index: number) => (
          <div
            key={index}
            className="flex-1 bg-surface-primary/30 rounded-sm transition-all duration-300 hover:bg-surface-primary/40"
            style={{ height: `${(point / Math.max(...sparkline)) * 100}%` }}
          />
        ))}
                    </div>
                    </div>
  );

  // Real-time Activity Item Component - Updated Typography
  const ActivityItem = ({ activity }: any) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-surface-secondary rounded-lg transition-colors duration-200">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        activity.priority === 'high' ? 'bg-states-error/10 text-states-error' :
        activity.priority === 'medium' ? 'bg-decorative-default/10 text-decorative-default' :
        'bg-text-body/10 text-text-body'
      }`}>
        {activity.type === 'lead' && <Users className="h-4 w-4" />}
        {activity.type === 'call' && <Phone className="h-4 w-4" />}
        {activity.type === 'task' && <CheckCircle className="h-4 w-4" />}
        {activity.type === 'meeting' && <Calendar className="h-4 w-4" />}
        {activity.type === 'deal' && <DollarSign className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-heading truncate">
          {activity.action}
        </p>
        <p className="text-xs text-text-body truncate font-medium">
          {activity.details}
        </p>
        <p className="text-xs text-text-body/60 font-normal">
          {activity.time}
                                </p>
                              </div>
      {activity.priority === 'high' && (
        <div className="w-2 h-2 bg-states-error rounded-full"></div>
                      )}
                    </div>
  );

  // AI Insight Card Component - Updated Typography
  const InsightCard = ({ insight }: any) => (
    <div className={`p-4 rounded-xl border-l-4 ${
      insight.priority === 'high' ? 'bg-states-error/10 border-states-error' :
      insight.priority === 'medium' ? 'bg-decorative-default/10 border-decorative-default' :
      'bg-text-body/10 border-text-body'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${
          insight.priority === 'high' ? 'bg-states-error/20 text-states-error' :
          insight.priority === 'medium' ? 'bg-decorative-default/20 text-decorative-default' :
          'bg-text-body/20 text-text-body'
        }`}>
          <Brain className="h-4 w-4" />
                          </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-text-heading mb-1 tracking-tight">
            {insight.title}
          </h4>
          <p className="text-sm text-text-body mb-2 font-normal">
            {insight.description}
          </p>
          <button className="text-xs font-semibold text-decorative-default hover:text-decorative-default/80 transition-colors tracking-wide">
            {insight.action} →
                      </button>
                          </div>
                        </div>
                          </div>
  );

  return (
    <LoadingState
      loading={authLoading}
      error={authError}
      type="page"
      message="Loading dashboard..."
    >
      <div className="min-h-screen bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-primary">
        {/* Theme Test - Remove after verification */}
        <div className="p-4 bg-surface-primary border border-surface-secondary m-4 rounded-lg">
          <h3 className="text-lg font-bold text-text-heading mb-2">Theme Test</h3>
          <div className="space-y-2">
            <div className="p-2 bg-primary-default text-primary-on-primary rounded">Primary Button</div>
            <div className="p-2 bg-secondary-default text-secondary-on-secondary rounded">Secondary Button</div>
            <div className="p-2 bg-states-success text-text-on-dark rounded">Success State</div>
            <div className="p-2 bg-states-error text-text-on-dark rounded">Error State</div>
            <div className="p-2 bg-decorative-default text-text-on-dark rounded">Decorative Color</div>
          </div>
        </div>
        
        {/* TOP SECTION: Enhanced KPI Cards with Blue Gradient Background */}
        <div className="relative bg-gradient-to-r from-obsidian-veil via-charcoal-tint to-obsidian-veil text-text-on-dark">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-6 py-8">
            {/* Header with Controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <h1 className="text-4xl text-text-on-dark font-bold tracking-tighter">Command Center</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-states-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-text-on-dark font-semibold tracking-wide">Live Data</span>
                        </div>
                      </div>
                      
              {/* Dashboard Controls */}
                        <div className="flex items-center space-x-3">
                {/* Timeframe Selector */}
                <select 
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="bg-surface-primary/10 backdrop-blur-sm text-text-on-dark border border-surface-primary/20 rounded-lg px-3 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary-default/50"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
                
                {/* Real-time Toggle */}
                <button
                  onClick={() => setRealTimeMode(!realTimeMode)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    realTimeMode 
                      ? 'bg-states-success/20 text-states-success border border-states-success/30' 
                      : 'bg-surface-primary/10 text-text-on-dark border border-surface-primary/20'
                  }`}
                  title={realTimeMode ? 'Real-time enabled' : 'Real-time disabled'}
                >
                  <Activity className="h-4 w-4" />
                </button>
                
                {/* Customization Mode */}
                <button
                  onClick={() => setCustomizationMode(!customizationMode)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    customizationMode 
                      ? 'bg-decorative-default/20 text-decorative-default border border-decorative-default/30' 
                      : 'bg-surface-primary/10 text-text-on-dark border border-surface-primary/20'
                  }`}
                  title="Customize Dashboard"
                >
                  <Settings className="h-4 w-4" />
                </button>
                      </div>
                      </div>
                      
            {/* Enhanced KPI Grid - Updated Typography */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Total Leads"
                value={enhancedKpis.totalLeads.value}
                trend={enhancedKpis.totalLeads.trend}
                sparkline={enhancedKpis.totalLeads.sparkline}
                icon={<Users className="h-6 w-6 text-white" />}
                onClick={() => {/* Navigate to leads */}}
              />
              
              <KPICard
                title="Conversion Rate"
                value={`${enhancedKpis.conversionRate.value}%`}
                trend={enhancedKpis.conversionRate.trend}
                sparkline={enhancedKpis.conversionRate.sparkline}
                icon={<Target className="h-6 w-6 text-white" />}
                onClick={() => {/* Navigate to analytics */}}
              />
              
              <KPICard
                title="Pipeline Value"
                value={`$${(enhancedKpis.pipelineValue.value / 1000).toFixed(0)}K`}
                trend={enhancedKpis.pipelineValue.trend}
                sparkline={enhancedKpis.pipelineValue.sparkline}
                icon={<DollarSign className="h-6 w-6 text-white" />}
                onClick={() => {/* Navigate to pipeline */}}
              />
              
              <KPICard
                title="Active Tasks"
                value={enhancedKpis.activeTasks.value}
                trend={enhancedKpis.activeTasks.trend}
                sparkline={enhancedKpis.activeTasks.sparkline}
                icon={<Clock className="h-6 w-6 text-white" />}
                onClick={() => {/* Navigate to tasks */}}
              />
                        </div>
                        </div>
                      </div>

        {/* MIDDLE SECTION: Visual Analytics - Updated Typography */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Lead Conversion Funnel */}
            <Widget 
              title="Lead Conversion Funnel" 
              className="bg-surface-primary border border-surface-secondary"
              actions={
                <button className="text-sm text-decorative-default hover:text-decorative-default/80 font-semibold">
                  View Details <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              }
            >
                    <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-decorative-default rounded-full"></div>
                    <span className="text-sm font-semibold">New Leads</span>
                          </div>
                  <span className="text-lg text-decorative-default font-bold tracking-tight">1,247</span>
                          </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                        <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-decorative-default/80 rounded-full"></div>
                    <span className="text-sm font-semibold">Qualified</span>
                          </div>
                  <span className="text-lg text-decorative-default font-bold tracking-tight">892</span>
                      </div>
                      
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                        <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-decorative-default/60 rounded-full"></div>
                    <span className="text-sm font-semibold">Proposals</span>
                          </div>
                  <span className="text-lg text-decorative-default font-bold tracking-tight">445</span>
                      </div>
                      
                <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                        <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-decorative-default/40 rounded-full"></div>
                    <span className="text-sm font-semibold">Closed</span>
                          </div>
                  <span className="text-lg text-decorative-default font-bold tracking-tight">234</span>
                      </div>
                    </div>
                  </Widget>

            {/* Revenue Trends Chart */}
            <Widget 
              title="Revenue Trends" 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              actions={
                <button className="text-ui text-blue-600 hover:text-blue-700 font-semibold">
                  View Reports <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              }
            >
                    <div className="space-y-4">
                <div className="flex items-center justify-between">
                            <div>
                    <p className="text-label text-gray-600 dark:text-gray-400 font-medium">Monthly Revenue</p>
                    <p className="text-metric text-gray-900 dark:text-white font-bold tracking-tight">$88.2K</p>
                            </div>
                  <div className="flex items-center text-emerald-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-caption font-bold tracking-wide">+12.5%</span>
                          </div>
                          </div>
                
                {/* Simple Revenue Chart */}
                <div className="h-32 flex items-end space-x-1">
                  {[65, 78, 82, 75, 88, 92, 85, 95, 88, 92, 96, 89].map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-200 dark:bg-blue-600 rounded-sm transition-all duration-300 hover:bg-blue-300 dark:hover:bg-blue-500"
                      style={{ height: `${value}%` }}
                    />
                  ))}
                      </div>
                    </div>
                  </Widget>

            {/* Team Performance */}
            <Widget 
              title="Team Performance" 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              actions={
                <button className="text-ui text-blue-600 hover:text-blue-700 font-semibold">
                  View Team <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              }
            >
                    <div className="space-y-4">
                      {[
                  { name: 'Sarah Johnson', deals: 8, revenue: '$45K', avatar: 'SJ' },
                  { name: 'Mike Chen', deals: 6, revenue: '$32K', avatar: 'MC' },
                  { name: 'Alex Rivera', deals: 4, revenue: '$28K', avatar: 'AR' }
                ].map((member, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {member.avatar}
                    </div>
                            <div className="flex-1">
                      <p className="text-body-small font-semibold text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-caption text-gray-500 dark:text-gray-400 font-medium">{member.deals} deals</p>
                            </div>
                    <div className="text-right">
                      <p className="text-body font-bold text-blue-600 dark:text-blue-400 tracking-tight">{member.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Widget>
                      </div>
                      </div>
                      
        {/* BOTTOM SECTION: Actionable Items - Updated Typography */}
            <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-time Activity Feed */}
            <Widget 
              title="Live Activity Feed" 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              actions={
                <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setRealTimeMode(!realTimeMode)}
                    className={`p-1 rounded ${
                      realTimeMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Activity className="h-3 w-3" />
                </button>
                  <button className="text-ui text-blue-600 hover:text-blue-700 font-semibold">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              }
            >
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {realTimeActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
            </Widget>

            {/* Upcoming Events & Tasks */}
            <Widget 
              title="Upcoming Events" 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              actions={
                <button className="text-ui text-blue-600 hover:text-blue-700 font-semibold">
                  View Calendar <ArrowRight className="ml-1 h-4 w-4" />
                      </button>
              }
            >
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      event.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                      event.type === 'call' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {event.type === 'meeting' && <Calendar className="h-5 w-5" />}
                      {event.type === 'call' && <Phone className="h-5 w-5" />}
                      {event.type === 'task' && <CheckCircle className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-small font-semibold text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-caption text-gray-500 dark:text-gray-400 font-medium">
                        {event.time} • {event.duration}
                      </p>
                  </div>
                    {event.priority === 'high' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
                ))}
                  </div>
            </Widget>

            {/* AI Insights & Quick Actions */}
            <Widget 
              title="AI Insights" 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              actions={
                <button className="text-ui text-blue-600 hover:text-blue-700 font-semibold">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
              }
            >
              <div className="space-y-3">
                {aiInsights.slice(0, 3).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
                
                {/* Quick Actions */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-body font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-caption font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors tracking-wide">
                      Add Lead
            </button>
                    <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-caption font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors tracking-wide">
                      Schedule Call
            </button>
                    <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-caption font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors tracking-wide">
                      Create Task
            </button>
                    <button className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-caption font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors tracking-wide">
                      Send Report
            </button>
          </div>
        </div>
          </div>
            </Widget>
        </div>
              </div>

        {/* PREMIUM UX FEATURES */}
        
        {/* Floating Action Button for Quick Access */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col space-y-3">
            <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110">
              <Plus className="h-6 w-6" />
              </button>
            <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110">
              <Phone className="h-6 w-6" />
                </button>
            <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110">
              <Bell className="h-6 w-6" />
            </button>
            </div>
                    </div>

        {/* Customization Panel (when in customization mode) */}
        {customizationMode && (
          <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-40 transform transition-transform duration-300">
            <div className="p-6">
              <h3 className="text-title font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Customize Dashboard</h3>
              
              {/* Widget Visibility */}
              <div className="space-y-4">
                <h4 className="text-label font-semibold text-gray-700 dark:text-gray-300 tracking-wide">Widget Visibility</h4>
                {['KPI Cards', 'Activity Feed', 'Revenue Chart', 'Team Performance', 'AI Insights'].map((widget) => (
                  <label key={widget} className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-body-small font-medium text-gray-900 dark:text-white">{widget}</span>
                      </label>
                    ))}
                  </div>
              
              {/* Role-based Views */}
              <div className="mt-6">
                <h4 className="text-label font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wide">Role-based View</h4>
                <select 
                  value={roleBasedView}
                  onChange={(e) => setRoleBasedView(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-body font-medium text-gray-900 dark:text-white"
                >
                  <option value="founder">Founder View</option>
                  <option value="manager">Manager View</option>
                  <option value="sales">Sales View</option>
                  <option value="admin">Admin View</option>
                </select>
                        </div>
                      </div>
                    </div>
      )}
      </div>
    </LoadingState>
  );
};

export default Dashboard;