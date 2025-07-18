import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeadData } from '../../hooks/useLeadData';
import { format } from 'date-fns';
import {
  UserCircle, Phone, Mail, Globe, Building, MapPin, Home, Bed, Bath, DollarSign, Calendar, File, Ticket, Briefcase, MessageSquare, PhoneCall, CheckSquare, Users, Paperclip, Star, Tag, Edit2, Plus, ChevronLeft, ChevronRight, Loader2, AlertCircle, Plus as PlusIcon, X as XIcon, ArrowLeft, Filter, Eye, BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { PROPERTY_STATUSES } from '../../utils/propertyStatuses';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import LeadQuickActions from './LeadQuickActions';
import { isValidUUID } from '../../lib/utils';

type TabKey = 'activity' | 'notes' | 'calls' | 'tasks' | 'meetings' | 'deals' | 'tickets' | 'attachments' | 'playbooks';

const TABS: { key: TabKey; label: string; icon: JSX.Element }[] = [
  { key: 'activity', label: 'Activity', icon: <Star className="h-4 w-4" /> },
  { key: 'notes', label: 'Notes', icon: <MessageSquare className="h-4 w-4" /> },
  { key: 'calls', label: 'Calls', icon: <PhoneCall className="h-4 w-4" /> },
  { key: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-4 w-4" /> },
  { key: 'meetings', label: 'Meetings', icon: <Calendar className="h-4 w-4" /> },
  { key: 'deals', label: 'Deals', icon: <Briefcase className="h-4 w-4" /> },
  { key: 'tickets', label: 'Tickets', icon: <Ticket className="h-4 w-4" /> },
  { key: 'attachments', label: 'Files', icon: <Paperclip className="h-4 w-4" /> },
  { key: 'playbooks', label: 'Playbooks', icon: <Tag className="h-4 w-4" /> },
];

function getTabCount(tabKey: TabKey, data: any[] | undefined): number {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  return 0;
}

interface Property {
  id: string;
  name: string;
  type: string;
  status: PropertyStatus;
  current_price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  images?: string[];
  size_options?: number[];
  [key: string]: any;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
  country?: string;
  budget: number;
  preferred_contact_method: string;
  assigned_to: string;
  last_contact_date: string;
  follow_up_date: string;
  created_by: string;
  assigned_user?: {
    full_name: string;
  } | null;
  nationality?: string;
  preferred_location?: string;
  preferred_property_type?: string;
  preferred_bedrooms?: number;
  preferred_bathrooms?: number;
  preferred_area?: string;
  preferred_amenities?: string;
  next_followup_date?: string;
  dumped_at?: string;
  dumped_by?: string;
}

// Utility for price formatting
function formatPrice(value: number, currency: string = 'AED') {
  if (!value) return '-';
  return `${currency} ${value.toLocaleString()}`;
}

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('activity');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [callForm, setCallForm] = useState({ duration: 0, notes: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', due_date: '', priority: 'Normal', assigned_to: '' });
  const [meetingForm, setMeetingForm] = useState({ title: '', description: '', start_time: '', end_time: '', attendees: [] as string[] });
  const [dealForm, setDealForm] = useState({ name: '', amount: 0, status: '' });
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', status: '' });
  const [fileForm, setFileForm] = useState<File | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [preferencesForm, setPreferencesForm] = useState<any>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // Only use id if it's a valid UUID
  const safeId = id && isValidUUID(id) ? id : null;
  const {
    lead,
    activities: leadActivities,
    deals,
    tickets,
    attachments,
    notes,
    calls,
    tasks,
    meetings,
    company,
    loading,
    error,
    updateLeadStatus,
    addNote,
    addDeal,
    addTicket,
    addAttachment,
    addMeeting,
    addTask,
    addCall,
    updateLead
  } = useLeadData(safeId);
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAttendeesDropdown, setShowAttendeesDropdown] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [matchedProperties, setMatchedProperties] = useState<Property[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [openMatchModal, setOpenMatchModal] = useState<null | 'budget' | 'type' | 'bedrooms' | 'location'>(null);
  const [sortBy, setSortBy] = useState('price_asc');
  const [showComparisonView, setShowComparisonView] = useState(false);

  const activities = leadActivities;

  useEffect(() => {
    // Fetch all users for attendees dropdown
    async function fetchUsers() {
      const { data: userList } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      setUsers(userList || []);
    }
    fetchUsers();
    // Get current user id
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
      // Default attendees to current user if not set
      setMeetingForm(f => ({ ...f, attendees: user?.id ? [user.id] : [] }));
    });
  }, []);

  useEffect(() => {
    const fetchAllProperties = async () => {
      if (!lead || !lead.id) {
        console.log('No lead data available yet');
        return;
      }
      setMatchingLoading(true);
      try {
        console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${API_URL}/api/properties`);
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const { data } = await response.json();
        if (!data || !data.properties) {
          throw new Error('Invalid response format from server');
        }
        setAllProperties(data.properties);
        // Run matching logic
        const matches = matchPropertiesToLead(data.properties, lead);
        setMatchedProperties(matches);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setMatchedProperties([]);
      } finally {
        setMatchingLoading(false);
      }
    };
    fetchAllProperties();
  }, [lead]);

  // Function to match properties to lead preferences
  const matchPropertiesToLead = (properties: Property[], lead: any) => {
    if (!lead) return [];
    
    return properties
      .filter(property => {
        // Exclude Land/Plot unless explicitly required
        const isLandOrPlot = property.type && ["Land", "Plot"].includes(property.type);
        const wantsLandOrPlot = ["Land", "Plot"].includes(lead.preferred_property_type);
        if (isLandOrPlot && !wantsLandOrPlot) return false;
        return true;
      })
      .map(property => {
        let score = 0;
        let matchReasons: string[] = [];
        
        // Budget match (highest priority - 40 points)
        const isWithinBudget = lead.budget && property.current_price <= lead.budget * 1.1;
        if (isWithinBudget) {
          score += 40;
          matchReasons.push('Within Budget');
        }
        
        // Type match (15 points)
        if (property.type === lead.preferred_property_type) {
          score += 15;
          matchReasons.push('Property Type');
        }
        
        // Location match (15 points)
        if (lead.preferred_location && 
            property.location?.toLowerCase().includes(lead.preferred_location.toLowerCase())) {
          score += 15;
          matchReasons.push('Location');
        }
        
        // Bedrooms match (10 points)
        if (property.bedrooms === lead.preferred_bedrooms) {
          score += 10;
          matchReasons.push('Bedrooms');
        }
        
        // Bathrooms match (10 points)
        if (property.bathrooms === lead.preferred_bathrooms) {
          score += 10;
          matchReasons.push('Bathrooms');
        }
        
        // Area match (5 points)
        if (lead.preferred_area && 
            property.area?.toLowerCase().includes(lead.preferred_area.toLowerCase())) {
          score += 5;
          matchReasons.push('Area');
        }
        
        // Amenities match (5 points)
        if (lead.preferred_amenities && 
            typeof lead.preferred_amenities === 'string' &&
            typeof property.amenities === 'string') {
          const preferredAmenities = lead.preferred_amenities.split(',').map((a: string) => a.trim());
          const propertyAmenities = property.amenities.split(',').map((a: string) => a.trim());
          const matchingAmenities = preferredAmenities.filter((a: string) => 
            propertyAmenities.includes(a)
          );
          if (matchingAmenities.length > 0) {
            score += 5;
            matchReasons.push('Amenities');
          }
        }
        
        return {
          ...property,
          matchScore: score,
          matchReasons,
          isWithinBudget
        };
      })
      .filter(match => match.matchScore > 0)
      .sort((a, b) => {
        if (a.isWithinBudget !== b.isWithinBudget) {
          return a.isWithinBudget ? -1 : 1;
        }
        return b.matchScore - a.matchScore;
      });
  };

  // Toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Preferences empty check
  const preferencesEmpty = !lead || (!lead.preferred_location && !lead.preferred_property_type && !lead.budget && !lead.preferred_bedrooms && !lead.preferred_bathrooms && !lead.preferred_area);

  // Quick action handlers
  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    await addNote(noteContent);
    setNoteContent('');
    setShowNoteModal(false);
    showToast('Note added!');
  };
  const handleLogCall = async () => {
    if (!callForm.duration || !callForm.notes) return;
    await addCall(callForm);
    setCallForm({ duration: 0, notes: '' });
    setShowCallModal(false);
    showToast('Call logged!');
  };
  const handleAddTask = async () => {
    if (!taskForm.title || !taskForm.due_date) return;
    await addTask(taskForm);
    setTaskForm({ title: '', description: '', due_date: '', priority: 'Normal', assigned_to: '' });
    setShowTaskModal(false);
    showToast('Task added!');
  };
  const handleAddMeeting = async () => {
    if (!meetingForm.title || !meetingForm.start_time || !meetingForm.end_time) return;
    await addMeeting({ ...meetingForm, attendees: meetingForm.attendees });
    setMeetingForm({ title: '', description: '', start_time: '', end_time: '', attendees: currentUserId ? [currentUserId] : [] });
    setShowMeetingModal(false);
    showToast('Meeting added!');
  };
  const handleAddDeal = async () => {
    if (!dealForm.name || !dealForm.amount) return;
    await addDeal(dealForm);
    setDealForm({ name: '', amount: 0, status: '' });
    setShowDealModal(false);
    showToast('Deal added!');
  };
  const handleAddTicket = async () => {
    if (!ticketForm.subject || !ticketForm.status) return;
    await addTicket(ticketForm);
    setTicketForm({ subject: '', description: '', status: '' });
    setShowTicketModal(false);
    showToast('Ticket added!');
  };
  const handleAddFile = async () => {
    if (!fileForm) return;
    await addAttachment(fileForm);
    setFileForm(null);
    setShowFileModal(false);
    showToast('File uploaded!');
  };
  const handleEditLead = async () => {
    await updateLead(editForm);
    setShowEditModal(false);
    showToast('Lead updated!');
  };
  const handleSavePreferences = async () => {
    await updateLead(preferencesForm);
    setShowPreferencesModal(false);
    showToast('Preferences saved!');
  };

  // Helper to generate time options in 15-min intervals
  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 15, 30, 45]) {
        const hour = h.toString().padStart(2, '0');
        const min = m.toString().padStart(2, '0');
        times.push(`${hour}:${min}`);
      }
    }
    return times;
  };
  const timeOptions = generateTimeOptions();

  // Update meetingForm start_time and end_time when date/time changes
  useEffect(() => {
    if (meetingDate && startTime) {
      setMeetingForm(f => ({ ...f, start_time: `${meetingDate}T${startTime}:00` }));
    }
    if (meetingDate && endTime) {
      setMeetingForm(f => ({ ...f, end_time: `${meetingDate}T${endTime}:00` }));
    }
  }, [meetingDate, startTime, endTime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
      </div>
    );
  }
  if (error || !lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-500">
        <AlertCircle className="h-10 w-10 mb-2" />
        {error || 'Lead not found'}
      </div>
    );
  }

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneCall className="h-4 w-4 text-blue-500" />;
      case 'note': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'status': return <Tag className="h-4 w-4 text-yellow-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  // Tab data mapping
  const tabData: Record<TabKey, any[]> = {
    activity: activities,
    notes,
    calls,
    tasks,
    meetings,
    deals,
    tickets,
    attachments,
    playbooks: [],
  };

  // Tab empty states
  const tabEmpty: Record<TabKey, string> = {
    activity: 'No activity yet.',
    notes: 'No notes yet.',
    calls: 'No calls yet.',
    tasks: 'No tasks yet.',
    meetings: 'No meetings yet.',
    deals: 'No deals yet.',
    tickets: 'No tickets yet.',
    attachments: 'No files yet.',
    playbooks: 'Playbooks integration coming soon.',
  };

  // Update the property card rendering for responsiveness
  const renderPropertyCard = (property: any) => (
    <div 
      key={property.id} 
      className="p-4 rounded-lg border hover:border-purple-500 transition-colors flex flex-col h-full max-w-full overflow-hidden bg-card dark:bg-card-dark"
      style={{ minWidth: 0 }}
    >
      <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-background dark:bg-background-dark flex items-center justify-center">
        {property.images && property.images[0] ? (
          <img 
            src={property.images[0]} 
            alt={property.name}
            className="object-cover w-full h-full"
            style={{ minWidth: 0, minHeight: 0 }}
          />
        ) : (
          <span className="text-muted-foreground text-sm">No Image</span>
        )}
        <Badge 
          variant={PROPERTY_STATUSES[property.status]}
          className="absolute top-2 right-2"
        >
          {property.status}
        </Badge>
                  </div>

      <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
        <div className="min-w-0">
          <h3 className="font-medium truncate">{property.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{property.location || '-'}</p>
                </div>
        <div className="flex flex-col items-end min-w-fit">
          <Badge variant={property.isWithinBudget ? "default" : "secondary"}>
            {property.matchScore}% Match
          </Badge>
          {!property.isWithinBudget && (
            <span className="text-xs text-muted-foreground mt-1">
              Above Budget
            </span>
          )}
      </div>
            </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
        <div className="space-y-2 text-sm min-w-0">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium truncate">{formatPrice(property.current_price)}</span>
            </div>
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{property.type || '-'}</span>
            </div>
          </div>
        <div className="space-y-2 text-sm min-w-0">
          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <div className="flex items-center space-x-2">
              <Bed className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{property.bedrooms} beds</span>
            </div>
          )}
          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <div className="flex items-center space-x-2">
              <Bath className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{property.bathrooms} baths</span>
            </div>
          )}
          {property.size_options && property.size_options.length > 0 && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{property.size_options.map((size: number) => `${size} m²`).join(', ')}</span>
          </div>
          )}
        </div>
            </div>

      {property.matchReasons && property.matchReasons.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Match Reasons</p>
          <div className="flex flex-wrap gap-2">
            {property.matchReasons.map((reason: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {property.amenities && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {property.amenities.split(',').map((amenity: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity.trim()}
              </Badge>
            ))}
          </div>
              </div>
            )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t gap-2 w-full">
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => navigate(`/properties/${property.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <Button 
          variant="default" 
          size="sm"
          className="w-full sm:w-auto"
          onClick={async () => {
            try {
              await addNote(`Property details sent to lead: ${property.name}`);
              showToast('Property details sent to lead!');
            } catch (error) {
              console.error('Error sending property details:', error);
              showToast('Failed to send property details', 'error');
            }
          }}
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Details
        </Button>
                    </div>
                  </div>
  );

  // Update the comparison view to show match reasons
  const renderComparisonView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4 font-medium text-sm text-muted-foreground border-b pb-2">
        <div>Property</div>
        <div>Price</div>
        <div>Details</div>
        <div>Match Score</div>
        <div>Match Reasons</div>
              </div>
      {matchedProperties.map((property) => (
        <div key={property.id} className="grid grid-cols-5 gap-4 items-center border-b pb-4">
          <div className="flex items-center space-x-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
              <img 
                src={property.images?.[0] || '/placeholder-property.jpg'} 
                alt={property.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-medium">{property.name}</h3>
              <p className="text-sm text-muted-foreground">{property.location}</p>
            </div>
          </div>
          <div className="font-medium">
            {formatPrice(property.current_price)}
            {!property.isWithinBudget && (
              <span className="text-xs text-muted-foreground block">Above Budget</span>
            )}
                  </div>
          <div className="text-sm">
            <div>{property.type}</div>
            <div>{property.bedrooms} beds • {property.bathrooms} baths</div>
            <div>{property.size_options && property.size_options.length > 0 ? property.size_options.map((size: number) => `${size} m²`).join(', ') : '-'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={property.isWithinBudget ? "default" : "secondary"}>
              {property.matchScore}%
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {property.matchReasons.map((reason: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {reason}
              </Badge>
                ))}
              </div>
                  </div>
                ))}
              </div>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      {/* Header */}
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
                    <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {loading ? <span className="inline-block bg-gray-200 rounded h-8 w-48 animate-pulse" /> : `${lead?.first_name} ${lead?.last_name}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {loading ? <span className="inline-block bg-gray-200 rounded h-4 w-32 animate-pulse" /> : `Lead ID: ${lead?.id}`}
              </p>
                    </div>
                  </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Lead
            </Button>
            <Button variant="default" onClick={() => setShowPreferencesModal(true)}>
              <Star className="h-4 w-4 mr-2" />
              Preferences
            </Button>
                </div>
                    </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Name: {lead.first_name} {lead.last_name}</p>
                <p>Email: {lead.email}</p>
                <p>Phone: {lead.phone}</p>
                <p>Status: {lead.status}</p>
                <LeadQuickActions leadId={lead.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead?.email || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead?.company || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead?.country || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Type: {lead?.preferred_property_type || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Location: {lead?.preferred_location || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Budget: {lead?.budget ? getCurrencyDisplay(lead.budget).primary : 'Not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Bedrooms: {lead?.preferred_bedrooms || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matched Properties Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CardTitle>Matched Properties</CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {matchedProperties.length} matches
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="bedrooms_desc">Most Bedrooms</SelectItem>
                      <SelectItem value="area_desc">Largest Area</SelectItem>
                      <SelectItem value="match_score">Best Match</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setOpenMatchModal('budget')}
                    className="flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowComparisonView(!showComparisonView)}
                    className="flex items-center space-x-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Compare</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {matchingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                  </div>
                ) : matchedProperties.length > 0 ? (
                  showComparisonView ? renderComparisonView() : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchedProperties.map(renderPropertyCard)}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {preferencesEmpty ? (
                      <div className="space-y-4">
                        <p>Add property preferences to see matching properties</p>
                        <Button 
                          variant="outline"
                          onClick={() => setShowPreferencesModal(true)}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Set Preferences
                        </Button>
                      </div>
                    ) : (
                      <p>No matching properties found</p>
                    )}
                      </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Activities & Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
                  <TabsList className="grid grid-cols-4 lg:grid-cols-9 mb-4">
                    {TABS.map((tab) => (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.key}
                        className="flex items-center space-x-2"
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {getTabCount(tab.key, tabData[tab.key])}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="space-y-4">
                    {activities?.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
                        <Avatar>
                          <AvatarFallback>{activity.user?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.user?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                    </div>
                  ))}
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button onClick={() => setShowNoteModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                  </div>
                      {notes?.map((note, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Avatar>
                                <AvatarFallback>{note.user?.full_name?.[0] || 'U'}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{note.user?.full_name}</span>
                        </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{note.content}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Calls Tab */}
                  <TabsContent value="calls" className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button onClick={() => setShowCallModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Log Call
                      </Button>
                  </div>
                      {calls?.map((call, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <PhoneCall className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">Call Duration: {call.duration} minutes</span>
                        </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(call.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{call.notes}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Tasks Tab */}
                  <TabsContent value="tasks" className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button onClick={() => setShowTaskModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                  </div>
                      {tasks?.map((task, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <CheckSquare className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{task.title}</span>
                    </div>
                              <Badge variant={task.status === 'completed' ? 'success' : 'secondary'}>
                                {task.status}
                              </Badge>
                    </div>
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                              <span>Priority: {task.priority}</span>
                      </div>
                    </div>
                      ))}
                  </TabsContent>

                  {/* Meetings Tab */}
                  <TabsContent value="meetings" className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button onClick={() => setShowMeetingModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                  </div>
                        {meetings?.map((meeting, index) => (
                          <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium">{meeting.title}</span>
                    </div>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(meeting.start_time), 'MMM d, yyyy h:mm a')}
                                </span>
                      </div>
                            <p className="text-sm text-muted-foreground mb-2">{meeting.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{meeting.attendees?.length || 0} attendees</span>
                            </div>
                    </div>
                  ))}
                  </TabsContent>

                  {/* Deals Tab */}
                  <TabsContent value="deals" className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button onClick={() => setShowDealModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Deal
                      </Button>
                    </div>
                      {deals?.map((deal, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Briefcase className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">{deal.name}</span>
                              </div>
                              <Badge variant="secondary">{deal.status}</Badge>
                            </div>
                            <p className="text-sm font-medium text-green-600">
                              {getCurrencyDisplay(deal.amount).primary}
                            </p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Tickets Tab */}
                  <TabsContent value="tickets" className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button onClick={() => setShowTicketModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Ticket
                      </Button>
                    </div>
                      {tickets?.map((ticket, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Ticket className="h-4 w-4 text-red-500" />
                                <span className="font-medium">{ticket.subject}</span>
                              </div>
                              <Badge variant={ticket.status === 'resolved' ? 'success' : 'destructive'}>
                                {ticket.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Attachments Tab */}
                  <TabsContent value="attachments" className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <Button onClick={() => setShowFileModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                      {attachments?.map((file, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <File className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                  </TabsContent>

                  {/* Playbooks Tab */}
                  <TabsContent value="playbooks" className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Playbooks Coming Soon</h3>
                      <p className="text-sm text-muted-foreground">
                        We're working on bringing you powerful playbooks to automate your lead management.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowNoteModal(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowCallModal(true)}>
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Log Call
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowTaskModal(true)}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowMeetingModal(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Status</span>
                    <Badge variant={PROPERTY_STATUSES[lead?.status || '']}>
                      {lead?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Contact</span>
                      <span className="text-sm">
                        {lead?.last_contact_date ? format(new Date(lead.last_contact_date), 'MMM d, yyyy') : 'Never'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next Follow-up</span>
                      <span className="text-sm">
                        {lead?.follow_up_date ? format(new Date(lead.follow_up_date), 'MMM d, yyyy') : 'Not scheduled'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        {/* Add Note Modal */}
        <DialogRoot open={showNoteModal} onOpenChange={setShowNoteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNoteModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Log Call Modal */}
        <DialogRoot open={showCallModal} onOpenChange={setShowCallModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Call</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={callForm.duration}
                  onChange={(e) => setCallForm({ ...callForm, duration: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Enter call notes..."
                  value={callForm.notes}
                  onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCallModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleLogCall}>
                Log Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Add Task Modal */}
        <DialogRoot open={showTaskModal} onOpenChange={setShowTaskModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="datetime-local"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Schedule Meeting Modal */}
        <DialogRoot open={showMeetingModal} onOpenChange={setShowMeetingModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="Enter meeting title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                  placeholder="Enter meeting description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Select
                    value={startTime}
                    onValueChange={setStartTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>End Time</Label>
                  <Select
                    value={endTime}
                    onValueChange={setEndTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Attendees</Label>
                <Select
                  value={meetingForm.attendees[0]}
                  onValueChange={(value) => setMeetingForm({ ...meetingForm, attendees: [value] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attendee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMeetingModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMeeting}>
                Schedule Meeting
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Add Deal Modal */}
        <DialogRoot open={showDealModal} onOpenChange={setShowDealModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Deal Name</Label>
                <Input
                  value={dealForm.name}
                  onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                  placeholder="Enter deal name"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={dealForm.amount}
                  onChange={(e) => setDealForm({ ...dealForm, amount: parseFloat(e.target.value) })}
                  placeholder="Enter deal amount"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={dealForm.status}
                  onValueChange={(value) => setDealForm({ ...dealForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDealModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDeal}>
                Add Deal
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Create Ticket Modal */}
        <DialogRoot open={showTicketModal} onOpenChange={setShowTicketModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="Enter ticket subject"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Enter ticket description"
                  rows={4}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={ticketForm.status}
                  onValueChange={(value) => setTicketForm({ ...ticketForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTicketModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTicket}>
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Upload File Modal */}
        <DialogRoot open={showFileModal} onOpenChange={setShowFileModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>File</Label>
                <Input
                  type="file"
                  onChange={(e) => setFileForm(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFileModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFile}>
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Edit Lead Modal */}
        <DialogRoot open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditLead}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Preferences Modal */}
        <DialogRoot open={showPreferencesModal} onOpenChange={setShowPreferencesModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Property Preferences</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Preferred Location</Label>
                <Input
                  value={preferencesForm.preferred_location}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, preferred_location: e.target.value })}
                  placeholder="Enter preferred location"
                />
              </div>
              <div>
                <Label>Property Type</Label>
                <Select
                  value={preferencesForm.preferred_property_type}
                  onValueChange={(value) => setPreferencesForm({ ...preferencesForm, preferred_property_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget</Label>
                <Input
                  type="number"
                  value={preferencesForm.budget}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, budget: parseFloat(e.target.value) })}
                  placeholder="Enter budget"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bedrooms</Label>
                  <Select
                    value={preferencesForm.preferred_bedrooms?.toString()}
                    onValueChange={(value) => setPreferencesForm({ ...preferencesForm, preferred_bedrooms: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Select
                    value={preferencesForm.preferred_bathrooms?.toString()}
                    onValueChange={(value) => setPreferencesForm({ ...preferencesForm, preferred_bathrooms: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Preferred Area</Label>
                <Input
                  value={preferencesForm.preferred_area}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, preferred_area: e.target.value })}
                  placeholder="Enter preferred area"
                />
              </div>
              <div>
                <Label>Amenities</Label>
                <Input
                  value={preferencesForm.preferred_amenities}
                  onChange={(e) => setPreferencesForm({ ...preferencesForm, preferred_amenities: e.target.value })}
                  placeholder="Enter preferred amenities (comma-separated)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreferencesModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`p-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 