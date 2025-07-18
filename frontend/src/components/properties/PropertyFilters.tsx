import React, { useState } from 'react';
import { Input } from '../ui/input';
import { PropertyTypeSelect } from '../PropertyTypeSelect';
import { PropertyType } from '../../utils/propertyTypes';
import { Filter } from 'lucide-react';

const PROPERTY_STATUSES = {
  // Core Property Statuses
  CORE: ['Available', 'Under Offer', 'Sold', 'Rented', 'Off Market'],
  
  // Development & Off-Plan Statuses
  DEVELOPMENT: ['Off-Plan', 'Under Construction', 'Completed', 'Delayed'],
  
  // Transactional & Legal Statuses
  TRANSACTIONAL: ['Reserved', 'Mortgaged', 'Restrained', 'Pending DLD Approval'],
  
  // Rental-Specific Statuses
  RENTAL: ['Vacant', 'Leasehold', 'Active Rental Dispute'],
  
  // Additional Market-Driven Statuses
  MARKET: ['Price Reduced', 'Exclusive Listing', 'Coming Soon']
} as const;

interface PropertyFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
    priceRange: [number, number];
    bedrooms: string;
    bathrooms: string;
  };
  onChange: (filters: PropertyFiltersProps['filters']) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ filters, onChange }) => {
  const handleChange = (key: keyof PropertyFiltersProps['filters'], value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Mobile: Show Filters button */}
      <div className="sm:hidden mb-2">
        <button
          className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg bg-white text-black w-full justify-center font-semibold"
          onClick={() => setOpen((v) => !v)}
        >
          <Filter className="h-4 w-4" />
          {open ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      {/* Filters group: visible on desktop, collapsible on mobile */}
      <div className={`transition-all duration-300 ${open ? 'block' : 'hidden'} sm:block`}> 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search properties..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="pending">Pending</option>
              <option value="rented">Rented</option>
            </select>
          </div>
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => handleChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => handleChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bedrooms
            </label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bathrooms
            </label>
            <select
              value={filters.bathrooms}
              onChange={(e) => handleChange('bathrooms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters; 