import React from 'react';
import { Home } from 'lucide-react';

interface PropertiesWidgetProps {
  value: number | string;
}

const PropertiesWidget: React.FC<PropertiesWidgetProps> = ({ value }) => (
  <div className="flex items-center gap-2">
    <Home className="h-5 w-5 text-black" />
    <span className="text-2xl font-bold text-black">{value}</span>
  </div>
);

export default PropertiesWidget; 