import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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
import { 
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { useNavigate, useLocation } from 'react-router-dom';

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

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, location.pathname]);

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

      // Process data
      const totalLeads = leads?.length || 0;
      const activeLeads = leads?.filter(lead => lead.status === 'active').length || 0;
      const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
      const totalProperties = properties?.length || 0;
      const availableProperties = properties?.filter(prop => prop.status === 'Available').length || 0;
      const soldProperties = properties?.filter(prop => prop.status === 'Sold').length || 0;

      // Calculate revenue
      const totalRevenue = properties?.reduce((sum, prop) => sum + (prop.price || 0), 0) || 0;
      const monthlyRevenue = totalRevenue / 12;
      const revenueChange = 15; // Example value

      // Process lead sources
      const leadSources = leads?.reduce((acc: any[], lead) => {
        const existing = acc.find(item => item.source === lead.source);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ source: lead.source, count: 1 });
        }
        return acc;
      }, []) || [];

      // Process property types
      const propertyTypes = properties?.reduce((acc: any[], prop) => {
        const existing = acc.find(item => item.type === prop.type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ type: prop.type, count: 1 });
        }
        return acc;
      }, []) || [];

      // Process monthly leads
      const monthlyLeads = [
        { month: 'Jan', count: 25 },
        { month: 'Feb', count: 30 },
        { month: 'Mar', count: 28 },
        { month: 'Apr', count: 35 },
        { month: 'May', count: 32 },
        { month: 'Jun', count: 40 },
      ];

      // Process user stats
      const userStats = await Promise.all(
        (users || []).map(async (user) => {
          const userLeads = leads?.filter(lead => lead.assigned_to === user.id) || [];
          const userConvertedLeads = userLeads.filter(lead => lead.status === 'converted');
          const userRevenue = properties
            ?.filter(prop => prop.assigned_to === user.id)
            .reduce((sum, prop) => sum + (prop.price || 0), 0) || 0;

          // Get last activity
          const { data: lastActivity } = await supabase
            .from('lead_notes')
            .select('created_at')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            id: user.id,
            full_name: user.full_name,
            totalLeads: userLeads.length,
            activeLeads: userLeads.filter(lead => lead.status === 'active').length,
            convertedLeads: userConvertedLeads.length,
            conversionRate: userLeads.length ? (userConvertedLeads.length / userLeads.length) * 100 : 0,
            totalRevenue: userRevenue,
            lastActivity: lastActivity?.[0]?.created_at || null
          };
        })
      );

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
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Reports</h1>
        <Button className="bg-black text-white hover:bg-gray-900">
          <DocumentArrowDownIcon className="h-4 w-4 mr-2 text-white" />
          Export Report
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card className="border border-black bg-white">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={dateRange === 'week' ? 'default' : 'outline'}
              className={dateRange === 'week' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}
              onClick={() => setDateRange('week')}
            >
              Week
            </Button>
            <Button
              variant={dateRange === 'month' ? 'default' : 'outline'}
              className={dateRange === 'month' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}
              onClick={() => setDateRange('month')}
            >
              Month
            </Button>
            <Button
              variant={dateRange === 'year' ? 'default' : 'outline'}
              className={dateRange === 'year' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}
              onClick={() => setDateRange('year')}
            >
              Year
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-black bg-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white border border-black">
                <UserGroupIcon className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-semibold text-black">{reportData?.totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-black bg-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white border border-black">
                <BuildingOfficeIcon className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-semibold text-black">{reportData?.totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-black bg-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white border border-black">
                <CurrencyDollarIcon className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-semibold text-black">
                  ${reportData?.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-black bg-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white border border-black">
                <ChartBarIcon className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-semibold text-black">
                  {((reportData?.convertedLeads || 0) / (reportData?.totalLeads || 1) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lead Sources */}
        <Card className="border border-black bg-white">
          <CardHeader className="border-b border-black">
            <CardTitle className="text-black">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.leadSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{source.source}</span>
                  <Badge className="border-black text-black bg-white">{source.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Types */}
        <Card className="border border-black bg-white">
          <CardHeader className="border-b border-black">
            <CardTitle className="text-black">Property Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.propertyTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{type.type}</span>
                  <Badge className="border-black text-black bg-white">{type.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="border border-black bg-white">
        <CardHeader className="border-b border-black">
          <CardTitle className="text-black">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-black">
                    Agent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-black">
                    Leads
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-black">
                    Conversion Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-black">
                    Revenue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-black">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-black">
                {reportData?.userStats.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-white border border-black flex items-center justify-center">
                            <span className="text-lg font-medium text-black">
                              {user.full_name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-black">{user.full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{user.totalLeads}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">{user.conversionRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">${user.totalRevenue.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {new Date(user.lastActivity).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 