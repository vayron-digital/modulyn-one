import React, { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { FilterBar } from '../../components/ui/FilterBar';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/cold-calls';

const FILTERS = [
  { key: 'agent_id', label: 'Agent', type: 'text' as const, placeholder: 'Agent' },
  { key: 'source', label: 'Source', type: 'text' as const, placeholder: 'Source' },
  { key: 'status', label: 'Status', type: 'text' as const, placeholder: 'Status' },
  { key: 'priority', label: 'Priority', type: 'text' as const, placeholder: 'Priority' },
  { key: 'date', label: 'Date', type: 'date' as const, placeholder: 'Date' },
];

const ColdCalls: React.FC = () => {
  const { user } = useAuth();
  console.log('Current user:', user); // Debug: log user object
  const isAdmin = user && typeof user.role === 'string' && user.role.toLowerCase().includes('admin');
  const [coldCalls, setColdCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignAgentId, setAssignAgentId] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    agent_id: '',
    source: '',
    status: 'pending',
    priority: '',
    comments: '',
    date: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<any | null>(null);
  const [convertLoading, setConvertLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [showImportGuide, setShowImportGuide] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);

  const fetchColdCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      // Add filter query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const res = await fetch(`${API_URL}${params.toString() ? '?' + params.toString() : ''}`);
      if (!res.ok) throw new Error('Failed to fetch cold calls');
      const json = await res.json();
      setColdCalls(json.data.coldCalls || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColdCalls();
    // eslint-disable-next-line
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      if (!error) setProfiles(data || []);
    };
    fetchProfiles();
  }, []);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedRows(ids);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows }),
      });
      if (!res.ok) throw new Error('Failed to delete cold calls');
      setSelectedRows([]);
      await fetchColdCalls();
    } catch (err) {
      alert('Bulk delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    setActionLoading(true);
    try {
      let url = `${API_URL}/export/csv`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to export CSV');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'cold_calls_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Export failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleAssignAgent = async () => {
    if (!assignAgentId || selectedRows.length === 0) return;
    setAssignLoading(true);
    try {
      const res = await fetch(`${API_URL}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows, agentId: assignAgentId }),
      });
      if (!res.ok) throw new Error('Failed to assign agent');
      setAssignModalOpen(false);
      setAssignAgentId('');
      setSelectedRows([]);
      await fetchColdCalls();
    } catch (err) {
      alert('Assign agent failed');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddColdCall = async () => {
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error('Failed to add cold call');
      setAddModalOpen(false);
      setAddForm({ name: '', email: '', phone: '', agent_id: '', source: '', status: 'pending', priority: '', comments: '', date: '' });
      await fetchColdCalls();
    } catch (err: any) {
      setAddError(err.message || 'Add failed');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRowClick = (item: any) => {
    setDetailsData(item);
    setDetailsModalOpen(true);
  };

  const handleConvertToLead = async () => {
    if (!detailsData) return;
    setConvertLoading(true);
    try {
      const res = await fetch(`${API_URL}/${detailsData.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convertedBy: 'admin' }), // TODO: use real user id
      });
      if (!res.ok) throw new Error('Failed to convert');
      setDetailsModalOpen(false);
      setDetailsData(null);
      await fetchColdCalls();
    } catch (err) {
      alert('Convert failed');
    } finally {
      setConvertLoading(false);
    }
  };

  const handleSampleDownload = () => {
    // Implementation of handleSampleDownload
  };

  const handleImportCSV = async () => {
    setImportLoading(true);
    setImportError(null);
    try {
      if (!importFile) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('file', importFile, importFile.name);
      const res = await fetch(`${API_URL}/import/csv`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to import CSV');
      setImportModalOpen(false);
      setImportFile(null);
      await fetchColdCalls();
    } catch (err: any) {
      setImportError(err.message || 'Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportClick = () => {
    setShowImportGuide(true);
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    ...(isAdmin ? [
      {
        key: 'agent',
        header: 'Agent',
        render: (item: any) => (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={item.agent_id || ''}
            onClick={e => e.stopPropagation()}
            onChange={async (e) => {
              const newAgentId = e.target.value;
              await fetch(`${API_URL}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [item.id], agentId: newAgentId }),
              });
              fetchColdCalls();
            }}
          >
            <option value="">Unassigned</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.full_name}</option>
            ))}
          </select>
        ),
      },
    ] : []),
    { key: 'source', header: 'Source' },
    { key: 'status', header: 'Status', render: (item: any) => <Badge>{item.status}</Badge> },
    { key: 'priority', header: 'Priority' },
    { key: 'comments', header: 'Comments' },
    { key: 'date', header: 'Date' },
  ];

  return (
    <div className="p-8 min-h-screen flex justify-center items-start">
      {/* Artificial Loading Screen with Guide */}
      {showImportGuide && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
          }}>
            <div style={{
              background: '#fff',
              color: '#18181b',
              width: '90vw',
              maxWidth: 1100,
              minHeight: 340,
              maxHeight: '90vh',
              borderRadius: 18,
              boxShadow: '0 8px 32px 0 rgba(99,102,241,0.10)',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              position: 'relative',
              border: '1.5px solid #e5e7eb',
              overflow: 'hidden',
            }}>
              {/* Left: Illustration, Logos, Spinner */}
              <div style={{ flex: '0 0 320px', background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, borderRight: '1.5px solid #e5e7eb' }}>
                {/* SVG Illustration */}
                <div style={{ marginBottom: 24 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="20" width="60" height="40" rx="8" fill="#6366f1"/>
                    <rect x="18" y="28" width="44" height="24" rx="4" fill="#fff"/>
                    <circle cx="24" cy="40" r="4" fill="#6366f1"/>
                    <rect x="32" y="38" width="20" height="4" rx="2" fill="#a5b4fc"/>
                    <rect x="32" y="46" width="16" height="4" rx="2" fill="#a5b4fc"/>
                    <circle cx="56" cy="40" r="4" fill="#6366f1"/>
                  </svg>
                </div>
                {/* Spinner */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ width: 32, height: 32, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      border: '3px solid #a5b4fc',
                      borderTop: '3px solid #6366f1',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                  </div>
                </div>
                {/* Logos */}
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 0 }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/512px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png" alt="Excel" style={{ height: 22, width: 22, objectFit: 'contain', opacity: 0.7 }} />
                  <img src="https://mailmeteor.com/logos/assets/PNG/Google_Sheets_Logo_512px.png" alt="Google Sheets" style={{ height: 22, width: 22, objectFit: 'contain', opacity: 0.7 }} />
                  <img src="https://cdn.worldvectorlogo.com/logos/numbers-ios.svg" alt="Apple Numbers" style={{ height: 22, width: 22, objectFit: 'contain', borderRadius: 6, opacity: 0.7 }} />
                </div>
              </div>
              {/* Right: Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, height: '100%', overflow: 'hidden' }}>
                <h2 className="text-2xl font-bold mb-2" style={{ textAlign: 'center', marginBottom: 6 }}>You're almost there! Let's prep your CSV.</h2>
                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 15, marginBottom: 18 }}>We play nice with Excel, Google Sheets, and Numbers. Here's your quick import checklist:</div>
                <div style={{ width: '100%', height: 1, background: '#ececec', margin: '0 0 18px 0' }} />
                <ul style={{ maxWidth: 440, margin: '0 auto', fontSize: 15, color: '#52525b', marginBottom: 18, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Name</li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Email</li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Phone</li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Agent ID</li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Source</li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Status</li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Priority</li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Comments</li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}><span style={{ color: '#22c55e', marginRight: 10, fontSize: 20 }}>✔️</span> Date</li>
                </ul>
                <div className="mb-2 text-base font-semibold" style={{ textAlign: 'center', fontSize: 15, marginBottom: 6 }}>Sample row:</div>
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs font-mono border" style={{ maxWidth: 420, margin: '0 auto', fontSize: 13, color: '#18181b', marginBottom: 18 }}>John Doe, john@example.com, 1234567890, 1, Google, pending, High, "Interested in 2BHK", 2024-06-01</div>
                <div className="mb-2 text-base font-semibold" style={{ textAlign: 'center', fontSize: 15, marginBottom: 6 }}>Pro tips:</div>
                <ul style={{ maxWidth: 440, margin: '0 auto', fontSize: 14, color: '#6366f1', marginBottom: 24, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center' }}>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 180 }}><span style={{ marginRight: 10, fontSize: 18 }}>📅</span> Date must be <b>YYYY-MM-DD</b></li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 180 }}><span style={{ marginRight: 10, fontSize: 18 }}>⚡</span> Status: <b>pending</b>, <b>converted</b>, or <b>invalid</b></li>
                  <li style={{ display: 'flex', alignItems: 'center', minWidth: 180 }}><span style={{ marginRight: 10, fontSize: 18 }}>🚫</span> No empty rows!</li>
                </ul>
                <div className="mt-6 text-center" style={{ width: '100%' }}>
                  <button
                    className="bg-indigo-600 text-white px-8 py-3 rounded-full text-base font-semibold hover:bg-indigo-700 transition"
                    style={{ minWidth: 180, boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)' }}
                    onClick={() => { setShowImportGuide(false); setImportModalOpen(true); }}
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Card className="w-full max-w-7xl bg-white dark:bg-black border-black dark:border-white text-black dark:text-white shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-3xl font-bold">Cold Calls</CardTitle>
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <>
                <Button variant="outline" disabled={actionLoading} onClick={handleImportClick}>Import CSV</Button>
                <Button variant="outline" disabled={actionLoading} onClick={handleExport}>Export</Button>
                <DialogPrimitive.Root open={assignModalOpen} onOpenChange={setAssignModalOpen}>
                  <DialogPrimitive.Trigger asChild>
                    <Button variant="outline" disabled={selectedRows.length === 0 || actionLoading}>Assign Agent</Button>
                  </DialogPrimitive.Trigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Agent</DialogTitle>
                      <DialogDescription>
                        Assign the selected cold calls to an agent.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="my-4">
                      <Select value={assignAgentId} onValueChange={setAssignAgentId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>{profile.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAssignModalOpen(false)} disabled={assignLoading}>Cancel</Button>
                      <Button variant="default" onClick={handleAssignAgent} disabled={!assignAgentId || assignLoading}>
                        {assignLoading ? 'Assigning...' : 'Assign'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </DialogPrimitive.Root>
                <Button variant="destructive" disabled={selectedRows.length === 0 || actionLoading} onClick={handleBulkDelete}>Bulk Delete</Button>
              </>
            )}
            <DialogPrimitive.Root open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogPrimitive.Trigger asChild>
                <Button variant="default" disabled={actionLoading}>Add New Cold Call</Button>
              </DialogPrimitive.Trigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Cold Call</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new cold call lead.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddColdCall(); }}>
                  <input className="w-full p-2 border rounded" name="name" placeholder="Name" value={addForm.name} onChange={handleAddChange} required />
                  <input className="w-full p-2 border rounded" name="email" placeholder="Email" value={addForm.email} onChange={handleAddChange} />
                  <input className="w-full p-2 border rounded" name="phone" placeholder="Phone" value={addForm.phone} onChange={handleAddChange} required />
                  <input className="w-full p-2 border rounded" name="agent_id" placeholder="Agent ID" value={addForm.agent_id} onChange={handleAddChange} />
                  <input className="w-full p-2 border rounded" name="source" placeholder="Source" value={addForm.source} onChange={handleAddChange} />
                  <select className="w-full p-2 border rounded" name="status" value={addForm.status} onChange={handleAddChange}>
                    <option value="pending">Pending</option>
                    <option value="converted">Converted</option>
                    <option value="invalid">Invalid</option>
                  </select>
                  <input className="w-full p-2 border rounded" name="priority" placeholder="Priority" value={addForm.priority} onChange={handleAddChange} />
                  <textarea className="w-full p-2 border rounded" name="comments" placeholder="Comments" value={addForm.comments} onChange={handleAddChange} />
                  <input className="w-full p-2 border rounded" name="date" type="date" placeholder="Date" value={addForm.date} onChange={handleAddChange} />
                  {addError && <div className="text-red-500 text-sm">{addError}</div>}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddModalOpen(false)} disabled={addLoading}>Cancel</Button>
                    <Button variant="default" type="submit" disabled={addLoading}>{addLoading ? 'Adding...' : 'Add'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </DialogPrimitive.Root>
          </div>
          {/* Render Import CSV modal for admins only, but outside the button group so it always appears if open */}
          {isAdmin && importModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
              }}>
                <div style={{
                  background: '#fff',
                  color: '#18181b',
                  width: '90vw',
                  maxWidth: 1100,
                  minHeight: 340,
                  maxHeight: '90vh',
                  borderRadius: 18,
                  boxShadow: '0 8px 32px 0 rgba(99,102,241,0.10)',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  position: 'relative',
                  border: '1.5px solid #e5e7eb',
                  overflow: 'hidden',
                }}>
                  {/* Left: Illustration, Logos, Spinner */}
                  <div style={{ flex: '0 0 320px', background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, borderRight: '1.5px solid #e5e7eb' }}>
                    {/* SVG Illustration */}
                    <div style={{ marginBottom: 24 }}>
                      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="20" width="60" height="40" rx="8" fill="#6366f1"/>
                        <rect x="18" y="28" width="44" height="24" rx="4" fill="#fff"/>
                        <circle cx="24" cy="40" r="4" fill="#6366f1"/>
                        <rect x="32" y="38" width="20" height="4" rx="2" fill="#a5b4fc"/>
                        <rect x="32" y="46" width="16" height="4" rx="2" fill="#a5b4fc"/>
                        <circle cx="56" cy="40" r="4" fill="#6366f1"/>
                      </svg>
                    </div>
                    {/* Spinner (shows only when loading) */}
                    {importLoading && (
                      <div style={{ marginBottom: 18 }}>
                        <div style={{ width: 32, height: 32, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{
                            width: 24,
                            height: 24,
                            border: '3px solid #a5b4fc',
                            borderTop: '3px solid #6366f1',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }} />
                        </div>
                      </div>
                    )}
                    {/* Logos */}
                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 0 }}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/512px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png" alt="Excel" style={{ height: 22, width: 22, objectFit: 'contain', opacity: 0.7 }} />
                      <img src="https://mailmeteor.com/logos/assets/PNG/Google_Sheets_Logo_512px.png" alt="Google Sheets" style={{ height: 22, width: 22, objectFit: 'contain', opacity: 0.7 }} />
                      <img src="https://cdn.worldvectorlogo.com/logos/numbers-ios.svg" alt="Apple Numbers" style={{ height: 22, width: 22, objectFit: 'contain', borderRadius: 6, opacity: 0.7 }} />
                    </div>
                  </div>
                  {/* Right: Import Form */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 36, height: '100%', overflow: 'hidden' }}>
                    <h2 className="text-2xl font-bold mb-2" style={{ textAlign: 'center', marginBottom: 6 }}>Import Cold Calls (CSV)</h2>
                    <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 15, marginBottom: 18 }}>Upload a CSV file exported from Excel, Google Sheets, or Numbers.</div>
                    <div style={{ width: '100%', height: 1, background: '#ececec', margin: '0 0 18px 0' }} />
                    <input
                      type="file"
                      accept=".csv"
                      onChange={e => setImportFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-black mb-2"
                      style={{ marginBottom: 18, maxWidth: 320 }}
                    />
                    {importError && <div className="text-red-500 mt-2 text-sm" style={{ marginBottom: 12 }}>{importError}</div>}
                    <div className="flex gap-2 mt-4 justify-center" style={{ width: '100%' }}>
                      <button
                        className="bg-gray-200 text-black px-6 py-2 rounded font-semibold hover:bg-gray-300 transition"
                        style={{ minWidth: 120 }}
                        onClick={() => setImportModalOpen(false)}
                        disabled={importLoading}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-indigo-600 text-white px-8 py-2 rounded-full font-semibold hover:bg-indigo-700 transition"
                        style={{ minWidth: 140, boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)' }}
                        onClick={handleImportCSV}
                        disabled={!importFile || importLoading}
                      >
                        {importLoading ? 'Importing...' : 'Import'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <FilterBar
            filters={FILTERS}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          {selectedRows.length > 0 && (
            <div className="mb-2 text-sm font-semibold text-black dark:text-white">{selectedRows.length} selected</div>
          )}
          {loading ? (
            <div className="text-center py-10 text-lg">Loading...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <DataTable
              columns={columns}
              data={coldCalls.map((item) => ({ ...item, _rowKey: item.id }))}
              selectedRows={selectedRows}
              onSelectionChange={handleSelectionChange}
              onRowClick={handleRowClick}
            />
          )}
          <DialogPrimitive.Root open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cold Call Details</DialogTitle>
              </DialogHeader>
              {detailsData && (
                <div className="space-y-2">
                  <div><b>Name:</b> {detailsData.name}</div>
                  <div><b>Email:</b> {detailsData.email}</div>
                  <div><b>Phone:</b> {detailsData.phone}</div>
                  <div><b>Agent:</b> {detailsData.agent_id}</div>
                  <div><b>Source:</b> {detailsData.source}</div>
                  <div><b>Status:</b> <Badge>{detailsData.status}</Badge></div>
                  <div><b>Priority:</b> {detailsData.priority}</div>
                  <div><b>Comments:</b> {detailsData.comments}</div>
                  <div><b>Date:</b> {detailsData.date}</div>
                  {detailsData.is_converted && (
                    <div className="text-green-600 font-bold">Converted</div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)} disabled={convertLoading}>Close</Button>
                {!detailsData?.is_converted && (
                  <Button variant="default" onClick={handleConvertToLead} disabled={convertLoading}>
                    {convertLoading ? 'Converting...' : 'Convert to Lead'}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </DialogPrimitive.Root>
        </CardContent>
        {actionLoading && <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="text-white text-xl">Processing...</div></div>}
      </Card>
    </div>
  );
};

export default ColdCalls; 