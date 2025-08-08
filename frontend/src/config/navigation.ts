import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Users, Building, Shield, Zap, Settings, CreditCard } from 'lucide-react';
import { useFeatures } from '../hooks/useFeatures';
import { DESIGN } from '../lib/design';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  adminOnly?: boolean;
  ownerOnly?: boolean;
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
    children: [
      {
        name: 'All Leads',
        href: '/leads',
        icon: UserGroupIcon,
      },
      {
        name: 'Dumped Leads',
        href: '/leads/dumped',
        icon: UserIcon,
      },
    ],
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
    children: [
      {
        name: 'Profile',
        href: '/settings?tab=profile',
        icon: UserIcon,
      },
      {
        name: 'Users',
        href: '/settings?tab=users',
        icon: Users,
        adminOnly: true,
      },
      {
        name: 'Teams',
        href: '/settings?tab=teams',
        icon: Building,
        adminOnly: true,
      },
      {
        name: 'Permissions',
        href: '/settings?tab=permissions',
        icon: Shield,
        ownerOnly: true,
      },
      {
        name: 'Integrations',
        href: '/settings?tab=integrations',
        icon: Zap,
      },
      {
        name: 'Subscription',
        href: '/settings/subscription',
        icon: CreditCard,
        adminOnly: true,
      },
      {
        name: 'Preferences',
        href: '/settings?tab=preferences',
        icon: Settings,
      },
      {
        name: 'Storage Test',
        href: '/admin/storage-test',
        icon: Shield,
        adminOnly: true,
      },
    ],
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

export function getNavigationItems(features: any) {
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
      children: [
        {
          name: 'All Leads',
          href: '/leads',
          icon: UserGroupIcon,
        },
        {
          name: 'Dumped Leads',
          href: '/leads/dumped',
          icon: UserIcon,
        },
      ],
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