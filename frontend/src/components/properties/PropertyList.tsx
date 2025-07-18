import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../../types/property';
import { formatCurrency } from '../../utils/format';

interface PropertyListProps {
  properties: Property[];
}

const PropertyList: React.FC<PropertyListProps> = ({ properties }) => {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Link
          key={property.id}
          to={`/properties/${property.id}`}
          className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {property.address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(property.price)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {property.type}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{property.bedrooms} beds</span>
              <span>{property.bathrooms} baths</span>
              <span>{property.square_feet} sq ft</span>
              <span className="ml-auto">{property.status}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PropertyList; 