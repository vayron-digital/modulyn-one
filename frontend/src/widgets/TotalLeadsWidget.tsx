import React from 'react';
import { Users } from 'lucide-react';

interface TotalLeadsWidgetProps {
  value: number | string;
}

const TotalLeadsWidget: React.FC<TotalLeadsWidgetProps> = ({ value }) => (
  <div className="flex items-center gap-2">
    <Users className="h-5 w-5 text-black" />
    <span className="text-2xl font-bold text-black">{value}</span>
  </div>
);

export default TotalLeadsWidget; 