import React from 'react';
import { Button } from '../components/ui/button';

interface SalesPipelineWidgetProps {
  progress: number; // 0-100
  estimatedCompletion: string;
  onViewDetails?: () => void;
}

const SalesPipelineWidget: React.FC<SalesPipelineWidgetProps> = ({ progress, estimatedCompletion, onViewDetails }) => (
  <>
    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
      <div className="bg-green-400 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
    <p className="text-xs">Estimated completion: {estimatedCompletion}</p>
    {onViewDetails && (
      <Button variant="outline" className="bg-white text-black border-black mt-2" onClick={onViewDetails}>
        View Details
      </Button>
    )}
  </>
);

export default SalesPipelineWidget; 