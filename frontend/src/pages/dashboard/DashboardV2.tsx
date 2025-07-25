import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Home, Calendar, DollarSign, CheckCircle, XCircle, TrendingUp, TrendingDown, ArrowRight, List, Mail, FileText, UserPlus } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { dashboardApi } from '../../lib/api';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Widget from '../../components/ui/widget';
import NewLeadsWidget from '../../widgets/NewLeadsWidget';
import OverdueTasksWidget from '../../widgets/OverdueTasksWidget';
import TotalLeadsWidget from '../../widgets/TotalLeadsWidget';
import ActiveTasksWidget from '../../widgets/ActiveTasksWidget';
import PropertiesWidget from '../../widgets/PropertiesWidget';
import RevenueLeadsChartWidget from '../../widgets/RevenueLeadsChartWidget';
import RecentActivityWidget from '../../widgets/RecentActivityWidget';
import SalesPipelineWidget from '../../widgets/SalesPipelineWidget';
import TodoListWidget from '../../widgets/TodoListWidget';
import { useLayout } from '../../components/layout/DashboardLayout';

const DashboardV2 = () => {
  const navigate = useNavigate();
  const { setHeader, setContent } = useLayout();
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const response = await dashboardApi.getKPIs();
        if (response.data && response.data.success) {
          setKpis(response.data.data);
        }
      } catch (err) {
        setError('Failed to load dashboard KPIs.');
      } finally {
        setLoading(false);
      }
    }
    fetchKPIs();
  }, []);

  // Example chart data (replace with real data if available)
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Leads',
        data: [12, 19, 15, 22, 18, 24, 20],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Revenue',
        data: [5000, 7000, 6000, 9000, 8000, 11000, 10000],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Example recent activity (replace with real data if available)
  const recentActivity = [
    { icon: <Users className="h-6 w-6 text-black" />, text: 'New lead added: John Doe', time: '2 hours ago', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { icon: <Home className="h-6 w-6 text-black" />, text: 'Property listed: Ocean View Villa', time: 'Yesterday', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { icon: <Calendar className="h-6 w-6 text-black" />, text: 'Task completed: Call with client', time: '2 days ago', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
  ];

  useEffect(() => {
    setHeader({
      title: 'Dashboard',
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Dashboard' }
      ],
      tabs: [
        { label: 'Overview', href: '#', active: true },
        { label: 'Pipeline', href: '#' },
        { label: 'Reports', href: '#' }
      ]
    });
    setContent(
      <>
        {/* Left Column (Stats) */}
        <div className="col">
          <Widget title="New Leads">
            <NewLeadsWidget value={kpis && typeof kpis.newLeadsToday === 'number' ? kpis.newLeadsToday : 'N/A'} trend={'+18.7%'} />
          </Widget>
          <Widget title="Overdue Tasks">
            <OverdueTasksWidget value={kpis && typeof kpis.overdueTasks === 'number' ? kpis.overdueTasks : 'N/A'} trend={'+2.7%'} />
          </Widget>
        </div>
        {/* Center Column (KPIs + Chart + Recent) */}
        <div className="col" style={{ flex: 2, minWidth: '16rem', maxWidth: '32rem', width: '100%' }}>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Widget title="Total Leads">
              <TotalLeadsWidget value={kpis && typeof kpis.totalLeads === 'number' ? kpis.totalLeads : 'N/A'} />
            </Widget>
            <Widget title="New Leads">
              <NewLeadsWidget value={kpis && typeof kpis.newLeadsToday === 'number' ? kpis.newLeadsToday : 'N/A'} trend={'+18.7%'} />
            </Widget>
            <Widget title="Active Tasks">
              <ActiveTasksWidget value={kpis && typeof kpis.activeTasks === 'number' ? kpis.activeTasks : 'N/A'} />
            </Widget>
            <Widget title="Properties">
              <PropertiesWidget value={kpis && typeof kpis.totalProperties === 'number' ? kpis.totalProperties : 'N/A'} />
            </Widget>
          </div>
          <Widget title="Revenue & Leads Trend" actions={<Button variant="ghost" className="text-gray-600 hover:text-black" onClick={() => navigate('/reports')}>View Reports <ArrowRight className="ml-2 h-4 w-4 text-black" /></Button>}>
            <RevenueLeadsChartWidget chartData={chartData} chartOptions={chartOptions} onViewReports={() => navigate('/reports')} />
          </Widget>
          <Widget title="Recent Activity">
            <RecentActivityWidget recentActivity={recentActivity} />
          </Widget>
        </div>
        {/* Right Column (Status/To-Do) */}
        <div className="col">
          <Widget title="Sales Pipeline">
            <SalesPipelineWidget progress={60} estimatedCompletion="2 days left" onViewDetails={() => {}} />
          </Widget>
          <Widget title="Your To-Do List">
            <TodoListWidget todos={[
              { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: 'Follow up with new leads' },
              { icon: <Mail className="h-4 w-4 text-blue-500" />, text: 'Send property brochures' },
              { icon: <FileText className="h-4 w-4 text-gray-500" />, text: 'Review contract drafts' },
              { icon: <Calendar className="h-4 w-4 text-purple-500" />, text: 'Schedule team meeting' },
            ]} />
          </Widget>
        </div>
      </>
    );
  }, [setHeader, setContent, kpis, chartData, chartOptions, navigate]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return null;
};

export default DashboardV2; 