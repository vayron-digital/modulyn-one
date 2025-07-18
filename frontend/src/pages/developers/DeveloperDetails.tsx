import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/card';
import PropertyCard from '../../components/properties/PropertyCard';

const DeveloperDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const devUuid = id;
  const [developer, setDeveloper] = useState<{ developer_id: string; name: string; logo_url?: string } | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!devUuid) return setLoading(false);
      const { data: dev, error: devError } = await supabase.from('developers').select('developer_id, name, logo_url').eq('developer_id', devUuid).single();
      const { data: props, error: propError } = await supabase.from('properties').select('*').eq('developer_id', devUuid);
      if (!devError) setDeveloper(dev);
      if (!propError) setProperties(props || []);
      setLoading(false);
    };
    fetchData();
  }, [devUuid]);

  if (loading) return <div className="p-8 text-center">Loading developer...</div>;
  if (!developer) return <div className="p-8 text-center">Developer not found.</div>;

  return (
    <div className="p-8">
      <button className="mb-4 text-blue-600" onClick={() => navigate('/developers')}>&larr; Back to Developers</button>
      <h1 className="text-2xl font-bold mb-4">{developer.name}</h1>
      <h2 className="text-lg font-semibold mb-2">Properties</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {properties.length === 0 ? (
          <div className="col-span-full text-gray-500">No properties found for this developer.</div>
        ) : (
          properties.map((property) => {
            const cardProps = {
              id: property.id?.toString() || '',
              refNo: property.ref_no || property.id?.toString() || '',
              title: property.name || property.title || '',
              price: property.price || 0,
              type: property.type || '',
              location: property.location || '',
              bedrooms: property.bedrooms || '',
              bathrooms: property.bathrooms || '',
              area: property.area || '',
              status: property.status || '',
              listingDate: property.listing_date || '',
              owner: property.owner || '',
              image: property.image || '',
            };
            return <PropertyCard key={property.id} {...cardProps} />;
          })
        )}
      </div>
    </div>
  );
};

export default DeveloperDetails; 