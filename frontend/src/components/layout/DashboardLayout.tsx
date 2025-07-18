import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSidebar } from '../../contexts/SidebarContext';
import { cn } from '../../lib/utils';
import Topbar from './Topbar';
import ChatFloatingButton from '../ChatFloatingButton';
import BottomNav from './BottomNav';
import { DESIGN } from '../../lib/design';
import { useFeatures } from '../../hooks/useFeatures';

const DashboardLayout: React.FC = () => {
  const { isOpen, isMobile } = useSidebar();
  const features = useFeatures();

  return (
    <div className="min-h-screen bg-white dark:bg-card-dark w-full">
      <div className={cn('flex w-full h-screen', isMobile && 'block')}> {/* FLEX CONTAINER */}
        {/* Sidebar */}
        {!isMobile && (
          <div
            className="flex-shrink-0 h-full"
            style={{ width: isOpen ? DESIGN.sidebarWidth : 80 }}
          >
            <Sidebar />
          </div>
        )}
        {/* Main Content */}
        <main
          className={cn(
            'flex-1 flex flex-col min-h-screen transition-all duration-300',
            isMobile && 'w-full'
          )}
          style={{ fontSize: DESIGN.fontSize.base }}
        >
          {/* Only show Topbar on desktop */}
          {!isMobile && <Topbar />}
          {/* Main content wrapper */}
          <div className={cn('flex-1 flex flex-col overflow-auto')}> {/* Make main scrollable */}
            {!isMobile ? (
              <div className="container mx-auto px-4 py-8 flex-1">
                <Outlet />
              </div>
            ) : (
              <div style={{ width: '100vw', margin: 0, padding: 0, boxSizing: 'border-box' }}>
                <Outlet />
              </div>
            )}
          </div>
          {isMobile && features.team && <BottomNav />}
        </main>
      </div>
      {/* Only show ChatFloatingButton on desktop/tablet if chat is enabled */}
      {!isMobile && features.chat && <ChatFloatingButton />}
    </div>
  );
};

export default DashboardLayout; 