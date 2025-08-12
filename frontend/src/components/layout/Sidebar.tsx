import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  BarChart3, 
  Target, 
  Phone, 
  CheckSquare, 
  Settings, 
  Building, 
  FileText, 
  Calendar,
  ChevronRight,
  ChevronDown,
  Zap,
  Bell,
  Search
} from 'lucide-react';
import ComponentErrorBoundary from '../common/ComponentErrorBoundary';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Enhanced navigation structure
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Home className="h-5 w-5" />,
      path: '/dashboard',
      color: 'blue',
      description: 'Your command center'
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: <Users className="h-5 w-5" />,
      path: '/leads',
      color: 'emerald',
      description: 'Manage prospects',
      children: [
        { label: 'All Leads', path: '/leads', icon: <Users className="h-4 w-4" /> },
        { label: 'Add Lead', path: '/leads/add', icon: <Target className="h-4 w-4" /> },
        { label: 'Dumped Leads', path: '/leads/dumped', icon: <FileText className="h-4 w-4" /> }
      ]
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: <Building className="h-5 w-5" />,
      path: '/properties',
      color: 'purple',
      description: 'Property listings',
      children: [
        { label: 'All Properties', path: '/properties', icon: <Building className="h-4 w-4" /> },
        { label: 'Add Property', path: '/properties/add', icon: <Target className="h-4 w-4" /> }
      ]
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="h-5 w-5" />,
      path: '/tasks',
      color: 'orange',
      description: 'Task management',
      children: [
        { label: 'All Tasks', path: '/tasks', icon: <CheckSquare className="h-4 w-4" /> },
        { label: 'Add Task', path: '/tasks/add', icon: <Target className="h-4 w-4" /> }
      ]
    },
    {
      id: 'contacts',
      label: 'Contacts Management',
      icon: <Phone className="h-5 w-5" />,
      path: '/contacts',
      color: 'indigo',
      description: 'Contact management',
      children: [
        { label: 'All Contacts', path: '/contacts', icon: <Phone className="h-4 w-4" /> },
        { label: 'Add Contact', path: '/contacts/add', icon: <Phone className="h-4 w-4" /> }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/reports',
      color: 'pink',
      description: 'Reports & insights'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="h-5 w-5" />,
      path: '/scheduler',
      color: 'teal',
      description: 'Schedule & events'
    },
    {
      id: 'team',
      label: 'Team',
      icon: <Users className="h-5 w-5" />,
      path: '/team',
      color: 'rose',
      description: 'Team management'
    }
  ];

  const bottomNavItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      path: '/notifications',
      color: 'yellow',
      badge: 3
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
      color: 'gray'
    }
  ];

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colors: Record<string, { bg: string; text: string; activeBg: string; activeText: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', activeBg: 'bg-blue-600', activeText: 'text-white' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', activeBg: 'bg-emerald-600', activeText: 'text-white' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', activeBg: 'bg-purple-600', activeText: 'text-white' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', activeBg: 'bg-orange-600', activeText: 'text-white' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', activeBg: 'bg-indigo-600', activeText: 'text-white' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', activeBg: 'bg-pink-600', activeText: 'text-white' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', activeBg: 'bg-teal-600', activeText: 'text-white' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600', activeBg: 'bg-rose-600', activeText: 'text-white' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', activeBg: 'bg-yellow-600', activeText: 'text-white' },
      gray: { bg: 'bg-slate-100', text: 'text-slate-600', activeBg: 'bg-slate-600', activeText: 'text-white' }
    };
    
    const colorClass = colors[color] || colors.blue;
    return isActive 
      ? `${colorClass.activeBg} ${colorClass.activeText}` 
      : `hover:${colorClass.bg} ${colorClass.text}`;
  };

  return (
    <ComponentErrorBoundary componentName="Sidebar" showRetry={false}>
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded ? '240px' : '60px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-3 top-20 bottom-3 bg-surface-primary/95 backdrop-blur-xl border border-surface-secondary/30 rounded-xl shadow-xl z-[500] flex flex-col overflow-hidden"
        style={{ height: 'calc(100vh - 6rem)' }}
      >
        {/* Header */}
        <div className="p-2 border-b border-slate-200/30">
              <motion.button
            onClick={toggleExpanded}
            className="w-full flex items-center justify-center p-2 hover:bg-surface-secondary/30 rounded-lg transition-colors duration-200"
                whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            </motion.div>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="ml-2 font-medium text-text-heading text-sm"
              >
                Menu
              </motion.span>
            )}
              </motion.button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto p-1">
          <div className="space-y-0.5">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded_Section = expandedSections.includes(item.id);

              return (
                <div key={item.id}>
                  <motion.button
                    onClick={() => {
                      if (hasChildren) {
                        toggleSection(item.id);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-primary-default text-primary-on-primary shadow-sm'
                        : `hover:bg-surface-secondary/50 text-text-secondary`
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-1.5 rounded-md transition-colors duration-200 ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-surface-secondary/30'
                    }`}>
                      {item.icon}
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-2 flex-1 text-left"
                        >
                          <div className="font-medium text-sm">{item.label}</div>
                          {item.description && (
                            <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isExpanded && hasChildren && (
                      <motion.div
                        animate={{ rotate: isExpanded_Section ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Children */}
                  <AnimatePresence>
                    {hasChildren && isExpanded && isExpanded_Section && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.children?.map((child, index) => (
                          <motion.button
                            key={index}
                            onClick={() => navigate(child.path)}
                            className={`w-full flex items-center p-1.5 rounded-md text-xs transition-colors duration-200 ${
                              location.pathname === child.path
                                ? 'bg-surface-secondary text-text-heading font-medium'
                                : 'text-text-secondary hover:bg-surface-secondary/30 hover:text-text-heading'
                            }`}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="p-1">
                              {child.icon}
                            </div>
                            <span className="ml-1.5">{child.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="p-1 border-t border-slate-200/30">
          <div className="space-y-0.5">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 relative ${
                    isActive 
                      ? 'bg-primary-default text-primary-on-primary shadow-sm'
                      : 'hover:bg-surface-secondary/50 text-text-secondary'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`p-1.5 rounded-md transition-colors duration-200 ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-surface-secondary/30'
                  }`}>
                    {item.icon}
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-2 font-medium text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {item.badge && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </div>
                  )}
                </motion.button>
        );
      })}
          </div>
        </div>
      </motion.aside>
    </ComponentErrorBoundary>
  );
};

export default Sidebar; 