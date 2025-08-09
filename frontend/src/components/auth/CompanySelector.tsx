import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Plus, Check, ChevronDown, Loader2, Globe, AlertTriangle, Users } from 'lucide-react';
import { api } from '../../lib/api';

interface Tenant {
  id: string;
  name: string;
  logo_url?: string;
  slug: string;
  member_count?: number;
}

interface CompanySelectorProps {
  value: string;
  onChange: (companyName: string, selectedTenant?: Tenant) => void;
  onModeChange: (mode: 'create' | 'join') => void;
  mode: 'create' | 'join';
  className?: string;
  customSlug?: string;
  onSlugChange?: (slug: string) => void;
  slugConflict?: {exists: boolean, tenant?: Tenant} | null;
  onSlugConflictAction?: (action: 'join' | 'change') => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  value,
  onChange,
  onModeChange,
  mode,
  className = '',
  customSlug = '',
  onSlugChange,
  slugConflict,
  onSlugConflictAction
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search tenants
  const searchTenants = async (query: string) => {
    if (!query.trim()) {
      setTenants([]);
      return;
    }

    // Backend requires minimum 2 characters
    if (query.trim().length < 2) {
      setTenants([]);
      return;
    }

    console.log('🔍 Searching tenants with query:', query);
    setLoading(true);
    try {
      const response = await api.get(`/tenants/search?q=${encodeURIComponent(query)}&limit=10`);
      console.log('📡 Search response:', response.data);
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('❌ Error searching tenants:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'join') {
        searchTenants(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, mode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    onChange(tenant.name, tenant);
    setIsOpen(false);
    setSearchQuery(tenant.name);
  };

  const handleModeSwitch = (newMode: 'create' | 'join') => {
    onModeChange(newMode);
    setSelectedTenant(null);
    setSearchQuery('');
    setIsOpen(false);
    
    if (newMode === 'create') {
      onChange('');
    }
  };

  const handleInputChange = (inputValue: string) => {
    if (mode === 'create') {
      onChange(inputValue);
      // Auto-generate slug from company name if no custom slug
      if (!customSlug && onSlugChange) {
        const autoSlug = inputValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        onSlugChange(autoSlug);
      }
    } else {
      setSearchQuery(inputValue);
      if (!inputValue.trim()) {
        setSelectedTenant(null);
        onChange('');
      }
      setIsOpen(true);
    }
  };
  
  const handleSlugChange = (slugValue: string) => {
    if (onSlugChange) {
      const cleanSlug = slugValue.toLowerCase().replace(/[^a-z0-9-]/g, '');
      onSlugChange(cleanSlug);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Selection */}
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => handleModeSwitch('create')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'create'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Company
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('join')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'join'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Building2 className="w-4 h-4" />
            Join Existing Company
          </div>
        </button>
      </div>

      {/* Input Field */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {mode === 'create' ? 'Company Name *' : 'Search for your company *'}
        </label>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {mode === 'create' ? (
              <Building2 className="h-5 w-5 text-slate-400" />
            ) : (
              <Search className="h-5 w-5 text-slate-400" />
            )}
          </div>
          
          <input
            type="text"
            value={mode === 'create' ? value : searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => mode === 'join' && setIsOpen(true)}
            className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={
              mode === 'create'
                ? 'Enter your company name'
                : 'Type to search for your company...'
            }
          />
          
          {mode === 'join' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {loading ? (
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </div>
          )}
        </div>

        {/* Dropdown for Join Mode */}
        {mode === 'join' && isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Searching companies...
              </div>
            ) : tenants.length > 0 ? (
              <div className="py-1">
                {tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    type="button"
                    onClick={() => handleTenantSelect(tenant)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 group"
                  >
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {tenant.logo_url ? (
                        <img
                          src={tenant.logo_url}
                          alt={`${tenant.name} logo`}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Company Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {tenant.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {tenant.member_count} {tenant.member_count === 1 ? 'member' : 'members'}
                      </div>
                    </div>
                    
                    {/* Selected Indicator */}
                    {selectedTenant?.id === tenant.id && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-slate-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No companies found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try a different search term or create a new company
                </p>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Start typing to search companies</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Company Preview */}
      {mode === 'join' && selectedTenant && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {selectedTenant.logo_url ? (
                <img
                  src={selectedTenant.logo_url}
                  alt={`${selectedTenant.name} logo`}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-blue-700">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Ready to join {selectedTenant.name}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                You'll need approval from a company admin to access the workspace
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Slug Input for Create Mode */}
      {mode === 'create' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Company URL *
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-3 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg text-sm text-slate-500">
                <Globe className="w-4 h-4 mr-1" />
                app.modulyn.com/
              </span>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="your-company"
                className="flex-1 px-3 py-3 border border-slate-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              This will be your company's unique web address
            </p>
          </div>
          
          {/* Slug Conflict Detection */}
          {slugConflict?.exists && slugConflict.tenant && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-900 mb-2">
                    Company Already Exists
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {slugConflict.tenant.logo_url ? (
                        <img
                          src={slugConflict.tenant.logo_url}
                          alt={`${slugConflict.tenant.name} logo`}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-amber-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-amber-900">
                        {slugConflict.tenant.name}
                      </div>
                      <div className="text-xs text-amber-700">
                        {slugConflict.tenant.member_count} members
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 mb-3">
                    A company with this URL already exists. Would you like to:
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSlugConflictAction?.('join')}
                      className="px-3 py-2 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Join This Company
                    </button>
                    <button
                      type="button"
                      onClick={() => onSlugConflictAction?.('change')}
                      className="px-3 py-2 bg-white border border-amber-300 text-amber-700 text-sm rounded-md hover:bg-amber-50 transition-colors"
                    >
                      Choose Different URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Create Mode Preview */}
          {value.trim() && customSlug && !slugConflict?.exists && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Creating "{value}"
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    URL: app.modulyn.com/{customSlug}
                  </p>
                  <p className="text-xs text-green-600">
                    You'll be the admin of this new company workspace
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
