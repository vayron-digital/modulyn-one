import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
  Bell,
  Repeat,
  Filter,
  Search,
  X,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  Upload,
  HelpCircle,
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '../../components/ui/table';
import { useHotkeys } from 'react-hotkeys-hook';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'appointment';
  lead_id?: string;
  description?: string;
  location?: string;
  status: string;
  color?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  assigned_to?: string;
  created_by?: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface EventConflict {
  event1: Event;
  event2: Event;
  overlap: {
    start: Date;
    end: Date;
  };
}

const TABS = [
  { label: 'All Events', type: null },
  { label: 'Tasks', type: 'task' },
  { label: 'Appointments', type: 'appointment' },
];

const PAGE_SIZE = 10;

const EVENT_DURATION_PRESETS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
  { label: 'All day', value: 24 * 60 },
];

const EVENT_TEMPLATES = [
  {
    name: 'Client Meeting',
    type: 'appointment' as const,
    duration: 60,
    description: 'Meeting with client to discuss requirements',
  },
  {
    name: 'Follow-up Call',
    type: 'task' as const,
    duration: 30,
    description: 'Follow-up call with client',
  },
  {
    name: 'Property Viewing',
    type: 'appointment' as const,
    duration: 120,
    description: 'Property viewing with client',
  },
];

const KEYBOARD_SHORTCUTS = [
  { key: 'n', description: 'Create new event' },
  { key: 'f', description: 'Toggle filters' },
  { key: 'c', description: 'Toggle calendar/list view' },
  { key: 'l', description: 'Switch to list view' },
  { key: 'esc', description: 'Close modal' },
];

const Scheduler = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'All',
    status: 'All',
    assignedTo: 'All',
    dateRange: {
      start: null as Date | null,
      end: null as Date | null,
    },
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<{key: string, direction: 'asc'|'desc'}>({key: 'start', direction: 'asc'});
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [conflicts, setConflicts] = useState<EventConflict[]>([]);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickEventTitle, setQuickEventTitle] = useState('');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      showToast('Please log in to access the scheduler', 'error');
      return;
    }
    fetchEvents();
    fetchLeads();
  }, [user, activeTab, page, sort, filters, viewMode, selectedDate]);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('events')
        .select('*', { count: 'exact' });

      // Apply type filter from tabs
      if (TABS[activeTab].type) {
        query = query.eq('type', TABS[activeTab].type);
      }

      // Apply search
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      // Apply filters
      if (filters.type !== 'All') query = query.eq('type', filters.type);
      if (filters.status !== 'All') query = query.eq('status', filters.status);
      if (filters.assignedTo !== 'All') query = query.eq('assigned_to', filters.assignedTo);
      if (filters.dateRange.start) query = query.gte('start', filters.dateRange.start.toISOString());
      if (filters.dateRange.end) query = query.lte('end', filters.dateRange.end.toISOString());

      // Apply sorting
      query = query.order(sort.key, { ascending: sort.direction === 'asc' });

      // Apply pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        if (error.code === 'PGRST301') {
          showToast('Please log in to access the scheduler', 'error');
        } else {
          throw error;
        }
      }
      
      setEvents(data?.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        recurring: event.recurring ? {
          ...event.recurring,
          endDate: event.recurring.endDate ? new Date(event.recurring.endDate) : undefined
        } : undefined
      })) || []);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name, email, phone, status');

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      showToast('Error fetching leads', 'error');
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string | { start: Date | null; end: Date | null }) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (key: string) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelected(prev => 
      prev.length === events.length ? [] : events.map(e => e.id)
    );
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      task: 'bg-indigo-100 text-indigo-800',
      appointment: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Keyboard shortcuts
  useHotkeys('n', () => handleCreateEvent());
  useHotkeys('f', () => setShowFilters(prev => !prev));
  useHotkeys('esc', () => {
    setShowEventModal(false);
    setShowQuickCreate(false);
  });
  useHotkeys('c', () => setViewMode(prev => prev === 'calendar' ? 'list' : 'calendar'));
  useHotkeys('l', () => setViewMode('list'));

  // Check for event conflicts
  const checkConflicts = useCallback((newEvent: Event) => {
    const conflicts: EventConflict[] = [];
    events.forEach(event => {
      if (event.id === newEvent.id) return;
      
      const overlap = {
        start: new Date(Math.max(newEvent.start.getTime(), event.start.getTime())),
        end: new Date(Math.min(newEvent.end.getTime(), event.end.getTime()))
      };
      
      if (overlap.start < overlap.end) {
        conflicts.push({
          event1: newEvent,
          event2: event,
          overlap
        });
      }
    });
    
    setConflicts(conflicts);
    return conflicts.length > 0;
  }, [events]);

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const event = events.find(e => e.id === result.draggableId);
    if (!event) return;
    
    const newStart = new Date(event.start);
    const newEnd = new Date(event.end);
    const duration = event.end.getTime() - event.start.getTime();
    
    // Calculate new date based on drop position
    const daysDiff = destination.droppableId - source.droppableId;
    newStart.setDate(newStart.getDate() + daysDiff);
    newEnd.setTime(newStart.getTime() + duration);
    
    const updatedEvent = { ...event, start: newStart, end: newEnd };
    
    if (checkConflicts(updatedEvent)) {
      showToast('Event conflicts with existing events', 'error');
      return;
    }
    
    handleEventUpdate(updatedEvent);
  };

  // Quick event creation
  const handleQuickCreate = async () => {
    if (!quickEventTitle.trim()) return;
    
    const newEvent: Event = {
      id: '',
      title: quickEventTitle,
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour duration
      type: 'task',
      status: 'scheduled'
    };
    
    if (checkConflicts(newEvent)) {
      showToast('Event conflicts with existing events', 'error');
      return;
    }
    
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent, newEvent);
    setShowQuickCreate(false);
    setQuickEventTitle('');
  };

  // Event reminders
  const scheduleReminder = (event: Event) => {
    const reminderTime = new Date(event.start);
    reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30 minutes before
    
    const now = new Date();
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    if (timeUntilReminder > 0) {
      setTimeout(() => {
        toast.custom((t) => (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-medium">{event.title}</h3>
            <p className="text-sm text-gray-500">
              Starting in 30 minutes at {format(event.start, 'h:mm a')}
            </p>
            <div className="mt-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.dismiss(t.id)}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  toast.dismiss(t.id);
                  handleEventClick(event);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        ), {
          duration: 10000,
        });
      }, timeUntilReminder);
    }
  };

  // Modified handleSubmit to include conflict checking and reminders
  const handleSubmit = async (e: React.FormEvent, quickEvent?: Event) => {
    if (!user) {
      showToast('Please log in to create events', 'error');
      return;
    }

    e.preventDefault();
    const eventToSubmit = quickEvent || selectedEvent;
    if (!eventToSubmit) return;

    try {
      setLoading(true);
      const eventData = {
        ...eventToSubmit,
        start: eventToSubmit.start.toISOString(),
        end: eventToSubmit.end.toISOString(),
        recurring: eventToSubmit.recurring ? {
          ...eventToSubmit.recurring,
          endDate: eventToSubmit.recurring.endDate?.toISOString()
        } : null,
        created_by: user.id
      };

      if (eventToSubmit.id) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventToSubmit.id);

        if (error) throw error;
        showToast('Event updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
        showToast('Event created successfully', 'success');
      }

      setShowEventModal(false);
      fetchEvents();
      scheduleReminder(eventToSubmit);
    } catch (error: any) {
      console.error('Error saving event:', error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Export events
  const handleExport = () => {
    const exportData = events.map(event => ({
      ...event,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      recurring: event.recurring ? {
        ...event.recurring,
        endDate: event.recurring.endDate?.toISOString()
      } : null
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    saveAs(blob, `events-${format(new Date(), 'yyyy-MM-dd')}.json`);
  };

  // Import events
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedEvents = JSON.parse(text);

      // Validate imported events
      const validEvents = importedEvents.filter((event: any) => {
        return event.title && event.start && event.end && event.type;
      });

      if (validEvents.length === 0) {
        showToast('No valid events found in the file', 'error');
        return;
      }

      // Check for conflicts
      const hasConflicts = validEvents.some((event: Event) => checkConflicts(event));
      if (hasConflicts) {
        showToast('Some events have conflicts with existing events', 'error');
        return;
      }

      // Insert events
      const { error } = await supabase
        .from('events')
        .insert(validEvents);

      if (error) throw error;

      showToast(`Successfully imported ${validEvents.length} events`, 'success');
      fetchEvents();
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  // Apply template
  const applyTemplate = (template: typeof EVENT_TEMPLATES[0]) => {
    if (!selectedEvent) return;

    const newEvent: Event = {
      ...selectedEvent,
      title: template.name,
      type: template.type,
      description: template.description,
      end: new Date(selectedEvent.start.getTime() + template.duration * 60 * 1000),
    };

    setSelectedEvent(newEvent);
  };

  const handleCreateEvent = () => {
    setSelectedEvent({
      id: '',
      title: '',
      type: 'task',
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour duration
      status: 'scheduled'
    });
    setShowEventModal(true);
  };

  const handleEventUpdate = async (updatedEvent: Event) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('events')
        .update({
          ...updatedEvent,
          start: updatedEvent.start.toISOString(),
          end: updatedEvent.end.toISOString(),
          recurring: updatedEvent.recurring ? {
            ...updatedEvent.recurring,
            endDate: updatedEvent.recurring.endDate?.toISOString()
          } : null
        })
        .eq('id', updatedEvent.id);

      if (error) throw error;
      showToast('Event updated successfully', 'success');
      fetchEvents();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Please log in to access the scheduler.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <FullScreenLoader />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Scheduler</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="bg-white text-black border-black hover:bg-gray-100"
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
          >
            {viewMode === 'calendar' ? (
              <List className="h-4 w-4 mr-2 text-black" />
            ) : (
              <Calendar className="h-4 w-4 mr-2 text-black" />
            )}
            {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
          </Button>
          <Button className="bg-black text-white hover:bg-gray-900" onClick={() => { setSelectedEvent(null); setShowEventModal(true); }}>
            <Plus className="h-4 w-4 mr-2 text-white" />
            New Event
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {TABS.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 rounded-md border-b-2 ${activeTab === index ? 'bg-white text-black border-black font-semibold' : 'text-gray-600 border-transparent'} focus:outline-none`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-black rounded-xl bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
            value={search}
            onChange={handleSearchInput}
          />
        </div>
        <Button
          variant="outline"
          className="bg-white text-black border-black hover:bg-gray-100"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2 text-black" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="border border-black rounded-xl px-3 py-2 bg-white text-black"
          >
            <option value="All">All Types</option>
            <option value="task">Tasks</option>
            <option value="appointment">Appointments</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-black rounded-xl px-3 py-2 bg-white text-black"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <select
            value={filters.assignedTo}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="border border-black rounded-xl px-3 py-2 bg-white text-black"
          >
            <option value="All">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="team">Team Events</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateRange.start ? format(filters.dateRange.start, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : null;
                setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: newDate }
                }));
              }}
              className="border border-black rounded-xl px-3 py-2 bg-white text-black"
            />
            <input
              type="date"
              value={filters.dateRange.end ? format(filters.dateRange.end, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : null;
                setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: newDate }
                }));
              }}
              className="border border-black rounded-xl px-3 py-2 bg-white text-black"
            />
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {format(selectedDate, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="bg-white p-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}

              {eachDayOfInterval({
                start: startOfMonth(selectedDate),
                end: endOfMonth(selectedDate),
              }).map(day => {
                const dayEvents = events.filter(event =>
                  isSameDay(new Date(event.start), day)
                );

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[120px] bg-white p-2 ${
                      !isSameMonth(day, selectedDate)
                        ? 'bg-gray-50 text-gray-400'
                        : isToday(day)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm">{format(day, 'd')}</span>
                      {isSameMonth(day, selectedDate) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setSelectedDate(day);
                            setShowEventModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer hover:bg-opacity-80 ${
                            event.type === 'task'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75 truncate">
                            {format(new Date(event.start), 'h:mm a')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selected.length === events.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </TableHead>
                  <TableHead className="w-1/3">Event</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-48">Date & Time</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-48">Location</TableHead>
                  <TableHead className="w-48">Assigned To</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.includes(event.id)}
                        onChange={() => handleSelect(event.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {event.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(new Date(event.start))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}>
                        {event.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.assigned_to && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{event.assigned_to}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {viewMode === 'list' && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, totalPages * PAGE_SIZE)} of {totalPages * PAGE_SIZE} events
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedEvent ? 'Edit Event' : 'New Event'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEventModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={selectedEvent?.title || ''}
                      onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                      placeholder="Event title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      name="type"
                      value={selectedEvent?.type || 'task'}
                      onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, type: e.target.value as 'task' | 'appointment' } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="task">Task</option>
                      <option value="appointment">Appointment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Date & Time</Label>
                    <Input
                      id="start"
                      name="start"
                      type="datetime-local"
                      value={selectedEvent?.start ? format(new Date(selectedEvent.start), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, start: new Date(e.target.value) } : null)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end">End Date & Time</Label>
                    <Input
                      id="end"
                      name="end"
                      type="datetime-local"
                      value={selectedEvent?.end ? format(new Date(selectedEvent.end), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, end: new Date(e.target.value) } : null)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={selectedEvent?.description || ''}
                    onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Event description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={selectedEvent?.location || ''}
                    onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, location: e.target.value } : null)}
                    placeholder="Event location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={selectedEvent?.status || 'pending'}
                      onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, status: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <select
                      id="assigned_to"
                      name="assigned_to"
                      value={selectedEvent?.assigned_to || ''}
                      onChange={(e) => setSelectedEvent(prev => prev ? { ...prev, assigned_to: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select Assignee</option>
                      <option value="me">Me</option>
                      <option value="team">Team</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={!!selectedEvent?.recurring}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvent(prev => prev ? {
                            ...prev,
                            recurring: {
                              frequency: 'daily',
                              interval: 1,
                            }
                          } : null);
                        } else {
                          setSelectedEvent(prev => prev ? {
                            ...prev,
                            recurring: undefined
                          } : null);
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="recurring">Recurring Event</Label>
                  </div>

                  {selectedEvent?.recurring && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <select
                          id="frequency"
                          name="frequency"
                          value={selectedEvent.recurring.frequency}
                          onChange={(e) => setSelectedEvent(prev => prev ? {
                            ...prev,
                            recurring: {
                              ...prev.recurring!,
                              frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                            }
                          } : null)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interval">Interval</Label>
                        <Input
                          id="interval"
                          name="interval"
                          type="number"
                          min="1"
                          value={selectedEvent.recurring.interval}
                          onChange={(e) => setSelectedEvent(prev => prev ? {
                            ...prev,
                            recurring: {
                              ...prev.recurring!,
                              interval: parseInt(e.target.value)
                            }
                          } : null)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="endDate">End Date (Optional)</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={selectedEvent.recurring.endDate ? format(new Date(selectedEvent.recurring.endDate), 'yyyy-MM-dd') : ''}
                          onChange={(e) => setSelectedEvent(prev => prev ? {
                            ...prev,
                            recurring: {
                              ...prev.recurring!,
                              endDate: e.target.value ? new Date(e.target.value) : undefined
                            }
                          } : null)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEventModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {selectedEvent ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      selectedEvent ? 'Update Event' : 'Create Event'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Create Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setShowQuickCreate(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Quick Create
      </Button>

      {/* Quick Create Modal */}
      {showQuickCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Quick Create Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input
                    value={quickEventTitle}
                    onChange={(e) => setQuickEventTitle(e.target.value)}
                    placeholder="Enter event title..."
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowQuickCreate(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleQuickCreate}>
                    Create Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Event Conflicts Detected</h3>
          <ul className="mt-2 space-y-2">
            {conflicts.map((conflict, index) => (
              <li key={index} className="text-sm text-yellow-700">
                {conflict.event1.title} conflicts with {conflict.event2.title} from{' '}
                {format(conflict.overlap.start, 'h:mm a')} to{' '}
                {format(conflict.overlap.end, 'h:mm a')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keyboard Shortcuts Help Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-4 z-50"
        onClick={() => setShowKeyboardShortcuts(true)}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* Import/Export Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('import-input')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <input
          id="import-input"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {KEYBOARD_SHORTCUTS.map(shortcut => (
                  <div key={shortcut.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowKeyboardShortcuts(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Templates */}
      {showEventModal && selectedEvent && (
        <div className="mb-4">
          <Label>Event Templates</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {EVENT_TEMPLATES.map(template => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                className={selectedTemplate === template.name ? 'border-primary' : ''}
                onClick={() => {
                  setSelectedTemplate(template.name);
                  applyTemplate(template);
                }}
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Duration Presets */}
      {showEventModal && selectedEvent && (
        <div className="mb-4">
          <Label>Duration Presets</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {EVENT_DURATION_PRESETS.map(preset => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => {
                  const newEnd = new Date(selectedEvent.start.getTime() + preset.value * 60 * 1000);
                  setSelectedEvent(prev => prev ? { ...prev, end: newEnd } : null);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler; 
