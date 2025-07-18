import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Users,
  Home,
  Calendar,
  CheckSquare,
  Phone,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart,
  Building,
  UserPlus,
  PlusCircle,
  Search,
  Bell,
  Command,
  Building2,
  ClipboardList,
  ListChecks,
  Users2,
  FileUp,
  BookOpen,
  Plus,
  BarChart2,
  Trash2,
  Zap,
  MessageSquare,
  Activity,
  Pencil,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useNotifications } from '../../hooks/useNotifications';
import { useHotkeys } from 'react-hotkeys-hook';
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '../../contexts/SidebarContext';
import { SIDEBAR_NAV, SIDEBAR_USER, SidebarNavItem, SIDEBAR_DESIGN } from '../../config/SidebarConfig';
import { SidebarItem } from './SidebarItem';
import { useFeatures } from '../../hooks/useFeatures';
import { DESIGN } from '../../lib/design';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  to: string;
  subItems?: MenuItem[];
  badge?: string | number;
  shortcut?: string;
  adminOnly?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const Sidebar: React.FC = () => {
  const { isOpen, toggle, isMobile } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast()
  const features = useFeatures();

  const isActive = (path: string) => location.pathname === path;
  const isActiveGroup = (paths: string[]) => paths.some(path => location.pathname.startsWith(path));

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        toggle();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const handleNotificationClick = (notification: Notification) => {
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default'
    })
  }

  const sidebarVariants = {
    open: {
      width: '280px',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      width: '80px',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const contentVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  const isAdmin = user?.is_admin || user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'master';

  // --- NEW NAV RENDERING ---
  // Filter nav items by feature toggles and admin
  const filteredNav = SIDEBAR_NAV.filter(item => {
    if (typeof item.featureKey === 'string' && features[item.featureKey] === false) return false;
    if (item.adminOnly && !user?.is_admin) return false;
    return true;
  });

  // Render nav
  return (
    <nav className={cn('flex flex-col h-full', isOpen ? 'w-[260px]' : 'w-[56px]', 'bg-card dark:bg-card-dark text-text dark:text-text-dark border-r border-divider dark:border-dividerDark')}
      style={{ background: SIDEBAR_DESIGN.colors.card }}
    >
      {/* Logo and Collapse Button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <img src="/logo.png" alt="Logo" className={cn('transition-all', isOpen ? 'h-8 w-auto' : 'h-8 w-8')} />
        <button
          onClick={toggle}
          className={cn(
            'p-2 rounded-lg hover:bg-primary/10 transition-colors ml-2',
            !isOpen && 'mx-auto'
          )}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            className={cn('w-6 h-6 transition-transform', isOpen ? '' : 'rotate-180')}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l-8 8 8 8" />
          </svg>
        </button>
      </div>
      <div className="flex-1 flex flex-col gap-1 mt-4">
        {filteredNav.map(item => {
          let badge: string | number | undefined = undefined;
          if (item.badgeKey === 'unreadNotifications') badge = unreadCount;
          else if (item.badgeKey === 'unreadChat') badge = 0; // TODO: replace with real chat unread count
          return (
            <SidebarItem
              key={item.name}
              item={item}
              collapsed={!isOpen}
              active={location.pathname.startsWith(item.href)}
              badge={badge}
              // TODO: wire up quick actions, extensions
            />
          );
        })}
      </div>
      {/* Extensions Section */}
      {SIDEBAR_NAV.some(item => item.extension && features[item.featureKey] !== false) && (
        <>
          <div className={cn('my-2', isOpen ? 'px-4' : 'px-1')}>
            <div className="border-t border-gray-200 dark:border-gray-800" />
          </div>
          {isOpen && (
            <div className="px-5 py-2 text-xs font-semibold text-neutral-400 tracking-widest uppercase">Extensions</div>
          )}
          <div className="flex flex-col gap-1">
            {SIDEBAR_NAV.filter(item => item.extension && (typeof item.featureKey === 'string' ? features[item.featureKey] !== false : true)).map(item => (
              <SidebarItem
                key={item.name}
                item={item}
                collapsed={!isOpen}
                active={location.pathname.startsWith(item.href)}
              />
            ))}
          </div>
        </>
      )}
      {/* User Section */}
      <div className={cn(
        'border-t border-divider dark:border-dividerDark px-4 py-3 flex items-center gap-3',
        'bg-card dark:bg-card-dark',
        !isOpen && 'flex-col px-2 py-2 gap-1'
      )}>
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
          {user?.full_name?.[0] || user?.email?.[0] || 'U'}
        </div>
        {isOpen && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user?.full_name || user?.email}</div>
            <div className="text-xs text-gray-500 truncate">{user?.role || 'User'}</div>
          </div>
        )}
        <button
          className={cn(
            'ml-auto p-2 rounded-full hover:bg-primary/10 text-primary transition-colors',
            !isOpen && 'ml-0',
            'bg-card dark:bg-card-dark'
          )}
          aria-label="Settings"
          // TODO: link to settings
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.36 6.36l-.71-.71M6.34 6.34l-.71-.71m12.02 0l-.71.71M6.34 17.66l-.71.71" />
          </svg>
        </button>
      </div>
      {/* Quick Actions */}
      <div className="px-2 pb-4 mt-auto">
        <div className={cn(
          'relative flex flex-col items-center',
          !isOpen && 'justify-center'
        )}>
          {/* Floating + button */}
          <button
            className={cn(
              'bg-primary text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
              isOpen ? 'w-12 h-12 mb-2' : 'w-10 h-10 mb-2',
              'hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50'
            )}
            aria-label="Quick Actions"
            // TODO: expand/collapse quick actions on click
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      {/* TODO: Render user section, quick actions, extensions, collapse button */}
    </nav>
  );
};

export default Sidebar; 