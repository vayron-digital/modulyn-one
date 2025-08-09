import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Clean top navigation - navigation is handled by sidebar

const TopNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    setShowSearch(!showSearch);
    // You can add a search modal or redirect to search page
    if (!showSearch) {
      navigate('/search');
    }
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    // You can add a notifications dropdown or redirect to notifications page
    if (!showNotifications) {
      navigate('/notifications');
    }
  };

  const handleHelp = () => {
    setShowHelp(!showHelp);
    // You can add a help modal or redirect to help page
    if (!showHelp) {
      navigate('/help');
    }
  };

  const handleProfile = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileSettings = () => {
    setShowProfileDropdown(false);
    navigate('/settings?tab=profile');
  };

  const handleSignOut = async () => {
    try {
      setShowProfileDropdown(false);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.2rem 2rem',
      fontFamily: 'Inter, SF Pro, Arial, Helvetica, sans-serif',
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: 'none',
      position: 'sticky',
      top: 0,
      left: 0,
      width: '100vw',
      maxWidth: '100vw',
      overflowX: 'hidden',
      flexWrap: 'nowrap',
      zIndex: 100,
      backdropFilter: 'blur(0.5rem)',
      WebkitBackdropFilter: 'blur(0.5rem)',
      transition: 'background 0.2s',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', flexShrink: 0, marginLeft: '80px' }}>
        <img 
          src="/logoBlack.png" 
          alt="Modulyn One" 
          style={{ 
            height: '36px', 
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      </div>
      {/* Breadcrumb or Current Page */}
      <div style={{ 
        flex: 1, 
        textAlign: 'center',
        fontSize: '1.1rem',
        fontWeight: 600,
        color: '#23262F',
        textTransform: 'capitalize'
      }}>
        {location.pathname === '/' ? 'Dashboard' : 
         location.pathname.split('/')[1]?.replace('-', ' ') || 'Dashboard'}
      </div>
      {/* Utility Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.88em', flexShrink: 0 }}>
        <button 
          onClick={handleSearch}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: '0.38em',
            borderRadius: '0.5em',
            transition: 'background-color 0.2s'
          }} 
          title="Search"
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="1.38em" height="1.38em" fill="none" stroke="#23262F" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
        <button 
          onClick={handleNotifications}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: '0.38em',
            borderRadius: '0.5em',
            transition: 'background-color 0.2s'
          }} 
          title="Notifications"
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="1.38em" height="1.38em" fill="none" stroke="#23262F" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
        </button>
        <button 
          onClick={handleHelp}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: '0.38em',
            borderRadius: '0.5em',
            transition: 'background-color 0.2s'
          }} 
          title="Help"
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="1.38em" height="1.38em" fill="none" stroke="#23262F" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 115.82 0c0 1.657-1.343 3-3 3v2" /><circle cx="12" cy="17" r="1" /></svg>
        </button>
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={handleProfile}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '0.25em',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            title="Profile"
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <img 
              src="/default-avatar.png" 
              alt="User" 
              style={{ 
                width: '2.375em', 
                height: '2.375em', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                border: '0.125em solid #e5e7eb', 
                boxShadow: 'var(--card-shadow)' 
              }} 
            />
          </button>
          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5em',
              background: 'white',
              borderRadius: '0.5em',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              minWidth: '200px',
              zIndex: 1000,
            }}>
              <div style={{ padding: '1em' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5em' }}>
                  {user?.email || 'User'}
                </div>
                <div style={{ fontSize: '0.875em', color: '#6b7280', marginBottom: '1em' }}>
                  {user?.email || 'user@example.com'}
                </div>
                <button
                  onClick={handleProfileSettings}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5em',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '0.25em',
                    fontSize: '0.875em'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5em',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '0.25em',
                    fontSize: '0.875em',
                    color: '#ef4444'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavBar; 