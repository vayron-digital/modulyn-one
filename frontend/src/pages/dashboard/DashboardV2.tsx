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

const DashboardV2 = () => {
  const navigate = useNavigate();
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f6fafd] flex flex-col items-stretch">
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-black">Good morning, CRM Pro!</h1>
          <p className="text-gray-600 text-sm mt-1">Here's what's happening in your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-black text-black">Settings</Button>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-black">U</div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-6 gap-6 px-6 pb-6">
        {/* Left Column (Stats) */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          <Widget title="New Leads">
            <NewLeadsWidget value={kpis && typeof kpis.newLeadsToday === 'number' ? kpis.newLeadsToday : 'N/A'} trend={'+18.7%'} />
          </Widget>
          <Widget title="Overdue Tasks">
            <OverdueTasksWidget value={kpis && typeof kpis.overdueTasks === 'number' ? kpis.overdueTasks : 'N/A'} trend={'+2.7%'} />
          </Widget>
        </div>

        {/* Center Column (KPIs + Chart + Recent) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Widget title="Total Leads">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-black" />
                <span className="text-2xl font-bold text-black">{kpis && typeof kpis.totalLeads === 'number' ? kpis.totalLeads : 'N/A'}</span>
              </div>
            </Widget>
            <Widget title="New Leads">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-black" />
                <span className="text-2xl font-bold text-black">{kpis && typeof kpis.newLeadsToday === 'number' ? kpis.newLeadsToday : 'N/A'}</span>
              </div>
            </Widget>
            <Widget title="Active Tasks">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-black" />
                <span className="text-2xl font-bold text-black">{kpis && typeof kpis.activeTasks === 'number' ? kpis.activeTasks : 'N/A'}</span>
              </div>
            </Widget>
            <Widget title="Properties">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-black" />
                <span className="text-2xl font-bold text-black">{kpis && typeof kpis.totalProperties === 'number' ? kpis.totalProperties : 'N/A'}</span>
              </div>
            </Widget>
          </div>

          {/* Revenue/Leads Chart */}
          <Widget title="Revenue & Leads Trend" actions={<Button variant="ghost" className="text-gray-600 hover:text-black" onClick={() => navigate('/reports')}>View Reports <ArrowRight className="ml-2 h-4 w-4 text-black" /></Button>}>
            <div className="h-64 w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </Widget>

          {/* Recent Activity */}
          <Widget title="Recent Activity">
            <ul className="space-y-3">
              {recentActivity.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <img src={item.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-black" />
                  <span className="text-black">{item.text}</span>
                  <span className="ml-auto text-xs text-gray-500">{item.time}</span>
                </li>
              ))}
            </ul>
          </Widget>
        </div>

        {/* Right Column (Status/To-Do) */}
        <div className="xl:col-span-1 flex flex-col gap-4">
          {/* Status/Progress Widget */}
          <Widget title="Sales Pipeline">
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs">Estimated completion: 2 days left</p>
            <Button variant="outline" className="bg-white text-black border-black mt-2">View Details</Button>
          </Widget>
          {/* To-Do List */}
          <Widget title="Your To-Do List">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-black"><CheckCircle className="h-4 w-4 text-green-500" /> Follow up with new leads</li>
              <li className="flex items-center gap-2 text-black"><Mail className="h-4 w-4 text-blue-500" /> Send property brochures</li>
              <li className="flex items-center gap-2 text-black"><FileText className="h-4 w-4 text-gray-500" /> Review contract drafts</li>
              <li className="flex items-center gap-2 text-black"><Calendar className="h-4 w-4 text-purple-500" /> Schedule team meeting</li>
            </ul>
          </Widget>
        </div>
      </div>
    </div>
  );
};

export default DashboardV2; 