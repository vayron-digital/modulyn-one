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
const TotalLeadsWidget = React.lazy(() => import('./TotalLeadsWidget'));
const ActiveTasksWidget = React.lazy(() => import('./ActiveTasksWidget'));
const PropertiesWidget = React.lazy(() => import('./PropertiesWidget'));
const RevenueLeadsChartWidget = React.lazy(() => import('./RevenueLeadsChartWidget'));
const RecentActivityWidget = React.lazy(() => import('./RecentActivityWidget'));
const SalesPipelineWidget = React.lazy(() => import('./SalesPipelineWidget'));
const TodoListWidget = React.lazy(() => import('./TodoListWidget'));
const ColdCallsWidget = React.lazy(() => import('./ColdCallsWidget'));

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
  {
    key: 'total-leads',
    name: 'Total Leads',
    description: 'Shows the total number of leads.',
    component: TotalLeadsWidget,
    roles: ['founder', 'sales'],
    module: 'leads',
  },
  {
    key: 'active-tasks',
    name: 'Active Tasks',
    description: 'Shows the number of active tasks.',
    component: ActiveTasksWidget,
    roles: ['founder', 'sales', 'support'],
    module: 'tasks',
  },
  {
    key: 'properties',
    name: 'Properties',
    description: 'Shows the total number of properties.',
    component: PropertiesWidget,
    roles: ['founder', 'sales'],
    module: 'properties',
  },
  {
    key: 'revenue-leads-chart',
    name: 'Revenue & Leads Chart',
    description: 'Displays a line chart of revenue and leads trends.',
    component: RevenueLeadsChartWidget,
    roles: ['founder', 'sales'],
    module: 'analytics',
  },
  {
    key: 'recent-activity',
    name: 'Recent Activity',
    description: 'Shows a feed of recent activity.',
    component: RecentActivityWidget,
    roles: ['founder', 'sales', 'support'],
    module: 'activity',
  },
  {
    key: 'sales-pipeline',
    name: 'Sales Pipeline',
    description: 'Shows sales pipeline progress and details.',
    component: SalesPipelineWidget,
    roles: ['founder', 'sales'],
    module: 'sales',
  },
  {
    key: 'todo-list',
    name: 'To-Do List',
    description: 'Shows the user\'s to-do list.',
    component: TodoListWidget,
    roles: ['founder', 'sales', 'support'],
    module: 'tasks',
  },
  {
    key: 'cold-calls',
    name: 'Cold Calls Made',
    description: 'Shows the number of cold calls made.',
    component: ColdCallsWidget,
    roles: ['founder', 'sales'],
    module: 'calls',
  },
  // Add more widgets here as you refactor
]; 