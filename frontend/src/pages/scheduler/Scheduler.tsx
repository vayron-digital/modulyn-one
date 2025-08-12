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
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import PageHeader from '../../components/ui/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

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

const Scheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'task' | 'appointment'>('all');

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'appointment' as 'task' | 'appointment',
    location: '',
    lead_id: '',
    assigned_to: ''
  });

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start', startOfMonth(currentDate).toISOString())
        .lte('end', endOfMonth(currentDate).toISOString())
        .order('start');

      if (error) throw error;

      const formattedEvents = (data || []).map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));

      setEvents(formattedEvents);

    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentDate, toast]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name, email, phone, status')
        .order('first_name');

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  }, []);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchEvents();
    fetchLeads();
  }, [fetchEvents, fetchLeads]);

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Calendar helpers
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startDate = startOfWeek(start);
    const endDate = endOfWeek(end);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  // Event handlers
  const handleAddEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.start || !newEvent.end) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title,
          description: newEvent.description,
          start: newEvent.start,
          end: newEvent.end,
          type: newEvent.type,
          location: newEvent.location,
          lead_id: newEvent.lead_id || null,
          assigned_to: newEvent.assigned_to || null,
          status: 'scheduled',
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully"
      });

      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        start: '',
        end: '',
        type: 'appointment',
        location: '',
        lead_id: '',
        assigned_to: ''
      });

      fetchEvents();

    } catch (err) {
      console.error('Error creating event:', err);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully"
      });

      fetchEvents();

    } catch (err) {
      console.error('Error deleting event:', err);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewEvent(prev => ({
      ...prev,
      start: format(date, 'yyyy-MM-dd\'T\'HH:mm'),
      end: format(addDays(date, 1), 'yyyy-MM-dd\'T\'HH:mm')
    }));
    setShowAddModal(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Calendar</h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title="Calendar & Scheduler"
        subtitle="Manage your appointments and tasks"
        icon={<Calendar className="h-6 w-6 text-blue-600" />}
        stats={[
          {
            label: 'Total Events',
            value: events.length,
            change: 5,
            trend: 'up'
          },
          {
            label: 'This Month',
            value: events.filter(e => isSameMonth(e.start, currentDate)).length,
            change: 3,
            trend: 'up'
          },
          {
            label: 'Appointments',
            value: events.filter(e => e.type === 'appointment').length,
            change: 8,
            trend: 'up'
          },
          {
            label: 'Tasks',
            value: events.filter(e => e.type === 'task').length,
            change: 2,
            trend: 'down'
          }
        ]}
        actions={[
          {
            label: 'New Event',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowAddModal(true),
            variant: 'default'
          },
          {
            label: 'Today',
            icon: <Calendar className="h-4 w-4" />,
            onClick: goToToday,
            variant: 'outline'
          }
        ]}
        search={{
          placeholder: "Search events...",
          value: search,
          onChange: setSearch
        }}
        filters={
          <div className="flex items-center space-x-2">
            <Select value={filterType} onValueChange={(value: 'all' | 'task' | 'appointment') => setFilterType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
          </div>
        }
      />

      {/* Calendar Navigation */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-white p-3 text-center">
                <div className="text-sm font-medium text-slate-600">{day}</div>
              </div>
            ))}

            {/* Calendar days */}
            {getDaysInMonth().map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isTodayDate = isToday(date);
              const dayEvents = getEventsForDate(date);
              const filteredEvents = filterType === 'all' 
                ? dayEvents 
                : dayEvents.filter(e => e.type === filterType);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                  className={`bg-white min-h-[120px] p-2 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !isCurrentMonth ? 'text-slate-400' : ''
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                  }`}>
                    {format(date, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {filteredEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer ${
                          event.type === 'appointment' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {filteredEvents.length > 3 && (
                      <div className="text-xs text-slate-500">
                        +{filteredEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new appointment or task
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={newEvent.type} onValueChange={(value: 'task' | 'appointment') => setNewEvent(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Start</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={newEvent.start}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end">End</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={newEvent.end}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Event location"
              />
            </div>

            <div>
              <Label htmlFor="lead">Related Lead</Label>
              <Select value={newEvent.lead_id} onValueChange={(value) => setNewEvent(prev => ({ ...prev, lead_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {format(selectedEvent.start, 'PPP p')} - {format(selectedEvent.end, 'p')}
                </span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{selectedEvent.location}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Badge variant={selectedEvent.type === 'appointment' ? 'default' : 'secondary'}>
                  {selectedEvent.type}
                </Badge>
                <Badge variant="outline">{selectedEvent.status}</Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventModal(false)}>
              Close
            </Button>
            {selectedEvent && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDeleteEvent(selectedEvent.id);
                  setShowEventModal(false);
                }}
              >
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Scheduler; 
