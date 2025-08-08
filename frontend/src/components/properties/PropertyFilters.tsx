import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Filter, X, Search } from 'lucide-react';
import { PropertyType } from '../../utils/propertyTypes';
import { PropertyStatus, PROPERTY_STATUSES } from '../../utils/propertyStatuses';
import { Badge } from '../ui/badge';

const PROPERTY_STATUSES_FILTER = {
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
    type: PropertyType | 'All';
    status: PropertyStatus | 'All';
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

  const propertyTypeOptions = [
    { value: 'All', label: 'All Types' },
    { value: 'residential' as PropertyType, label: 'Residential' },
    { value: 'apartment' as PropertyType, label: 'Apartment' },
    { value: 'villa' as PropertyType, label: 'Villa' },
    { value: 'penthouse' as PropertyType, label: 'Penthouse' },
    { value: 'commercial' as PropertyType, label: 'Commercial' },
    { value: 'office' as PropertyType, label: 'Office' },
    { value: 'retail' as PropertyType, label: 'Retail' },
    { value: 'warehouse' as PropertyType, label: 'Warehouse' },
    { value: 'commercial-building' as PropertyType, label: 'Commercial Building' },
    { value: 'land' as PropertyType, label: 'Land' },
    { value: 'industrial' as PropertyType, label: 'Industrial' }
  ];

  const clearFilters = () => {
    onChange({
      search: '',
      type: 'All',
      status: 'All',
      priceRange: [0, 0],
      bedrooms: '',
      bathrooms: ''
    });
  };

  const hasActiveFilters = filters.search || filters.type !== 'All' || filters.status !== 'All' || 
    filters.priceRange[0] > 0 || filters.priceRange[1] > 0 || filters.bedrooms || filters.bathrooms;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-600 hover:text-slate-900"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(!open)}
              className="sm:hidden"
            >
              {open ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`transition-all duration-300 ${open ? 'block' : 'hidden'} sm:block`}>
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Search Properties</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                placeholder="Search by name, address, or keywords..."
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Property Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Property Type</Label>
              <Select value={filters.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {PROPERTY_STATUSES.CORE.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">Price Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  value={filters.priceRange[0] || ''}
                  onChange={(e) => handleChange('priceRange', [Number(e.target.value) || 0, filters.priceRange[1]])}
                  placeholder="Min Price"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => handleChange('priceRange', [filters.priceRange[0], Number(e.target.value) || 0])}
                  placeholder="Max Price"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Bedrooms</Label>
              <Select value={filters.bedrooms} onValueChange={(value) => handleChange('bedrooms', value)}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Any bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Bathrooms</Label>
              <Select value={filters.bathrooms} onValueChange={(value) => handleChange('bathrooms', value)}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Any bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters; 