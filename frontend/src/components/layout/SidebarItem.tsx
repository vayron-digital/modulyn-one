import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { SidebarNavItem, SIDEBAR_DESIGN } from '../../config/SidebarConfig';

interface SidebarItemProps {
  item: SidebarNavItem;
  collapsed: boolean;
  active: boolean;
  badge?: string | number;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ item, collapsed, active, badge, onClick }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group relative',
          isActive || active
            ? 'bg-primary/10 text-primary font-semibold shadow-md shadow-primary/10'
            : 'text-gray-700 hover:bg-primary/5 hover:shadow hover:shadow-primary/5',
          collapsed ? 'justify-center px-2' : '',
          'focus:outline-none focus:ring-2 focus:ring-primary/30'
        )
      }
      aria-label={item.name}
      onClick={onClick}
      tabIndex={0}
    >
      <motion.span
        className="relative flex items-center justify-center h-6 w-6"
        whileHover={{ scale: 1.08, rotate: -3 }}
        whileTap={{ scale: 0.96, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
        {badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px] h-5 flex items-center justify-center shadow"
          >
            {badge}
          </motion.span>
        )}
      </motion.span>
      {!collapsed && (
        <motion.span
          className="truncate text-base"
          style={{ fontSize: SIDEBAR_DESIGN.fontSize.base }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18 }}
        >
          {item.name}
        </motion.span>
      )}
      {item.quickAction && !collapsed && (
        <span className="ml-auto text-primary text-xs font-bold bg-primary/10 rounded px-2 py-0.5">Quick</span>
      )}
      {item.extension && !collapsed && (
        <span className="ml-auto text-indigo-600 text-xs font-bold bg-indigo-100 rounded px-2 py-0.5">Ext</span>
      )}
    </NavLink>
  );
}; 