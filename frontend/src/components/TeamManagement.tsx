import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: {
    full_name: string;
    personal_email: string;
    role: string;
  };
}

interface Agent {
  id: string;
  full_name: string;
  personal_email: string;
  role: string;
  team_id: string | null;
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: TeamMember[] }>({});
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamsAndAgents();
  }, []);

  const fetchTeamsAndAgents = async () => {
    try {
      setLoading(true);
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (teamsError) throw teamsError;
      
      // Fetch agents (profiles)
      const { data: agentsData, error: agentsError } = await supabase
        .from('profiles')
        .select('id, full_name, personal_email, role, team_id')
        .order('full_name');
      
      if (agentsError) throw agentsError;
      
      setTeams(teamsData || []);
      setAgents(agentsData || []);
      
      // Fetch team members for each team
      if (teamsData) {
        const membersPromises = teamsData.map(team =>
          supabase
            .from('team_members')
            .select('*, user:profiles(full_name, personal_email, role)')
            .eq('team_id', team.id)
        );
        
        const membersResults = await Promise.all(membersPromises);
        const membersMap: { [key: string]: TeamMember[] } = {};
        
        membersResults.forEach((result, index) => {
          if (result.data) {
            membersMap[teamsData[index].id] = result.data;
          }
        });
        
        setTeamMembers(membersMap);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    try {
      if (!newTeamName.trim()) {
        setError('Team name is required');
        return;
      }

      const { data, error } = await supabase
        .from('teams')
        .insert([
          {
            name: newTeamName.trim(),
            description: newTeamDescription.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTeams([...teams, data]);
      setNewTeamName('');
      setNewTeamDescription('');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId);

      if (error) throw error;

      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, ...updates } : team
      ));
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      setTeams(teams.filter(team => team.id !== teamId));
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const addTeamMember = async (teamId: string, userId: string, role: string = 'member') => {
    try {
      // First, check if user is already in another team
      const existingMember = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingMember.data) {
        // Remove from previous team
        await supabase
          .from('team_members')
          .delete()
          .eq('user_id', userId);
      }

      // Add to new team
      const { data, error } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: teamId,
            user_id: userId,
            role: role,
          },
        ])
        .select('*, user:profiles(full_name, personal_email, role)')
        .single();

      if (error) throw error;

      // Update profiles table with team_id
      await supabase
        .from('profiles')
        .update({ team_id: teamId })
        .eq('id', userId);

      setTeamMembers({
        ...teamMembers,
        [teamId]: [...(teamMembers[teamId] || []), data],
      });
      
      // Update agents list
      setAgents(agents.map(agent =>
        agent.id === userId ? { ...agent, team_id: teamId } : agent
      ));

      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const updateTeamMemberRole = async (teamId: string, userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      setTeamMembers({
        ...teamMembers,
        [teamId]: teamMembers[teamId].map(member =>
          member.user_id === userId ? { ...member, role: newRole } : member
        ),
      });
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update profiles table to remove team_id
      await supabase
        .from('profiles')
        .update({ team_id: null })
        .eq('id', userId);

      setTeamMembers({
        ...teamMembers,
        [teamId]: teamMembers[teamId].filter(member => member.user_id !== userId),
      });

      // Update agents list
      setAgents(agents.map(agent =>
        agent.id === userId ? { ...agent, team_id: null } : agent
      ));

      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create New Team */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Team</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="teamDescription"
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <button
            onClick={createTeam}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Team
          </button>
        </div>
      </div>

      {/* Teams List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Teams</h2>
        <div className="space-y-6">
          {teams.map(team => (
            <div key={team.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.description}</p>
                </div>
                <button
                  onClick={() => deleteTeam(team.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete Team
                </button>
              </div>

              {/* Team Members */}
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Team Members</h4>
                <ul className="space-y-2">
                  {teamMembers[team.id]?.map(member => (
                    <li key={member.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{member.user.full_name}</span>
                        <span className="text-gray-500 ml-2">({member.user.personal_email})</span>
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full
                          {member.role === 'lead' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={member.role}
                          onChange={(e) => updateTeamMemberRole(team.id, member.user_id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md"
                        >
                          <option value="member">Member</option>
                          <option value="lead">Team Lead</option>
                        </select>
                        <button
                          onClick={() => removeTeamMember(team.id, member.user_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add Member */}
              <div className="mt-4">
                <div className="flex space-x-4">
                  <select
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    onChange={(e) => {
                      if (e.target.value) {
                        const [userId, role] = e.target.value.split('|');
                        addTeamMember(team.id, userId, role || 'member');
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Add team member...</option>
                    {agents
                      .filter(agent => !teamMembers[team.id]?.some(member => member.user_id === agent.id))
                      .map(agent => (
                        <option key={agent.id} value={`${agent.id}|member`}>
                          {agent.full_name} ({agent.personal_email})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 