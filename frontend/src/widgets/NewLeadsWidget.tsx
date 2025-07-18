import React from 'react';
import { TrendingUp } from 'lucide-react';

interface NewLeadsWidgetProps {
  value: number | string;
  trend?: string;
}

const NewLeadsWidget: React.FC<NewLeadsWidgetProps> = ({ value, trend = '+18.7%' }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <span className="text-3xl font-bold text-black">{value}</span>
      <span className="text-green-600 text-sm font-semibold flex items-center gap-1">{trend} <TrendingUp className="h-4 w-4" /></span>
    </div>
  </div>
);

export default NewLeadsWidget; 