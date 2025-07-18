import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, FolderOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface Developer {
  id: string;
  name: string;
  logo_url?: string | null;
}

interface Brochure {
  id: string;
  developer_id: string | null;
  developer_name: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export default function BrochuresPage() {
  const [search, setSearch] = useState('');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;
  const location = useLocation();

  const fetchData = async () => {
    console.log("Fetching data...");
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

    const { data: brochureData, error: brochureError } = await supabase.from('brochures').select('*');
    if (brochureError) {
      console.error('Error fetching brochures:', brochureError);
      addToast({ title: 'Error', description: 'Error fetching brochures', type: 'error' });
      return;
    }
    setBrochures(brochureData as Brochure[]);
    console.log("Data fetched successfully!", { devData, brochureData });
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  const filteredDevs = developers.filter(dev =>
    dev.name.toLowerCase().includes(search.toLowerCase()) ||
    brochures.some(b => b.developer_id === dev.id && b.file_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight sm:mb-2 mb-1">
          Explore Brochures
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Browse through our curated collection of developer brochures.
        </p>
      </div>

      {/* Admin Control Buttons */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button className="w-full sm:w-auto" onClick={() => navigate('/brochures/upload')}>Upload New Brochure</Button>
          <Button className="w-full sm:w-auto" onClick={() => navigate('/brochures/developers')}>Manage Developers</Button>
          <Button className="w-full sm:w-auto" onClick={() => navigate('/brochures/manage')}>Manage Brochures</Button>
        </div>
      )}

      {/* Search Input */}
      <Input
        placeholder="Search by developer or brochure name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 sm:mb-8 p-3 sm:p-4 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
      />

      {/* Developer Cards Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {filteredDevs.length === 0 && search !== '' ? (
          <p className="col-span-full text-center text-muted-foreground">No developers or brochures match your search.</p>
        ) : filteredDevs.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No developers available yet.</p>
        ) : (
          filteredDevs.map(dev => {
            const devBrochures = brochures.filter(b => b.developer_id === dev.id);
            return (
              <Card
                key={dev.id}
                className="group flex flex-col items-center p-4 sm:p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out border border-border"
              >
                <CardHeader className="flex flex-col items-center p-0 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-full mb-2 sm:mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                    {dev.logo_url ? (
                      <img src={dev.logo_url} alt={`${dev.name} logo`} className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-full invert" />
                    ) : (
                      <FolderOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    )}
                  </div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-center leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
                    {dev.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="w-full flex flex-col items-center p-0">
                  <div className="mb-1 sm:mb-2 text-xs text-muted-foreground">{devBrochures.length} brochure{devBrochures.length !== 1 ? 's' : ''}</div>
                  <div className="flex flex-col gap-1 sm:gap-2 w-full">
                    {devBrochures.slice(0, 3).map(brochure => (
                      <div key={brochure.id} className="flex items-center justify-between w-full bg-gray-50 rounded px-2 py-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-[80px] sm:max-w-[100px] text-xs">{brochure.file_name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => window.open(brochure.file_url, '_blank')} title="View Brochure">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12H3m0 0l4-4m-4 4l4 4"/></svg>
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => window.open(brochure.file_url, '_blank')} title="Download Brochure">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {devBrochures.length > 3 && (
                      <Button variant="link" size="sm" className="mt-1 text-xs" onClick={() => navigate(`/brochures/${dev.id}`)}>
                        +{devBrochures.length - 3} more
                      </Button>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 sm:mt-3 w-full" onClick={() => navigate(`/brochures/${dev.id}`)}>
                    View All Brochures
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
} 