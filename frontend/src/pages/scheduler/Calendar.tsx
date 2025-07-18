import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button, Input, FormGroup } from '@/components/ui';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  type: 'meeting' | 'call' | 'task';
  status: 'scheduled' | 'completed' | 'cancelled';
  lead_id?: string;
  lead?: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          lead:leads (
            first_name,
            last_name
          )
        `)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.getDate() === day;
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700';
      case 'call':
        return 'bg-green-100 text-green-700';
      case 'task':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm mb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
            <Button onClick={() => setShowEventModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-medium text-gray-900 mx-4">{formatDate(currentDate)}</h2>
              <Button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 py-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="bg-white h-40" />
            ))}
            {days.map((day) => (
              <div key={day} className="bg-white p-2 h-40 overflow-y-auto">
                <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                <div className="space-y-1">
                  {getEventsForDay(day).map((event) => (
                    <Button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded ${getEventTypeColor(event.type)}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="flex items-center text-xs">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">{selectedEvent.title}</h3>
                <Button
                  onClick={() => setSelectedEvent(null)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" />
                </Button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                  {new Date(selectedEvent.start_time).toLocaleString()} - {new Date(selectedEvent.end_time).toLocaleString()}
                </div>
                {selectedEvent.lead && (
                  <div className="flex items-center text-sm text-gray-500">
                    <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {selectedEvent.lead.first_name} {selectedEvent.lead.last_name}
                  </div>
                )}
                <div className="text-sm text-gray-500">{selectedEvent.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 