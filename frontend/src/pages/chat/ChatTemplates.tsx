import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/use-toast';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { Copy, Plus, MessageCircle, Mail, Smartphone, MoreHorizontal, X } from 'lucide-react';

interface ChatTemplate {
  id: string;
  title: string;
  content: string;
}

export default function ChatTemplates() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ChatTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChatTemplate | null>(null);
  const [messageValue, setMessageValue] = useState('');
  // TODO: Replace with real admin check
  const isAdmin = true;

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_templates')
        .select('*')
        .order('title');

      if (error) throw error;

      setTemplates(data);
    } catch (error: any) {
      console.error('Error fetching chat templates:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: 'Copied!', description: 'Template copied to clipboard.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy.', variant: 'destructive' });
    }
  };

  const handleUseTemplate = (template: ChatTemplate) => {
    setSelectedTemplate(template);
    setMessageValue(template.content);
    setShowUseModal(true);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(messageValue);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    setShowUseModal(false);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(selectedTemplate?.title || '');
    const body = encodeURIComponent(messageValue);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowUseModal(false);
  };

  const handleSendSMS = () => {
    const body = encodeURIComponent(messageValue);
    window.open(`sms:?body=${body}`);
    setShowUseModal(false);
  };

  const handleOther = async () => {
    await handleCopy(messageValue);
    setShowUseModal(false);
  };

  const handleCreateTemplate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: 'Error', description: 'Title and content required.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const { error } = await supabase.from('chat_templates').insert([{ title: newTitle, content: newContent }]);
      if (error) throw error;
      toast({ title: 'Success', description: 'Template created.' });
      setShowNewModal(false);
      setNewTitle('');
      setNewContent('');
      fetchTemplates();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat Templates</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTemplates}>Refresh</Button>
          {isAdmin && (
            <Button onClick={() => setShowNewModal(true)} className="bg-primary text-white">
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Templates List */}
      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{template.title}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(template.content)} title="Copy">
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="mb-2 whitespace-pre-line">{template.content}</p>
              <Button
                onClick={() => handleUseTemplate(template)}
                className="mt-2"
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Chat Template</h2>
            <Input
              placeholder="Title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="mb-3"
            />
            <textarea
              placeholder="Template Content"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full border rounded p-2 mb-4 min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewModal(false)} disabled={creating}>Cancel</Button>
              <Button onClick={handleCreateTemplate} disabled={creating} className="bg-primary text-white">Create</Button>
            </div>
          </div>
        </div>
      )}

      {showUseModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-black" onClick={() => setShowUseModal(false)}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-2">How would you like to use this template?</h2>
            <p className="mb-4 text-gray-500">Edit the message below if needed, then choose an option:</p>
            <textarea
              className="w-full border rounded p-2 mb-4 min-h-[100px]"
              value={messageValue}
              onChange={e => setMessageValue(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <Button onClick={handleSendWhatsApp} className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 w-full">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
              <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full">
                <Mail className="h-4 w-4" /> Email
              </Button>
              <Button onClick={handleSendSMS} className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 w-full">
                <Smartphone className="h-4 w-4" /> SMS
              </Button>
              <Button onClick={handleOther} className="bg-gray-200 hover:bg-gray-300 text-black flex items-center gap-2 w-full">
                <Copy className="h-4 w-4" /> Other (Copy to Clipboard)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 