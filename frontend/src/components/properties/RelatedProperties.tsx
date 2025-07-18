import React from 'react';
import PropertyCard from './PropertyCard';

const RelatedProperties = ({ properties, onPropertyClick }) => {
  if (!properties || properties.length === 0) return null;
  return (
    <div className="mt-2">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Related Properties</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-2xl p-2">
            <PropertyCard {...property} onClick={() => onPropertyClick(property.id)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProperties; 