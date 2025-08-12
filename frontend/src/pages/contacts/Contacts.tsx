import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Tag,
  Settings,
  Download,
  Upload,
  MoreHorizontal,
  Star,
  MessageCircle,
  PhoneCall,
  Video,
  Mail as MailIcon,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Globe,
  Building,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ContactDetailModal from './ContactDetailModal';
import { useLayout } from '../../components/layout/DashboardLayout';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  social_media: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  lead_id?: string;
  created_at: string;
  updated_at: string;
  last_contact?: string;
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'partner';
  notes?: string;
  avatar_url?: string;
}

interface Interaction {
  id: string;
  contact_id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description?: string;
  date: string;
  duration?: number;
  outcome?: string;
  created_by: string;
}

const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { setHeader } = useLayout();

  // Mock data for now - we'll replace with real API calls later
  const mockContacts: Contact[] = [
    {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Tech Solutions Inc.',
      position: 'CEO',
      address: '123 Business St',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94105',
      country: 'USA',
      tags: ['VIP', 'Tech', 'Decision Maker'],
      custom_fields: {
        budget: '$500K - $1M',
        timeline: 'Q2 2024',
        source: 'LinkedIn'
      },
      social_media: {
        linkedin: 'linkedin.com/in/johndoe',
        twitter: '@johndoe',
        website: 'techsolutions.com'
      },
      status: 'prospect',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      last_contact: '2024-01-20T14:30:00Z',
      notes: 'Interested in enterprise solutions. Follow up next week.'
    },
    {
      id: '2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@startup.com',
      phone: '+1 (555) 987-6543',
      company: 'Innovation Labs',
      position: 'CTO',
      tags: ['Startup', 'Technical', 'Early Adopter'],
      custom_fields: {
        budget: '$100K - $250K',
        timeline: 'Q1 2024',
        source: 'Conference'
      },
      social_media: {
        linkedin: 'linkedin.com/in/sarahjohnson',
        twitter: '@sarahj',
        website: 'innovationlabs.io'
      },
      status: 'customer',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T16:45:00Z',
      last_contact: '2024-01-18T16:45:00Z',
      notes: 'Current customer. Very satisfied with our services.'
    }
  ];

  useEffect(() => {
    setHeader({
      title: '',
      breadcrumbs: [],
      tabs: []
    });
  }, [setHeader]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContacts(mockContacts);
      setFilteredContacts(mockContacts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchTerm, selectedTags, statusFilter, contacts]);

  const filterContacts = () => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contact =>
        selectedTags.some(tag => contact.tags.includes(tag))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
       {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-xl text-text-on-dark mb-8">
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => navigate('/contacts/new')} className="bg-gradient-to-r from-primary-default to-primary-tint hover:from-primary-tint hover:to-primary-shade text-primary-on-primary shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8" />
                  <div className="ml-3">
                    <p className="text-sm font-medium">Total Contacts</p>
                    <p className="text-2xl font-bold">{contacts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8" />
                  <div className="ml-3">
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-2xl font-bold">
                      {contacts.filter(c => c.status === 'active' || c.status === 'customer').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8" />
                  <div className="ml-3">
                    <p className="text-sm font-medium">Prospects</p>
                    <p className="text-2xl font-bold">
                      {contacts.filter(c => c.status === 'prospect').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8" />
                  <div className="ml-3">
                    <p className="text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold">
                      {contacts.filter(c => new Date(c.created_at).getMonth() === new Date().getMonth()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-6 space-y-6">
      {/* Filters and Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="customer">Customer</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
                <option value="partner">Partner</option>
              </select>
              
              <Button variant="outline" size="sm" className="bg-white/70">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
        <CardHeader>
          <CardTitle>All Contacts ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 bg-white/60 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(contact.first_name, contact.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </h3>
                        <Badge className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        {contact.company && (
                          <div className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {contact.company}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {contact.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {contact.phone}
                        </div>
                      </div>
                      
                      {contact.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          {contact.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{contact.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MailIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </div>
    </div>
  );
};

export default Contacts;
