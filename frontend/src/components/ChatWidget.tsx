import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Use Vite env variable for Socket.IO backend URL
console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

interface Message {
  id: number;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
}

interface Thread {
  id: number;
  name: string;
  participants: string;
}

const DEMO_USER_ID = 'demo-user-1'; // Replace with real user ID from auth
const DEMO_USER_AVATAR = '/default-avatar.png';
const DEMO_CHANNELS = [
  { id: 1, name: 'general' },
  { id: 2, name: 'random' },
  { id: 3, name: 'sales' },
  { id: 4, name: 'support' },
];

export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [activeChannel, setActiveChannel] = useState(DEMO_CHANNELS[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    
    socket.emit('joinThread', { threadId: activeChannel.id });
    
    socket.on('threadMessages', ({ messages }) => {
      if (mounted) {
        setMessages(messages);
      }
    });
    
    socket.on('newMessage', ({ message }) => {
      if (mounted) {
        setMessages((prev) => [...prev, message]);
      }
    });
    
    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [activeChannel.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socketRef.current?.emit('sendMessage', {
      threadId: activeChannel.id,
      senderId: user?.id || DEMO_USER_ID,
      content: input,
      type: 'text',
    });
    setInput('');
  };

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
      setLeads(data || []);
    } catch (err: any) {
      setLeadsError(err.message || 'Failed to fetch leads');
    } finally {
      setLeadsLoading(false);
    }
  };

  const shareLead = (lead: any) => {
    socketRef.current?.emit('sendMessage', {
      threadId: activeChannel.id,
      senderId: user?.id || DEMO_USER_ID,
      content: JSON.stringify(lead),
      type: 'lead',
    });
    setShowShareModal(false);
  };

  // File upload handler (mock: just use URL.createObjectURL for now)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // TODO: Replace with Supabase Storage upload
      const url = URL.createObjectURL(file);
      socketRef.current?.emit('sendMessage', {
        threadId: activeChannel.id,
        senderId: user?.id || DEMO_USER_ID,
        content: JSON.stringify({ url, name: file.name, type: file.type }),
        type: 'file',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[480px] h-[600px] bg-[#18181b] rounded-2xl shadow-2xl flex overflow-hidden z-[1000] border border-[#23232b]">
      {/* Sidebar */}
      <aside className="w-40 bg-[#23232b] flex flex-col border-r border-[#23232b]">
        <div className="p-4 text-lg font-bold tracking-wide border-b border-[#23232b] text-white">Channels</div>
        <nav className="flex-1 overflow-y-auto">
          {DEMO_CHANNELS.map((ch) => (
            <div
              key={ch.id}
              className={`px-4 py-2 cursor-pointer hover:bg-[#282834] transition text-white ${activeChannel.id === ch.id ? 'bg-[#282834] font-semibold text-primary' : ''}`}
              onClick={() => setActiveChannel(ch)}
            >
              #{ch.name}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-[#23232b] text-xs text-gray-400">Slack-style CRM Chat</div>
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23232b] flex items-center gap-3 bg-[#23232b]">
          <span className="text-xl font-bold text-white">#{activeChannel.name}</span>
          <button
            onClick={openShareModal}
            className="ml-auto bg-[#282834] text-xs text-white px-3 py-1 rounded hover:bg-primary/80 border border-[#23232b]"
          >
            Share from CRM
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#18181b]" id="chat-messages">
          {messages.map((msg, idx) => {
            if (msg.type === 'lead') {
              const lead = JSON.parse(msg.content);
              return (
                <div
                  key={msg.id || idx}
                  className="flex gap-3 items-end group cursor-pointer max-w-[70%] hover:bg-[#23232b] p-2 rounded-xl transition"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  title="View Lead Details"
                >
                  <img src={DEMO_USER_AVATAR} alt="avatar" className="w-8 h-8 rounded-full" />
                  <div className="bg-[#23232b] text-white rounded-2xl px-4 py-2 shadow min-w-[180px]">
                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                      {lead.first_name} {lead.last_name}
                      <span className="text-xs text-gray-400 font-normal">{lead.email}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Shared Lead</div>
                  </div>
                </div>
              );
            }
            if (msg.type === 'file') {
              const file = JSON.parse(msg.content);
              const isImage = file.type && file.type.startsWith('image/');
              return (
                <div key={msg.id || idx} className="flex gap-3 items-end max-w-[70%]">
                  <img src={DEMO_USER_AVATAR} alt="avatar" className="w-8 h-8 rounded-full" />
                  <div className="bg-[#23232b] text-white rounded-2xl px-4 py-2 shadow min-w-[180px]">
                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                      📎 {file.name}
                    </div>
                    {isImage ? (
                      <img src={file.url} alt={file.name} className="max-w-[200px] max-h-[120px] rounded mt-2" />
                    ) : (
                      <a href={file.url} download={file.name} className="text-primary underline text-xs">Download</a>
                    )}
                    <div className="text-xs text-gray-400 mt-1">Shared File</div>
                  </div>
                </div>
              );
            }
            const isMine = msg.sender_id === (user?.id || DEMO_USER_ID);
            return (
              <div key={msg.id || idx} className={`flex gap-3 items-end ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && <img src={DEMO_USER_AVATAR} alt="avatar" className="w-8 h-8 rounded-full" />}
                <div className={`rounded-2xl px-4 py-2 max-w-[60%] shadow ${isMine ? 'bg-primary text-white ml-auto' : 'bg-[#23232b] text-gray-100'}`}>
                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                    {isMine ? 'You' : 'Agent'}
                    <span className="text-xs text-gray-400 font-normal">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="whitespace-pre-line break-words">{msg.content}</div>
                </div>
                {isMine && <img src={user?.avatar_url || DEMO_USER_AVATAR} alt="avatar" className="w-8 h-8 rounded-full" />}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* Sticky Input */}
        <form
          className="p-4 border-t border-[#23232b] bg-[#23232b] flex gap-3 items-center"
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Message #${activeChannel.name}`}
            className="flex-1 px-4 py-2 rounded-full bg-[#18181b] text-white border border-[#282834] focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <label className="cursor-pointer" title="Upload file">
            <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
            <span className={`text-2xl ${uploading ? 'text-gray-400' : 'text-primary'}`}>📎</span>
          </label>
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2 rounded-full font-semibold hover:bg-primary/90 transition"
            disabled={!input.trim() || uploading}
          >
            Send
          </button>
        </form>
      </main>
      {/* Share from CRM Modal */}
      {showShareModal && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-80 bg-[#23232b] border border-[#282834] rounded-2xl shadow-xl z-[1001] p-6 text-white">
          <div className="font-bold mb-4 text-lg">Share a Lead</div>
          {leadsLoading ? (
            <div>Loading leads...</div>
          ) : leadsError ? (
            <div className="text-red-400">{leadsError}</div>
          ) : leads.length === 0 ? (
            <div>No leads found.</div>
          ) : (
            leads.map(lead => (
              <div key={lead.id} className="mb-3 p-3 border border-[#282834] rounded-lg cursor-pointer hover:bg-[#18181b]" onClick={() => shareLead(lead)}>
                <div className="font-semibold">{lead.first_name} {lead.last_name}</div>
                <div className="text-xs text-gray-400">{lead.email}</div>
              </div>
            ))
          )}
          <button onClick={() => setShowShareModal(false)} className="mt-4 bg-[#18181b] border border-[#282834] rounded px-4 py-2 text-white hover:bg-[#282834]">Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ChatWidget; 