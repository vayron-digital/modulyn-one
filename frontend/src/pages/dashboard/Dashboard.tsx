import React, { useState, useEffect, useCallback } from 'react';
import { useLayout } from '../../components/layout/DashboardLayout';
import styles from '../../components/layout/DashboardLayout.module.css';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useAuth } from '../../contexts/AuthContext';
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
import { Plus } from 'lucide-react';

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
  green: '#7be7b0',
  blue: '#4371c5',
  red: '#e37e55',
  yellow: '#f7d794'
};

const fadeInKeyframes = `@keyframes fadeInCard { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }`;

const DragHandle = () => (
  <span style={{ cursor: 'grab', marginRight: 10, fontSize: 20, color: '#bbb', userSelect: 'none', display: 'flex', alignItems: 'center' }} title="Drag">
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
  const { user } = useAuth();
  
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
    async function fetchKPIs() {
      try {
        setKpisLoading(true);
        setKpisError(null);
        const response = await dashboardApi.getKPIs();
        if (response.data && response.data.success) {
          setKpis(response.data.data);
        }
      } catch (err) {
        setKpisError('Failed to load analytics.');
      } finally {
        setKpisLoading(false);
      }
    }
    fetchKPIs();
  }, []);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setRecentActivityLoading(true);
        setRecentActivityError(null);
        // TODO: Replace with real API call if available
        // const response = await api.get('/dashboard/recent-activity');
        // setRecentActivity(response.data.data);
        setRecentActivity([
          { icon: '🟢', text: 'Lead added: John Doe', time: '2 hours ago', avatar: '/default-avatar.png' },
          { icon: '📞', text: 'Cold call made: Acme Corp', time: '3 hours ago', avatar: '/default-avatar.png' },
          { icon: '✅', text: 'Task completed: Follow up', time: '5 hours ago', avatar: '/default-avatar.png' },
          { icon: '🏷️', text: 'Status changed: Lead to Opportunity', time: 'Yesterday', avatar: '/default-avatar.png' },
          { icon: '📄', text: 'Document uploaded: NDA.pdf', time: 'Yesterday', avatar: '/default-avatar.png' },
        ]);
      } catch (err) {
        setRecentActivityError('Failed to load recent activity.');
      } finally {
        setRecentActivityLoading(false);
      }
    }
    fetchRecentActivity();
  }, []);

  React.useEffect(() => {
    if (user) {
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
  }, [user, setHeader, fetchJourneyCards]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Hero Section with Floating KPIs */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm">Live Data</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'overview' 
                    ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('journeys')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'journeys' 
                    ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Customer Journeys
              </button>
            </div>
          </div>

          {/* Floating KPIs */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Total Leads</p>
                  <p className="text-3xl font-bold text-white">{kpis?.totalLeads ?? 0}</p>
                  <p className="text-xs text-slate-300 mt-1">+12.5% from last month</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Avg Lead Value</p>
                  <p className="text-3xl font-bold text-white">$0.00</p>
                  <p className="text-xs text-slate-300 mt-1">+8.3% from last month</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Avg Leads/Day</p>
                  <p className="text-3xl font-bold text-white">0.00</p>
                  <p className="text-xs text-slate-300 mt-1">+15.2% from last month</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Total Quotations</p>
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-xs text-slate-300 mt-1">+5.7% from last month</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <svg className="h-6 w-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Enhanced Bento Grid Dashboard */}
          <div className="p-6">
            <div
              className="grid grid-cols-6 gap-6"
              style={{
                gridTemplateRows: 'masonry',
                alignItems: 'stretch',
                gridAutoRows: 'minmax(120px, auto)',
              }}
            >
              {/* Revenue Overview - Big Bento */}
              <div className="col-span-4 row-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Revenue Overview</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600">Live</span>
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl opacity-80"></div>
                      <svg className="relative w-8 h-8 text-slate-400 mx-auto mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">No data yet</p>
                    <p className="text-xs text-slate-400 mt-1">Revenue chart will appear here</p>
                  </div>
                </div>
              </div>

              {/* Total Leads - Tall Bento */}
              <div className="col-span-2 row-span-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-900">Total Leads</h3>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <svg className="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-900 mb-2">{kpis?.totalLeads ?? 0}</div>
                <p className="text-sm text-blue-700">+12.5% from last month</p>
              </div>

              {/* Average Lead Value - Small Bento */}
              <div className="col-span-2 row-span-1 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">Avg Lead Value</h3>
                    <div className="text-2xl font-bold text-emerald-900">$0.00</div>
                  </div>
                  <div className="p-2 bg-emerald-200 rounded-lg">
                    <svg className="h-5 w-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Average Leads/Day - Small Bento */}
              <div className="col-span-2 row-span-1 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-purple-900">Avg Leads/Day</h3>
                    <div className="text-2xl font-bold text-purple-900">0.00</div>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <svg className="h-5 w-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Quotations - Small Bento */}
              <div className="col-span-1 row-span-1 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-sm font-bold text-orange-900 mb-2">Quotations</h3>
                  <div className="text-xl font-bold text-orange-900">0</div>
                </div>
              </div>

              {/* Total Persons - Small Bento */}
              <div className="col-span-1 row-span-1 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-sm font-bold text-indigo-900 mb-2">Persons</h3>
                  <div className="text-xl font-bold text-indigo-900">0</div>
                </div>
              </div>

              {/* Total Organizations - Small Bento */}
              <div className="col-span-1 row-span-1 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-sm font-bold text-teal-900 mb-2">Organizations</h3>
                  <div className="text-xl font-bold text-teal-900">0</div>
                </div>
              </div>

              {/* Leads Chart - Wide Bento */}
              <div className="col-span-3 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Leads</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600">Live</span>
                  </div>
                </div>
                <div className="h-24 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg opacity-80"></div>
                      <svg className="relative w-6 h-6 text-slate-400 mx-auto mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-slate-600">No data yet</p>
                  </div>
                </div>
              </div>

              {/* Top Products - Small Bento */}
              <div className="col-span-1 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Top Products</h3>
                  <div className="relative w-10 h-10 mx-auto mb-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg opacity-80"></div>
                    <svg className="relative w-5 h-5 text-slate-400 mx-auto mt-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-slate-500 text-xs">No data yet</span>
                </div>
              </div>

              {/* Top Persons - Small Bento */}
              <div className="col-span-1 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Top Persons</h3>
                  <div className="relative w-10 h-10 mx-auto mb-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg opacity-80"></div>
                    <svg className="relative w-5 h-5 text-slate-400 mx-auto mt-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="text-slate-500 text-xs">No data yet</span>
                </div>
              </div>

              {/* Open Leads By Stages - Tall Bento */}
              <div className="col-span-2 row-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Open Leads By Stages</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600">Live</span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl opacity-80"></div>
                      <svg className="relative w-10 h-10 text-slate-400 mx-auto mt-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">No data yet</p>
                    <p className="text-xs text-slate-400 mt-1">Lead stages will appear here</p>
                  </div>
                </div>
              </div>

              {/* Revenue By Sources - Tall Bento */}
              <div className="col-span-2 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Revenue By Sources</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600">Live</span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg opacity-80"></div>
                      <svg className="relative w-8 h-8 text-slate-400 mx-auto mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-slate-600">No data yet</p>
                  </div>
                </div>
              </div>

              {/* Revenue By Types - Tall Bento */}
              <div className="col-span-2 row-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Revenue By Types</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600">Live</span>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg opacity-80"></div>
                      <svg className="relative w-8 h-8 text-slate-400 mx-auto mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-slate-600">No data yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {activeTab === 'journeys' && (
        <>
          {/* Board Selector: Always show this if no journey is selected */}
          {!selectedJourney ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Customer Journeys</h2>
                  <p className="text-slate-600">Track and manage customer interactions across different stages</p>
                </div>
                <button 
                  onClick={handleCreateJourney} 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-none rounded-xl px-6 py-3 font-semibold text-base cursor-pointer shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New Journey</span>
                </button>
              </div>
              {journeyLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl opacity-80 animate-pulse"></div>
                      <svg className="relative w-8 h-8 text-slate-400 mx-auto mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-600 text-lg font-medium">Loading journeys...</p>
                    <p className="text-slate-500 text-sm mt-1">Please wait while we fetch your data</p>
                  </div>
                </div>
              ) : journeys.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl opacity-80"></div>
                    <svg className="relative w-12 h-12 text-slate-400 mx-auto mt-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="text-slate-600 text-xl mb-2 font-semibold">No journeys yet</div>
                  <div className="text-slate-500 mb-6">Create your first customer journey board to get started!</div>
                  <button 
                    onClick={handleCreateJourney}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-none rounded-xl px-6 py-3 font-semibold text-base cursor-pointer shadow-lg transition-all duration-300"
                  >
                    Create Your First Journey
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {journeys.map(journey => (
                    <div 
                      key={journey.id} 
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 cursor-pointer border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-slate-300/50 hover:bg-white/90" 
                      onClick={() => setSelectedJourney(journey)} 
                      tabIndex={0} 
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedJourney(journey); }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="font-bold text-xl text-slate-900 group-hover:text-slate-800 transition-colors mb-2">{journey.name}</div>
                          <div className="text-slate-600 text-sm mb-4 line-clamp-2">{journey.description || 'No description provided'}</div>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-slate-500 text-xs">
                          Created {new Date(journey.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-slate-500">Active</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Create Journey Modal */}
              {showCreateJourney && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowCreateJourney(false)}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 min-w-[450px] max-w-md border border-slate-200/50" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h2 className="font-bold text-2xl text-slate-900">Create New Journey</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Journey Name</label>
                        <input 
                          className="w-full text-lg p-4 rounded-xl border border-slate-200/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white/50 backdrop-blur-sm" 
                          value={newJourneyName} 
                          onChange={e => setNewJourneyName(e.target.value)} 
                          placeholder="Enter journey name..." 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description (optional)</label>
                        <textarea 
                          className="w-full text-sm p-4 rounded-xl border border-slate-200/50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none bg-white/50 backdrop-blur-sm" 
                          value={newJourneyDesc} 
                          onChange={e => setNewJourneyDesc(e.target.value)} 
                          placeholder="Describe your customer journey..." 
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-8">
                      <button 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-none rounded-xl px-6 py-3 font-semibold text-base cursor-pointer transition-all duration-300 flex-1 shadow-lg hover:shadow-xl" 
                        onClick={handleCreateJourney}
                      >
                        Create Journey
                      </button>
                      <button 
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl px-6 py-3 font-semibold text-base cursor-pointer transition-all duration-300 flex-1" 
                        onClick={() => setShowCreateJourney(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Only show kanban loader if a journey is selected and cards are loading */}
              {loading ? (
                <div style={{ width: '100%', padding: '0 2.5rem 2.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                  <div style={{ textAlign: 'center', color: '#717783' }}>
                    <div style={{ fontSize: 18, marginBottom: 12 }}>Loading journey cards...</div>
                    <div style={{ fontSize: 14 }}>Please wait while we fetch your data</div>
                  </div>
                </div>
              ) : error ? (
                <div style={{ width: '100%', padding: '0 2.5rem 2.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                  <div style={{ textAlign: 'center', color: '#e37e55' }}>
                    <div style={{ fontSize: 18, marginBottom: 12 }}>Error loading data</div>
                    <div style={{ fontSize: 14, marginBottom: 16 }}>{error}</div>
                    <button onClick={handleRetry} style={{ background: '#4371c5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 }}>Retry</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-6 px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
                    <button 
                      onClick={() => setSelectedJourney(null)} 
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold text-lg cursor-pointer transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>All Boards</span>
                    </button>
                    <div className="flex items-center space-x-4">
                      {editingJourneyName ? (
                        <input
                          value={editedJourneyName}
                          onChange={e => setEditedJourneyName(e.target.value)}
                          onBlur={saveJourneyName}
                          onKeyDown={e => { if (e.key === 'Enter') saveJourneyName(); }}
                          autoFocus
                          className="font-bold text-2xl border border-slate-300 rounded-lg px-3 py-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      ) : (
                        <h2 
                          className="font-bold text-2xl text-slate-900 cursor-pointer hover:text-slate-700 transition-colors duration-200" 
                          onClick={() => {
                            setEditingJourneyName(true);
                            setEditedJourneyName(selectedJourney.name);
                          }}
                        >
                          {selectedJourney.name}
                        </h2>
                      )}
                      <div className="flex items-center space-x-2 text-slate-500 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Created {new Date(selectedJourney.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {/* Kanban board for selected journey */}
                  {selectedJourney && !loading && !error && (
                    <DragDropContext onDragEnd={onDragEnd}>
                      <div className="kanban-scroll-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', scrollSnapType: 'x mandatory', minHeight: '60vh' }} role="list" aria-label="Journey Columns Kanban" tabIndex={0}>
                        {/* Skeleton loader for columns */}
                        {columnsLoading ? (
                          Array.from({ length: 4 }).map((_, idx) => (
                            <div key={`skeleton-${idx}`} style={{ minWidth: '19rem', maxWidth: '22rem', flex: 1, background: '#f8f9fb', borderRadius: '1.25rem', margin: '0 0.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 1.5px 6px rgba(16,30,54,0.06)', border: '2.5px solid #rgb(246, 246, 246)', transition: 'box-shadow 0.2s, border 0.2s', scrollSnapAlign: 'start', opacity: 0.5, minHeight: 400 }} />
                          ))
                        ) : (
                          columns.map((column, colIdx) => (
                            <Droppable key={`column-${column.id}`} droppableId={colIdx.toString()}>
                              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  style={{
                                    minWidth: '19rem',
                                    maxWidth: '22rem',
                                    flex: 1,
                                    background: snapshot.isDraggingOver ? '#f0f4ff' : '#f8f9fb',
                                    borderRadius: '1.25rem',
                                    margin: '0 0.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: snapshot.isDraggingOver ? '0 4px 12px rgba(16,30,54,0.12)' : '0 1.5px 6px rgba(16,30,54,0.06)',
                                    border: snapshot.isDraggingOver ? '2.5px solid #3b82f6' : '2.5px solid #rgb(246, 246, 246)',
                                    transition: 'box-shadow 0.2s, border 0.2s',
                                    scrollSnapAlign: 'start',
                                    minHeight: 400,
                                  }}
                                >
                                  <div style={{ padding: '1.5rem', borderBottom: '1px solid #rgb(246, 246, 246)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#23262F', margin: 0 }}>{column.name}</h3>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>
                                          {journeyStages[colIdx]?.cards.length || 0}
                                        </span>
                                        <button
                                          onClick={() => handleAddCardInstant(colIdx)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#6b7280',
                                            cursor: 'pointer',
                                            fontSize: '1.25rem',
                                            padding: '0.25rem',
                                            borderRadius: '0.375rem',
                                            transition: 'background-color 0.2s',
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                          title="Add Card"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>No description</p>
                                  </div>
                                  <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                      {journeyStages[colIdx]?.cards.map((card, cardIdx) => (
                                        <Draggable key={`card-${card.id}`} draggableId={card.id.toString()} index={cardIdx}>
                                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              style={{
                                                ...provided.draggableProps.style,
                                                background: snapshot.isDragging ? '#ffffff' : '#ffffff',
                                                borderRadius: '0.75rem',
                                                padding: '1rem',
                                                boxShadow: snapshot.isDragging ? '0 10px 25px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                                                border: snapshot.isDragging ? '1px solid #rgb(246, 246, 246)' : '1px solid #f3f4f6',
                                                cursor: 'pointer',
                                                outline: card.completed ? '2px solid #7be7b0' : 'none',
                                                zIndex: snapshot.isDragging ? 1000 : undefined,
                                                transition: 'box-shadow 0.18s, border 0.18s',
                                              }}
                                              onClick={() => setModalCard(card)}
                                              role="listitem"
                                              aria-label={card.title}
                                              tabIndex={0}
                                              onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === ' ') setModalCard(card);
                                              }}
                                              title={card.title}
                                            >
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                                                <span {...provided.dragHandleProps} style={{ flexShrink: 0, cursor: 'grab', color: '#bbb', fontSize: 20 }} title="Drag" tabIndex={0} aria-label="Drag card" />
                                                <span style={{ fontWeight: 700, fontSize: 16, flex: 1, color: '#23262F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.title}</span>
                                              </div>
                                              {/* Tag Row - TODO: Use real tags when backend supports it */}
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 2 }}>
                                                <span style={{ background: '#eaf0fa', color: '#3b82f6', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px' }}>property</span>
                                                <span style={{ background: '#eaf0fa', color: '#23262F', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px' }}>realtor</span>
                                                <span style={{ background: '#eaf0fa', color: '#8b5cf6', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '2px 10px' }}>tenants</span>
                                              </div>
                                              {/* Value Row - TODO: Use real value when backend supports it */}
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                                <span style={{ background: '#fff0f0', color: '#e37e55', fontWeight: 700, fontSize: 15, borderRadius: 8, padding: '2px 12px', border: '1.5px solid #e37e55' }}>BHK</span>
                                                <span style={{ background: '#fff0f0', color: '#e37e55', fontWeight: 700, fontSize: 15, borderRadius: 8, padding: '2px 12px', border: '1.5px solid #e37e55' }}>{(card.value ?? 0).toLocaleString()} EUR</span>
                                              </div>
                                              {/* Bottom Row: Task, Assignee, Date - Use real assignee if available */}
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#717783', marginTop: 2 }}>
                                                <span>Task: 10/5</span>
                                                <span style={{ color: '#bbb', fontSize: 18, margin: '0 2px' }}>•</span>
                                                <span>{card.assigned_to || 'Unassigned'}</span>
                                                <span style={{ color: '#bbb', fontSize: 18, margin: '0 2px' }}>•</span>
                                                <span>{card.created_at ? new Date(card.created_at).toLocaleDateString() : '-'}</span>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Droppable>
                          ))
                        )}
                        {/* Add Column Button */}
                        <div style={{ minWidth: '19rem', maxWidth: '22rem', flex: 1, background: '#f8f9fb', borderRadius: '1.25rem', margin: '0 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2.5px dashed #4371c5', cursor: 'pointer', color: '#4371c5', fontWeight: 700, fontSize: 18 }} onClick={() => setAddingColumn(true)}>
                          {addingColumn ? (
                            <div style={{ padding: 24, width: '100%' }}>
                              <input
                                value={newColumnName}
                                onChange={e => setNewColumnName(e.target.value)}
                                onBlur={handleAddColumn}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); }}
                                autoFocus
                                style={{ fontWeight: 700, fontSize: 16, border: '1px solid #rgb(246, 246, 246)', borderRadius: 8, padding: '2px 8px', minWidth: 80, width: '100%' }}
                                placeholder="Column name"
                              />
                            </div>
                          ) : (
                            <span style={{ padding: 24, width: '100%', textAlign: 'center' }}>+ Add Column</span>
                          )}
                        </div>
                      </div>
                    </DragDropContext>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
      {/* Modals */}
      {editCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setEditCard(null)}
        >
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: 'var(--card-shadow)', padding: 36, minWidth: 320, minHeight: 180, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Edit Card</h2>
            <input
              style={{ width: '100%', fontSize: 18, padding: 8, borderRadius: 8, border: '1px solid #rgb(246, 246, 246)', marginBottom: 18 }}
              value={editCard.card.title}
              onChange={e => setEditCard({ ...editCard, card: { ...editCard.card, title: e.target.value } })}
              placeholder="Card Title"
            />
            <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              {(['green', 'blue', 'red', 'yellow'] as const).map(status => (
                <button
                  key={status}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: statusColors[status], border: editCard.card.status === status ? '2px solid #4371c5' : '2px solid #rgb(246, 246, 246)', cursor: 'pointer' }}
                  onClick={() => setEditCard({ ...editCard, card: { ...editCard.card, status } })}
                  title={status.charAt(0).toUpperCase() + status.slice(1)}
                />
              ))}
            </div>
            <button
              style={{ background: '#4371c5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginRight: 12 }}
              onClick={handleEditSave}
            >
              Save
            </button>
            <button
              style={{ background: '#eee', color: '#23262F', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}
              onClick={() => setEditCard(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {deleteCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setDeleteCard(null)}
        >
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: 'var(--card-shadow)', padding: 36, minWidth: 320, minHeight: 120, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Delete Card?</h2>
            <div style={{ color: '#717783', fontSize: 16, marginBottom: 18 }}>Are you sure you want to delete "{deleteCard.card.title}"?</div>
            <button
              style={{ background: '#e37e55', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginRight: 12 }}
              onClick={handleDeleteCard}
            >
              Delete
            </button>
            <button
              style={{ background: '#eee', color: '#23262F', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}
              onClick={() => setDeleteCard(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {addCardCol !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setAddCardCol(null)}
        >
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: 'var(--card-shadow)', padding: 36, minWidth: 320, minHeight: 120, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Add New Card</h2>
            <input
              style={{ width: '100%', fontSize: 18, padding: 8, borderRadius: 8, border: '1px solid #rgb(246, 246, 246)', marginBottom: 18 }}
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              placeholder="Card Title"
            />
            <button
              style={{ background: '#4371c5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginRight: 12 }}
              onClick={handleAddCardModal}
            >
              Add
            </button>
            <button
              style={{ background: '#eee', color: '#23262F', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}
              onClick={() => setAddCardCol(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Right-side drawer for card details */}
      {modalCard && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.18)',
              zIndex: 9998,
              transition: 'background 0.3s',
            }}
            onClick={() => setModalCard(null)}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: 480,
              maxWidth: '100vw',
              background: '#fff',
              boxShadow: '-8px 0 32px rgba(16,30,54,0.13)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              transform: 'translateX(0)',
              transition: 'transform 0.45s cubic-bezier(.4,1.2,.6,1)',
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '28px 32px 0 32px', borderTopLeftRadius: 24, background: '#fff', position: 'sticky', top: 0, zIndex: 10
            }}>
              <div style={{ fontWeight: 700, fontSize: 22, flex: 1 }}>
                <input
                  style={{
                    fontWeight: 700, fontSize: 22, border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#23262F',
                  }}
                  value={modalCard.title}
                  onChange={e => setModalCard({ ...modalCard, title: e.target.value })}
                />
              </div>
              <button
                style={{
                  background: 'none', border: 'none', fontSize: 28, color: '#bbb', cursor: 'pointer', marginLeft: 12
                }}
                onClick={() => setModalCard(null)}
                title="Close"
              >
                ×
              </button>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid #f0f1f3', margin: '18px 0 0 0', padding: '0 32px' }}>
              {['Details', 'Subtasks', 'Comments', 'Activity'].map(tab => (
                <button
                  key={tab}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 16,
                    color: tab === drawerTab ? '#4371c5' : '#717783',
                    borderBottom: tab === drawerTab ? '2.5px solid #4371c5' : '2.5px solid transparent',
                    cursor: 'pointer',
                    transition: 'color 0.18s, border 0.18s',
                  }}
                  onClick={() => setDrawerTab(tab as any)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div style={{ flex: 1, padding: '24px 32px 32px 32px', overflowY: 'auto' }}>
              {/* Details Tab */}
              {drawerTab === 'Details' && (
                <>
                  {/* Assignees */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Assignees</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Mock avatars */}
                      {[{ name: 'Jane Doe', avatar: '/default-avatar.png' }, { name: 'John Smith', avatar: '/default-avatar.png' }].map(user => (
                        <span key={user.name} title={user.name} style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid #rgb(246, 246, 246)', background: '#f7f8fa' }}>
                          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </span>
                      ))}
                      <button style={{ width: 32, height: 32, borderRadius: '50%', background: '#eaf0fa', border: 'none', color: '#4371c5', fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                  {/* Tags */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Tags</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {/* Mock tags */}
                      {[{ label: 'Dashboard', color: '#eaf0fa', text: '#4371c5' }, { label: 'Medium', color: '#fbeee6', text: '#e37e55' }].map(tag => (
                        <span key={tag.label} style={{ background: tag.color, color: tag.text, borderRadius: 12, padding: '2px 14px', fontSize: 13, fontWeight: 600 }}>{tag.label}</span>
                      ))}
                      <button style={{ background: '#f7f8fa', border: 'none', borderRadius: 12, padding: '2px 10px', fontSize: 15, color: '#4371c5', fontWeight: 600, cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                  {/* Description */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Description</div>
                    <textarea
                      style={{ width: '100%', minHeight: 64, fontSize: 15, borderRadius: 8, border: '1px solid #rgb(246, 246, 246)', padding: 10, resize: 'vertical', fontFamily: 'inherit', color: '#23262F' }}
                      value={drawerDescription || 'This is a sample description. Click to edit.'}
                      onChange={e => setDrawerDescription(e.target.value)}
                    />
                  </div>
                  {/* Attachments */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Attachments</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Mock attachments */}
                      <span style={{ background: '#f7f8fa', borderRadius: 8, padding: '6px 12px', fontSize: 14, color: '#4371c5', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" fill="none" stroke="#4371c5" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8"/><rect width="16" height="12" x="4" y="7" rx="2"/><path d="M8 21h8"/></svg>
                        Design brief.pdf
                        <button style={{ background: 'none', border: 'none', color: '#e37e55', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} title="Remove">×</button>
                      </span>
                      <span style={{ background: '#f7f8fa', borderRadius: 8, padding: '6px 12px', fontSize: 14, color: '#e37e55', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" fill="none" stroke="#e37e55" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8"/><rect width="16" height="12" x="4" y="7" rx="2"/><path d="M8 21h8"/></svg>
                        Logo.ai
                        <button style={{ background: 'none', border: 'none', color: '#e37e55', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} title="Remove">×</button>
                      </span>
                      <button style={{ background: '#eaf0fa', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 15, color: '#4371c5', fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
                    </div>
                  </div>
                </>
              )}
              {/* Subtasks Tab */}
              {drawerTab === 'Subtasks' && (
                <>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Subtasks</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Mock subtasks */}
                    {[{ text: 'Design wireframes', done: true }, { text: 'Review with team', done: false }].map((sub, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: sub.done ? '#7be7b0' : '#23262F', textDecoration: sub.done ? 'line-through' : 'none', fontWeight: 500 }}>
                        <input type="checkbox" checked={sub.done} style={{ accentColor: '#4371c5', width: 18, height: 18 }} readOnly />
                        {sub.text}
                        <button style={{ background: 'none', border: 'none', color: '#bbb', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginLeft: 8 }} title="Remove">×</button>
                      </label>
                    ))}
                    <button style={{ background: '#eaf0fa', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 15, color: '#4371c5', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>+ Add Subtask</button>
                  </div>
                </>
              )}
              {/* Comments Tab */}
              {drawerTab === 'Comments' && (
                <>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Comments</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Mock comments */}
                    {[{ user: 'Jane Doe', avatar: '/default-avatar.png', text: 'Great work!', time: '2h ago' }, { user: 'John Smith', avatar: '/default-avatar.png', text: 'Let\'s review this tomorrow.', time: '1h ago' }].map((c, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <img src={c.avatar} alt={c.user} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #rgb(246, 246, 246)', marginTop: 2 }} />
                        <div style={{ background: '#f7f8fa', borderRadius: 12, padding: '10px 14px', fontSize: 15, color: '#23262F', fontWeight: 500, flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{c.user} <span style={{ color: '#b0b6c3', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>{c.time}</span></div>
                          <div>{c.text}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 8 }}>
                      <img src={'/default-avatar.png'} alt="Me" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #rgb(246, 246, 246)', marginTop: 2 }} />
                      <textarea style={{ flex: 1, borderRadius: 12, border: '1px solid #rgb(246, 246, 246)', padding: '10px 14px', fontSize: 15, fontFamily: 'inherit', color: '#23262F', minHeight: 36, resize: 'vertical' }} placeholder="Add a comment..." />
                      <button style={{ background: '#4371c5', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginLeft: 4 }}>Send</button>
                    </div>
                  </div>
                </>
              )}
              {/* Activity Tab */}
              {drawerTab === 'Activity' && (
                <>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Activity</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Mock activity feed */}
                    {[{ icon: '📝', text: 'Edited description', time: '2h ago' }, { icon: '✅', text: 'Completed subtask', time: '1h ago' }].map((a, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#23262F', fontWeight: 500 }}>
                        <span style={{ fontSize: 18 }}>{a.icon}</span>
                        <span>{a.text}</span>
                        <span style={{ color: '#b0b6c3', fontWeight: 400, fontSize: 13, marginLeft: 'auto' }}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

// Add these styles at the bottom of the file
const summaryCardStyle = {
  background: '#fff',
  borderRadius: '1rem',
  boxShadow: 'var(--card-shadow)',
  padding: '1.5rem',
  minHeight: 80,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  fontWeight: 500,
  fontSize: '1rem',
  color: '#23262F',
};
const summaryValueStyle = {
  fontWeight: 700,
  fontSize: '1.5rem',
  color: '#101620',
  marginTop: 6,
};
const sideCardStyle = {
  background: '#fff',
  borderRadius: '1.5rem',
  boxShadow: 'var(--card-shadow)',
  padding: '1.5rem',
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};
const sideCardTitleStyle = {
  fontWeight: 600,
  fontSize: '1rem',
  marginBottom: 12,
  color: '#23262F',
};
const sideCardPlaceholderStyle = {
  color: '#bbb',
  fontSize: 15,
  textAlign: 'center',
};

// Add @keyframes pulse for skeleton shimmer
const style = document.createElement('style');
style.innerHTML = `@keyframes pulse { 0% { opacity: 0.7; } 100% { opacity: 1; } }`;
document.head.appendChild(style);