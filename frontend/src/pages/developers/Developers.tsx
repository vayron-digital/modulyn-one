import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/useToast';

interface Developer {
  developer_id: string;
  name: string;
  logo_url?: string;
}

const Developers: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editDev, setEditDev] = useState<Developer | null>(null);
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.from('developers').select('developer_id, name, logo_url').order('name');
        
        if (error) {
          console.error('Error fetching developers:', error);
          throw new Error(error.message || 'Failed to fetch developers');
        }
        
        setDevelopers((data || []).filter(d => d.developer_id));
      } catch (err: any) {
        console.error('Error in fetchDevelopers:', err);
        setError(err.message || 'Failed to load developers');
        toast({
          title: 'Error',
          description: err.message || 'Failed to load developers',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDevelopers();
  }, []);

  const filtered = developers.filter(dev => dev.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddDeveloper = async () => {
    if (!newDevName.trim()) return;
    
    try {
      setAdding(true);
      setError(null);
      
      const { data: newDev, error } = await supabase
        .from('developers')
        .insert({ name: newDevName.trim() })
        .select('developer_id, name, logo_url')
        .single();
      
      if (error) {
        console.error('Error adding developer:', error);
        throw new Error(error.message || 'Failed to add developer');
      }
      
      if (newDev && newDev.developer_id) {
        setShowAddModal(false);
        setNewDevName('');
        
        // Refresh list
        const { data, error: refreshError } = await supabase
          .from('developers')
          .select('developer_id, name, logo_url')
          .order('name');
        
        if (refreshError) {
          console.error('Error refreshing developers:', refreshError);
          throw new Error('Developer added but failed to refresh list');
        }
        
        setDevelopers((data || []).filter(d => d.developer_id));
        toast({
          title: 'Success',
          description: 'Developer added successfully',
        });
      }
    } catch (err: any) {
      console.error('Error in handleAddDeveloper:', err);
      setError(err.message || 'Failed to add developer');
      toast({
        title: 'Error',
        description: err.message || 'Failed to add developer',
        variant: 'destructive'
      });
    } finally {
      setAdding(false);
    }
  };

  const handleEditDeveloper = async () => {
    if (!editDev || !editName.trim()) return;
    
    try {
      setEditing(true);
      setError(null);
      
      const { error } = await supabase
        .from('developers')
        .update({ name: editName.trim() })
        .eq('developer_id', editDev.developer_id);
      
      if (error) {
        console.error('Error updating developer:', error);
        throw new Error(error.message || 'Failed to update developer');
      }
      
      setEditDev(null);
      setEditName('');
      
      // Refresh list
      const { data, error: refreshError } = await supabase
        .from('developers')
        .select('developer_id, name, logo_url')
        .order('name');
      
      if (refreshError) {
        console.error('Error refreshing developers:', refreshError);
        throw new Error('Developer updated but failed to refresh list');
      }
      
      setDevelopers((data || []).filter(d => d.developer_id));
      toast({
        title: 'Success',
        description: 'Developer updated successfully',
      });
    } catch (err: any) {
      console.error('Error in handleEditDeveloper:', err);
      setError(err.message || 'Failed to update developer');
      toast({
        title: 'Error',
        description: err.message || 'Failed to update developer',
        variant: 'destructive'
      });
    } finally {
      setEditing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading developers...</div>;
  
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-2 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        {user?.is_admin && (
          <Button onClick={() => setShowAddModal(true)} className="ml-4">+ Add Developer</Button>
        )}
      </div>
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