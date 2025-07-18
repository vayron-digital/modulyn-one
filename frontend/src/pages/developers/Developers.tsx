import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';

interface Developer {
  developer_id: string;
  name: string;
  logo_url?: string;
}

const Developers: React.FC = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editDev, setEditDev] = useState<Developer | null>(null);
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      const { data, error } = await supabase.from('developers').select('developer_id, name, logo_url').order('name');
      if (!error) setDevelopers((data || []).filter(d => d.developer_id));
      setLoading(false);
    };
    fetchDevelopers();
  }, []);

  const filtered = developers.filter(dev => dev.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddDeveloper = async () => {
    if (!newDevName.trim()) return;
    setAdding(true);
    const { data: newDev, error } = await supabase.from('developers').insert({ name: newDevName.trim() }).select('developer_id, name, logo_url').single();
    setAdding(false);
    if (!error && newDev && newDev.developer_id) {
      setShowAddModal(false);
      setNewDevName('');
      // Refresh list
      const { data } = await supabase.from('developers').select('developer_id, name, logo_url').order('name');
      setDevelopers((data || []).filter(d => d.developer_id));
    }
  };

  const handleEditDeveloper = async () => {
    if (!editDev || !editName.trim()) return;
    setEditing(true);
    const { error } = await supabase.from('developers').update({ name: editName.trim() }).eq('developer_id', editDev.developer_id);
    setEditing(false);
    if (!error) {
      setEditDev(null);
      setEditName('');
      // Refresh list
      const { data } = await supabase.from('developers').select('developer_id, name, logo_url').order('name');
      setDevelopers((data || []).filter(d => d.developer_id));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading developers...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center justify-between">
        Developers
        {user?.is_admin && (
          <Button onClick={() => setShowAddModal(true)} className="ml-4">+ Add Developer</Button>
        )}
      </h1>
      {/* Add Developer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add Developer</h2>
            <input
              type="text"
              placeholder="Developer name"
              value={newDevName}
              onChange={e => setNewDevName(e.target.value)}
              className="mb-4 px-4 py-2 border rounded w-full"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={adding}>Cancel</Button>
              <Button onClick={handleAddDeveloper} disabled={adding || !newDevName.trim()}>
                {adding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {editDev && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Developer</h2>
            <input
              type="text"
              placeholder="Developer name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="mb-4 px-4 py-2 border rounded w-full"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDev(null)} disabled={editing}>Cancel</Button>
              <Button onClick={handleEditDeveloper} disabled={editing || !editName.trim()}>
                {editing ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <input
        type="text"
        placeholder="Search developers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 border rounded w-full max-w-md"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
          <div key="no-devs" className="col-span-full text-gray-500">No developers found.</div>
        ) : (
          filtered.map(dev => (
            <Card
              key={dev.developer_id || dev.name}
              className="p-6 cursor-pointer hover:shadow-lg transition relative"
              onClick={() => {
                console.log('Navigating to', dev.developer_id, `/developers/${dev.developer_id}`);
                dev.developer_id && navigate(`/developers/${dev.developer_id}`);
              }}
            >
              <div className="font-semibold text-lg">{dev.name}</div>
              {user?.is_admin && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={e => { e.stopPropagation(); setEditDev(dev); setEditName(dev.name); }}
                >
                  Edit
                </Button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Developers; 