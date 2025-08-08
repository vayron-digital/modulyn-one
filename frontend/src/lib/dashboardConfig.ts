import { WidgetConfig } from '../widgets/DashboardWidget';

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: WidgetConfig[];
  isDefault?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WidgetTemplate {
  type: string;
  name: string;
  description: string;
  category: 'analytics' | 'activity' | 'tasks' | 'leads' | 'system' | 'custom';
  defaultSize: 'small' | 'medium' | 'large' | 'full';
  defaultConfig?: Record<string, any>;
  icon?: string;
  roles?: string[];
  permissions?: string[];
}

// Default widget templates
export const widgetTemplates: WidgetTemplate[] = [
  {
    type: 'kpi-card',
    name: 'KPI Card',
    description: 'Display key performance indicators with trends',
    category: 'analytics',
    defaultSize: 'small',
    icon: '📊',
    roles: ['founder', 'sales', 'manager']
  },
  {
    type: 'recent-activity',
    name: 'Recent Activity',
    description: 'Show recent system activity and updates',
    category: 'activity',
    defaultSize: 'medium',
    icon: '📝',
    roles: ['founder', 'sales', 'support']
  },
  {
    type: 'quick-actions',
    name: 'Quick Actions',
    description: 'Common actions and shortcuts',
    category: 'system',
    defaultSize: 'small',
    icon: '⚡',
    roles: ['founder', 'sales', 'support']
  },
  {
    type: 'task-list',
    name: 'Task List',
    description: 'Display tasks with status and priority',
    category: 'tasks',
    defaultSize: 'medium',
    icon: '✅',
    roles: ['founder', 'sales', 'support']
  },
  {
    type: 'lead-pipeline',
    name: 'Lead Pipeline',
    description: 'Visual representation of lead stages',
    category: 'leads',
    defaultSize: 'large',
    icon: '🎯',
    roles: ['founder', 'sales']
  },
  {
    type: 'system-status',
    name: 'System Status',
    description: 'Monitor system health and performance',
    category: 'system',
    defaultSize: 'small',
    icon: '🔧',
    roles: ['founder', 'admin']
  },
  {
    type: 'notifications',
    name: 'Notifications',
    description: 'Important alerts and notifications',
    category: 'system',
    defaultSize: 'small',
    icon: '🔔',
    roles: ['founder', 'sales', 'support']
  },
  {
    type: 'performance-chart',
    name: 'Performance Chart',
    description: 'Interactive charts and analytics',
    category: 'analytics',
    defaultSize: 'large',
    icon: '📈',
    roles: ['founder', 'sales', 'manager']
  }
];

// Default dashboard layouts
export const defaultLayouts: DashboardLayout[] = [
  {
    id: 'founder-default',
    name: 'Founder Dashboard',
    description: 'Comprehensive view for founders and executives',
    isDefault: true,
    widgets: [
      {
        id: 'total-leads',
        type: 'kpi-card',
        title: 'Total Leads',
        size: 'small',
        position: { x: 0, y: 0 },
        config: { metric: 'totalLeads', trend: true }
      },
      {
        id: 'new-leads-today',
        type: 'kpi-card',
        title: 'New Leads Today',
        size: 'small',
        position: { x: 1, y: 0 },
        config: { metric: 'newLeadsToday', trend: true }
      },
      {
        id: 'active-tasks',
        type: 'kpi-card',
        title: 'Active Tasks',
        size: 'small',
        position: { x: 2, y: 0 },
        config: { metric: 'activeTasks', trend: true }
      },
      {
        id: 'overdue-tasks',
        type: 'kpi-card',
        title: 'Overdue Tasks',
        size: 'small',
        position: { x: 3, y: 0 },
        config: { metric: 'overdueTasks', trend: true }
      },
      {
        id: 'recent-activity',
        type: 'recent-activity',
        title: 'Recent Activity',
        size: 'medium',
        position: { x: 0, y: 1 },
        config: { limit: 10, showAvatars: true }
      },
      {
        id: 'quick-actions',
        type: 'quick-actions',
        title: 'Quick Actions',
        size: 'small',
        position: { x: 2, y: 1 },
        config: { actions: ['add-lead', 'create-task', 'schedule-call'] }
      },
      {
        id: 'lead-pipeline',
        type: 'lead-pipeline',
        title: 'Lead Pipeline',
        size: 'large',
        position: { x: 0, y: 2 },
        config: { showValues: true, showTrends: true }
      },
      {
        id: 'notifications',
        type: 'notifications',
        title: 'Notifications',
        size: 'small',
        position: { x: 2, y: 2 },
        config: { limit: 5, showPriority: true }
      }
    ]
  },
  {
    id: 'sales-default',
    name: 'Sales Dashboard',
    description: 'Focused view for sales teams',
    widgets: [
      {
        id: 'sales-kpi-1',
        type: 'kpi-card',
        title: 'Pipeline Value',
        size: 'small',
        position: { x: 0, y: 0 },
        config: { metric: 'pipelineValue', trend: true }
      },
      {
        id: 'sales-kpi-2',
        type: 'kpi-card',
        title: 'Conversion Rate',
        size: 'small',
        position: { x: 1, y: 0 },
        config: { metric: 'conversionRate', trend: true }
      },
      {
        id: 'sales-kpi-3',
        type: 'kpi-card',
        title: 'Calls Made',
        size: 'small',
        position: { x: 2, y: 0 },
        config: { metric: 'callsMade', trend: true }
      },
      {
        id: 'sales-kpi-4',
        type: 'kpi-card',
        title: 'Meetings Booked',
        size: 'small',
        position: { x: 3, y: 0 },
        config: { metric: 'meetingsBooked', trend: true }
      },
      {
        id: 'sales-pipeline',
        type: 'lead-pipeline',
        title: 'Sales Pipeline',
        size: 'large',
        position: { x: 0, y: 1 },
        config: { showValues: true, showTrends: true }
      },
      {
        id: 'sales-tasks',
        type: 'task-list',
        title: 'Sales Tasks',
        size: 'medium',
        position: { x: 2, y: 1 },
        config: { filter: 'sales', limit: 8 }
      }
    ]
  }
];

// Dashboard configuration management
export class DashboardConfigManager {
  private static instance: DashboardConfigManager;
  private layouts: Map<string, DashboardLayout> = new Map();
  private userPreferences: Map<string, any> = new Map();

  private constructor() {
    this.initializeDefaultLayouts();
  }

  static getInstance(): DashboardConfigManager {
    if (!DashboardConfigManager.instance) {
      DashboardConfigManager.instance = new DashboardConfigManager();
    }
    return DashboardConfigManager.instance;
  }

  private initializeDefaultLayouts() {
    defaultLayouts.forEach(layout => {
      this.layouts.set(layout.id, layout);
    });
  }

  getLayout(layoutId: string): DashboardLayout | undefined {
    return this.layouts.get(layoutId);
  }

  getDefaultLayout(): DashboardLayout | undefined {
    return defaultLayouts.find(layout => layout.isDefault);
  }

  saveLayout(layout: DashboardLayout): void {
    this.layouts.set(layout.id, {
      ...layout,
      updatedAt: new Date().toISOString()
    });
    this.saveToStorage();
  }

  deleteLayout(layoutId: string): boolean {
    const deleted = this.layouts.delete(layoutId);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  getUserPreference(userId: string, key: string): any {
    const userPrefs = this.userPreferences.get(userId) || {};
    return userPrefs[key];
  }

  setUserPreference(userId: string, key: string, value: any): void {
    const userPrefs = this.userPreferences.get(userId) || {};
    userPrefs[key] = value;
    this.userPreferences.set(userId, userPrefs);
    this.saveToStorage();
  }

  getWidgetTemplate(type: string): WidgetTemplate | undefined {
    return widgetTemplates.find(template => template.type === type);
  }

  getWidgetTemplatesByCategory(category: string): WidgetTemplate[] {
    return widgetTemplates.filter(template => template.category === category);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('dashboard-layouts', JSON.stringify(Array.from(this.layouts.entries())));
      localStorage.setItem('dashboard-preferences', JSON.stringify(Array.from(this.userPreferences.entries())));
    } catch (error) {
      console.warn('Failed to save dashboard configuration to localStorage:', error);
    }
  }

  loadFromStorage(): void {
    try {
      const layoutsData = localStorage.getItem('dashboard-layouts');
      const preferencesData = localStorage.getItem('dashboard-preferences');

      if (layoutsData) {
        const layoutsArray = JSON.parse(layoutsData);
        this.layouts = new Map(layoutsArray);
      }

      if (preferencesData) {
        const preferencesArray = JSON.parse(preferencesData);
        this.userPreferences = new Map(preferencesArray);
      }
    } catch (error) {
      console.warn('Failed to load dashboard configuration from localStorage:', error);
    }
  }
}

export const dashboardConfig = DashboardConfigManager.getInstance(); 