import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { checkDatabaseStructure } from '../../utils/checkDatabase';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import Toast from '../../components/common/Toast';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  Users, 
  Phone, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Plus,
  Calendar,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  UserPlus,
  PhoneCall,
  CheckSquare,
  XSquare,
  DollarSign as DollarSignIcon,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Eye,
  Download,
  Upload,
  Check,
  X,
  Mail,
  User,
  Building,
  MapPin,
  Tag,
  Star,
  StarOff,
  Home,
  MessageSquare,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { dashboardApi } from '../../lib/api';
import { DashboardKPI } from '../../types/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  totalProperties: number;
  totalSales: number;
  monthlyRevenue: number;
  conversionRate: number;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  assigned_to: string;
  created_by: string;
  assigned_user: {
    full_name: string;
  } | null;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  created_at: string;
}

interface DbCheckResult {
  success: boolean;
  error?: any;
  details: {
    profilesAccessible: boolean;
    userProfile: any;
    userId: string;
  };
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'property' | 'task' | 'document';
  action: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeLeads: 0,
    totalProperties: 0,
    totalSales: 0,
    monthlyRevenue: 0,
    conversionRate: 0
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbCheckResult, setDbCheckResult] = useState<DbCheckResult | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{start: string|null, end: string|null}>({start: null, end: null});
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashValue, setSlashValue] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const slashActions = [
    { label: 'Add Lead', action: () => console.log('Add Lead') },
    { label: 'Add Note', action: () => console.log('Add Note') },
    { label: 'Schedule Call', action: () => console.log('Schedule Call') },
    { label: 'Add Project', action: () => console.log('Add Project') },
  ];
  const slashInputRef = useRef<HTMLInputElement>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const location = useLocation();
  const [kpis, setKpis] = useState<DashboardKPI | null>(null);

  // Chart data
  const leadsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Leads',
        data: [65, 59, 80, 81, 56, 55],
        fill: true,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4
      },
      {
        label: 'Closed Deals',
        data: [28, 48, 40, 19, 86, 27],
        fill: true,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        backgroundColor: '#6366F1',
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: '#E5E7EB'
        },
        ticks: {
          color: '#6B7280'
        }
      },
      x: {
        grid: {
          color: '#E5E7EB'
        },
        ticks: {
          color: '#6B7280'
        }
      }
    }
  };

  useEffect(() => {
    checkDatabaseAndFetchData();
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !slashOpen) {
        setSlashOpen(true);
        setTimeout(() => slashInputRef.current?.focus(), 10);
      } else if (slashOpen) {
        if (e.key === 'Escape') setSlashOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slashOpen]);

  const checkDatabaseAndFetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getKPIs();
      if (response.data && response.data.success) {
        setKpis(response.data.data);
      } else {
        setError('Failed to fetch dashboard KPIs.');
      }
      setLoading(false);
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard KPIs.');
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'lead_created':
        return <UserPlus className="h-5 w-5 text-black" />;
      case 'task_completed':
        return <CheckSquare className="h-5 w-5 text-black" />;
      case 'call_logged':
        return <PhoneCall className="h-5 w-5 text-black" />;
      case 'deal_closed':
        return <DollarSignIcon className="h-5 w-5 text-black" />;
      default:
        return <Activity className="h-5 w-5 text-black" />;
    }
  };

  const getActivityTitle = (type: string): string => {
    switch (type) {
      case 'lead_created':
        return 'New Lead Created';
      case 'task_completed':
        return 'Task Completed';
      case 'call_logged':
        return 'Call Logged';
      case 'deal_closed':
        return 'Deal Closed';
      default:
        return 'Activity';
    }
  };

  // Real-time subscription
  useEffect(() => {
    const leadsSubscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, 
        (payload) => {
          console.log('Change received!', payload);
          checkDatabaseAndFetchData();
        }
      )
      .subscribe();

    return () => {
      leadsSubscription.unsubscribe();
    };
  }, [user?.id]);

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-400">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={checkDatabaseAndFetchData}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Retry
            </button>
            {dbCheckResult && !dbCheckResult.success && (
              <div className="mt-2">
                <p className="text-xs text-red-600">
                  Technical details: {JSON.stringify(dbCheckResult.details)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  This may be because the database tables haven't been created yet. 
                  <button className="underline text-indigo-600" onClick={()=>window.location.reload()}>Refresh</button> or <a href="mailto:support@yourcrm.com" className="underline text-indigo-600">Contact Support</a>.
                </p>
              </div>
            )}
          </div>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
      </div>
    );
  }

  const quickActions = [
    {
      title: 'New Lead',
      icon: <Users className="h-5 w-5 text-black" />,
      onClick: () => navigate('/leads/new'),
    },
    {
      title: 'Add Property',
      icon: <Home className="h-5 w-5 text-black" />,
      onClick: () => navigate('/properties/new'),
    },
    {
      title: 'New Task',
      icon: <Calendar className="h-5 w-5 text-black" />,
      onClick: () => navigate('/tasks/new'),
    },
    {
      title: 'New Document',
      icon: <FileText className="h-5 w-5 text-black" />,
      onClick: () => navigate('/documents/new'),
    }
  ];

  return (
    <div className="space-y-6 bg-white dark:bg-card-dark min-h-screen p-6 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Welcome back, {user?.email}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              className="bg-white dark:bg-card-dark text-black dark:text-white placeholder:text-gray-400 rounded-xl px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-black border border-black w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-400" />
          </div>
          <Button
            variant="outline"
            className="bg-white dark:bg-black text-black dark:text-white border-black hover:bg-gray-100 w-full sm:w-auto"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2 text-black" />
            Filters
          </Button>
          <Button className="bg-black text-white hover:bg-gray-900 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2 text-white" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 bg-white text-black border-black hover:bg-gray-100 text-xs sm:text-sm"
            onClick={action.onClick}
          >
            <div className="p-2 rounded-full bg-white border border-black text-black">
              {action.icon}
            </div>
            <span className="font-medium">{action.title}</span>
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6 bg-white border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{kpis && typeof kpis.totalLeads === 'number' ? kpis.totalLeads : 'N/A'}</p>
            </div>
            <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6 bg-white border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Properties</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{kpis && typeof kpis.totalProperties === 'number' ? kpis.totalProperties : 'N/A'}</p>
            </div>
            <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
              <Home className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6 bg-white border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-black">{kpis && typeof kpis.revenueThisMonth === 'number' ? kpis.revenueThisMonth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</p>
            </div>
            <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Conversion Rate: <span className="font-medium text-black">{kpis && typeof kpis.conversionRate === 'number' ? kpis.conversionRate.toFixed(1) + '%' : 'N/A'}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-x-auto">
        <Card className="bg-white border border-black">
          <CardHeader>
            <CardTitle className="text-black text-base sm:text-lg">Lead Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[300px] w-full min-w-[260px] overflow-x-auto">
              <Line data={leadsData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-black">
          <CardHeader>
            <CardTitle className="text-black text-base sm:text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[300px] w-full min-w-[260px] overflow-x-auto">
              <Bar data={revenueData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white border border-black">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-black text-base sm:text-lg">Recent Activity</CardTitle>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-black"
              onClick={() => navigate('/activities')}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4 text-black" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 border border-black rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="bg-white border border-black p-1 sm:p-2 rounded-lg">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-black font-medium text-xs sm:text-base">{activity.title}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{activity.description}</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-black">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-black text-base sm:text-lg">Recent Leads</CardTitle>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-black"
              onClick={() => navigate('/leads')}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4 text-black" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 border border-black rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-black text-white font-bold rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-base">
                      {lead.first_name[0]}{lead.last_name[0]}
                    </div>
                    <div>
                      <p className="text-black font-medium text-xs sm:text-base">{lead.first_name} {lead.last_name}</p>
                      <p className="text-gray-600 text-[10px] sm:text-sm">{lead.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-black"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <ArrowRight className="h-4 w-4 text-black" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4 sm:p-6 bg-white border border-black">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-black">Recent Activity</h2>
        <div className="space-y-3 sm:space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-black flex items-center justify-center">
                {activity.type === 'lead' && <Users className="h-4 w-4 text-black" />}
                {activity.type === 'property' && <Home className="h-4 w-4 text-black" />}
                {activity.type === 'task' && <Calendar className="h-4 w-4 text-black" />}
                {activity.type === 'document' && <FileText className="h-4 w-4 text-black" />}
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-black">{activity.description}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">
                  {activity.user.name} • {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* New KPI Cards */}
      {kpis && (
        <>
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">New Leads Today</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{typeof kpis.newLeadsToday === 'number' ? kpis.newLeadsToday : 'N/A'}</p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">New Leads This Week</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{typeof kpis.newLeadsThisWeek === 'number' ? kpis.newLeadsThisWeek : 'N/A'}</p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Leads Converted This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{typeof kpis.leadsConvertedThisMonth === 'number' ? kpis.leadsConvertedThisMonth : 'N/A'}</p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{typeof kpis.activeTasks === 'number' ? kpis.activeTasks : 'N/A'}</p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{typeof kpis.overdueTasks === 'number' ? kpis.overdueTasks : 'N/A'}</p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Properties Sold This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{typeof kpis.propertiesSoldThisMonth === 'number' ? kpis.propertiesSoldThisMonth : 'N/A'}</p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Call Success Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  {typeof kpis.callSuccessRate === 'number'
                    ? (kpis.callSuccessRate * 100).toFixed(1) + '%'
                    : 'N/A'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <PhoneCall className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          {/* Avg Lead Response Time */}
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Lead Response Time</p>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  {typeof kpis.avgLeadResponseTime === 'number' ? `${kpis.avgLeadResponseTime.toFixed(1)} min` : 'N/A'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          {/* Avg Deal Size */}
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Deal Size</p>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  {typeof kpis.avgDealSize === 'number' ? kpis.avgDealSize.toFixed(0) : 'N/A'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
          {/* Revenue This Month */}
          <Card className="p-4 sm:p-6 bg-white border border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  {typeof kpis.revenueThisMonth === 'number' ? kpis.revenueThisMonth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-white border border-black rounded-full">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
            </div>
          </Card>
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Dashboard; 