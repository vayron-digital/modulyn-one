import React from 'react';
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
  BarChart,
  Building,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { useFeatures } from '../../hooks/useFeatures';
import { DESIGN } from '../../lib/design';

export default function MobileMenu() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const features = useFeatures();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/',
    },
    features.leads !== false && {
      label: 'Leads',
      icon: <Users className="h-5 w-5" />,
      href: '/leads',
    },
    features.properties !== false && {
      label: 'Properties',
      icon: <Home className="h-5 w-5" />,
      href: '/properties',
    },
    features.tasks !== false && {
      label: 'Tasks',
      icon: <CheckSquare className="h-5 w-5" />,
      href: '/tasks',
    },
    features.calls && {
      label: 'Calls',
      icon: <Phone className="h-5 w-5" />,
      href: '/calls',
    },
    features.calendar && {
      label: 'Calendar',
      icon: <Calendar className="h-5 w-5" />,
      href: '/scheduler',
    },
    features.documents && {
      label: 'Documents',
      icon: <FileText className="h-5 w-5" />,
      href: '/documents',
    },
    features.reports && {
      label: 'Reports',
      icon: <BarChart className="h-5 w-5" />,
      href: '/reports',
    },
    features.team && {
      label: 'Team',
      icon: <Users className="h-5 w-5" />,
      href: '/team',
    },
    features.settings !== false && {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
    },
  ].filter(Boolean);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Fortune CRM</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
} 