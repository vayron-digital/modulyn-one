import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiShare2, FiUpload, FiStar, FiPlus, FiList, FiSettings, FiBell, FiHome, FiUsers, FiBarChart2, FiTarget, FiBookOpen } from 'react-icons/fi';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const SIDEBAR_TOP_MARGIN = '5.5rem'; // rem, matches top nav height

const Sidebar: React.FC = () => {
  const location = useLocation();
  // Determine sidebar options based on route
  let TOOL_ICONS = [];
  if (location.pathname.startsWith('/dashboard/journeys')) {
    TOOL_ICONS = [
      { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
      { icon: <FiTarget />, label: 'Journeys', path: '/dashboard/journeys' },
      { icon: <FiBookOpen />, label: 'Knowledge', path: '/dashboard/journeys/knowledge' },
      { icon: <FiSettings />, label: 'Settings', path: '/settings' },
    ];
  } else if (location.pathname.startsWith('/dashboard')) {
    TOOL_ICONS = [
      { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
      { icon: <FiBarChart2 />, label: 'Analytics', path: '/dashboard/analytics' },
      { icon: <FiUsers />, label: 'Team', path: '/team' },
      { icon: <FiSettings />, label: 'Settings', path: '/settings' },
    ];
  } else if (location.pathname.startsWith('/leads')) {
    TOOL_ICONS = [
      { icon: <FiUsers />, label: 'Leads', path: '/leads' },
      { icon: <FiPlus />, label: 'Add Lead', path: '/leads/add' },
      { icon: <FiList />, label: 'All Leads', path: '/leads/all' },
      { icon: <FiSettings />, label: 'Settings', path: '/settings' },
    ];
  } else {
    TOOL_ICONS = [
      { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
      { icon: <FiSettings />, label: 'Settings', path: '/settings' },
    ];
  }

  return (
    <aside
      style={{
        position: 'fixed',
        left: '0.625rem',
        top: SIDEBAR_TOP_MARGIN,
        height: `calc(100vh - ${SIDEBAR_TOP_MARGIN})`,
        width: '4rem',
        background: 'rgba(255, 255, 255, 0)',
        borderTopLeftRadius: '0.5rem',
        borderBottomLeftRadius: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2.2rem 0',
        gap: '1.38rem',
        border: 'none',
        zIndex: 200,
        transition: 'box-shadow 0.2s, background 0.2s',
        backgroundClip: 'padding-box',
        backdropFilter: 'blur(0.5rem)',
        WebkitBackdropFilter: 'blur(0.5rem)',
      }}
    >
      {TOOL_ICONS.map((tool, idx) => {
        // Animation logic per item
        const baseItemSize = 44; // px
        const magnification = 64; // px
        const spring = { mass: 0.1, stiffness: 150, damping: 12 };
        const isHovered = useMotionValue(0);
        const size = useSpring(useTransform(isHovered, [0, 1], [baseItemSize, magnification]), spring);
        return (
          <div key={tool.label} style={{ position: 'relative', width: '100%' }}>
            <a href={tool.path} style={{ textDecoration: 'none' }}>
              <motion.button
                title={tool.label}
                style={{
                  background: 'rgba(255, 255, 255, 0)',
                  border: 'none',
                  borderRadius: '1.125rem',
                  width: size,
                  height: size,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.625rem auto',
                  boxShadow: '0 0.125rem 0.5rem rgba(16,30,54,0.06)',
                  cursor: 'pointer',
                  fontSize: '1.375rem',
                  color: '#23262F',
                  transition: 'box-shadow 0.18s, background 0.18s',
                  outline: 'none',
                  position: 'relative',
                  backdropFilter: 'blur(0.5rem)',
                  WebkitBackdropFilter: 'blur(0.5rem)',
                }}
                onHoverStart={() => isHovered.set(1)}
                onHoverEnd={() => isHovered.set(0)}
                aria-label={tool.label}
                whileTap={{ scale: 0.95 }}
              >
                {tool.icon}
              </motion.button>
            </a>
            {/* Tooltip */}
            <span
              style={{
                visibility: 'hidden',
                opacity: 0,
                background: '#23262F',
                color: '#fff',
                borderRadius: '0.5rem',
                padding: '0.25rem 0.75rem',
                fontSize: '0.81rem',
                position: 'absolute',
                left: '3.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                transition: 'opacity 0.18s',
                zIndex: 100,
              }}
              className="sidebar-tooltip"
            >
              {tool.label}
            </span>
          </div>
        );
      })}
      <style>{`
        aside > div:hover .sidebar-tooltip {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar; 