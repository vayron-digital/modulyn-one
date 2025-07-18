import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
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
import { Plus, Mail, Phone, UserPlus, Building, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import FullScreenLoader from '../../components/common/FullScreenLoader';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  reports_to: string | null;
  avatar_url: string | null;
  phone: string | null;
  joined_date: string;
  status: string;
  team_id: string;
}

function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTeamMembers();

    // Set up real-time subscription
    const subscription = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchTeamMembers(); // Refresh the team data when changes occur
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      // Get the user's team
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // If user has a team, fetch team members
      if (userProfile?.team_id) {
        const { data: teamMembers, error: teamError } = await supabase
          .from('profiles')
          .select('*')
          .eq('team_id', userProfile.team_id)
          .order('role');

        if (teamError) throw teamError;
        setTeamMembers(teamMembers || []);
      } else {
        // If no team, just show the user's own profile
        const { data: userData, error: userDataError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userDataError) throw userDataError;
        setTeamMembers(userData ? [userData] : []);
      }
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (members: TeamMember[]) => {
    const hierarchy: { [key: string]: TeamMember[] } = {};
    
    // Group members by their manager (reports_to)
    members.forEach(member => {
      const managerId = member.reports_to || 'root';
      if (!hierarchy[managerId]) {
        hierarchy[managerId] = [];
      }
      hierarchy[managerId].push(member);
    });

    return hierarchy;
  };

  const renderTeamMember = (member: TeamMember, level: number = 0) => {
    const hierarchy = buildHierarchy(teamMembers);
    const directReports = hierarchy[member.id] || [];

    return (
      <div key={member.id} className={`ml-${level * 8}`}>
        <div className="flex items-center p-4 bg-white rounded-lg shadow mb-4">
          <div className="flex-shrink-0 h-12 w-12">
            {member.avatar_url ? (
              <img
                className="h-12 w-12 rounded-full"
                src={member.avatar_url}
                alt={member.full_name}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xl font-medium text-indigo-600">
                  {member.full_name?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{member.full_name}</h3>
            <div className="text-sm text-gray-500">{member.role}</div>
            <div className="text-sm text-gray-500">{member.department}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm text-gray-500">{member.email}</div>
            <div className="text-sm text-gray-500">{member.phone}</div>
          </div>
        </div>
        {directReports.length > 0 && (
          <div className="ml-8 border-l-2 border-gray-200 pl-4">
            {directReports.map(report => renderTeamMember(report, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const hierarchy = buildHierarchy(teamMembers);
  const rootMembers = hierarchy['root'] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-gray-500">
            View and manage your team members
          </p>
        </div>
        <Button
          onClick={() => navigate('/team/new')}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {member.avatar_url ? (
                    <img
                      className="h-12 w-12 rounded-full"
                      src={member.avatar_url}
                      alt={member.full_name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xl font-medium text-indigo-600">
                        {member.full_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{member.full_name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{member.role}</Badge>
                    <Badge variant="outline">{member.department}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Building className="h-4 w-4 mr-2" />
                  <span>Team {member.team_id}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Reports to: {member.reports_to || 'None'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Team; 