import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface Developer {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface AdminControlsProps {
  onDataChange: () => void;
}

export default function AdminControls({ onDataChange }: AdminControlsProps) {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const { addToast } = useToast();
  const navigate = useNavigate();

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
    console.log('Fetched developers in AdminControls:', mappedDevs);
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Card className="mb-8 p-6 shadow-lg rounded-xl bg-card">
      <CardHeader className="pb-4 mb-4 border-b">
        <CardTitle className="text-2xl font-bold text-center">Admin Controls</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => handleNavigation('/brochures/upload')}>Upload New Brochure</Button>
          <Button onClick={() => handleNavigation('/brochures/developers')}>Manage Developers</Button>
          <Button onClick={() => handleNavigation('/brochures/manage')}>Manage Brochures</Button>
        </div>
      </CardContent>
    </Card>
  );
}
