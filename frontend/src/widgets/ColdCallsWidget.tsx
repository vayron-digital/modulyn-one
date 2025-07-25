import React from 'react';
import { Phone } from 'lucide-react';

interface ColdCallsWidgetProps {
  value: number | string;
}

const ColdCallsWidget: React.FC<ColdCallsWidgetProps> = ({ value }) => (
  <div className="flex items-center gap-2">
    <Phone className="h-5 w-5 text-black" />
    <span className="text-2xl font-bold text-black">{value}</span>
  </div>
);

export default ColdCallsWidget; 