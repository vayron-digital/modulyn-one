import React, { useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Plus, Download, List, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card } from '../../components/ui/card';
import { UserPlus, CheckSquare, XSquare, DollarSign } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../lib/utils';

const TABS = [
  { label: 'All Clients', status: null },
  { label: 'Leads', status: 'new' },
  { label: 'Ongoing', status: 'active' },
  { label: 'Payment Back', status: 'payment_back' },
  { label: 'Closed', status: 'closed' },
];

const PAGE_SIZE = 10;

const columns = [
  {
    key: 'name',
    header: 'Name',
    render: (item) => (
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
          {item.first_name?.[0]}{item.last_name?.[0]}
        </div>
        <div>
          <div className="font-medium">{item.first_name} {item.last_name}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
    render: (item) => (
      <div className="flex items-center space-x-2">
        <span>{item.phone}</span>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        item.status === 'new' ? 'bg-blue-100 text-blue-800' :
        item.status === 'active' ? 'bg-green-100 text-green-800' :
        item.status === 'payment_back' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {item.status}
      </span>
    ),
  },
  {
    key: 'source',
    header: 'Source',
    render: (item) => (
      <span className="capitalize">{item.source}</span>
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    render: (item) => new Date(item.created_at).toLocaleDateString(),
  },
];

const Leads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState({ key: 'created_at', direction: 'desc' });
  const { toast } = useToast();

  const handleLeadClick = (lead) => {
    navigate(`/leads/${lead.id}`);
  };

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Button
          onClick={() => navigate('/leads/new')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white border border-black">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.status}
              value={tab.status || 'all'}
              className="text-black data-[state=active]:bg-black data-[state=active]:text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Leads List */}
      <div className="bg-white border border-black rounded-lg overflow-hidden">
        <div className="p-4 border-b border-black">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">Leads</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-white text-black border-black hover:bg-gray-100"
              >
                <Download className="h-4 w-4 mr-2 text-black" />
                Export
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                data={leads}
                loading={loading}
                onSort={(key, direction) => setSort({ key, direction })}
                sortKey={sort.key}
                sortDirection={sort.direction}
                onRowClick={(lead) => handleLeadClick(lead)}
                selectedRows={selected}
                onSelectionChange={(newSelected) => setSelected(newSelected)}
                idField="id"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leads; 