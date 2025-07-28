import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { 
  Building, 
  Users, 
  UserPlus, 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count: number;
  leader_id?: string;
  leader_name?: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  team_id?: string;
  profile_image_url?: string;
}

interface TeamStats {
  totalTeams: number;
  totalMembers: number;
  activeTeams: number;
  averageTeamSize: number;
}

export default function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalTeams: 0,
    totalMembers: 0,
    activeTeams: 0,
    averageTeamSize: 0
  });
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    leader_id: ''
  });

  const isAdmin = user?.is_admin || user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchTeams();
      fetchTeamMembers();
    }
  }, [isAdmin]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!leader_id(full_name)
        `)
        .order('name');

      if (error) throw error;

      const teamsWithStats = (data || []).map(team => ({
        ...team,
        leader_name: team.leader?.full_name,
        member_count: 0 // Will be calculated separately
      }));

      setTeams(teamsWithStats);
      calculateTeamStats(teamsWithStats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, team_id, profile_image_url')
        .order('full_name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateTeamStats = (teamsData: Team[]) => {
    const totalTeams = teamsData.length;
    const totalMembers = teamMembers.length;
    const activeTeams = teamsData.filter(team => team.member_count > 0).length;
    const averageTeamSize = totalTeams > 0 ? totalMembers / totalTeams : 0;

    setTeamStats({
      totalTeams,
      totalMembers,
      activeTeams,
      averageTeamSize: Math.round(averageTeamSize * 10) / 10
    });
  };

  const handleCreateTeam = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: newTeam.name,
          description: newTeam.description,
          leader_id: newTeam.leader_id || null
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      setNewTeam({ name: '', description: '', leader_id: '' });
      setShowCreateTeamModal(false);
      fetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemberToTeam = async (teamId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ team_id: teamId })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added to team successfully",
      });

      fetchTeamMembers();
      fetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveMemberFromTeam = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ team_id: null })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from team successfully",
      });

      fetchTeamMembers();
      fetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      // First remove all members from the team
      await supabase
        .from('profiles')
        .update({ team_id: null })
        .eq('team_id', teamId);

      // Then delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });

      fetchTeams();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You need administrator privileges to access team management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage team structure and hierarchy</p>
        </div>
        <Button 
          onClick={() => setShowCreateTeamModal(true)} 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold">{teamStats.totalTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold">{teamStats.activeTeams}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Team Size</p>
                <p className="text-2xl font-bold">{teamStats.averageTeamSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const teamMembersList = teamMembers.filter(member => member.team_id === team.id);
          return (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowAddMemberModal(true);
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{team.description}</p>
                {team.leader_name && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Leader: {team.leader_name}</Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Members</span>
                    <Badge>{teamMembersList.length}</Badge>
                  </div>
                  
                  {teamMembersList.length > 0 ? (
                    <div className="space-y-2">
                      {teamMembersList.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.profile_image_url} />
                              <AvatarFallback>{member.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{member.full_name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMemberFromTeam(member.id)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {teamMembersList.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{teamMembersList.length - 3} more members
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No members yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Team Modal */}
      <DialogRoot open={showCreateTeamModal} onOpenChange={setShowCreateTeamModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Set up a new team with a leader and description</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Sales Team, Marketing Team, etc."
              />
            </div>
            <div>
              <Label htmlFor="team-description">Description</Label>
              <Input
                id="team-description"
                value={newTeam.description}
                onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Team purpose and responsibilities"
              />
            </div>
            <div>
              <Label htmlFor="team-leader">Team Leader (Optional)</Label>
              <Select value={newTeam.leader_id} onValueChange={(value) => setNewTeam(prev => ({ ...prev, leader_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No leader</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeamModal(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateTeam}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Add Member to Team Modal */}
      <DialogRoot open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member to {selectedTeam?.name}</DialogTitle>
            <DialogDescription>Select a team member to add to this team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Available Members</Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {teamMembers
                  .filter(member => !member.team_id)
                  .map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.profile_image_url} />
                          <AvatarFallback>{member.full_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.full_name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (selectedTeam) {
                            handleAddMemberToTeam(selectedTeam.id, member.id);
                            setShowAddMemberModal(false);
                          }
                        }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                {teamMembers.filter(member => !member.team_id).length === 0 && (
                  <p className="text-center text-gray-500 py-4">No available members</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
} 