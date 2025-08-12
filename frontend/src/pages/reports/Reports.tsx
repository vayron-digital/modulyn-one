import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { 
  BarChart3,
  Users,
  Building,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  User,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { motion } from 'framer-motion';

interface ReportData {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  totalRevenue: number;
  monthlyRevenue: number;
  revenueChange: number;
  leadSources: { source: string; count: number }[];
  propertyTypes: { type: string; count: number }[];
  monthlyLeads: { month: string; count: number }[];
  userStats: {
    id: string;
    full_name: string;
    totalLeads: number;
    activeLeads: number;
    convertedLeads: number;
    conversionRate: number;
    totalRevenue: number;
    lastActivity: string;
  }[];
}

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard');
      return;
    }
    fetchReportData();
  }, [dateRange, location.pathname, user, navigate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users if admin
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (usersError) throw usersError;

      // Fetch leads data
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*');

      if (leadsError) throw leadsError;

      // Fetch properties data
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*');

      if (propertiesError) throw propertiesError;

      // Calculate report data
      const totalLeads = leads?.length || 0;
      const activeLeads = leads?.filter(lead => lead.status === 'active').length || 0;
      const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
      
      const totalProperties = properties?.length || 0;
      const availableProperties = properties?.filter(prop => prop.status === 'Available').length || 0;
      const soldProperties = properties?.filter(prop => prop.status === 'Sold').length || 0;

      // Calculate revenue (mock data for now)
      const totalRevenue = soldProperties * 500000; // Mock average property price
      const monthlyRevenue = totalRevenue / 12;
      const revenueChange = 15; // Mock 15% increase

      // Mock data for charts
      const leadSources = [
        { source: 'Website', count: 45 },
        { source: 'Referral', count: 32 },
        { source: 'Social Media', count: 28 },
        { source: 'Direct', count: 15 }
      ];

      const propertyTypes = [
        { type: 'Residential', count: 120 },
        { type: 'Commercial', count: 45 },
        { type: 'Land', count: 23 },
        { type: 'Industrial', count: 12 }
      ];

      const monthlyLeads = [
        { month: 'Jan', count: 45 },
        { month: 'Feb', count: 52 },
        { month: 'Mar', count: 48 },
        { month: 'Apr', count: 61 },
        { month: 'May', count: 55 },
        { month: 'Jun', count: 67 }
      ];

      const userStats = users?.map(user => ({
        id: user.id,
        full_name: user.full_name,
        totalLeads: Math.floor(Math.random() * 50) + 10,
        activeLeads: Math.floor(Math.random() * 20) + 5,
        convertedLeads: Math.floor(Math.random() * 15) + 2,
        conversionRate: Math.floor(Math.random() * 30) + 10,
        totalRevenue: Math.floor(Math.random() * 1000000) + 100000,
        lastActivity: new Date().toISOString()
      })) || [];

      setReportData({
        totalLeads,
        activeLeads,
        convertedLeads,
        totalProperties,
        availableProperties,
        soldProperties,
        totalRevenue,
        monthlyRevenue,
        revenueChange,
        leadSources,
        propertyTypes,
        monthlyLeads,
        userStats
      });

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Award className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Access Denied</h3>
          <p className="text-slate-600">You need admin privileges to view reports.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Reports</h3>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Available</h3>
          <p className="text-slate-600">No report data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <PageHeader
        title="Analytics & Reports"
        subtitle="Comprehensive insights into your CRM performance"
        icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
        stats={[
          {
            label: 'Total Revenue',
            value: getCurrencyDisplay(reportData.totalRevenue),
            change: reportData.revenueChange,
            trend: 'up'
          },
          {
            label: 'Total Leads',
            value: reportData.totalLeads,
            change: 8,
            trend: 'up'
          },
          {
            label: 'Properties Sold',
            value: reportData.soldProperties,
            change: 12,
            trend: 'up'
          },
          {
            label: 'Conversion Rate',
            value: `${((reportData.convertedLeads / reportData.totalLeads) * 100).toFixed(1)}%`,
            change: 5,
            trend: 'up'
          }
        ]}
        actions={[
          {
            label: 'Export Report',
            icon: <Download className="h-4 w-4" />,
            onClick: () => toast({ title: "Coming Soon", description: "Export feature will be available soon" }),
            variant: 'outline'
          },
          {
            label: 'Schedule Report',
            icon: <Calendar className="h-4 w-4" />,
            onClick: () => toast({ title: "Coming Soon", description: "Schedule feature will be available soon" }),
            variant: 'outline'
          }
        ]}
      />

      {/* Date Range Selector */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium">Date Range:</Label>
              <Select value={dateRange} onValueChange={(value: 'week' | 'month' | 'year') => setDateRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReportData}
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Leads</p>
                      <p className="text-2xl font-bold text-slate-900">{reportData.totalLeads}</p>
                    </div>
                                         <div className="p-3 bg-blue-100 rounded-full">
                       <Users className="h-6 w-6 text-blue-600" />
                     </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+8% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Properties</p>
                      <p className="text-2xl font-bold text-slate-900">{reportData.totalProperties}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+12% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">{getCurrencyDisplay(reportData.totalRevenue)}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+{reportData.revenueChange}% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {((reportData.convertedLeads / reportData.totalLeads) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Target className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+5% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                                 <CardTitle className="flex items-center space-x-2">
                   <Users className="h-5 w-5" />
                   <span>Lead Sources</span>
                 </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.leadSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{source.source}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(source.count / Math.max(...reportData.leadSources.map(s => s.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{source.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Property Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.propertyTypes.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{type.type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(type.count / Math.max(...reportData.propertyTypes.map(t => t.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{type.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Lead Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{reportData.totalLeads}</div>
                  <div className="text-sm text-slate-600">Total Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{reportData.activeLeads}</div>
                  <div className="text-sm text-slate-600">Active Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{reportData.convertedLeads}</div>
                  <div className="text-sm text-slate-600">Converted Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{reportData.totalProperties}</div>
                  <div className="text-sm text-slate-600">Total Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{reportData.availableProperties}</div>
                  <div className="text-sm text-slate-600">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{reportData.soldProperties}</div>
                  <div className="text-sm text-slate-600">Sold</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.userStats.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">{user.full_name}</div>
                        <div className="text-sm text-slate-600">{user.totalLeads} leads • {user.conversionRate}% conversion</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900">{getCurrencyDisplay(user.totalRevenue)}</div>
                      <div className="text-sm text-slate-600">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports; 