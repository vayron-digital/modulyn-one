import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useFeatures } from '../hooks/useFeatures';
import { DESIGN } from '../lib/design';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  adminOnly?: boolean;
  children?: NavigationItem[];
}

export interface UserNavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
  },
  {
    name: 'Properties',
    href: '/properties',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: UserGroupIcon,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: DocumentTextIcon,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ChartBarIcon,
    adminOnly: true,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
  },
];

export const userNavigation: UserNavigationItem[] = [
  { 
    name: 'Your Profile', 
    href: '/profile',
    icon: UserIcon
  },
  { 
    name: 'Settings', 
    href: '/settings',
    icon: CogIcon
  },
  { 
    name: 'Sign out', 
    href: '/logout',
    icon: ArrowRightOnRectangleIcon
  },
]; 

export function getNavigationItems(features) {
  return [
    features.dashboard !== false && {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
    },
    features.properties !== false && {
      name: 'Properties',
      href: '/properties',
      icon: BuildingOfficeIcon,
    },
    features.leads !== false && {
      name: 'Leads',
      href: '/leads',
      icon: UserGroupIcon,
    },
    features.tasks !== false && {
      name: 'Tasks',
      href: '/tasks',
      icon: ClipboardDocumentListIcon,
    },
    features.documents && {
      name: 'Documents',
      href: '/documents',
      icon: DocumentTextIcon,
    },
    features.reports && {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      adminOnly: true,
    },
    features.settings !== false && {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
    },
  ].filter(Boolean);
} 