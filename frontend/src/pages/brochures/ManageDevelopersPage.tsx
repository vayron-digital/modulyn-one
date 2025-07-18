import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface Developer {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface ManageDevelopersPageProps {
  onDataChange: () => void;
}

export default function ManageDevelopersPage({ onDataChange }: ManageDevelopersPageProps) {
  const [newDev, setNewDev] = useState('');
  const [renameDev, setRenameDev] = useState('');
  const [renameDevNew, setRenameDevNew] = useState('');
  const [delDev, setDelDev] = useState<string>('');
  const [developers, setDevelopers] = useState<Developer[]>([]);

  // New state for logo management
  const [selectedDevForLogo, setSelectedDevForLogo] = useState<string>('');
  const [logoFileForUpdate, setLogoFileForUpdate] = useState<File | null>(null);
  const [invertLogo, setInvertLogo] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevelopers = async () => {
      const { data: devData, error: devError } = await supabase.from('developers').select('name, new_uuid_id, logo_url');
      if (devError) {
        console.error('Error fetching developers:', devError);
        addToast({ title: 'Error', description: 'Error fetching developers', type: 'error' });
        return;
      }
      const mappedDevs = devData.map((dev: { name: string; new_uuid_id: string; logo_url: string | null }) => ({
        id: dev.new_uuid_id,
        name: dev.name,
        logo_url: dev.logo_url,
      }));
      setDevelopers(mappedDevs);
      console.log('Fetched developers in ManageDevelopersPage:', mappedDevs);
    };
    fetchDevelopers();
  }, []);

  useEffect(() => {
    if (logoFileForUpdate) {
      try {
        const url = URL.createObjectURL(logoFileForUpdate);
        setLogoPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        setLogoPreviewUrl(null);
        addToast({ title: 'Error', description: 'Could not preview logo file.', type: 'error' });
      }
    } else {
      setLogoPreviewUrl(null);
    }
  }, [logoFileForUpdate]);

  const sanitizeFileName = (name: string) => {
    return name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  };

  const handleCreateDeveloper = async () => {
    if (!newDev) {
      addToast({ title: 'Error', description: 'Please enter a developer name', type: 'error' });
      return;
    }
    const { error } = await supabase.from('developers').insert({ name: newDev });
    if (error) {
      console.error('Error creating developer:', error);
      addToast({ title: 'Error', description: 'Error creating developer', type: 'error' });
      return;
    }
    addToast({ title: 'Success', description: 'Developer created successfully!', type: 'success' });
    setNewDev('');
    const { data: devData, error: devError } = await supabase.from('developers').select('name, new_uuid_id, logo_url');
    if (devError) {
      console.error('Error fetching developers after create:', devError);
      addToast({ title: 'Error', description: 'Error fetching developers after create', type: 'error' });
      return;
    }
    const mappedDevs = devData.map((dev: { name: string; new_uuid_id: string; logo_url: string | null }) => ({
      id: dev.new_uuid_id,
      name: dev.name,
      logo_url: dev.logo_url,
    }));
    setDevelopers(mappedDevs);
    navigate('/brochures');
  };

  const handleRenameDeveloper = async () => {
    if (!renameDev || !renameDevNew) {
      addToast({ title: 'Error', description: 'Please select a developer and enter a new name', type: 'error' });
      return;
    }

    const updates: { name: string } = { name: renameDevNew };

    const { error } = await supabase.from('developers').update(updates).eq('new_uuid_id', renameDev);
    if (error) {
      console.error('Error renaming developer:', error);
      addToast({ title: 'Error', description: 'Error renaming developer', type: 'error' });
      return;
    }
    addToast({ title: 'Success', description: 'Developer renamed successfully!', type: 'success' });
    setRenameDev('');
    setRenameDevNew('');
    const { data: devData, error: devError } = await supabase.from('developers').select('name, new_uuid_id, logo_url');
    if (devError) {
      console.error('Error fetching developers after rename:', devError);
      addToast({ title: 'Error', description: 'Error fetching developers after rename', type: 'error' });
      return;
    }
    const mappedDevs = devData.map((dev: { name: string; new_uuid_id: string; logo_url: string | null }) => ({
      id: dev.new_uuid_id,
      name: dev.name,
      logo_url: dev.logo_url,
    }));
    setDevelopers(mappedDevs);
    navigate('/brochures');
  };

  const handleUpdateLogo = async () => {
    if (!selectedDevForLogo || !logoFileForUpdate) {
      addToast({ title: 'Error', description: 'Please select a developer and a logo file.', type: 'error' });
      return;
    }
    // Validate file type and size
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(logoFileForUpdate.type)) {
      addToast({ title: 'Error', description: 'Logo must be a PNG or JPG file.', type: 'error' });
      return;
    }
    if (logoFileForUpdate.size > 5 * 1024 * 1024) { // 5MB limit
      addToast({ title: 'Error', description: 'Logo file is too large (max 5MB).', type: 'error' });
      return;
    }

    const developerToUpdate = developers.find(dev => dev.id === selectedDevForLogo);
    if (!developerToUpdate) {
      addToast({ title: 'Error', description: 'Developer not found.', type: 'error' });
      return;
    }

    const sanitizedDeveloperName = sanitizeFileName(developerToUpdate.name);
    const sanitizedLogoFileName = sanitizeFileName(logoFileForUpdate.name);
    const logoPath = `public/logos/${sanitizedDeveloperName}/${sanitizedLogoFileName}`;

    const { error: logoUploadError } = await supabase.storage
      .from('brochures')
      .upload(logoPath, logoFileForUpdate, { upsert: true });

    if (logoUploadError) {
      console.error('Error uploading logo file:', logoUploadError);
      addToast({ title: 'Error', description: `Error uploading logo: ${logoUploadError.message}`, type: 'error' });
      return;
    }

    const { data: logoPublicUrlData } = supabase.storage.from('brochures').getPublicUrl(logoPath);
    let logoPublicUrl: string | null = null;
    if (logoPublicUrlData && logoPublicUrlData.publicUrl) {
      logoPublicUrl = logoPublicUrlData.publicUrl;
    }

    console.log('Invert logo flag:', invertLogo);

    const { error: dbUpdateError } = await supabase.from('developers').update({ logo_url: logoPublicUrl }).eq('new_uuid_id', selectedDevForLogo);

    if (dbUpdateError) {
      console.error('Error updating developer logo URL in database:', dbUpdateError);
      addToast({ title: 'Error', description: 'Error updating logo URL.', type: 'error' });
      return;
    }

    addToast({ title: 'Success', description: 'Developer logo updated successfully!', type: 'success' });
    setSelectedDevForLogo('');
    setLogoFileForUpdate(null);
    const { data: devData, error: devError } = await supabase.from('developers').select('name, new_uuid_id, logo_url');
    if (devError) {
      console.error('Error fetching developers after logo update:', devError);
      addToast({ title: 'Error', description: 'Error fetching developers after logo update', type: 'error' });
      return;
    }
    const mappedDevs = devData.map((dev: { name: string; new_uuid_id: string; logo_url: string | null }) => ({
      id: dev.new_uuid_id,
      name: dev.name,
      logo_url: dev.logo_url,
    }));
    setDevelopers(mappedDevs);
    navigate('/brochures');
  };

  const handleDeleteDeveloper = async () => {
    if (!delDev) {
      addToast({ title: 'Error', description: 'Please select a developer to delete', type: 'error' });
      return;
    }

    const developerToDelete = developers.find(dev => dev.id === delDev);
    if (!developerToDelete) {
      addToast({ title: 'Error', description: 'Developer not found', type: 'error' });
      return;
    }

    const { data: brochuresToDelete, error: fetchBrochuresError } = await supabase
      .from('brochures')
      .select('file_url, thumbnail_url')
      .eq('developer_id', delDev);

    if (fetchBrochuresError) {
      console.error('Error fetching brochures for developer deletion:', fetchBrochuresError);
      addToast({ title: 'Error', description: 'Error fetching brochures for deletion', type: 'error' });
      return;
    }

    const filesToDelete: string[] = [];
    const supabaseBaseUrl = 'https://nwxqfzfweijwhgyzbaya.supabase.co';
    const storagePathPrefix = `${supabaseBaseUrl}/storage/v1/object/public/brochures/`;

    brochuresToDelete.forEach(brochure => {
      if (brochure.file_url) {
        filesToDelete.push(brochure.file_url.replace(storagePathPrefix, ''));
      }
      if (brochure.thumbnail_url) {
        filesToDelete.push(brochure.thumbnail_url.replace(storagePathPrefix, ''));
      }
    });

    if (developerToDelete.logo_url) {
        filesToDelete.push(developerToDelete.logo_url.replace(storagePathPrefix, ''));
    }

    if (filesToDelete.length > 0) {
      const { error: storageDeleteError } = await supabase.storage
        .from('brochures')
        .remove(filesToDelete);

      if (storageDeleteError) {
        console.error('Error deleting files from storage during developer deletion:', storageDeleteError);
        addToast({ title: 'Error', description: 'Error deleting associated files from storage', type: 'error' });
      }
    }

    const { error: dbBrochureError } = await supabase
      .from('brochures')
      .delete()
      .eq('developer_id', delDev);

    if (dbBrochureError) {
      console.error('Error deleting brochures from database during developer deletion:', dbBrochureError);
      addToast({ title: 'Error', description: 'Error deleting associated brochures from database', type: 'error' });
      return;
    }

    const { error: dbDeveloperError } = await supabase
      .from('developers')
      .delete()
      .eq('new_uuid_id', delDev);

    if (dbDeveloperError) {
      console.error('Error deleting developer from database:', dbDeveloperError);
      addToast({ title: 'Error', description: 'Error deleting developer from database', type: 'error' });
      return;
    }

    addToast({ title: 'Success', description: 'Developer and all associated brochures deleted successfully!', type: 'success' });
    setDelDev('');
    const { data: devData, error: devError } = await supabase.from('developers').select('name, new_uuid_id, logo_url');
    if (devError) {
      console.error('Error fetching developers after delete:', devError);
      addToast({ title: 'Error', description: 'Error fetching developers after delete', type: 'error' });
      return;
    }
    const mappedDevs = devData.map((dev: { name: string; new_uuid_id: string; logo_url: string | null }) => ({
      id: dev.new_uuid_id,
      name: dev.name,
      logo_url: dev.logo_url,
    }));
    setDevelopers(mappedDevs);
    navigate('/brochures');
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6 shadow-lg rounded-xl bg-card">
        <CardHeader className="pb-4 mb-4 border-b">
          <CardTitle className="text-2xl font-bold text-center">Manage Developers</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-8">
          <div className="space-y-6">
            {/* Create Developer */}
            <div className="space-y-2">
              <Label htmlFor="new-developer-name">
                Create New Developer
              </Label>
              <div className="flex gap-2">
                <Input
                  id="new-developer-name"
                  placeholder="New developer name"
                  value={newDev}
                  onChange={e => setNewDev(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleCreateDeveloper}>Create</Button>
              </div>
            </div>

            {/* Rename Developer */}
            <div className="space-y-2">
              <Label htmlFor="rename-developer-select">
                Rename Developer
              </Label>
              <Select value={renameDev} onValueChange={setRenameDev}>
                <SelectTrigger id="rename-developer-select" className="w-full">
                  <SelectValue placeholder="Select developer to rename" />
                </SelectTrigger>
                <SelectContent>
                  {developers.map(dev => (
                    <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="New name"
                value={renameDevNew}
                onChange={e => setRenameDevNew(e.target.value)}
                className="mt-2"
              />
              <Button onClick={handleRenameDeveloper} className="mt-4">Rename Developer</Button>
            </div>

            {/* Update Developer Logo */}
            <div className="space-y-2">
              <Label htmlFor="update-logo-developer-select">
                Update Developer Logo
              </Label>
              <Select value={selectedDevForLogo} onValueChange={setSelectedDevForLogo}>
                <SelectTrigger id="update-logo-developer-select" className="w-full">
                  <SelectValue placeholder="Select developer to update logo" />
                </SelectTrigger>
                <SelectContent>
                  {developers.map(dev => (
                    <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-2 mt-4">
                <Label htmlFor="logo-update-file-input">
                  New Logo File
                </Label>
                <Input
                  id="logo-update-file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={e => setLogoFileForUpdate(e.target.files ? e.target.files[0] : null)}
                />
                {/* Invert Logo Toggle */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="invert-logo-toggle"
                    type="checkbox"
                    checked={invertLogo}
                    onChange={e => setInvertLogo(e.target.checked)}
                  />
                  <Label htmlFor="invert-logo-toggle">Invert Logo Colors (Black ↔ White)</Label>
                </div>
                {/* Logo Preview */}
                {logoPreviewUrl && (
                  <div className="mt-2">
                    <Label>Logo Preview:</Label>
                    <img
                      src={logoPreviewUrl}
                      alt="Logo Preview"
                      style={{
                        maxWidth: 120,
                        maxHeight: 120,
                        ...(invertLogo ? { filter: 'invert(1)' } : {}),
                        border: '1px solid #ccc',
                        background: '#fff',
                        marginTop: 8,
                      }}
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleUpdateLogo} className="mt-4">Update Logo</Button>
            </div>

            {/* Delete Developer */}
            <div className="space-y-2">
              <Label htmlFor="delete-developer-select">
                Delete Developer
              </Label>
              <Select value={delDev} onValueChange={setDelDev}>
                <SelectTrigger id="delete-developer-select" className="w-full">
                  <SelectValue placeholder="Select developer to delete" />
                </SelectTrigger>
                <SelectContent>
                  {developers.map(dev => (
                    <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleDeleteDeveloper} className="mt-4" variant="destructive">Delete Developer</Button>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <Button onClick={() => navigate('/brochures')} variant="outline">Back to Brochures</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
