import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  UserGroupIcon, 
  UserIcon, 
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';

const LeadsNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'All Leads',
      href: '/leads',
      icon: UserGroupIcon,
      description: 'Advanced lead management with automation and analytics',
      badge: 'PRO'
    },
    {
      name: 'Dumped Leads',
      href: '/leads/dumped',
      icon: UserIcon,
      description: 'View archived and dumped leads',
      badge: null
    }
  ];

  return (
    <div className="bg-[#ebecee] border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {isActive && <ArrowRightIcon className="h-4 w-4 ml-2" />}
              </Link>
            );
          })}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Lead
          </Button>
          {location.pathname === '/leads' && (
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Workflow Builder
            </Button>
          )}
        </div>
      </div>
      
      {/* Description */}
      <div className="mt-3">
        {navItems.find(item => item.href === location.pathname) && (
          <p className="text-sm text-gray-600">
            {navItems.find(item => item.href === location.pathname)?.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default LeadsNavigation; 