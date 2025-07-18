import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Developer {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface UploadBrochurePageProps {
  onUploadSuccess: () => void;
}

export default function UploadBrochurePage({ onUploadSuccess }: UploadBrochurePageProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDeveloper, setUploadDeveloper] = useState('');
  const [uploadThumbnailFile, setUploadThumbnailFile] = useState<File | null>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);

  const { addToast } = useToast();
  const { user } = useAuth();
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
      console.log('Fetched developers in UploadBrochurePage:', mappedDevs);
    };
    fetchDevelopers();
  }, []);

  const sanitizeFileName = (name: string) => {
    return name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  };

  const handleUploadBrochure = async () => {
    if (!uploadFile || !uploadDeveloper || !user?.id) {
      addToast({ title: 'Error', description: 'Please select a file, developer, and ensure you are logged in.', type: 'error' });
      return;
    }

    const developer = developers.find(dev => dev.id === uploadDeveloper);
    if (!developer) {
      addToast({ title: 'Error', description: 'Invalid developer selected', type: 'error' });
      return;
    }

    const sanitizedDeveloperName = sanitizeFileName(developer.name);
    const sanitizedFileName = sanitizeFileName(uploadFile.name);

    const filePath = `public/${sanitizedDeveloperName}/${sanitizedFileName}`;

    let thumbnailPublicUrl: string | null = null;
    if (uploadThumbnailFile) {
      const sanitizedThumbnailFileName = sanitizeFileName(uploadThumbnailFile.name);
      const thumbnailPath = `public/${sanitizedDeveloperName}/thumbnails/${sanitizedThumbnailFileName}`;

      const { error: thumbnailUploadError } = await supabase.storage
        .from('brochures')
        .upload(thumbnailPath, uploadThumbnailFile, { upsert: true });

      if (thumbnailUploadError) {
        console.error('Error uploading thumbnail file:', thumbnailUploadError);
        addToast({ title: 'Error', description: `Error uploading thumbnail: ${thumbnailUploadError.message}`, type: 'error' });
        return;
      }
      const { data: thumbPublicUrlData } = supabase.storage.from('brochures').getPublicUrl(thumbnailPath);
      if (thumbPublicUrlData && thumbPublicUrlData.publicUrl) {
        thumbnailPublicUrl = thumbPublicUrlData.publicUrl;
      }
    }

    const { data: existingFiles, error: listError } = await supabase.storage
      .from('brochures')
      .list(
        `public/${sanitizedDeveloperName}`,
        { search: sanitizedFileName }
      );

    if (listError) {
      console.error('Error checking for existing file in storage:', listError);
      addToast({ title: 'Error', description: `Error checking for existing file: ${listError.message}`, type: 'error' });
      return;
    }

    const fileExistsInStorage = existingFiles && existingFiles.length > 0;

    let publicUrl = '';

    if (fileExistsInStorage) {
      const { data: publicUrlData } = supabase.storage.from('brochures').getPublicUrl(filePath);
      if (!publicUrlData || !publicUrlData.publicUrl) {
        addToast({ title: 'Error', description: 'Could not get public URL for existing file', type: 'error' });
        return;
      }
      publicUrl = publicUrlData.publicUrl;
      console.log('File already exists in storage. Proceeding to database check.');
      addToast({ title: 'Info', description: 'File already exists in storage. Checking database.', type: 'info' });
    } else {
      const { error: uploadError } = await supabase.storage
        .from('brochures')
        .upload(filePath, uploadFile);

      if (uploadError) {
        if (uploadError.message && uploadError.message.includes('The resource already exists')) {
          console.log('File already exists in storage (conflict detected). Proceeding to database check.');
          addToast({ title: 'Info', description: 'File already exists in storage. Checking database.', type: 'info' });
          const { data: publicUrlData } = supabase.storage.from('brochures').getPublicUrl(filePath);
          if (!publicUrlData || !publicUrlData.publicUrl) {
            addToast({ title: 'Error', description: 'Could not get public URL after conflict', type: 'error' });
            return;
          }
          publicUrl = publicUrlData.publicUrl;
        } else {
          console.error('Error uploading file:', uploadError);
          console.error('Supabase upload error details:', uploadError.message, uploadError.stack);
          addToast({ title: 'Error', description: `Error uploading file: ${uploadError.message}`, type: 'error' });
          return;
        }
      } else {
        const { data: publicUrlData } = supabase.storage.from('brochures').getPublicUrl(filePath);
        if (!publicUrlData || !publicUrlData.publicUrl) {
          addToast({ title: 'Error', description: 'Could not get public URL for newly uploaded file', type: 'error' });
          return;
        }
        publicUrl = publicUrlData.publicUrl;
      }
    }

    const { data: existingBrochureData, error: fetchBrochureError } = await supabase
      .from('brochures')
      .select('*')
      .eq('developer_id', uploadDeveloper)
      .eq('file_name', uploadFile.name);

    if (fetchBrochureError) {
      console.error('Error checking for existing brochure metadata:', fetchBrochureError);
      addToast({ title: 'Error', description: `Error checking existing brochure: ${fetchBrochureError.message}`, type: 'error' });
      return;
    }

    if (existingBrochureData && existingBrochureData.length > 0) {
      console.log('Brochure metadata already exists in the database. Updating record.');
      addToast({ title: 'Info', description: 'Brochure metadata already exists. Updating...', type: 'info' });

      const { error: updateError } = await supabase
        .from('brochures')
        .update({
          file_url: publicUrl,
          thumbnail_url: thumbnailPublicUrl,
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString(),
        })
        .eq('developer_id', uploadDeveloper)
        .eq('file_name', uploadFile.name);

      if (updateError) {
        console.error('Error updating brochure metadata:', updateError);
        addToast({ title: 'Error', description: `Error updating brochure metadata: ${updateError.message}`, type: 'error' });
        return;
      }
      console.log('Brochure updated successfully, calling addToast and onDataChange.');
      addToast({ title: 'Success', description: 'Brochure updated successfully!', type: 'success' });

    } else {
      console.log('Attempting to insert new brochure metadata:', {
        developer_id: uploadDeveloper,
        developer_name: developer.name,
        file_name: uploadFile.name,
        file_url: publicUrl,
        thumbnail_url: thumbnailPublicUrl,
        uploaded_by: user.id,
      });
      console.log('Type of uploadDeveloper (before insert):', typeof uploadDeveloper);

      const { error: insertError } = await supabase.from('brochures').insert({
        developer_id: uploadDeveloper,
        developer_name: developer.name,
        file_name: uploadFile.name,
        file_url: publicUrl,
        thumbnail_url: thumbnailPublicUrl,
        uploaded_by: user.id,
      });

      if (insertError) {
        console.error('Error inserting brochure metadata:', insertError);
        addToast({ title: 'Error', description: 'Error saving brochure metadata', type: 'error' });
        await supabase.storage.from('brochures').remove([filePath]);
        return;
      }

      console.log('Brochure uploaded successfully, calling addToast and onDataChange.');
      addToast({ title: 'Success', description: 'Brochure uploaded successfully!', type: 'success' });
    }

    setUploadFile(null);
    setUploadThumbnailFile(null);
    setUploadDeveloper('');
    navigate('/brochures');
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6 shadow-lg rounded-xl bg-card">
        <CardHeader className="pb-4 mb-4 border-b">
          <CardTitle className="text-2xl font-bold text-center">Upload New Brochure</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brochure-developer-select">
                Select Developer
              </Label>
              <Select value={uploadDeveloper} onValueChange={setUploadDeveloper}>
                <SelectTrigger id="brochure-developer-select" className="w-full">
                  <SelectValue placeholder="Select a developer" />
                </SelectTrigger>
                <SelectContent>
                  {developers.map(dev => (
                    <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brochure-file-input">
                Brochure File (PDF)
              </Label>
              <Input
                id="brochure-file-input"
                type="file"
                accept=".pdf"
                onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brochure-thumbnail-input">
                Brochure Thumbnail (Optional)
              </Label>
              <Input
                id="brochure-thumbnail-input"
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={e => setUploadThumbnailFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <Button onClick={() => navigate('/brochures')} variant="outline">Cancel</Button>
            <Button onClick={handleUploadBrochure}>Upload Brochure</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
