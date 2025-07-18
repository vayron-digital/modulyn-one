import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import FullScreenLoader from '../../components/common/FullScreenLoader';

interface Member {
  id: number;
  name: string;
  target: number;
  actual: number;
}
interface Team {
  id: number;
  name: string;
  leader: string;
  members: Member[];
}

type EditState = Record<string, string | number>;

export default function AdminTeamHierarchyPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<EditState>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const token = String(localStorage.getItem('token') ?? '');
    setLoading(true);
    setError('');
    Promise.all([
      fetch('/api/team/teams', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/team/team-hierarchy', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/team/team-revenue', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([teamsRes, hierarchyRes, revenueRes]) => {
      // Map teams, hierarchy, and revenue into the Team[] shape
      const teamsData = teamsRes.data?.teams || [];
      const hierarchy = hierarchyRes.data?.teamHierarchy || [];
      const revenue = revenueRes.data?.teamRevenue || [];
      // For demo: flatten to one level, real impl should build tree
      const teamsMapped: Team[] = teamsData.map((t: any) => {
        const members = revenue.filter((r: any) => r.team_id === t.id).map((r: any) => ({
          id: r.id,
          name: t.name, // TODO: Replace with real member name if available
          target: r.revenue_target,
          actual: r.revenue_actual,
        }));
        return {
          id: t.id,
          name: t.name,
          leader: '-', // TODO: Replace with real leader if available
          members,
        };
      });
      setTeams(teamsMapped);
      setLoading(false);
    }).catch(err => {
      setError('Failed to load team data');
      setLoading(false);
    });
  }, [user]);

  if (!user || !(user.is_admin || user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'master')) {
    return <div className="p-8 text-center text-red-500">Access denied. Admins only.</div>;
  }
  if (loading) return <FullScreenLoader />;

  const handleEdit = (teamId: number, memberId: number, field: 'target' | 'actual', value: string) => {
    setEdit(e => ({ ...e, [`${teamId}_${memberId}_${field}`]: String(value) }));
  };
  const handleSave = async (teamId: number, memberId: number) => {
    // Save to backend
    setLoading(true);
    setError('');
    try {
      const token = String(localStorage.getItem('token') ?? '');
      const target = edit[`${teamId}_${memberId}_target`];
      const actual = edit[`${teamId}_${memberId}_actual`];
      await fetch(`/api/team/team-revenue/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ revenue_target: target, revenue_actual: actual }),
      });
      setEdit(e => {
        const newEdit = { ...e };
        delete newEdit[`${teamId}_${memberId}_target`];
        delete newEdit[`${teamId}_${memberId}_actual`];
        return newEdit;
      });
      // Optionally, reload data
      // ...
      setLoading(false);
    } catch (err) {
      setError('Failed to save changes');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team & Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.map(team => (
            <div key={team.id} className="mb-8 border rounded p-4">
              <div className="font-bold text-lg mb-2">{team.name} <span className="text-sm font-normal">(Leader: {team.leader})</span></div>
              <table className="min-w-full text-sm border mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Member</th>
                    <th className="p-2 border">Target Revenue</th>
                    <th className="p-2 border">Actual Revenue</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.members.map(m => (
                    <tr key={m.id} className="border-b">
                      <td className="p-2 border">{m.name}</td>
                      <td className="p-2 border">
                        <Input
                          type="number"
                          value={String(edit[`${team.id}_${m.id}_target`] ?? m.target ?? '')}
                          onChange={e => handleEdit(team.id, m.id, 'target', e.target.value || '')}
                        />
                      </td>
                      <td className="p-2 border">
                        <Input
                          type="number"
                          value={String(edit[`${team.id}_${m.id}_actual`] ?? m.actual ?? '')}
                          onChange={e => handleEdit(team.id, m.id, 'actual', e.target.value || '')}
                        />
                      </td>
                      <td className="p-2 border">
                        <Button size="sm" onClick={() => handleSave(team.id, m.id)}>Save</Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="p-2 border">Team Total</td>
                    <td className="p-2 border">{team.members.reduce((a, m) => a + (Number(edit[`${team.id}_${m.id}_target`] ?? m.target) || 0), 0)}</td>
                    <td className="p-2 border">{team.members.reduce((a, m) => a + (Number(edit[`${team.id}_${m.id}_actual`] ?? m.actual) || 0), 0)}</td>
                    <td className="p-2 border"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 