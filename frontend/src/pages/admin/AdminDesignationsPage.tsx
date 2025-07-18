import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../../components/ui/table';

interface Designation {
  id: string;
  name: string;
  description: string;
}

export default function AdminDesignationsPage() {
  const { user } = useAuth();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<{ [id: string]: Partial<Designation> }>({});
  const [newDesignation, setNewDesignation] = useState<Partial<Designation>>({ name: '', description: '' });

  useEffect(() => {
    if (!user) return;
    const token = String(localStorage.getItem('token') ?? '');
    setLoading(true);
    setError('');
    fetch('/api/team/designations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => {
        setDesignations(res.data?.designations || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load designations');
        setLoading(false);
      });
  }, [user]);

  if (!user || !(user.is_admin || user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'master')) {
    return <div className="p-8 text-center text-red-500">Access denied. Admins only.</div>;
  }
  if (loading) return <FullScreenLoader />;

  const handleEditChange = (id: string, field: keyof Designation, value: string) => {
    setEdit(e => ({ ...e, [id]: { ...e[id], [field]: value } }));
  };
  const handleEditSave = async (id: string) => {
    const token = String(localStorage.getItem('token') ?? '');
    const data = edit[id];
    setLoading(true);
    setError('');
    await fetch(`/api/team/designations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    setEdit(e => { const n = { ...e }; delete n[id]; return n; });
    // Reload
    fetch('/api/team/designations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => { setDesignations(res.data?.designations || []); setLoading(false); })
      .catch(() => { setError('Failed to reload'); setLoading(false); });
  };
  const handleDelete = async (id: string) => {
    const token = String(localStorage.getItem('token') ?? '');
    setLoading(true);
    setError('');
    await fetch(`/api/team/designations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    // Reload
    fetch('/api/team/designations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => { setDesignations(res.data?.designations || []); setLoading(false); })
      .catch(() => { setError('Failed to reload'); setLoading(false); });
  };
  const handleAdd = async () => {
    const token = String(localStorage.getItem('token') ?? '');
    setLoading(true);
    setError('');
    await fetch('/api/team/designations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newDesignation),
    });
    setNewDesignation({ name: '', description: '' });
    // Reload
    fetch('/api/team/designations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => { setDesignations(res.data?.designations || []); setLoading(false); })
      .catch(() => { setError('Failed to reload'); setLoading(false); });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Manage Designations</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designations.map(d => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Input value={edit[d.id]?.name ?? d.name} onChange={e => handleEditChange(d.id, 'name', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input value={edit[d.id]?.description ?? d.description} onChange={e => handleEditChange(d.id, 'description', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleEditSave(d.id)}>Save</Button>
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(d.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <Input value={newDesignation.name || ''} onChange={e => setNewDesignation(nd => ({ ...nd, name: e.target.value }))} placeholder="New designation name" />
                </TableCell>
                <TableCell>
                  <Input value={newDesignation.description || ''} onChange={e => setNewDesignation(nd => ({ ...nd, description: e.target.value }))} placeholder="Description" />
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={handleAdd}>Add</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 