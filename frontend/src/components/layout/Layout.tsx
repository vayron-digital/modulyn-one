import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationCenter from '../notifications/NotificationCenter';
import Topbar from './Topbar';
import MobileMenu from './MobileMenu';
import { DESIGN } from '../../lib/design';

export default function Layout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFixed, setIsFixed] = useState(true);

  // Sidebar width based on expanded state
  const sidebarWidth = isExpanded ? DESIGN.sidebarWidth : 80;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      <div className="flex h-screen">
        {/* Sidebar (desktop only) */}
        <aside className={`hidden md:flex flex-col`} style={{ width: sidebarWidth, borderRadius: DESIGN.borderRadius }}>
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden md:ml-[-0.5rem]">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-5 bg-background dark:bg-background-dark" style={{ fontSize: DESIGN.fontSize.base }}>
            <div className="flex justify-end mb-4">
              <NotificationCenter />
            </div>
            <div className="bg-card dark:bg-card-dark rounded-lg shadow-sm dark:shadow-dark" style={{ borderRadius: DESIGN.borderRadius }}>
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </div>
  );
} 