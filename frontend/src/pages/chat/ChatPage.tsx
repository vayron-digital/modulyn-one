import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { User } from '../../types/auth';
import { cn } from '../../lib/utils';
import { Input, Button, FormGroup } from '../../components/ui';
import { toast } from '../../components/ui/use-toast';

const mockChannels = [
  { id: 'general', name: 'General' },
  { id: 'random', name: 'Random' },
  { id: 'sales', name: 'Sales' },
  { id: 'support', name: 'Support' },
];

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeouts = useRef<{ [userId: string]: NodeJS.Timeout }>({});
  const [uploading, setUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [crmLeads, setCrmLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [shareTab, setShareTab] = useState<'leads' | 'properties' | 'events'>('leads');
  const [crmProperties, setCrmProperties] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [crmEvents, setCrmEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const MOCK_LEADS = [
    { id: 'lead-1', name: 'John Doe', email: 'john@example.com' },
    { id: 'lead-2', name: 'Jane Smith', email: 'jane@example.com' },
  ];
  const isMobile = useMediaQuery('(max-width: 700px)');
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLength = useRef<number>(0);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [chatPanelHeight, setChatPanelHeight] = useState<string | undefined>(undefined);
  // For swipe-to-open sidebar
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [activeChannel, setActiveChannel] = useState(mockChannels[0]);

  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) throw new Error('Not signed in');
        const { data, error } = await supabase
          .from('chat_threads')
          .select('*')
          .ilike('participants', `%${user.id}%`)
          .order('updated_at', { ascending: false });
        if (error) throw error;
        setThreads(data || []);
        setActiveThread((data && data[0]) || null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch threads');
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, [user]);

  useEffect(() => {
    if (!activeThread) return;
    const fetchMessages = async () => {
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('thread_id', activeThread.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        setMessages(data || []);
      } catch (err: any) {
        setMessagesError(err.message || 'Failed to fetch messages');
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [activeThread]);

  // Connect to Socket.IO on mount
  useEffect(() => {
    console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
    const s = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  // Join thread room and listen for new messages
  useEffect(() => {
    if (!socket || !activeThread) return;
    socket.emit('joinThread', { threadId: activeThread.id });
    const handleNewMessage = ({ message }: any) => {
      if (message.thread_id === activeThread.id) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => { socket.off('newMessage', handleNewMessage); };
  }, [socket, activeThread]);

  // Prevent page scroll when chat is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  // Set CSS variable for dynamic viewport height
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.0087;
      document.documentElement.style.setProperty('--app-vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  // Mark messages as read when opening a thread
  useEffect(() => {
    if (!activeThread || !user) return;
    const markAsRead = async () => {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('thread_id', activeThread.id)
        .eq('is_read', false)
        .neq('sender_id', user.id);
      // Refetch messages for the thread
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', activeThread.id)
        .order('created_at', { ascending: true });
      if (!error) setMessages(data || []);
      // Optionally: trigger unread badge update (Socket.IO will handle real-time for others)
    };
    markAsRead();
  }, [activeThread, user]);

  // Emit typing event
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket && activeThread && user) {
      socket.emit('typing', { threadId: activeThread.id, userId: user.id, userName: user.full_name });
    }
  };

  // Listen for typing events
  useEffect(() => {
    if (!socket || !activeThread) return;
    const handleTyping = ({ threadId, userId, userName }: any) => {
      if (threadId === activeThread.id && userId !== user?.id) {
        setTypingUsers((prev) => {
          if (!prev.includes(userName)) return [...prev, userName];
          return prev;
        });
        if (typingTimeouts.current[userId]) clearTimeout(typingTimeouts.current[userId]);
        typingTimeouts.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter(name => name !== userName));
        }, 2000);
      }
    };
    socket.on('typing', handleTyping);
    return () => { socket.off('typing', handleTyping); };
  }, [socket, activeThread, user]);

  const sendMessage = async () => {
    if (!input.trim() || !activeThread || !user) return;

    const newMsg = {
      thread_id: activeThread.id,
      sender_id: user.id,
      content: input,
      type: 'text',
      created_at: new Date().toISOString(),
    };

    setInput('');
    setMessages(prev => [...prev, newMsg]);

    try {
      // Emit via Socket.IO for real-time
      socket?.emit('sendMessage', {
        threadId: activeThread.id,
        senderId: user.id,
        content: input,
        type: 'text',
      });
      
      // Insert to Supabase for persistence
      const { error } = await supabase.from('chat_messages').insert([newMsg]);
      
      if (error) {
        console.error('Error saving message:', error);
        throw new Error(error.message || 'Failed to save message');
      }
    } catch (err: any) {
      console.error('Error in sendMessage:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to send message',
        variant: 'destructive'
      });
      // Optionally: revert the optimistic update
      setMessages(prev => prev.filter(msg => msg !== newMsg));
    }
  };

  // Fetch all users for new chat
  const openNewChatModal = async () => {
    setShowNewChatModal(true);
    setUsersLoading(true);
    setUsersError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user?.id);
        
      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.message || 'Failed to fetch users');
      }
      
      setAllUsers(data || []);
    } catch (err: any) {
      console.error('Error in openNewChatModal:', err);
      setUsersError(err.message || 'Failed to fetch users');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Create or get thread with selected user
  const startNewChat = async (otherUser: any) => {
    if (!user) return;
    
    try {
      // Check if thread exists
      const participants = [user.id, otherUser.id].sort().join(',');
      const { data: existing, error: findErr } = await supabase
        .from('chat_threads')
        .select('*')
        .ilike('participants', `%${user.id}%`)
        .ilike('participants', `%${otherUser.id}%`);
        
      if (findErr) {
        console.error('Error finding existing thread:', findErr);
        throw new Error(findErr.message || 'Failed to check existing thread');
      }
      
      let thread = existing && existing.find((t: any) => {
        const ids = t.participants.split(',').map((id: string) => id.trim()).sort().join(',');
        return ids === participants;
      });
      
      if (!thread) {
        // Create new thread
        const { data: created, error: createErr } = await supabase
          .from('chat_threads')
          .insert([{ participants }])
          .select();
          
        if (createErr) {
          console.error('Error creating thread:', createErr);
          throw new Error(createErr.message || 'Failed to create new chat thread');
        }
        
        thread = created && created[0];
      }
      
      setShowNewChatModal(false);
      setActiveThread(thread);
      
      // Optionally: refetch threads
      const { data: threadsData, error: threadsError } = await supabase
        .from('chat_threads')
        .select('*')
        .ilike('participants', `%${user.id}%`)
        .order('updated_at', { ascending: false });
        
      if (threadsError) {
        console.error('Error refreshing threads:', threadsError);
        // Don't throw here as the main operation succeeded
      } else {
        setThreads(threadsData || []);
      }
    } catch (err: any) {
      console.error('Error in startNewChat:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to start new chat',
        variant: 'destructive'
      });
    }
  };

  // File upload handler (mock: just use URL.createObjectURL for now)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeThread || !user) return;
    
    setUploading(true);
    
    try {
      // TODO: Replace with Supabase Storage upload
      const url = URL.createObjectURL(file);
      
      const fileMsg = {
        thread_id: activeThread.id,
        sender_id: user.id,
        content: JSON.stringify({ url, name: file.name, type: file.type }),
        type: 'file',
        created_at: new Date().toISOString(),
      };
      
      socket?.emit('sendMessage', {
        threadId: activeThread.id,
        senderId: user.id,
        content: JSON.stringify({ url, name: file.name, type: file.type }),
        type: 'file',
      });
      
      const { error } = await supabase.from('chat_messages').insert([fileMsg]);
      
      if (error) {
        console.error('Error saving file message:', error);
        throw new Error(error.message || 'Failed to save file message');
      }
      
      setMessages(prev => [...prev, fileMsg]);
    } catch (err: any) {
      console.error('Error in handleFileChange:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // Fetch real leads for 'Share from CRM'
  const openShareModal = async () => {
    setShowShareModal(true);
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      if (!user) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('leads')
        .select('id, first_name, last_name, email')
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .is('dumped_at', null)
        .limit(10);
      if (error) throw error;
      setCrmLeads(data || []);
    } catch (err: any) {
      setLeadsError(err.message || 'Failed to fetch leads');
    } finally {
      setLeadsLoading(false);
    }
  };

  // Fetch real properties
  const fetchProperties = async () => {
    setPropertiesLoading(true);
    setPropertiesError(null);
    try {
      if (!user) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address, price, status')
        .limit(10);
      if (error) throw error;
      setCrmProperties(data || []);
    } catch (err: any) {
      setPropertiesError(err.message || 'Failed to fetch properties');
    } finally {
      setPropertiesLoading(false);
    }
  };

  // Fetch real events
  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      if (!user) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, event_date')
        .limit(10);
      if (error) throw error;
      setCrmEvents(data || []);
    } catch (err: any) {
      setEventsError(err.message || 'Failed to fetch events');
    } finally {
      setEventsLoading(false);
    }
  };

  // Fetch data for active tab
  useEffect(() => {
    if (!showShareModal) return;
    if (shareTab === 'leads') return; // already fetched on open
    if (shareTab === 'properties') fetchProperties();
    if (shareTab === 'events') fetchEvents();
  }, [showShareModal, shareTab]);

  // Share real lead
  const shareLead = (lead: any) => {
    if (!activeThread || !user) return;
    const payload = {
      id: lead.id,
      name: `${lead.first_name} ${lead.last_name}`,
      email: lead.email,
    };
    socket?.emit('sendMessage', {
      threadId: activeThread.id,
      senderId: user.id,
      content: JSON.stringify(payload),
      type: 'lead',
    });
    supabase.from('chat_messages').insert([
      {
        thread_id: activeThread.id,
        sender_id: user.id,
        content: JSON.stringify(payload),
        type: 'lead',
        created_at: new Date().toISOString(),
      },
    ]);
    setShowShareModal(false);
  };

  // Share property
  const shareProperty = (property: any) => {
    if (!activeThread || !user) return;
    const payload = {
      id: property.id,
      title: property.title,
      address: property.address,
      price: property.price,
      status: property.status,
    };
    socket?.emit('sendMessage', {
      threadId: activeThread.id,
      senderId: user.id,
      content: JSON.stringify(payload),
      type: 'property',
    });
    supabase.from('chat_messages').insert([
      {
        thread_id: activeThread.id,
        sender_id: user.id,
        content: JSON.stringify(payload),
        type: 'property',
        created_at: new Date().toISOString(),
      },
    ]);
    setShowShareModal(false);
  };

  // Share event
  const shareEvent = (event: any) => {
    if (!activeThread || !user) return;
    const payload = {
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.event_date,
    };
    socket?.emit('sendMessage', {
      threadId: activeThread.id,
      senderId: user.id,
      content: JSON.stringify(payload),
      type: 'event',
    });
    supabase.from('chat_messages').insert([
      {
        thread_id: activeThread.id,
        sender_id: user.id,
        content: JSON.stringify(payload),
        type: 'event',
        created_at: new Date().toISOString(),
      },
    ]);
    setShowShareModal(false);
  };

  // Poll messages every 5 seconds as a fallback for real-time
  useEffect(() => {
    if (!activeThread) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('thread_id', activeThread.id)
        .order('created_at', { ascending: true });
      if (!error && data) {
        // Animate new messages
        if (prevMessagesLength.current && data.length > prevMessagesLength.current) {
          setMessages(data.map((msg, i) =>
            i === data.length - 1 ? { ...msg, _animate: true } : msg
          ));
        } else {
          setMessages(data);
        }
        prevMessagesLength.current = data.length;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeThread]);

  // Auto-scroll to latest message on messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useLayoutEffect(() => {
    if (!isMobile) return;
    const updateHeight = () => {
      const headerH = headerRef.current?.offsetHeight || 0;
      const inputH = inputRef.current?.offsetHeight || 0;
      // BottomNav is 64px
      setChatPanelHeight(`calc(100dvh - ${headerH + inputH + 64}px)`);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isMobile]);

  // Helper to get the other user's info for any thread
  const getOtherUserInfoForThread = (thread: any) => {
    if (!thread || !user) return {};
    const participantIds = (thread.participants || '').split(',').map((id: string) => id.trim());
    const otherId = participantIds.find((id: string) => id !== user.id);
    if (!otherId) return {};
    const otherUser = allUsers.find(u => u.id === otherId);
    return otherUser || {};
  };

  // Fetch all users (except current user) on mount for header display
  useEffect(() => {
    if (!user) return;
    const fetchAllUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, profile_image_url')
        .neq('id', user.id);
      if (!error) setAllUsers(data || []);
    };
    fetchAllUsers();
  }, [user]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background text-foreground">
      {/* Sidebar: Channels + DMs */}
      <aside className="w-64 bg-sidebar dark:bg-gray-900 border-r border-border dark:border-border-dark flex flex-col">
        <div className="p-4 text-lg font-bold tracking-wide border-b border-border dark:border-border-dark flex items-center justify-between">
          <span>Channels</span>
          <button onClick={openNewChatModal} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20">+ New DM</button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {mockChannels.map((ch) => (
            <div
              key={ch.id}
              className={cn(
                'px-4 py-2 cursor-pointer hover:bg-sidebar transition',
                activeChannel.id === ch.id && 'bg-sidebar font-semibold text-primary'
              )}
              onClick={() => setActiveChannel(ch)}
            >
              #{ch.name}
            </div>
          ))}
          <div className="mt-6 px-4 text-xs text-muted-foreground dark:text-muted-foreground-dark uppercase tracking-wider">Direct Messages</div>
          {threads.map((thread) => {
            const other = getOtherUserInfoForThread(thread);
            return (
              <div
                key={thread.id}
                className={cn(
                  'px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-sidebar transition',
                  activeThread?.id === thread.id && 'bg-sidebar font-semibold text-primary'
                )}
                onClick={() => setActiveThread(thread)}
              >
                <img src={other.profile_image_url || '/default-avatar.png'} alt="avatar" className="w-6 h-6 rounded-full" />
                <span>{other.full_name || 'User'}</span>
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border dark:border-border-dark text-xs text-muted-foreground dark:text-muted-foreground-dark">Slack-style CRM Chat</div>
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-background dark:bg-background-dark">
        {/* Header */}
        <div ref={headerRef} className="px-6 py-4 border-b border-border dark:border-border-dark flex items-center gap-3 bg-card dark:bg-card-dark">
          {activeThread ? (
            <>
              <img src={getOtherUserInfoForThread(activeThread).profile_image_url || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
              <span className="text-lg font-bold">{getOtherUserInfoForThread(activeThread).full_name || 'Direct Message'}</span>
            </>
          ) : (
            <span className="text-xl font-bold">#{activeChannel.name}</span>
          )}
          <button
            onClick={openShareModal}
            className="ml-auto bg-sidebar text-xs text-white px-3 py-1 rounded hover:bg-primary/80 border border-border"
          >
            Share from CRM
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-background dark:bg-background-dark" id="chat-messages" style={isMobile ? { height: chatPanelHeight } : {}}>
          {messagesLoading ? (
            <div className="text-center text-muted-foreground dark:text-muted-foreground-dark">Loading messages...</div>
          ) : messagesError ? (
            <div className="text-center text-red-400">{messagesError}</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground dark:text-muted-foreground-dark">No messages yet. Start the convo!</div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.sender_id === user?.id;
              const sender = allUsers.find(u => u.id === msg.sender_id) || {};
              if (msg.type === 'lead') {
                const lead = JSON.parse(msg.content);
                return (
                  <div key={`lead-${msg.id || idx}`} className="flex gap-3 items-end group cursor-pointer max-w-[70%] hover:bg-sidebar p-2 rounded-xl transition" onClick={() => navigate(`/leads/${lead.id}`)} title="View Lead Details">
                    <img src={sender.profile_image_url || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className={`${isMine ? 'bg-primary text-white' : 'bg-[#E8C77B] text-gray-900'} rounded-2xl px-4 py-2 shadow min-w-[180px]`}>
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        {lead.name}
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark font-normal">{lead.email}</span>
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1">Shared Lead</div>
                    </div>
                  </div>
                );
              }
              if (msg.type === 'file') {
                const file = JSON.parse(msg.content);
                const isImage = file.type && file.type.startsWith('image/');
                return (
                  <div key={msg.id || idx} className="flex gap-3 items-end max-w-[70%]">
                    <img src={sender.profile_image_url || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className={`${isMine ? 'bg-primary text-white' : 'bg-[#E8C77B] text-gray-900'} rounded-2xl px-4 py-2 shadow min-w-[180px]`}>
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        📎 {file.name}
                      </div>
                      {isImage ? (
                        <img src={file.url} alt={file.name} className="max-w-[200px] max-h-[120px] rounded mt-2" />
                      ) : (
                        <a href={file.url} download={file.name} className="text-primary underline text-xs">Download</a>
                      )}
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1">Shared File</div>
                    </div>
                  </div>
                );
              }
              if (msg.type === 'property') {
                const property = JSON.parse(msg.content);
                return (
                  <div key={msg.id || idx} className="flex gap-3 items-end group cursor-pointer max-w-[70%] hover:bg-sidebar p-2 rounded-xl transition" title="View Property Details">
                    <img src={sender.profile_image_url || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className={`${isMine ? 'bg-primary text-white' : 'bg-[#E8C77B] text-gray-900'} rounded-2xl px-4 py-2 shadow min-w-[180px]`}>
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        {property.title}
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark font-normal">{property.address}</span>
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1">AED {property.price} • {property.status}</div>
                    </div>
                  </div>
                );
              }
              if (msg.type === 'event') {
                const event = JSON.parse(msg.content);
                return (
                  <div key={msg.id || idx} className="flex gap-3 items-end group cursor-pointer max-w-[70%] hover:bg-sidebar p-2 rounded-xl transition" title="View Event Details">
                    <img src={sender.profile_image_url || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className={`${isMine ? 'bg-primary text-white' : 'bg-[#E8C77B] text-gray-900'} rounded-2xl px-4 py-2 shadow min-w-[180px]`}>
                      <div className="text-sm font-medium mb-1 flex items-center gap-2">
                        {event.title}
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark font-normal">{event.event_date}</span>
                      </div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark mt-1">{event.description}</div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={msg.id || idx} className={`flex gap-3 items-end ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && <img src={sender.profile_image_url || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />}
                  <div className={`${isMine ? 'bg-primary text-white' : 'bg-[#E8C77B] text-gray-900'} rounded-2xl px-4 py-2 max-w-[60%] shadow`}>
                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                      {isMine ? 'You' : sender.full_name || 'Agent'}
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark font-normal">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="whitespace-pre-line break-words">{msg.content}</div>
                  </div>
                  {isMine && <img src={user?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />}
                </div>
              );
            })
          )}
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark mt-2">{typingUsers.join(', ')} typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Sticky Input */}
        <form
          ref={inputRef}
          className="p-4 border-t border-border dark:border-border-dark bg-card dark:bg-card-dark flex gap-3 items-center"
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <FormGroup className="flex-1 mb-0">
            <Input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={activeThread ? `Message ${getOtherUserInfoForThread(activeThread).full_name || 'DM'}` : `Message #${activeChannel.name}`}
              autoFocus
              disabled={uploading}
            />
          </FormGroup>
          <label className="cursor-pointer" title="Upload file">
            <Input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
            <span className={`text-2xl ${uploading ? 'text-muted-foreground dark:text-muted-foreground-dark' : 'text-primary'}`}>📎</span>
          </label>
          <Button
            type="submit"
            disabled={!input.trim() || uploading}
            className="rounded-full px-5 py-2 font-semibold"
          >
            Send
          </Button>
        </form>
      </main>
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
          <div className="bg-card rounded-2xl p-8 w-96 max-w-full shadow-xl">
            <div className="font-bold text-lg mb-4">Start a New DM</div>
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full mb-4 px-4 py-2 rounded bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {usersLoading ? (
              <div className="text-muted-foreground dark:text-muted-foreground-dark">Loading users...</div>
            ) : usersError ? (
              <div className="text-red-400">{usersError}</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {allUsers.filter(u => u.full_name?.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded hover:bg-sidebar cursor-pointer" onClick={() => startNewChat(u)}>
                    <img src={u.profile_image_url || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-medium">{u.full_name}</div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark">{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowNewChatModal(false)} className="mt-4 bg-sidebar border border-sidebar rounded px-4 py-2 text-white hover:bg-primary">Cancel</button>
          </div>
        </div>
      )}
      {/* Share from CRM Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
          <div className="bg-card rounded-2xl p-8 w-96 max-w-full shadow-xl">
            <div className="font-bold text-lg mb-4">Share from CRM</div>
            <div className="flex gap-2 mb-4">
              <button className={cn('px-3 py-1 rounded', shareTab === 'leads' ? 'bg-primary text-white' : 'bg-sidebar text-gray-400')} onClick={() => setShareTab('leads')}>Leads</button>
              <button className={cn('px-3 py-1 rounded', shareTab === 'properties' ? 'bg-primary text-white' : 'bg-sidebar text-gray-400')} onClick={() => setShareTab('properties')}>Properties</button>
              <button className={cn('px-3 py-1 rounded', shareTab === 'events' ? 'bg-primary text-white' : 'bg-sidebar text-gray-400')} onClick={() => setShareTab('events')}>Events</button>
            </div>
            {shareTab === 'leads' && (leadsLoading ? (
              <div className="text-muted-foreground dark:text-muted-foreground-dark">Loading leads...</div>
            ) : leadsError ? (
              <div className="text-red-400">{leadsError}</div>
            ) : crmLeads.length === 0 ? (
              <div className="text-muted-foreground dark:text-muted-foreground-dark">No leads found.</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {crmLeads.map(lead => (
                  <div key={lead.id} className="flex items-center gap-3 p-2 rounded hover:bg-sidebar cursor-pointer" onClick={() => shareLead(lead)}>
                    <div>
                      <div className="font-medium">{lead.first_name} {lead.last_name}</div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark">{lead.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {shareTab === 'properties' && (propertiesLoading ? (
              <div className="text-muted-foreground dark:text-muted-foreground-dark">Loading properties...</div>
            ) : propertiesError ? (
              <div className="text-red-400">{propertiesError}</div>
            ) : crmProperties.length === 0 ? (
              <div className="text-muted-foreground dark:text-muted-foreground-dark">No properties found.</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {crmProperties.map(property => (
                  <div key={property.id} className="flex items-center gap-3 p-2 rounded hover:bg-sidebar cursor-pointer" onClick={() => shareProperty(property)}>
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark">{property.address}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {shareTab === 'events' && (eventsLoading ? (
              <div className="text-muted-foreground dark:text-muted-foreground-dark">Loading events...</div>
            ) : eventsError ? (
              <div className="text-red-400">{eventsError}</div>
            ) : crmEvents.length === 0 ? (
              <div className="text-muted-foreground dark:text-muted-foreground-dark">No events found.</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {crmEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded hover:bg-sidebar cursor-pointer" onClick={() => shareEvent(event)}>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark">{event.event_date}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={() => setShowShareModal(false)} className="mt-4 bg-sidebar border border-sidebar rounded px-4 py-2 text-white hover:bg-primary">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const popupStyle = document.createElement('style');
popupStyle.innerHTML = `@keyframes popup { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }`;
document.head.appendChild(popupStyle);

export default ChatPage; 