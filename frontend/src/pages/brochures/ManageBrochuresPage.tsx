import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface Developer {
  id: string;
  name: string;
}

interface Brochure {
  id: string;
  developer_id: string | null;
  developer_name: string;
  file_name: string;
  file_url: string;
  thumbnail_url: string | null;
  uploaded_by: string;
  uploaded_at: string;
}

interface ManageBrochuresPageProps {
  // developers: Developer[]; // Removed, now fetched internally
  onDataChange: () => void;
}

export default function ManageBrochuresPage({ onDataChange }: ManageBrochuresPageProps) {
  const [delBrochure, setDelBrochure] = useState<string>('');
  const [delDev, setDelDev] = useState<string>('');
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]); // Add local state for developers

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
      console.log('Fetched developers in ManageBrochuresPage:', mappedDevs);
    };
    fetchDevelopers();
  }, []);

  useEffect(() => {
    const fetchBrochuresForDeveloper = async () => {
      if (delDev) {
        const { data: brochureData, error: brochureError } = await supabase
          .from('brochures')
          .select('*')
          .eq('developer_id', delDev);

        if (brochureError) {
          console.error('Error fetching brochures:', brochureError);
          addToast({ title: 'Error', description: 'Error fetching brochures', type: 'error' });
          return;
        }
        setBrochures(brochureData);
      }
    };
    fetchBrochuresForDeveloper();
  }, [delDev]);

  const handleDeleteBrochure = async () => {
    if (!delBrochure) {
      addToast({ title: 'Error', description: 'Please select a brochure to delete', type: 'error' });
      return;
    }

    const brochureToDelete = brochures.find(b => b.id === delBrochure);
    if (!brochureToDelete) {
      addToast({ title: 'Error', description: 'Brochure not found', type: 'error' });
      return;
    }

    const supabaseBaseUrl = 'https://nwxqfzfweijwhgyzbaya.supabase.co';
    const storagePathPrefix = `${supabaseBaseUrl}/storage/v1/object/public/brochures/`;
    const storagePath = brochureToDelete.file_url.replace(storagePathPrefix, '');

    if (brochureToDelete.thumbnail_url) {
      const thumbnailStoragePath = brochureToDelete.thumbnail_url.replace(storagePathPrefix, '');
      const { error: thumbnailDeleteError } = await supabase.storage
        .from('brochures')
        .remove([thumbnailStoragePath]);
      if (thumbnailDeleteError) {
        console.error('Error deleting thumbnail from storage:', thumbnailDeleteError);
        addToast({ title: 'Error', description: 'Error deleting thumbnail from storage', type: 'error' });
      }
    }

    const { error: storageError } = await supabase.storage
      .from('brochures')
      .remove([storagePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      addToast({ title: 'Error', description: 'Error deleting file from storage', type: 'error' });
      return;
    }

    const { error: dbError } = await supabase.from('brochures').delete().eq('id', delBrochure);

    if (dbError) {
      console.error('Error deleting brochure from database:', dbError);
      addToast({ title: 'Error', description: 'Error deleting brochure from database', type: 'error' });
      return;
    }

    addToast({ title: 'Success', description: 'Brochure deleted successfully!', type: 'success' });
    setDelBrochure('');
    setDelDev('');
    navigate('/brochures'); // Navigate back to the main brochures page
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6 shadow-lg rounded-xl bg-card">
        <CardHeader className="pb-4 mb-4 border-b">
          <CardTitle className="text-2xl font-bold text-center">Manage Brochures</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="delete-brochure-developer-select">
                Select Developer to view Brochures
              </Label>
              <Select value={delDev} onValueChange={setDelDev}>
                <SelectTrigger id="delete-brochure-developer-select" className="w-full">
                  <SelectValue placeholder="Select developer" />
                </SelectTrigger>
                <SelectContent>
                  {developers.map(dev => (
                    <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {delDev && brochures.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="delete-brochure-select">
                  Select Brochure to Delete
                </Label>
                <Select value={delBrochure} onValueChange={setDelBrochure}>
                  <SelectTrigger id="delete-brochure-select" className="w-full">
                    <SelectValue placeholder="Select brochure" />
                  </SelectTrigger>
                  <SelectContent>
                    {brochures.map(bro => (
                      <SelectItem key={bro.id} value={bro.id}>{bro.file_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleDeleteBrochure} className="mt-4" variant="destructive">Delete Brochure</Button>
              </div>
            )}
            {delDev && brochures.length === 0 && (
              <p className="text-muted-foreground text-center mt-4">No brochures for selected developer.</p>
            )}
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <Button onClick={() => navigate('/brochures')} variant="outline">Back to Brochures</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
