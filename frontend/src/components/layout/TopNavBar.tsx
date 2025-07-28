import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Leads', path: '/leads' },
  { label: 'Properties', path: '/properties' },
  { label: 'Calls', path: '/calls' },
  { label: 'Tasks', path: '/tasks' },
 // { label: 'Team', path: '/team' },
 // { label: 'Scheduler', path: '/scheduler' },
 // { label: 'Documents', path: '/documents' },
 // { label: 'Reports', path: '/reports' },
 // { label: 'Settings', path: '/settings' },
];

const TopNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '2.5rem 2vw 1.5rem 2vw',
      fontFamily: 'Inter, SF Pro, Arial, Helvetica, sans-serif',
      background: 'rgba(255, 255, 255, 0)',
      boxShadow: 'none',
      border: 'none',
      position: 'sticky',
      top: 0,
      left: 0,
      width: '100vw',
      maxWidth: '100vw',
      overflowX: 'hidden',
      flexWrap: 'nowrap',
      zIndex: 300,
      backdropFilter: 'blur(0.5rem)',
      WebkitBackdropFilter: 'blur(0.5rem)',
      transition: 'background 0.2s',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', flexShrink: 0 }}>
        <img 
          src="/logoBlack.png" 
          alt="Modulyn One" 
          style={{ 
            height: '62px', 
            width: 'auto',
            objectFit: 'contain',
            marginLeft: '50px'
          }} 
        />
      </div>
      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5em', flexWrap: 'nowrap', overflow: 'hidden', maxWidth: '70vw', minWidth: 0 }}>
        {NAV_LINKS.map(link => {
          const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
          return (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              style={{
                background: isActive ? '#101620' : 'transparent',
                color: isActive ? '#fff' : '#23262F',
                borderRadius: '1.375em',
                fontWeight: 500,
                fontSize: '1.06rem',
                padding: isActive ? '0.625em 1.375em' : '0.625em 0.875em',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'Inter, SF Pro, Arial, Helvetica, sans-serif',
                boxShadow: isActive ? 'var(--card-shadow)' : 'none',
                transition: 'background 0.2s, color 0.2s',
                textDecoration: 'none',
                position: 'relative',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
              onMouseOver={e => { if (!isActive) (e.currentTarget.style.textDecoration = 'underline'); }}
              onMouseOut={e => { if (!isActive) (e.currentTarget.style.textDecoration = 'none'); }}
            >
              {link.label}
            </button>
          );
        })}
      </nav>
      {/* Utility Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.88em', flexShrink: 0 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.38em' }} title="Search">
          <svg width="1.38em" height="1.38em" fill="none" stroke="#23262F" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.38em' }} title="Notifications">
          <svg width="1.38em" height="1.38em" fill="none" stroke="#23262F" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.38em' }} title="Help">
          <svg width="1.38em" height="1.38em" fill="none" stroke="#23262F" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 115.82 0c0 1.657-1.343 3-3 3v2" /><circle cx="12" cy="17" r="1" /></svg>
        </button>
        <img src="/default-avatar.png" alt="User" style={{ width: '2.375em', height: '2.375em', borderRadius: '50%', objectFit: 'cover', border: '0.125em solid #e5e7eb', boxShadow: 'var(--card-shadow)' }} />
      </div>
    </div>
  );
};

export default TopNavBar; 