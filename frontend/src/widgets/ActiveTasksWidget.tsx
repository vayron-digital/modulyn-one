import React from 'react';
import { Calendar } from 'lucide-react';

interface ActiveTasksWidgetProps {
  value: number | string;
}

const ActiveTasksWidget: React.FC<ActiveTasksWidgetProps> = ({ value }) => (
  <div className="flex items-center gap-2">
    <Calendar className="h-5 w-5 text-black" />
    <span className="text-2xl font-bold text-black">{value}</span>
  </div>
);

export default ActiveTasksWidget; 