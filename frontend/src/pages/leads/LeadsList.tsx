import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  budget: number;
  preferred_location: string;
  preferred_property_type: string;
  preferred_bedrooms: number;
  preferred_bathrooms: number;
  preferred_area: string;
  preferred_amenities: string[];
  source: string;
  status: string;
  assigned_to: string;
  assigned_user?: {
    full_name: string;
  };
  created_by: string;
  notes: string;
  last_contact_date: string;
  next_followup_date: string;
  created_at: string;
  updated_at: string;
}

export default function LeadsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.is_admin || false;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Lead;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const searchTimeoutRef = useRef<number>();
  const [shuffleMode, setShuffleMode] = useState(false);

  // Create debounced fetch function
  const debouncedFetchLeads = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      fetchLeads();
    }, 500);
  }, [filters, sortConfig, currentPage, user]);

  // Update useEffect to use debounced fetch
  useEffect(() => {
    if (user) {
      debouncedFetchLeads();
    } else {
      setLoading(false);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedFetchLeads, user]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching leads for user:', user.id, 'isAdmin:', isAdmin);

      // Build the query
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_user:profiles!leads_assigned_to_fkey (
            full_name
          )
        `, { count: 'exact' });

      // Filter leads based on user role
      if (!isAdmin) {
        console.log('Applying user filter for non-admin user');
        query = query.or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`);
      } else {
        console.log('Admin user - showing all leads');
      }

      // Exclude dumped leads
      query = query.is('dumped_at', null);

      // Apply search filter
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      if (sortConfig) {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      console.log('Executing query with filters:', {
        user: user.id,
        isAdmin,
        search: filters.search,
        status: filters.status,
        page: currentPage,
        itemsPerPage
      });

      const { data, error, count } = await query;

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      console.log('Query results:', {
        count,
        dataLength: data?.length
      });

      // Transform the data to handle the assigned_user field correctly
      const transformedData = (data || []).map(lead => ({
        ...lead,
        assigned_user: lead.assigned_user?.[0] || null
      }));

      setLeads(transformedData);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      fetchLeads();
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      setError(error.message);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Update search handler to use debounced fetch
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  };

  const handleStatusChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
    setCurrentPage(1);
  };

  const handleShuffleToggle = () => {
    setShuffleMode(!shuffleMode);
    if (!shuffleMode) {
      const shuffledLeads = [...leads].sort(() => Math.random() - 0.5);
      setLeads(shuffledLeads);
    } else {
      fetchLeads();
    }
  };

  const renderPagination = () => {
    const pages: JSX.Element[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page button
    pages.push(
      <button
        key="first"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronDoubleLeftIcon className="h-4 w-4" />
      </button>
    );

    // Previous page button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md border ${
            currentPage === i
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next page button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    );

    // Last page button
    pages.push(
      <button
        key="last"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronDoubleRightIcon className="h-4 w-4" />
      </button>
    );

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} leads
        </div>
        <div className="flex space-x-1">
          {pages}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all leads in the system including their contact information and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => navigate('/leads/new')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add lead
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filters.status}
                  onChange={handleStatusChangeSelect}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <Button
            variant="outline"
            className="bg-white text-black border-black hover:bg-gray-100"
            onClick={handleShuffleToggle}
          >
            {shuffleMode ? 'Disable Shuffle' : 'Enable Shuffle'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {leads.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No leads found. Start by adding your first lead!</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                          onClick={() => handleSort('first_name')}
                        >
                          <div className="flex items-center">
                            Name
                            {sortConfig?.key === 'first_name' && (
                              sortConfig.direction === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Contact
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Preferences
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {sortConfig?.key === 'status' && (
                              sortConfig.direction === 'asc' ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Assigned To
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Follow-up
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {leads.map((lead) => (
                        <tr key={lead.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <UserIcon className="h-10 w-10 text-gray-400" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {lead.first_name} {lead.last_name}
                                </div>
                                <div className="text-gray-500">{lead.nationality}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {lead.phone}
                            </div>
                            {lead.email && (
                              <div className="flex items-center mt-1">
                                <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                {lead.email}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div>{lead.preferred_location}</div>
                            <div className="text-gray-500">
                              {lead.preferred_property_type} • {lead.budget?.toLocaleString()} AED
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <select
                              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                                lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                                lead.status === 'Proposal' ? 'bg-purple-100 text-purple-800' :
                                lead.status === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                                lead.status === 'Closed Won' ? 'bg-green-100 text-green-800' :
                                lead.status === 'Closed Lost' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Proposal">Proposal</option>
                              <option value="Negotiation">Negotiation</option>
                              <option value="Closed Won">Closed Won</option>
                              <option value="Closed Lost">Closed Lost</option>
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {lead.assigned_user?.full_name || 'Unassigned'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {lead.next_followup_date ? new Date(lead.next_followup_date).toLocaleDateString() : 'No follow-up'}
                            </div>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => navigate(`/leads/${lead.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {leads.length > 0 && renderPagination()}
    </div>
  );
} 