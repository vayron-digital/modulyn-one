import React from 'react';
import DashboardWidget, { WidgetConfig } from './DashboardWidget';
import { dashboardConfig } from '../lib/dashboardConfig';

// Import existing widgets
import NewLeadsWidget from './NewLeadsWidget';
import TotalLeadsWidget from './TotalLeadsWidget';
import ActiveTasksWidget from './ActiveTasksWidget';
import OverdueTasksWidget from './OverdueTasksWidget';
import RecentActivityWidget from './RecentActivityWidget';

interface WidgetRendererProps {
  config: WidgetConfig;
  data?: any;
  loading?: boolean;
  error?: string | null;
  onConfigChange?: (config: WidgetConfig) => void;
  onRemove?: (id: string) => void;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  config,
  data,
  loading = false,
  error = null,
  onConfigChange,
  onRemove
}) => {
  const renderWidgetContent = () => {
    switch (config.type) {
      case 'kpi-card':
        return renderKPICard();
      case 'recent-activity':
        return renderRecentActivity();
      case 'quick-actions':
        return renderQuickActions();
      case 'task-list':
        return renderTaskList();
      case 'lead-pipeline':
        return renderLeadPipeline();
      case 'system-status':
        return renderSystemStatus();
      case 'notifications':
        return renderNotifications();
      case 'performance-chart':
        return renderPerformanceChart();
      default:
        return renderDefaultWidget();
    }
  };

  const renderKPICard = () => {
    const metric = config.config?.metric;
    const value = data?.[metric] ?? 0;
    const trend = config.config?.trend ? '+12.5%' : null;
    
    const getMetricConfig = () => {
      switch (metric) {
        case 'totalLeads':
          return {
            icon: '👥',
            color: 'blue',
            title: 'Total Leads'
          };
        case 'newLeadsToday':
          return {
            icon: '📈',
            color: 'green',
            title: 'New Leads Today'
          };
        case 'activeTasks':
          return {
            icon: '✅',
            color: 'purple',
            title: 'Active Tasks'
          };
        case 'overdueTasks':
          return {
            icon: '⏰',
            color: 'orange',
            title: 'Overdue Tasks'
          };
        default:
          return {
            icon: '📊',
            color: 'gray',
            title: config.title
          };
      }
    };

    const metricConfig = getMetricConfig();
    const colorClasses = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      purple: 'text-purple-600 dark:text-purple-400',
      orange: 'text-orange-600 dark:text-orange-400',
      gray: 'text-gray-600 dark:text-gray-400'
    };

    return (
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colorClasses[metricConfig.color as keyof typeof colorClasses]}`}>
            {metricConfig.title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-xs ${colorClasses[metricConfig.color as keyof typeof colorClasses]} mt-1`}>
              {trend} from last month
            </p>
          )}
        </div>
        <div className={`p-3 bg-${metricConfig.color}-100 dark:bg-${metricConfig.color}-900/20 rounded-lg`}>
          <span className="text-2xl">{metricConfig.icon}</span>
        </div>
      </div>
    );
  };

  const renderRecentActivity = () => {
    const activities = data?.activities || [];
    const limit = config.config?.limit || 5;

    return (
      <div className="space-y-3">
        {activities.slice(0, limit).map((activity: any, index: number) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {activity.description || 'Activity'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(activity.created_at).toLocaleDateString()} • {activity.type || 'General'}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    );
  };

  const renderQuickActions = () => {
    const actions = config.config?.actions || ['add-lead', 'create-task', 'schedule-call'];

    const actionConfigs = {
      'add-lead': { icon: '👤', label: 'Add Lead', color: 'blue' },
      'create-task': { icon: '✅', label: 'Create Task', color: 'green' },
      'schedule-call': { icon: '📞', label: 'Schedule Call', color: 'purple' },
      'send-email': { icon: '📧', label: 'Send Email', color: 'orange' }
    };

    return (
      <div className="space-y-3">
        {actions.map((action: string, index: number) => {
          const actionConfig = actionConfigs[action as keyof typeof actionConfigs] || actionConfigs['add-lead'];
          return (
            <button
              key={index}
              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{actionConfig.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{actionConfig.label}</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>
    );
  };

  const renderTaskList = () => {
    const tasks = data?.tasks || [];
    const limit = config.config?.limit || 5;

    return (
      <div className="space-y-3">
        {tasks.slice(0, limit).map((task: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={task.completed}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{task.due_date}</p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            }`}>
              {task.priority}
            </span>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
          </div>
        )}
      </div>
    );
  };

  const renderLeadPipeline = () => {
    const stages = data?.pipeline || [
      { name: 'Prospecting', count: 124, value: '$156K' },
      { name: 'Qualified', count: 89, value: '$234K' },
      { name: 'Proposal', count: 56, value: '$189K' },
      { name: 'Negotiation', count: 34, value: '$145K' },
      { name: 'Closed Won', count: 23, value: '$98K' }
    ];

    return (
      <div className="space-y-4">
        {stages.map((stage: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'purple', 'orange', 'emerald'][index % 5]}-500`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{stage.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stage.count} leads</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{stage.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSystemStatus = () => {
    const statuses = [
      { name: 'System Online', status: 'Operational', color: 'green' },
      { name: 'Database', status: 'Healthy', color: 'green' },
      { name: 'API Services', status: 'Active', color: 'green' }
    ];

    return (
      <div className="space-y-3">
        {statuses.map((status, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{status.name}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{status.status}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderNotifications = () => {
    const notifications = data?.notifications || [
      { type: 'warning', message: 'Overdue Task', description: 'Follow up with John Doe is overdue', time: '2 hours ago' },
      { type: 'info', message: 'New Lead', description: 'Sarah Johnson added as new lead', time: '1 hour ago' },
      { type: 'success', message: 'Task Completed', description: 'Proposal sent to ABC Corp', time: '30 minutes ago' }
    ];

    const typeColors = {
      warning: 'yellow',
      info: 'blue',
      success: 'green',
      error: 'red'
    };

    return (
      <div className="space-y-3">
        {notifications.map((notification: any, index: number) => {
          const color = typeColors[notification.type as keyof typeof typeColors] || 'gray';
          return (
            <div key={index} className={`flex items-start space-x-3 p-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg border border-${color}-200 dark:border-${color}-700`}>
              <div className={`w-2 h-2 bg-${color}-500 rounded-full mt-2`}></div>
              <div className="flex-1">
                <p className={`text-sm font-medium text-${color}-800 dark:text-${color}-200`}>{notification.message}</p>
                <p className={`text-xs text-${color}-600 dark:text-${color}-400`}>{notification.description}</p>
                <p className={`text-xs text-${color}-500 dark:text-${color}-500 mt-1`}>{notification.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPerformanceChart = () => {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Performance Chart</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">Chart will appear here</p>
        </div>
      </div>
    );
  };

  const renderDefaultWidget = () => {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Unknown widget type: {config.type}</p>
        </div>
      </div>
    );
  };

  return (
    <DashboardWidget
      config={config}
      onConfigChange={onConfigChange}
      onRemove={onRemove}
      loading={loading}
      error={error}
    >
      {renderWidgetContent()}
    </DashboardWidget>
  );
};

export default WidgetRenderer; 