import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

const ChatFloatingButton: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch unread count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id);
      if (!error) setUnread(count || 0);
    };
    fetchUnread();
  }, [user]);

  // Real-time update via Socket.IO
  useEffect(() => {
    console.log('VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
    const s = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(s);
    const handleNewMessage = () => {
      // Refetch unread count on new message
      if (!user) return;
      supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id)
        .then(({ count, error }) => {
          if (!error) setUnread(count || 0);
        });
    };
    s.on('newMessage', handleNewMessage);
    return () => { s.disconnect(); };
  }, [user]);

  if (location.pathname.startsWith('/chat')) return null;

  return (
    <button
      onClick={() => navigate('/chat')}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 2000,
        background: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 64,
        height: 64,
        boxShadow: '0 2px 12px #0002',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        cursor: 'pointer',
      }}
      title="Open Chat"
    >
      💬
      {unread > 0 && (
        <span style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: '#ff3b30',
          color: '#fff',
          borderRadius: 12,
          padding: '2px 8px',
          fontSize: 13,
          fontWeight: 700,
          boxShadow: '0 1px 4px #0002',
        }}>{unread}</span>
      )}
    </button>
  );
};

export default ChatFloatingButton; 