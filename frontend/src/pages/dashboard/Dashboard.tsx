import React, { useState, useEffect, useCallback } from 'react';
import { useLayout } from '../../components/layout/DashboardLayout';
import { useAuthLoading } from '../../hooks/useAuthLoading';
import LoadingState from '../../components/common/LoadingState';
import { dashboardApi, journeysApi, journeyColumnsApi } from '../../lib/api';
import { TrendingUp, Users, DollarSign, Settings, Activity, ArrowRight, RefreshCw, Target, Clock, Phone, CheckCircle, Calendar, Bell, BarChart3, Plus, Brain } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';



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

const Dashboard = () => {
  const { setHeader } = useLayout();
  const { user, loading: authLoading, error: authError } = useAuthLoading();
  const { theme } = useTheme();
  
  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>([]);
  // const [modalCard, setModalCard] = useState<JourneyCard | null>(null);
  const [editCard, setEditCard] = useState<{ colIdx: number; cardIdx: number; card: JourneyCard } | null>(null);
  const [deleteCard, setDeleteCard] = useState<{ colIdx: number; cardIdx: number; card: JourneyCard } | null>(null);
  const [addCardCol, setAddCardCol] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCards, setPendingCards] = useState<string[]>([]);
  const [dragVersion, setDragVersion] = useState(0);
  const [tempId, setTempId] = useState(0);
  const [kpis, setKpis] = useState<any>(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  
  // Add dashboard layer state
  // Simplified UI state
  const [dashboardLayer] = useState<'overview' | 'analytics' | 'team' | 'automation' | 'insights'>('overview');
  const [sidebarExpanded] = useState(false);

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
  const [drawerTab] = useState<'Details' | 'Subtasks' | 'Comments' | 'Activity'>('Details');
  const [drawerDescription] = useState('');
  const [activeTab] = useState<'overview' | 'journeys'>('overview');
  const [journeyView] = useState<'kanban' | 'list'>('kanban');
  const [journeySearchTerm] = useState('');
  const [journeySortBy] = useState<'name' | 'value' | 'date'>('name');

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

  const [journeys, setJourneys] = useState<any[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<any | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(true);
  const [showCreateJourney, setShowCreateJourney] = useState(false);
  const [newJourneyName, setNewJourneyName] = useState('');
  const [newJourneyDesc, setNewJourneyDesc] = useState('');

  // Dynamic columns state
  type JourneyColumn = { id: string; name: string; position: number };
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
      const response = await dashboardApi.createJourneyCard({
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
      const response = await dashboardApi.updateJourneyCard(editCard.card.id, {
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
      const response = await dashboardApi.deleteJourneyCard(deleteCard.card.id);
      
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
  const onDragEnd = useCallback(async (result: any) => {
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
      const response = await dashboardApi.reorderJourneyCards({
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
      const response = await dashboardApi.createJourneyCard({
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

        const isDevelopment = window.location.hostname === '192.168.1.249' || window.location.hostname === 'localhost';
        if (isDevelopment) {
          setKpis({
            totalLeads: { value: 1247, trend: 12.5, sparkline: [12, 19, 15, 22, 18, 24, 20] },
            newLeadsToday: { value: 28, trend: 18.7, sparkline: [8, 12, 15, 18, 22, 25, 28] },
            conversionRate: { value: 24.8, trend: 5.2, sparkline: [68, 72, 75, 78, 82, 85, 88] },
            avgLeadValue: { value: 4500, trend: 8.3, sparkline: [2500, 2800, 3200, 3500, 3800, 4200, 4500] },
            activeTasks: { value: 65, trend: 5.2, sparkline: [45, 52, 48, 55, 62, 58, 65] },
            overdueTasks: { value: 9, trend: -2.7, sparkline: [12, 8, 15, 10, 7, 13, 9] },
            totalRevenue: { value: 88200, trend: 15.8, sparkline: [45000, 52000, 48000, 55000, 62000, 58000, 65000] },
            pipelineValue: { value: 210000, trend: 22.1, sparkline: [120000, 135000, 150000, 165000, 180000, 195000, 210000] }
          });
          setKpisLoading(false);
          return;
        }

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
      title: '',
      breadcrumbs: [],
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
  const onColumnDragEnd = async (result: any) => {
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
  // Removed experimental components for cleanliness

  // const fadeInKeyframes = `@keyframes fadeInCard { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }`;

  // const DragHandle = () => (<span />);

  return (
    <LoadingState
      loading={authLoading}
      error={authError ? String(authError) : null}
      type="page"
      message="Loading dashboard..."
    >
      <div className="min-h-screen bg-surface-secondary">
        
        {/* TOP SECTION: Premium Header with Glass Morphism */}
        <div className="relative">
          <div className="relative px-8 py-10">
            {/* Header with Enhanced Controls */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-text-heading mb-1">Welcome back</h1>
                  <p className="text-sm text-text-secondary">
                    Your business command center is ready
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-surface-primary rounded-full px-3 py-1 border border-fields-border">
                  <div className="w-2 h-2 bg-states-success rounded-full"></div>
                  <span className="text-xs text-text-secondary font-medium">Real-time sync</span>
                </div>
              </div>
                      
              {/* Premium Dashboard Controls */}
              <div className="flex items-center space-x-4">
                {/* Timeframe Selector */}
                <div className="relative">
                  <select 
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                    className="bg-surface-primary text-text-heading border border-fields-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-default/30 appearance-none pr-8 cursor-pointer"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                  <ArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
                
                {/* Action Buttons */}
                <button onClick={() => setRealTimeMode(!realTimeMode)}
                  className={`p-2 rounded-lg border ${realTimeMode ? 'bg-surface-primary text-states-success border-fields-border' : 'bg-surface-primary text-text-secondary border-fields-border'}`}
                  title={realTimeMode ? 'Real-time enabled' : 'Real-time disabled'}>
                  <Activity className="h-4 w-4" />
                </button>
                
                <button onClick={() => setCustomizationMode(!customizationMode)}
                  className="p-2 rounded-lg border bg-surface-primary text-text-secondary border-fields-border"
                  title="Customize Dashboard">
                  <Settings className="h-4 w-4" />
                </button>
                
                <button className="p-2 bg-primary-default hover:bg-primary-shade text-primary-on-primary rounded-lg">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
                      
            {/* Premium KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Leads Card */}
              <div className="group relative">
                <div className="relative bg-surface-primary rounded-xl p-5 border border-fields-border shadow-sm cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+12.5%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">1,247</p>
                    <p className="text-sm text-slate-600 font-medium">Total Leads</p>
                  </div>
                  <div className="mt-4 flex items-end space-x-1 h-8">
                    {[12, 19, 15, 22, 18, 24, 20].map((height, i) => (
                      <div key={i} className="flex-1 bg-blue-200 rounded-sm transition-all duration-300 hover:bg-blue-300" style={{ height: `${height * 2}px` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Conversion Rate Card */}
              <div className="group relative">
                <div className="relative bg-surface-primary rounded-xl p-5 border border-fields-border shadow-sm cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+5.2%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">24.8%</p>
                    <p className="text-sm text-slate-600 font-medium">Conversion Rate</p>
                  </div>
                  <div className="mt-4 flex items-end space-x-1 h-8">
                    {[68, 72, 75, 78, 82, 85, 88].map((height, i) => (
                      <div key={i} className="flex-1 bg-emerald-200 rounded-sm transition-all duration-300 hover:bg-emerald-300" style={{ height: `${height / 2}px` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Pipeline Value Card */}
              <div className="group relative">
                <div className="relative bg-surface-primary rounded-xl p-5 border border-fields-border shadow-sm cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+22.1%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">$210K</p>
                    <p className="text-sm text-slate-600 font-medium">Pipeline Value</p>
                  </div>
                  <div className="mt-4 flex items-end space-x-1 h-8">
                    {[45, 52, 48, 55, 62, 58, 65].map((height, i) => (
                      <div key={i} className="flex-1 bg-purple-200 rounded-sm transition-all duration-300 hover:bg-purple-300" style={{ height: `${height / 2}px` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Tasks Card */}
              <div className="group relative">
                <div className="relative bg-surface-primary rounded-xl p-5 border border-fields-border shadow-sm cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+5.2%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">65</p>
                    <p className="text-sm text-slate-600 font-medium">Active Tasks</p>
                  </div>
                  <div className="mt-4 flex items-end space-x-1 h-8">
                    {[45, 52, 48, 55, 62, 58, 65].map((height, i) => (
                      <div key={i} className="flex-1 bg-orange-200 rounded-sm transition-all duration-300 hover:bg-orange-300" style={{ height: `${height / 2}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Premium Analytics Dashboard */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Lead Conversion Funnel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Lead Pipeline</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-700">New Leads</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">1,247</span>
                  </div>
                  <div className="absolute -bottom-2 left-8 w-px h-4 bg-slate-300"></div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-700">Qualified</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-600">892</span>
                  </div>
                  <div className="absolute -bottom-2 left-8 w-px h-4 bg-slate-300"></div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-700">Proposals</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">445</span>
                  </div>
                  <div className="absolute -bottom-2 left-8 w-px h-4 bg-slate-300"></div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-slate-700">Closed Won</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">234</span>
                </div>
              </div>
            </div>

            {/* Revenue Trends Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Revenue Trends</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                  <span>View Reports</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">$88.2K</p>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">+12.5%</span>
                  </div>
                </div>
                
                {/* Enhanced Revenue Chart */}
                <div className="h-32 flex items-end space-x-2">
                  {[65, 78, 82, 75, 88, 92, 85, 95, 88, 92, 96, 89].map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer relative"
                        style={{ height: `${value}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          ${(value * 1.2).toFixed(0)}K
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 mt-2">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Team Performance</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                  <span>View Team</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Sarah Johnson', deals: 8, revenue: '$45K', avatar: 'SJ', trend: '+15%', color: 'emerald' },
                  { name: 'Mike Chen', deals: 6, revenue: '$32K', avatar: 'MC', trend: '+8%', color: 'blue' },
                  { name: 'Alex Rivera', deals: 4, revenue: '$28K', avatar: 'AR', trend: '+5%', color: 'purple' }
                ].map((member, index) => (
                  <div key={index} className="group flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 cursor-pointer">
                    <div className={`w-12 h-12 bg-gradient-to-br ${
                      member.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                      member.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      'from-purple-500 to-purple-600'
                    } rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-600">{member.deals} deals closed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{member.revenue}</p>
                      <p className="text-sm text-emerald-600 font-medium">{member.trend}</p>
                    </div>
                    <div className="w-2 h-8 bg-gradient-to-t from-slate-200 to-slate-300 rounded-full overflow-hidden">
                      <div className={`w-full bg-gradient-to-t ${
                        member.color === 'emerald' ? 'from-emerald-400 to-emerald-500' :
                        member.color === 'blue' ? 'from-blue-400 to-blue-500' :
                        'from-purple-400 to-purple-500'
                      } rounded-full transition-all duration-300`} style={{ height: `${(member.deals / 10) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
                      
        {/* BOTTOM SECTION: Premium Activity Dashboard */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-time Activity Feed */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-slate-900">Live Activity</h3>
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    realTimeMode ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {realTimeActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer group">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                      activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    } group-hover:scale-110 transition-transform duration-200`}>
                      {activity.type === 'lead' && <Users className="h-5 w-5" />}
                      {activity.type === 'call' && <Phone className="h-5 w-5" />}
                      {activity.type === 'task' && <CheckCircle className="h-5 w-5" />}
                      {activity.type === 'meeting' && <Calendar className="h-5 w-5" />}
                      {activity.type === 'deal' && <DollarSign className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {activity.details}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    {activity.priority === 'high' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events & Tasks */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Upcoming Events</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                  <span>View Calendar</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="group flex items-center space-x-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200 ${
                      event.type === 'meeting' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                      event.type === 'call' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' :
                      'bg-gradient-to-br from-slate-500 to-slate-600 text-white'
                    }`}>
                      {event.type === 'meeting' && <Calendar className="h-6 w-6" />}
                      {event.type === 'call' && <Phone className="h-6 w-6" />}
                      {event.type === 'task' && <CheckCircle className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        {event.time} • {event.duration}
                      </p>
                      {event.attendees > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          {event.attendees} attendees
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {event.priority === 'high' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.priority === 'high' ? 'bg-red-100 text-red-700' :
                        event.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {event.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights & Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-bold text-slate-900">AI Insights</h3>
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {aiInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                    insight.priority === 'high' ? 'bg-red-50 border-red-500 hover:bg-red-100' :
                    insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100' :
                    'bg-blue-50 border-blue-500 hover:bg-blue-100'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-600' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-slate-600 mb-2">
                          {insight.description}
                        </p>
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                          {insight.action} →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Quick Actions */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="font-semibold text-slate-900 mb-4">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-semibold text-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 group">
                      <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>Add Lead</span>
                    </button>
                    <button className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-sm font-semibold text-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2 group">
                      <Phone className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>Schedule Call</span>
                    </button>
                    <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-sm font-semibold text-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2 group">
                      <CheckCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>Create Task</span>
                    </button>
                    <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-xl text-sm font-semibold text-orange-700 transition-colors duration-200 flex items-center justify-center space-x-2 group">
                      <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>Send Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="flex flex-col space-y-4">
            {/* Main FAB */}
            <button className="group relative p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl">
              <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white text-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Quick Add
              </div>
            </button>
            
            {/* Secondary FABs */}
            <button className="group relative p-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105">
              <Phone className="h-5 w-5" />
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white text-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Make Call
              </div>
            </button>
            
            <button className="group relative p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105">
              <Bell className="h-5 w-5" />
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white text-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Notifications
              </div>
            </button>
          </div>
        </div>

        {/* Premium Customization Sidebar */}
        {customizationMode && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-40 transform transition-transform duration-300 border-l border-slate-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">Customize Dashboard</h3>
                <button 
                  onClick={() => setCustomizationMode(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <ArrowRight className="h-5 w-5 text-slate-600" />
                </button>
              </div>
              
              {/* Widget Visibility */}
              <div className="space-y-6 mb-8">
                <h4 className="text-lg font-semibold text-slate-900">Widget Visibility</h4>
                {['KPI Cards', 'Activity Feed', 'Revenue Chart', 'Team Performance', 'AI Insights'].map((widget) => (
                  <label key={widget} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                    <span className="font-medium text-slate-900">{widget}</span>
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                  </label>
                ))}
              </div>
              
              {/* Role-based Views */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Role-based View</h4>
                <select 
                  value={roleBasedView}
                  onChange={(e) => setRoleBasedView(e.target.value as any)}
                  className="w-full p-4 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="founder">👑 Founder View</option>
                  <option value="manager">👔 Manager View</option>
                  <option value="sales">💼 Sales View</option>
                  <option value="admin">⚙️ Admin View</option>
                </select>
              </div>

              {/* Theme Preferences */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Theme Preferences</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 transition-colors duration-200">
                    <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md mb-2"></div>
                    <span className="text-xs font-medium text-blue-700">Blue</span>
                  </button>
                  <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors duration-200">
                    <div className="w-full h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md mb-2"></div>
                    <span className="text-xs font-medium text-purple-700">Purple</span>
                  </button>
                  <button className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors duration-200">
                    <div className="w-full h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-md mb-2"></div>
                    <span className="text-xs font-medium text-emerald-700">Green</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingState>
  );
};

export default Dashboard;