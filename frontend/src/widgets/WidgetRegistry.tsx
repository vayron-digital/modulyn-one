import React from 'react';

// Widget metadata type
export interface WidgetMeta {
  key: string;
  name: string;
  description?: string;
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  roles?: string[]; // e.g., ['founder', 'sales', 'support']
  module?: string; // for feature toggling
}

// Example widget: NewLeadsWidget (to be implemented)
const NewLeadsWidget = React.lazy(() => import('./NewLeadsWidget'));
const OverdueTasksWidget = React.lazy(() => import('./OverdueTasksWidget'));

// Registry object
export const widgetRegistry: WidgetMeta[] = [
  {
    key: 'new-leads',
    name: 'New Leads',
    description: 'Shows the number of new leads today.',
    component: NewLeadsWidget,
    roles: ['founder', 'sales'],
    module: 'leads',
  },
  {
    key: 'overdue-tasks',
    name: 'Overdue Tasks',
    description: 'Shows the number of overdue tasks.',
    component: OverdueTasksWidget,
    roles: ['founder', 'sales', 'support'],
    module: 'tasks',
  },
  // Add more widgets here as you refactor
]; 