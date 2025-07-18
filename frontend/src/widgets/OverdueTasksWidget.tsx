import React from 'react';
import { TrendingDown } from 'lucide-react';

interface OverdueTasksWidgetProps {
  value: number | string;
  trend?: string;
}

const OverdueTasksWidget: React.FC<OverdueTasksWidgetProps> = ({ value, trend = '+2.7%' }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <span className="text-3xl font-bold text-black">{value}</span>
      <span className="text-red-600 text-sm font-semibold flex items-center gap-1">{trend} <TrendingDown className="h-4 w-4" /></span>
    </div>
  </div>
);

export default OverdueTasksWidget; 