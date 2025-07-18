import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LeadsByStatus {
  status: string;
  count: number;
  user_id: string;
  user_name: string;
}

interface CallsByType {
  type: string;
  count: number;
  user_id: string;
  user_name: string;
}

export default function AllReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<LeadsByStatus[]>([]);
  const [callData, setCallData] = useState<CallsByType[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all users first
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch leads and calls data for each user
      const leadsPromises = usersData?.map(async (user) => {
        const { data, error } = await supabase.rpc('get_leads_by_status', {
          user_id: user.id,
        });
        if (error) throw error;
        return data.map((item: any) => ({
          ...item,
          user_name: user.full_name,
        }));
      });

      const callsPromises = usersData?.map(async (user) => {
        const { data, error } = await supabase.rpc('get_calls_by_type', {
          user_id: user.id,
        });
        if (error) throw error;
        return data.map((item: any) => ({
          ...item,
          user_name: user.full_name,
        }));
      });

      const leadsResults = await Promise.all(leadsPromises || []);
      const callsResults = await Promise.all(callsPromises || []);

      setLeadData(leadsResults.flat());
      setCallData(callsResults.flat());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const aggregateLeadData = () => {
    const aggregated = leadData.reduce((acc, curr) => {
      const key = curr.status;
      if (!acc[key]) {
        acc[key] = { status: key, count: 0 };
      }
      acc[key].count += curr.count;
      return acc;
    }, {});
    return Object.values(aggregated);
  };

  const aggregateCallData = () => {
    const aggregated = callData.reduce((acc, curr) => {
      const key = curr.type;
      if (!acc[key]) {
        acc[key] = { type: key, count: 0 };
      }
      acc[key].count += curr.count;
      return acc;
    }, {});
    return Object.values(aggregated);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading reports: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-8">All Reports</h1>

      <div className="space-y-12">
        {/* Overall Statistics */}
        <section>
          <h2 className="text-xl font-medium mb-6">Overall Statistics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Leads by Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregateLeadData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Calls by Type</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregateCallData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Per User Statistics */}
        <section>
          <h2 className="text-xl font-medium mb-6">Per User Statistics</h2>
          <div className="space-y-8">
            {users.map((user) => (
              <div key={user.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">{user.full_name}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-base font-medium mb-2">Leads by Status</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={leadData.filter((lead) => lead.user_id === user.id)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#4F46E5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-medium mb-2">Calls by Type</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={callData.filter((call) => call.user_id === user.id)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 