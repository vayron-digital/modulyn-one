import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Tag,
  Edit,
  Trash2,
  Eye,
  Star,
  Bookmark,
  Share2,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { format } from 'date-fns';

interface Note {
  id: string;
  content: string;
  note_type: 'general' | 'call' | 'meeting' | 'follow_up' | 'important' | 'internal';
  lead_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_important: boolean;
  tags: string[];
  lead?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  created_user?: {
    full_name: string;
    profile_image_url?: string;
  };
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  assigned_to?: string;
  assigned_user?: {
    full_name: string;
    profile_image_url?: string;
  };
}

export default function CentralizedNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [noteTypeFilter, setNoteTypeFilter] = useState('all');
  const [leadFilter, setLeadFilter] = useState('all');
  const [importantFilter, setImportantFilter] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Form states
  const [newNote, setNewNote] = useState({
    content: '',
    note_type: 'general' as const,
    lead_id: '',
    is_important: false,
    tags: [] as string[]
  });

  const [editNote, setEditNote] = useState({
    content: '',
    note_type: 'general' as const,
    is_important: false,
    tags: [] as string[]
  });

  const NOTE_TYPES = [
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' },
    { value: 'call', label: 'Call', color: 'bg-blue-100 text-blue-800' },
    { value: 'meeting', label: 'Meeting', color: 'bg-green-100 text-green-800' },
    { value: 'follow_up', label: 'Follow-up', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'important', label: 'Important', color: 'bg-red-100 text-red-800' },
    { value: 'internal', label: 'Internal', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    fetchNotes();
    fetchLeads();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_notes' }, () => {
        fetchNotes();
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lead_notes')
        .select(`
          *,
          lead:leads(first_name, last_name, email, phone, status, assigned_to, assigned_user:profiles!assigned_to(full_name, profile_image_url)),
          created_user:profiles!created_by(full_name, profile_image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          status,
          assigned_to,
          assigned_user:profiles!assigned_to(full_name, profile_image_url)
        `)
        .order('first_name');

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleAddNote = async () => {
    try {
      if (!newNote.content.trim() || !newNote.lead_id) {
        toast({
          title: "Validation Error",
          description: "Content and lead are required",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('lead_notes')
        .insert([{
          ...newNote,
          created_by: user?.id,
          tags: newNote.tags.length > 0 ? newNote.tags : []
        }]);

      if (error) throw error;

      setShowAddModal(false);
      setNewNote({ content: '', note_type: 'general', lead_id: '', is_important: false, tags: [] });
      fetchNotes();
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditNote = async () => {
    if (!selectedNote) return;

    try {
      const { error } = await supabase
        .from('lead_notes')
        .update({
          content: editNote.content,
          note_type: editNote.note_type,
          is_important: editNote.is_important,
          tags: editNote.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedNote.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedNote(null);
      setEditNote({ content: '', note_type: 'general', is_important: false, tags: [] });
      fetchNotes();
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      fetchNotes();
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleImportant = async (noteId: string, currentImportant: boolean) => {
    try {
      const { error } = await supabase
        .from('lead_notes')
        .update({ is_important: !currentImportant })
        .eq('id', noteId);

      if (error) throw error;

      fetchNotes();
      toast({
        title: "Success",
        description: `Note marked as ${!currentImportant ? 'important' : 'not important'}`,
      });
    } catch (error: any) {
      console.error('Error toggling important:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getNoteTypeConfig = (type: string) => {
    return NOTE_TYPES.find(t => t.value === type) || NOTE_TYPES[0];
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.lead?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.lead?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.lead?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = noteTypeFilter === 'all' || note.note_type === noteTypeFilter;
    const matchesLead = leadFilter === 'all' || note.lead_id === leadFilter;
    const matchesImportant = !importantFilter || note.is_important;

    return matchesSearch && matchesType && matchesLead && matchesImportant;
  });

  const importantNotes = notes.filter(note => note.is_important);
  const recentNotes = notes.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Centralized Notes</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage all lead notes in one place</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{notes.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Important Notes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{importantNotes.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Leads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{leads.length}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Notes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {notes.filter(note => 
                    new Date(note.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* All Notes Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search</Label>
                  <Input
                    placeholder="Search notes, leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Note Type</Label>
                  <Select value={noteTypeFilter} onValueChange={setNoteTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {NOTE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lead</Label>
                  <Select value={leadFilter} onValueChange={setLeadFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Leads</SelectItem>
                      {leads.map(lead => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.first_name} {lead.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant={importantFilter ? 'default' : 'outline'}
                    onClick={() => setImportantFilter(!importantFilter)}
                    className="w-full"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Important Only
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes List */}
          <Card>
            <CardHeader>
              <CardTitle>Notes ({filteredNotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading notes...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes found</h3>
                  <p className="text-gray-500">No notes match the current filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <Avatar>
                            <AvatarImage src={note.created_user?.profile_image_url} />
                            <AvatarFallback>{note.created_user?.full_name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getNoteTypeConfig(note.note_type).color}>
                                {getNoteTypeConfig(note.note_type).label}
                              </Badge>
                              {note.is_important && (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white mb-2">{note.content}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Lead: {note.lead?.first_name} {note.lead?.last_name}</span>
                              <span>By: {note.created_user?.full_name}</span>
                              <span>{format(new Date(note.created_at), 'MMM dd, yyyy h:mm a')}</span>
                            </div>
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {note.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleImportant(note.id, note.is_important)}
                          >
                            <Star className={`h-4 w-4 ${note.is_important ? 'text-yellow-500 fill-current' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedNote(note);
                              setEditNote({
                                content: note.content,
                                note_type: note.note_type,
                                is_important: note.is_important,
                                tags: note.tags || []
                              });
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Important Notes Tab */}
        <TabsContent value="important" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Important Notes ({importantNotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importantNotes.map((note) => (
                  <div key={note.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar>
                          <AvatarImage src={note.created_user?.profile_image_url} />
                          <AvatarFallback>{note.created_user?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getNoteTypeConfig(note.note_type).color}>
                              {getNoteTypeConfig(note.note_type).label}
                            </Badge>
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white mb-2">{note.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Lead: {note.lead?.first_name} {note.lead?.last_name}</span>
                            <span>By: {note.created_user?.full_name}</span>
                            <span>{format(new Date(note.created_at), 'MMM dd, yyyy h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Notes Tab */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notes ({recentNotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar>
                          <AvatarImage src={note.created_user?.profile_image_url} />
                          <AvatarFallback>{note.created_user?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getNoteTypeConfig(note.note_type).color}>
                              {getNoteTypeConfig(note.note_type).label}
                            </Badge>
                            {note.is_important && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white mb-2">{note.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Lead: {note.lead?.first_name} {note.lead?.last_name}</span>
                            <span>By: {note.created_user?.full_name}</span>
                            <span>{format(new Date(note.created_at), 'MMM dd, yyyy h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>Search Notes</Label>
                  <Input
                    placeholder="Search by content, lead name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Note Type</Label>
                    <Select value={noteTypeFilter} onValueChange={setNoteTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {NOTE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lead</Label>
                    <Select value={leadFilter} onValueChange={setLeadFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Leads</SelectItem>
                        {leads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.first_name} {lead.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant={importantFilter ? 'default' : 'outline'}
                      onClick={() => setImportantFilter(!importantFilter)}
                      className="w-full"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Important Only
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search Results ({filteredNotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar>
                          <AvatarImage src={note.created_user?.profile_image_url} />
                          <AvatarFallback>{note.created_user?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getNoteTypeConfig(note.note_type).color}>
                              {getNoteTypeConfig(note.note_type).label}
                            </Badge>
                            {note.is_important && (
                              <Star className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white mb-2">{note.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Lead: {note.lead?.first_name} {note.lead?.last_name}</span>
                            <span>By: {note.created_user?.full_name}</span>
                            <span>{format(new Date(note.created_at), 'MMM dd, yyyy h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Note Modal */}
      <DialogRoot open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add a new note for a lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lead">Lead *</Label>
              <Select value={newNote.lead_id} onValueChange={(value) => setNewNote({ ...newNote, lead_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.first_name} {lead.last_name} ({lead.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="note_type">Note Type</Label>
              <Select value={newNote.note_type} onValueChange={(value: any) => setNewNote({ ...newNote, note_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Enter your note..."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="important"
                checked={newNote.is_important}
                onChange={(e) => setNewNote({ ...newNote, is_important: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="important">Mark as important</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.content.trim() || !newNote.lead_id}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Edit Note Modal */}
      <DialogRoot open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update the note content and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_note_type">Note Type</Label>
              <Select value={editNote.note_type} onValueChange={(value: any) => setEditNote({ ...editNote, note_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_content">Content *</Label>
              <Textarea
                id="edit_content"
                value={editNote.content}
                onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                placeholder="Enter your note..."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_important"
                checked={editNote.is_important}
                onChange={(e) => setEditNote({ ...editNote, is_important: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="edit_important">Mark as important</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditNote} disabled={!editNote.content.trim()}>
              Update Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
} 