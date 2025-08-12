// SidebarConfig.ts
import { HomeIcon, BuildingOfficeIcon, UserGroupIcon, ClipboardDocumentListIcon, DocumentTextIcon, ChartBarIcon, CogIcon, UserIcon, ArrowRightOnRectangleIcon, ChatBubbleLeftRightIcon, BellAlertIcon, PhoneArrowUpRightIcon, CalendarDaysIcon, PuzzlePieceIcon, PlusCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { DESIGN } from '../lib/design';

export interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  featureKey?: string;
  adminOnly?: boolean;
  quickAction?: boolean;
  badgeKey?: string;
  children?: SidebarNavItem[];
  extension?: boolean;
}

export const SIDEBAR_NAV: SidebarNavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, featureKey: 'dashboard' },
  { name: 'Leads', href: '/leads', icon: UserGroupIcon, featureKey: 'leads', quickAction: true, children: [
    { name: 'All Leads', href: '/leads', icon: UserGroupIcon },
    { name: 'Dumped Leads', href: '/leads/dumped', icon: UserIcon },
    { name: 'New Lead', href: '/leads/new', icon: PlusCircleIcon, quickAction: true },
  ] },
  { name: 'Properties', href: '/properties', icon: BuildingOfficeIcon, featureKey: 'properties', quickAction: true, children: [
    { name: 'All Properties', href: '/properties', icon: BuildingOfficeIcon },
    { name: 'Add Property', href: '/properties/new', icon: PlusCircleIcon, quickAction: true },
  ] },
  { name: 'Contacts', href: '/contacts', icon: UserGroupIcon, featureKey: 'contacts', quickAction: true, children: [
    { name: 'All Contacts', href: '/contacts', icon: UserGroupIcon },
    { name: 'Add Contact', href: '/contacts/new', icon: PlusCircleIcon, quickAction: true },
    { name: 'Import Contacts', href: '/contacts/import', icon: PlusCircleIcon },
  ] },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, featureKey: 'tasks', quickAction: true, children: [
    { name: 'All Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'New Task', href: '/tasks/new', icon: PlusCircleIcon, quickAction: true },
  ] },
  { name: 'Scheduler', href: '/scheduler', icon: CalendarDaysIcon, featureKey: 'calendar', quickAction: true },
  { name: 'Team', href: '/team', icon: UserGroupIcon, featureKey: 'team' },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, featureKey: 'chat', badgeKey: 'unreadChat' },
  { name: 'Notifications', href: '/notifications', icon: BellAlertIcon, featureKey: 'notifications', badgeKey: 'unreadNotifications' },
  { name: 'Cold Calls', href: '/cold-calls', icon: PhoneArrowUpRightIcon, featureKey: 'cold_calls', adminOnly: true, quickAction: true },
  { name: 'Extensions', href: '/extensions', icon: PuzzlePieceIcon, extension: true },
  { name: 'Settings', href: '/settings', icon: CogIcon, featureKey: 'settings' },
];

export const SIDEBAR_USER: SidebarNavItem[] = [
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
  { name: 'Sign out', href: '/logout', icon: ArrowRightOnRectangleIcon },
];

export const SIDEBAR_DESIGN = DESIGN; 