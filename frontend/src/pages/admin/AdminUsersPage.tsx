import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { supabase } from '../../lib/supabase';

const ROLES = ['admin', 'agent', 'team_leader', 'jr_team_leader', 'other'];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    async function fetchUsers() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      fetch('/api/team/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(res => {
          setUsers(res.data?.users || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    fetchUsers();
  }, [user]);

  if (!user || !(user.is_admin || user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'master')) {
    return <div className="p-8 text-center text-red-500">Access denied. Admins only.</div>;
  }
  if (loading) return <FullScreenLoader />;

  const filtered = users.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (search && !(`${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All CRM Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                {ROLES.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="w-64" placeholder="Search by name or email" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Date of Joining</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 border">{u.first_name} {u.last_name}</td>
                    <td className="p-2 border capitalize">{u.role}</td>
                    <td className="p-2 border">{u.phone}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border"><Badge variant={u.status === 'active' ? 'default' : 'secondary'}>{u.status}</Badge></td>
                    <td className="p-2 border">{u.date_of_joining ? new Date(u.date_of_joining).toLocaleDateString() : '-'}</td>
                    <td className="p-2 border">
                      <Button size="sm" variant="outline" className="mr-2">View</Button>
                      <Button size="sm" variant="outline">Edit</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center p-4 text-gray-400">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 