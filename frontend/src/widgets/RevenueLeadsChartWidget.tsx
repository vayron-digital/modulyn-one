import React from 'react';
import { Line } from 'react-chartjs-2';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';

interface RevenueLeadsChartWidgetProps {
  chartData: any;
  chartOptions: any;
  onViewReports?: () => void;
}

const RevenueLeadsChartWidget: React.FC<RevenueLeadsChartWidgetProps> = ({ chartData, chartOptions, onViewReports }) => (
  <>
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-lg font-semibold text-black">Revenue & Leads Trend</h2>
      {onViewReports && (
        <Button variant="ghost" className="text-gray-600 hover:text-black" onClick={onViewReports}>
          View Reports <ArrowRight className="ml-2 h-4 w-4 text-black" />
        </Button>
      )}
    </div>
    <div className="h-64 w-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  </>
);

export default RevenueLeadsChartWidget; 