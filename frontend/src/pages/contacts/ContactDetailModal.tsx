import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  User, 
  Calendar,
  Clock,
  MessageCircle,
  PhoneCall,
  Video,
  Mail as MailIcon,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Globe,
  Edit,
  Star,
  Tag,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  FileText,
  Activity,
  Settings,
  Download,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';

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

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Mock interactions data
  const mockInteractions: Interaction[] = [
    {
      id: '1',
      contact_id: contact?.id || '',
      type: 'call',
      title: 'Follow-up Call',
      description: 'Discussed project requirements and timeline',
      date: '2024-01-20T14:30:00Z',
      duration: 25,
      outcome: 'Positive - Scheduled demo',
      created_by: 'John Smith'
    },
    {
      id: '2',
      contact_id: contact?.id || '',
      type: 'email',
      title: 'Proposal Sent',
      description: 'Sent detailed proposal for enterprise solution',
      date: '2024-01-18T10:15:00Z',
      outcome: 'Delivered',
      created_by: 'John Smith'
    },
    {
      id: '3',
      contact_id: contact?.id || '',
      type: 'meeting',
      title: 'Initial Discovery Call',
      description: 'Understanding their business needs and challenges',
      date: '2024-01-15T09:00:00Z',
      duration: 45,
      outcome: 'Qualified - Next steps planned',
      created_by: 'John Smith'
    }
  ];

  if (!contact) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneCall className="h-4 w-4" />;
      case 'email': return <MailIcon className="h-4 w-4" />;
      case 'meeting': return <Video className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'call': return 'text-blue-600 bg-blue-50';
      case 'email': return 'text-green-600 bg-green-50';
      case 'meeting': return 'text-purple-600 bg-purple-50';
      case 'task': return 'text-orange-600 bg-orange-50';
      case 'note': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const addTag = () => {
    if (newTag.trim() && !contact.tags.includes(newTag.trim())) {
      // In a real app, this would update the contact via API
      console.log('Adding tag:', newTag);
      setNewTag('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Contact Details
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={contact.avatar_url} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {getInitials(contact.first_name, contact.last_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {contact.first_name} {contact.last_name}
                </h2>
                <Badge className={getStatusColor(contact.status)}>
                  {contact.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
              
              {contact.company && (
                <p className="text-gray-600 mt-1">
                  <Building className="h-4 w-4 inline mr-1" />
                  {contact.position} at {contact.company}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-3">
                <Button variant="outline" size="sm">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm">
                  <MailIcon className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="custom">Custom Fields</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                    {contact.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                        <div className="text-sm">
                          <div>{contact.address}</div>
                          <div>{contact.city}, {contact.state} {contact.zip_code}</div>
                          <div>{contact.country}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Tags & Segmentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <X className="h-3 w-3 ml-1 cursor-pointer" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add notes about this contact..."
                    value={contact.notes || ''}
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interactions Tab */}
            <TabsContent value="interactions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Interaction History</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Interaction
                </Button>
              </div>
              
              <div className="space-y-3">
                {mockInteractions.map((interaction) => (
                  <div key={interaction.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getInteractionColor(interaction.type)}`}>
                        {getInteractionIcon(interaction.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{interaction.title}</h4>
                          <span className="text-sm text-gray-500">
                            {format(new Date(interaction.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {interaction.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {interaction.duration && (
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {interaction.duration} min
                            </span>
                          )}
                          <span>By {interaction.created_by}</span>
                          {interaction.outcome && (
                            <Badge variant="outline" className="text-xs">
                              {interaction.outcome}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Social Media Tab */}
            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Profiles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contact.social_media.linkedin && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Linkedin className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="font-medium">LinkedIn</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  )}
                  
                  {contact.social_media.twitter && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Twitter className="h-5 w-5 text-blue-400 mr-3" />
                        <span className="font-medium">Twitter</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  )}
                  
                  {contact.social_media.website && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-600 mr-3" />
                        <span className="font-medium">Website</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Visit Site
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Fields Tab */}
            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(contact.custom_fields).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace('_', ' ')}
                        </label>
                        <Input value={value} readOnly />
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Field
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tasks & Follow-ups</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center text-gray-500 py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No tasks assigned to this contact</p>
                    <p className="text-sm">Create tasks to track follow-ups and activities</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailModal;
