import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import FullScreenLoader from '../../components/common/FullScreenLoader';

interface Team {
  id: string;
  name: string;
}
interface Revenue {
  id: string;
  team_id: string;
  month: string;
  revenue_target: number;
  revenue_actual: number;
}

export default function AdminTeamRevenuePage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<{ [id: string]: Partial<Revenue> }>({});

  useEffect(() => {
    if (!user) return;
    const token = String(localStorage.getItem('token') ?? '');
    setLoading(true);
    setError('');
    Promise.all([
      fetch('/api/team/teams', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/team/team-revenue', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([teamsRes, revenueRes]) => {
      setTeams(teamsRes.data?.teams || []);
      setRevenue(revenueRes.data?.teamRevenue || []);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load data');
      setLoading(false);
    });
  }, [user]);

  if (!user || !(user.is_admin || user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'master')) {
    return <div className="p-8 text-center text-red-500">Access denied. Admins only.</div>;
  }
  if (loading) return <FullScreenLoader />;

  const handleEditChange = (id: string, field: keyof Revenue, value: string) => {
    setEdit(e => ({ ...e, [id]: { ...e[id], [field]: value } }));
  };
  const handleEditSave = async (id: string) => {
    const token = String(localStorage.getItem('token') ?? '');
    const data = edit[id];
    setLoading(true);
    setError('');
    await fetch(`/api/team/team-revenue/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    setEdit(e => { const n = { ...e }; delete n[id]; return n; });
    // Reload
    fetch('/api/team/team-revenue', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => { setRevenue(res.data?.teamRevenue || []); setLoading(false); })
      .catch(() => { setError('Failed to reload'); setLoading(false); });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Team Revenue Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <table className="min-w-full text-sm border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Team</th>
                <th className="p-2 border">Month</th>
                <th className="p-2 border">Target</th>
                <th className="p-2 border">Actual</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-2 border">{teams.find(t => t.id === r.team_id)?.name || '-'}</td>
                  <td className="p-2 border">{r.month}</td>
                  <td className="p-2 border">
                    <Input type="number" value={edit[r.id]?.revenue_target ?? r.revenue_target} onChange={e => handleEditChange(r.id, 'revenue_target', e.target.value)} />
                  </td>
                  <td className="p-2 border">
                    <Input type="number" value={edit[r.id]?.revenue_actual ?? r.revenue_actual} onChange={e => handleEditChange(r.id, 'revenue_actual', e.target.value)} />
                  </td>
                  <td className="p-2 border">
                    <Button size="sm" onClick={() => handleEditSave(r.id)}>Save</Button>
                  </td>
                </tr>
              ))}
              {revenue.length === 0 && <tr><td colSpan={5} className="text-center p-4 text-gray-400">No revenue records found.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
} 