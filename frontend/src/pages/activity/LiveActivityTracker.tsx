import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { useToast } from '../../components/ui/use-toast';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { Button } from '../../components/ui/button';
import { PhoneCall, PhoneMissed, PhoneOutgoing, UserCircle, CheckCircle, XCircle, CircleDot } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

export default function LiveActivityTracker() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchActivities();
    const subscription = supabase
      .channel('activities')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, payload => {
        setActivities(prev => [payload.new as Activity, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActivities(data);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show call-related activities by default
  const filteredActivities = showAll
    ? activities
    : activities.filter(a => a.type.toLowerCase().includes('call'));

  // Helper to get icon and color for activity type
  const getActivityIcon = (type: string, status: string) => {
    if (type.toLowerCase().includes('call')) {
      if (status === 'started' || status === 'ongoing') return <CircleDot className="h-5 w-5 text-green-500" title="Live" />;
      if (status === 'ended' || status === 'completed') return <CheckCircle className="h-5 w-5 text-blue-500" title="Completed" />;
      if (status === 'missed') return <PhoneMissed className="h-5 w-5 text-red-500" title="Missed" />;
      return <PhoneCall className="h-5 w-5 text-gray-500" title="Call" />;
    }
    return <UserCircle className="h-5 w-5 text-gray-400" title="Activity" />;
  };

  // Helper to get status from description
  const getStatus = (desc: string) => {
    if (/started|ongoing/i.test(desc)) return 'started';
    if (/ended|completed/i.test(desc)) return 'ended';
    if (/missed/i.test(desc)) return 'missed';
    return '';
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Call Activity</h1>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={fetchActivities}>Refresh</Button>
          <Button variant={showAll ? 'default' : 'outline'} onClick={() => setShowAll(v => !v)}>
            {showAll ? 'Show Calls Only' : 'Show All'}
          </Button>
        </div>
      </div>

      {/* Activities List */}
      <div className="grid gap-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No activities found.</div>
        ) : filteredActivities.map((activity) => {
          const status = getStatus(activity.description);
          const isLive = status === 'started';
          return (
            <Card key={activity.id} className={isLive ? 'border-green-500 shadow-lg animate-pulse' : ''}>
              <CardHeader className="flex flex-row items-center gap-3">
                {getActivityIcon(activity.type, status)}
                <CardTitle className="flex-1">{activity.type}
                  {isLive && <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full animate-pulse">Live Now</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-2">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{activity.user.full_name}</span>
                  <span className="text-xs text-gray-400 ml-2">{new Date(activity.created_at).toLocaleString()}</span>
                </div>
                <p className="mb-1">{activity.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 