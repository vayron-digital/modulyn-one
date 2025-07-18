import React from 'react';
import { PropertyType } from '../utils/propertyTypes';
import { PropertyTypeSelect } from './PropertyTypeSelect';

interface FilterOptions {
  status: string[];
  assignedAgentId: string;
  leadSource: string;
  dateRange: {
    start: string;
    end: string;
  };
  budget: {
    min: string;
    max: string;
  };
  propertyType: PropertyType;
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface LeadFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  agents: any[];
}

function LeadFilters({ filters, onFilterChange, agents }: LeadFiltersProps) {
  const handleChange = (field: keyof FilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          multiple
          value={filters.status}
          onChange={(e) => handleChange('status', Array.from(e.target.selectedOptions, option => option.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed">Closed</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Assigned Agent Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Assigned Agent</label>
        <select
          value={filters.assignedAgentId}
          onChange={(e) => handleChange('assignedAgentId', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Agents</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lead Source Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Lead Source</label>
        <select
          value={filters.leadSource}
          onChange={(e) => handleChange('leadSource', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social">Social Media</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Date Range</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Budget Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Budget Range</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.budget.min}
            onChange={(e) => handleChange('budget', { ...filters.budget, min: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.budget.max}
            onChange={(e) => handleChange('budget', { ...filters.budget, max: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Property Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Property Type</label>
        <PropertyTypeSelect
          value={filters.propertyType}
          onChange={(type) => handleChange('propertyType', type)}
          className="mt-1"
        />
      </div>

      {/* Tags Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <select
          multiple
          value={filters.tags}
          onChange={(e) => handleChange('tags', Array.from(e.target.selectedOptions, option => option.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="urgent">Urgent</option>
          <option value="vip">VIP</option>
          <option value="follow-up">Follow Up</option>
          <option value="hot">Hot Lead</option>
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Sort By</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleChange('sortOrder', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default LeadFilters; 