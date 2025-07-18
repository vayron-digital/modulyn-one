import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Users, Building2, ClipboardList, FileText, Settings, MoreHorizontal, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useFeatures } from '../../hooks/useFeatures';
import { DESIGN } from '../../lib/design';

const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
const BottomNav: React.FC = () => {
  const location = useLocation();
  const [showDropup, setShowDropup] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const features = useFeatures();

  const navGroups = [
    features.dashboard !== false && { label: 'Home', icon: Home, to: '/' },
    features.properties !== false && { label: 'Properties', icon: Building2, to: '/properties' },
    features.leads !== false && { label: 'Leads', icon: Users, to: '/leads' },
    features.tasks !== false && { label: 'Tasks', icon: ClipboardList, to: '/tasks' },
    features.documents && { label: 'Documents', icon: FileText, to: '/documents' },
    features.settings !== false && { label: 'Settings', icon: Settings, to: '/settings' },
  ].filter(Boolean);
  const chatNav = features.chat && { label: 'Chat', icon: MessageSquare, to: '/chat' };

  // Split nav: left, center (chat), right
  const left = navGroups.slice(0, 2);
  const right = navGroups.slice(2, 4);
  const more = navGroups.slice(4);

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100vw',
      height: 64,
      background: DESIGN.colors.primary,
      borderTop: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 99999,
      boxShadow: '0 -2px 12px #0001',
    }}>
      {/* Left group */}
      {left.map(item => {
        const active = location.pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            to={item.to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: active ? '#007bff' : '#888',
              textDecoration: 'none',
              fontWeight: active ? 700 : 500,
              fontSize: 12,
              padding: 4,
            }}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      {/* Center: Chat */}
      {chatNav && (
        <Link
          to={chatNav.to}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: location.pathname.startsWith(chatNav.to) ? '#007bff' : '#888',
            textDecoration: 'none',
            fontWeight: location.pathname.startsWith(chatNav.to) ? 700 : 500,
            fontSize: 13,
            padding: 4,
            background: '#f7fafd',
            borderRadius: 999,
            boxShadow: '0 2px 8px #007bff22',
            margin: '0 8px',
          }}
        >
          <chatNav.icon className="w-7 h-7 mb-1" />
          <span>{chatNav.label}</span>
        </Link>
      )}
      {/* Right group */}
      {right.map(item => {
        const active = location.pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            to={item.to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: active ? '#007bff' : '#888',
              textDecoration: 'none',
              fontWeight: active ? 700 : 500,
              fontSize: 12,
              padding: 4,
            }}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      {/* More: dropup */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={() => setShowDropup(v => !v)}
          style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
        >
          <MoreHorizontal className="w-6 h-6 mb-1" />
          <span>More</span>
        </button>
        {showDropup && (
          <div style={{
            position: 'absolute',
            bottom: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 12,
            boxShadow: '0 4px 24px #0002',
            minWidth: 120,
            zIndex: 9999,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            {more.map(item => {
              const active = location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: active ? '#007bff' : '#222',
                    textDecoration: 'none',
                    fontWeight: active ? 700 : 500,
                    fontSize: 14,
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: active ? '#f0f6ff' : 'none',
                  }}
                  onClick={() => setShowDropup(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            {isMobile && (
              <button
                onClick={async () => {
                  await logout();
                  navigate('/auth/login');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#e11d48',
                  background: 'none',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '6px 8px',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default BottomNav; 