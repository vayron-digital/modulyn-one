import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Bell,
  Plus,
  Settings,
  HelpCircle,
  Search,
  Sun,
  Moon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTheme } from '../../contexts/ThemeContext';

export default function Topbar({ showSidebarToggle, onSidebarToggle }: { showSidebarToggle?: boolean, onSidebarToggle?: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

  const quickActions = [
    { label: 'Add Lead', href: '/leads/new' },
    { label: 'Add Property', href: '/properties/new' },
    { label: 'Create Task', href: '/tasks/new' },
    { label: 'Log Call', href: '/calls/new' },
  ];

  // Keyboard shortcut for search
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    searchRef.current?.focus();
  });

  return (
    <div className="h-16 border-b border-border dark:border-border-dark bg-card dark:bg-card-dark px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            className="mr-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="relative">
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search (Ctrl+K)"
            className="w-64 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark placeholder:text-muted-foreground dark:placeholder:text-muted-foreground-dark"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground-dark" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Actions Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-background dark:bg-background-dark border-border dark:border-border-dark text-foreground dark:text-white">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="w-48 bg-card dark:bg-card-dark rounded-lg shadow-lg border border-border dark:border-border-dark p-1">
            {quickActions.map((action) => (
              <DropdownMenu.Item
                key={action.label}
                onClick={() => navigate(action.href)}
                className="flex items-center px-2 py-1.5 text-sm text-foreground dark:text-foreground-dark hover:bg-accent dark:hover:bg-accent-dark rounded cursor-pointer"
              >
                {action.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-foreground dark:text-white hover:bg-accent dark:hover:bg-accent-dark"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-foreground dark:text-white hover:bg-accent dark:hover:bg-accent-dark"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              className="h-9 w-9 rounded-full bg-background dark:bg-background-dark border border-border dark:border-border-dark"
            >
              <Avatar>
                <AvatarImage src={user?.profile_image_url} alt={user?.full_name || user?.email} />
                <AvatarFallback>{user?.full_name?.[0] || user?.email?.[0]}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="w-56 bg-card dark:bg-card-dark rounded-lg shadow-lg border border-border dark:border-border-dark p-1">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground dark:text-white">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">{user?.email}</p>
            </div>
            <DropdownMenu.Separator className="bg-border dark:bg-border-dark" />
            <DropdownMenu.Item
              onClick={() => navigate('/settings')}
              className="flex items-center px-2 py-1.5 text-sm text-foreground dark:text-white hover:bg-accent transition delay-120 duration-300 ease-in-out dark:hover:bg-accent-dark rounded cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => navigate('/help')}
              className="flex items-center px-2 py-1.5 text-sm text-foreground dark:text-white hover:bg-accent transition delay-120 duration-300 ease-in-out dark:hover:bg-accent-dark rounded cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & Support
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="bg-border dark:bg-border-dark" />
            <DropdownMenu.Item
              onClick={signOut}
              className="flex items-center px-2 py-1.5 text-sm text-destructive dark:text-white dark:bg-red-800 dark:bg-opacity-20 hover:bg-destructive/10 transition delay-120 duration-300 ease-in-out dark:hover:bg-red-800/50 rounded cursor-pointer"
            >
              Sign Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
} 