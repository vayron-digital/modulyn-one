import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import styles from './DashboardLayout.module.css';
import Header, { HeaderTab } from './Header';
import Footer from './Footer';
import ComponentErrorBoundary from '../common/ComponentErrorBoundary';

interface LayoutContextType {
  setHeader: (header: HeaderProps) => void;
  setContent: (content: ReactNode) => void;
}

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  tabs?: HeaderTab[];
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
};

const TOPBAR_HEIGHT = -98; // px
export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [header, setHeader] = useState<HeaderProps | null>(null);
  const [content, setContent] = useState<ReactNode>(null);

  return (
    <LayoutContext.Provider value={{ setHeader, setContent }}>
      <TopNavBar />
      <Sidebar />
      <div style={{ marginLeft: 125, marginTop: TOPBAR_HEIGHT, transition: 'margin-left 0.2s, margin-top 0.2s', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className={styles.main} style={{ flex: 1 }}>
          {header && <Header {...header} />}
          {content && <div className={styles.contentColumns}>{content}</div>}
          {!content && children}
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
};

// Default export: use <Outlet /> for nested routes
const DashboardLayout: React.FC = () => (
  <LayoutProvider>
    <ComponentErrorBoundary componentName="DashboardLayout">
      <Outlet />
    </ComponentErrorBoundary>
  </LayoutProvider>
);

export default DashboardLayout; 