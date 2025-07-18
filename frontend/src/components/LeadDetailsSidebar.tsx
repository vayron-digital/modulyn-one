import React, { useState } from 'react';
import { useLeadData } from '../hooks/useLeadData';
import { format } from 'date-fns';
import { 
  UserCircle, 
  Phone, 
  Mail, 
  Globe, 
  Building, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  Paperclip,
  PhoneCall,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  CheckSquare,
  Users,
  File,
  Ticket,
  Briefcase,
  MessageSquare,
  Star,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';

interface LeadDetailsSidebarProps {
  leadId: string | null;
  onClose?: () => void;
  isDrawer?: boolean;
}

export function LeadDetailsSidebar({ leadId, onClose, isDrawer = false }: LeadDetailsSidebarProps) {
  const {
    lead,
    activities,
    deals,
    tickets,
    attachments,
    notes,
    emails,
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
    addEmail,
    updateLead
  } = useLeadData(leadId);

  const [activeTab, setActiveTab] = useState('activity');
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<typeof lead>>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    async function fetchProfiles() {
      const { data } = await supabase.from('profiles').select('id, full_name');
      setProfiles(data || []);
    }
    async function fetchAdminStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .single();
        setIsAdmin(profile?.is_admin || profile?.role === 'Administrator' || false);
      }
    }
    fetchProfiles();
    fetchAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        {error || 'Lead not found'}
      </div>
    );
  }

  const handleEdit = () => {
    setEditValues(lead);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateLead(editValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditValues(prev => ({ ...prev, [name]: value }));
  };

  const renderStatusBadge = (status: string) => {
    const statusColors = {
      'New': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'Contacted': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'Qualified': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'Proposal': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'Negotiation': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      'Closed Won': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'Closed Lost': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-muted dark:bg-muted-dark text-foreground dark:text-foreground-dark'}`}>
        {status}
      </span>
    );
  };

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      case 'note':
        return <MessageSquare className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case 'email':
        return <MailIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
      case 'status':
        return <Tag className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
      default:
        return <Star className="h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />;
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDrawer ? 'w-[400px]' : 'w-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <UserCircle className="h-10 w-10 text-gray-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {lead.first_name} {lead.last_name}
            </h2>
            <p className="text-sm text-gray-500">{lead.email}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Status */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Status</span>
          <select
            value={lead.status}
            onChange={(e) => updateLeadStatus(e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>
        {/* Agent Assignment Row */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-gray-500">Agent</span>
          {isAdmin ? (
            <select
              className="border rounded px-2 py-1 text-sm"
              value={lead.assigned_to || ''}
              onChange={async (e) => {
                const newAgentId = e.target.value;
                try {
                  await updateLead({ ...lead, assigned_to: newAgentId });
                  toast({ title: 'Success', description: 'Agent assigned', variant: 'default' });
                } catch (err: any) {
                  toast({ title: 'Error', description: err.message, variant: 'destructive' });
                }
              }}
            >
              <option value="">Unassigned</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.full_name}</option>
              ))}
            </select>
          ) : (
            <span>{lead.assigned_user?.full_name || 'Unassigned'}</span>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{lead.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{lead.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Globe className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{lead.nationality}</span>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">Budget: ${lead.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{lead.preferred_location}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Home className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{lead.preferred_property_type}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Bed className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{lead.preferred_bedrooms} beds</span>
          </div>
          <div className="flex items-center space-x-3">
            <Bath className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{lead.preferred_bathrooms} baths</span>
          </div>
          <div className="flex items-center space-x-3">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-900">{lead.preferred_area}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b">
          <nav className="flex space-x-4 px-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deals'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Deals
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tickets
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attachments'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Files
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {renderActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-4">
              {deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{deal.name}</h4>
                    <p className="text-sm text-gray-500">${deal.amount.toLocaleString()}</p>
                  </div>
                  {renderStatusBadge(deal.status)}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{ticket.subject}</h4>
                  </div>
                  {renderStatusBadge(ticket.status)}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{attachment.file_name}</span>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-500"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeadDetailsSidebar; 