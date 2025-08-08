import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Auto-collapse on mobile
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen((prev: boolean) => !prev), []);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

  const value = useMemo(() => ({ 
    isOpen, 
    toggle, 
    setOpen, 
    isMobile 
  }), [isOpen, toggle, setOpen, isMobile]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
} 