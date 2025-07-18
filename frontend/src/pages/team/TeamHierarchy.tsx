import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  reports_to: string | null;
  profile_image_url: string | null;
  department: string;
  total_leads: number;
  conversion_rate: number;
}

interface TeamNode extends TeamMember {
  children: TeamNode[];
}

function TeamHierarchy() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamNode[]>([]);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const buildHierarchy = (members: TeamMember[]): TeamNode[] => {
    const memberMap = new Map<string, TeamNode>();
    const roots: TeamNode[] = [];

    // First, convert all members to nodes with empty children arrays
    members.forEach(member => {
      memberMap.set(member.id, { ...member, children: [] });
    });

    // Then, build the hierarchy
    members.forEach(member => {
      const node = memberMap.get(member.id)!;
      if (member.reports_to) {
        const parent = memberMap.get(member.reports_to);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Fetch team members with their stats
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          reports_to,
          profile_image_url,
          department
        `);

      if (membersError) throw membersError;

      // Fetch lead statistics for each team member
      const membersWithStats = await Promise.all(
        members.map(async (member) => {
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, status')
            .eq('assigned_agent_id', member.id);

          if (leadsError) throw leadsError;

          const totalLeads = leads?.length || 0;
          const convertedLeads = leads?.filter(lead => lead.status === 'converted').length || 0;
          const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

          return {
            ...member,
            total_leads: totalLeads,
            conversion_rate: conversionRate
          };
        })
      );

      const hierarchy = buildHierarchy(membersWithStats);
      setTeamMembers(hierarchy);
    } catch (error: any) {
      console.error('Error fetching team data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const TeamMemberCard = ({ member }: { member: TeamNode }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {member.profile_image_url ? (
            <img
              src={member.profile_image_url}
              alt={member.full_name}
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xl font-medium text-indigo-600">
                {member.full_name?.charAt(0) || member.email.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{member.full_name || member.email}</h3>
          <p className="text-sm text-gray-500">{member.role}</p>
          <p className="text-sm text-gray-500">{member.department}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{member.total_leads} Leads</p>
          <p className="text-sm text-gray-500">{member.conversion_rate.toFixed(1)}% Conversion</p>
        </div>
      </div>
    </div>
  );

  const renderTeamTree = (nodes: TeamNode[], level: number = 0) => (
    <div className={`pl-${level * 8}`}>
      {nodes.map(node => (
        <div key={node.id}>
          <TeamMemberCard member={node} />
          {node.children.length > 0 && (
            <div className="ml-8 border-l-2 border-gray-200 pl-4">
              {renderTeamTree(node.children, level + 1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Team Hierarchy</h1>
        <p className="text-gray-500">View your team structure and performance metrics</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        {teamMembers.length > 0 ? (
          renderTeamTree(teamMembers)
        ) : (
          <p className="text-gray-500 text-center">No team members found.</p>
        )}
      </div>
    </div>
  );
}

export default TeamHierarchy; 