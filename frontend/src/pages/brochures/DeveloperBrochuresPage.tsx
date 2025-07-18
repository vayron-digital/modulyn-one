import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { ListFilter, Grid, FileText, FolderOpen } from 'lucide-react';

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

interface Developer {
  id: string;
  name: string;
  logo_url?: string | null;
}

export default function DeveloperBrochuresPage() {
  const { developerId } = useParams<{ developerId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [developerName, setDeveloperName] = useState<string>('');
  const [developerLogoUrl, setDeveloperLogoUrl] = useState<string | null>(null); // New state for logo URL
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid view

  useEffect(() => {
    console.log('DeveloperBrochuresPage: useEffect triggered.');
    console.log('DeveloperBrochuresPage: developerId from params:', developerId);

    if (!developerId) {
      addToast({ title: 'Error', description: 'Developer ID is missing.', type: 'error' });
      navigate('/brochures'); // Redirect back to main brochures page
      return;
    }

    const fetchDeveloperAndBrochures = async () => {
      console.log('Fetching developer and brochures for ID:', developerId);

      // Fetch developer name and logo URL
      const { data: devData, error: devError } = await supabase
        .from('developers')
        .select('name, logo_url') // Fetch logo_url
        .eq('new_uuid_id', developerId)
        .single();

      if (devError) {
        console.error('Error fetching developer:', devError);
        addToast({ title: 'Error', description: 'Error fetching developer details.', type: 'error' });
        navigate('/brochures');
        return;
      }
      if (devData) {
        setDeveloperName(devData.name);
        setDeveloperLogoUrl(devData.logo_url); // Set logo URL
        console.log('Fetched developer name:', devData.name);
        console.log('Fetched developer logo URL:', devData.logo_url);
      } else {
        console.log('Developer not found for ID:', developerId);
        addToast({ title: 'Error', description: 'Developer not found.', type: 'error' });
        navigate('/brochures');
        return;
      }

      // Fetch brochures for the developer
      const { data: brochureData, error: brochureError } = await supabase
        .from('brochures')
        .select('*, developer_id, file_name, file_url, uploaded_by, uploaded_at')
        .eq('developer_id', developerId);

      if (brochureError) {
        console.error('Error fetching brochures:', brochureError);
        addToast({ title: 'Error', description: 'Error fetching brochures for this developer.', type: 'error' });
        return;
      }
      setBrochures(brochureData);
      console.log('Fetched brochures:', brochureData);
    };

    fetchDeveloperAndBrochures();
  }, [developerId, navigate, addToast]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Button onClick={() => navigate(-1)} className="mb-4">← Back to All Brochures</Button>
      <div className="flex items-center gap-4 mb-6">
        {developerLogoUrl ? (
          <div className="p-3 bg-primary/10 mb-3">
            <img src={developerLogoUrl} alt={`${developerName} logo`} className="h-12 w-12 object-contain invert" />
          </div>
        ) : (
          <FolderOpen className="h-12 w-12 text-primary" />
        )}
        <h1 className="text-3xl font-bold">{developerName} Brochures</h1>
      </div>

      <div className="flex justify-end mb-4">
        <Button variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')} className="mr-2">
          <Grid className="h-4 w-4 mr-2" /> Grid View
        </Button>
        <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>
          <ListFilter className="h-4 w-4 mr-2" /> List View
        </Button>
      </div>

      {brochures.length === 0 ? (
        <p>No brochures available for {developerName}.</p>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brochures.map((brochure) => (
            <Card key={brochure.id} className="flex flex-col items-center p-4 hover:shadow-lg transition-shadow duration-200">
              <a href={brochure.file_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center w-full">
                {brochure.thumbnail_url ? (
                  <img src={brochure.thumbnail_url} alt={brochure.file_name} className="h-16 w-16 object-cover rounded-md mb-2" />
                ) : (
                  <FileText className="h-16 w-16 text-gray-400 mb-2" />
                )} 
                <CardTitle className="text-center text-sm font-semibold mb-1 truncate w-full">{brochure.file_name}</CardTitle>
                <CardContent className="text-xs text-gray-500">Uploaded: {new Date(brochure.uploaded_at).toLocaleDateString()}</CardContent>
              </a>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {brochures.map((brochure) => (
            <Card key={brochure.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {brochure.thumbnail_url ? (
                  <img src={brochure.thumbnail_url} alt={brochure.file_name} className="h-10 w-10 object-cover rounded-md" />
                ) : (
                  <FileText className="h-6 w-6 text-gray-400" />
                )}
                <div>
                  <div className="font-semibold">{brochure.file_name}</div>
                  <div className="text-xs text-gray-500">Uploaded: {new Date(brochure.uploaded_at).toLocaleDateString()}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open(brochure.file_url, '_blank')}>Download</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 