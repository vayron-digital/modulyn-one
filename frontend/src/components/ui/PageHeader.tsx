import React from 'react';
import { Button } from './button';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw,
  Settings,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  ClipboardList,
  Calendar,
  BarChart3
} from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
    disabled?: boolean;
  }[];
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };
  filters?: React.ReactNode;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  stats,
  actions,
  search,
  filters,
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Main Header */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {icon && (
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  {icon}
                </div>
              )}
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                  {title}
                  {stats && stats.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.length} items
                    </Badge>
                  )}
                </CardTitle>
                {subtitle && (
                  <p className="text-slate-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            
            {/* Actions */}
            {actions && actions.length > 0 && (
              <div className="flex items-center space-x-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant || 'default'}
                    disabled={action.disabled}
                    className="flex items-center space-x-2"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 border border-slate-200/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    {stat.change !== undefined && (
                      <div className="flex items-center space-x-1">
                        {stat.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : stat.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : null}
                        <span className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 
                          stat.trend === 'down' ? 'text-red-600' : 
                          'text-slate-600'
                        }`}>
                          {stat.change > 0 ? '+' : ''}{stat.change}%
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search and Filters */}
      {(search || filters) && (
        <Card className="border-0 shadow-sm bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {search && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={search.placeholder || "Search..."}
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
              )}
              
              {filters && (
                <div className="flex items-center space-x-2">
                  {filters}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Content */}
      {children && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default PageHeader;
