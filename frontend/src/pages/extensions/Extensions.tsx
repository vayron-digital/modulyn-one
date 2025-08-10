import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PuzzlePieceIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CogIcon,
  ShieldCheckIcon,
  SparklesIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface Extension {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'productivity' | 'analytics' | 'integration' | 'automation';
  status: 'available' | 'installed' | 'coming_soon' | 'premium';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  features: string[];
  pricing?: {
    type: 'free' | 'paid' | 'premium';
    amount?: number;
    period?: 'monthly' | 'yearly';
  };
  rating: number;
  installs: number;
  developer: string;
  version: string;
  lastUpdated: string;
}

const Extensions: React.FC = () => {
  const { user } = useAuth();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'communication' | 'productivity' | 'analytics' | 'integration' | 'automation'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'installs' | 'recent'>('name');

  useEffect(() => {
    fetchExtensions();
  }, []);

  const fetchExtensions = async () => {
    // Simulated data - in real app, this would come from an API
    const mockExtensions: Extension[] = [
      {
        id: '1',
        name: 'Email Integration',
        description: 'Connect your email accounts for seamless communication tracking',
        category: 'communication',
        status: 'available',
        icon: EnvelopeIcon,
        features: ['Email tracking', 'Auto-replies', 'Template management', 'Analytics'],
        pricing: { type: 'free' },
        rating: 4.8,
        installs: 1250,
        developer: 'CRM Team',
        version: '2.1.0',
        lastUpdated: '2024-01-15'
      },
      {
        id: '2',
        name: 'Calendar Sync',
        description: 'Sync your calendar with leads and appointments',
        category: 'productivity',
        status: 'installed',
        icon: CalendarIcon,
        features: ['Google Calendar', 'Outlook integration', 'Auto-scheduling', 'Reminders'],
        pricing: { type: 'free' },
        rating: 4.6,
        installs: 890,
        developer: 'CRM Team',
        version: '1.8.2',
        lastUpdated: '2024-01-10'
      },
      {
        id: '3',
        name: 'Advanced Analytics',
        description: 'Deep insights into your sales performance and lead conversion',
        category: 'analytics',
        status: 'premium',
        icon: ChartBarIcon,
        features: ['Custom dashboards', 'Predictive analytics', 'ROI tracking', 'Performance reports'],
        pricing: { type: 'premium', amount: 29, period: 'monthly' },
        rating: 4.9,
        installs: 456,
        developer: 'Analytics Pro',
        version: '3.2.1',
        lastUpdated: '2024-01-20'
      },
      {
        id: '4',
        name: 'WhatsApp Business',
        description: 'Integrate WhatsApp Business for customer communication',
        category: 'communication',
        status: 'available',
        icon: DevicePhoneMobileIcon,
        features: ['WhatsApp messaging', 'Template messages', 'Contact sync', 'Chat history'],
        pricing: { type: 'paid', amount: 15, period: 'monthly' },
        rating: 4.7,
        installs: 678,
        developer: 'WhatsApp Inc.',
        version: '1.5.0',
        lastUpdated: '2024-01-12'
      },
      {
        id: '5',
        name: 'Document Management',
        description: 'Advanced document handling and storage solutions',
        category: 'productivity',
        status: 'coming_soon',
        icon: DocumentTextIcon,
        features: ['Document templates', 'E-signatures', 'Version control', 'Cloud storage'],
        pricing: { type: 'paid', amount: 19, period: 'monthly' },
        rating: 0,
        installs: 0,
        developer: 'DocFlow',
        version: '1.0.0',
        lastUpdated: '2024-02-01'
      },
      {
        id: '6',
        name: 'Team Collaboration',
        description: 'Enhanced team communication and project management',
        category: 'productivity',
        status: 'available',
        icon: UserGroupIcon,
        features: ['Team chat', 'Task assignment', 'File sharing', 'Activity feeds'],
        pricing: { type: 'free' },
        rating: 4.5,
        installs: 1120,
        developer: 'CRM Team',
        version: '2.0.1',
        lastUpdated: '2024-01-18'
      },
      {
        id: '7',
        name: 'Property Market Data',
        description: 'Real-time property market insights and trends',
        category: 'analytics',
        status: 'premium',
        icon: BuildingOfficeIcon,
        features: ['Market trends', 'Price analysis', 'Competition tracking', 'Forecasting'],
        pricing: { type: 'premium', amount: 39, period: 'monthly' },
        rating: 4.8,
        installs: 234,
        developer: 'MarketInsights',
        version: '2.3.0',
        lastUpdated: '2024-01-22'
      },
      {
        id: '8',
        name: 'Workflow Automation',
        description: 'Automate repetitive tasks and streamline your workflow',
        category: 'automation',
        status: 'available',
        icon: SparklesIcon,
        features: ['Custom workflows', 'Trigger actions', 'Conditional logic', 'Scheduling'],
        pricing: { type: 'paid', amount: 25, period: 'monthly' },
        rating: 4.7,
        installs: 567,
        developer: 'AutomatePro',
        version: '1.9.3',
        lastUpdated: '2024-01-14'
      }
    ];

    setExtensions(mockExtensions);
    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'productivity':
        return <CogIcon className="h-5 w-5" />;
      case 'analytics':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'integration':
        return <GlobeAltIcon className="h-5 w-5" />;
      case 'automation':
        return <SparklesIcon className="h-5 w-5" />;
      default:
        return <PuzzlePieceIcon className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'installed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckIcon className="h-3 w-3 mr-1" />
          Installed
        </span>;
      case 'available':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Available
        </span>;
      case 'coming_soon':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Coming Soon
        </span>;
      case 'premium':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <ShieldCheckIcon className="h-3 w-3 mr-1" />
          Premium
        </span>;
      default:
        return null;
    }
  };

  const getPricingDisplay = (pricing?: Extension['pricing']) => {
    if (!pricing) return null;
    
    switch (pricing.type) {
      case 'free':
        return <span className="text-green-600 font-medium">Free</span>;
      case 'paid':
        return <span className="text-blue-600 font-medium">${pricing.amount}/{pricing.period}</span>;
      case 'premium':
        return <span className="text-purple-600 font-medium">${pricing.amount}/{pricing.period}</span>;
      default:
        return null;
    }
  };

  const filteredExtensions = extensions
    .filter(extension => 
      filter === 'all' || extension.category === filter
    )
    .filter(extension =>
      extension.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      extension.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'installs':
          return b.installs - a.installs;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleInstall = async (extensionId: string) => {
    // Simulate installation
    setExtensions(prev => 
      prev.map(ext => 
        ext.id === extensionId 
          ? { ...ext, status: 'installed' as const }
          : ext
      )
    );
  };

  const handleUninstall = async (extensionId: string) => {
    // Simulate uninstallation
    setExtensions(prev => 
      prev.map(ext => 
        ext.id === extensionId 
          ? { ...ext, status: 'available' as const }
          : ext
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PuzzlePieceIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Extensions</h1>
              <p className="text-gray-600">Enhance your CRM with powerful integrations and tools</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search extensions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <PuzzlePieceIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="installs">Sort by Installs</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center space-x-2">
            {['all', 'communication', 'productivity', 'analytics', 'integration', 'automation'].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === category
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Extensions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading extensions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredExtensions.map((extension) => (
                <motion.div
                  key={extension.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <extension.icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{extension.name}</h3>
                          <p className="text-sm text-gray-500">{extension.developer}</p>
                        </div>
                      </div>
                      {getStatusBadge(extension.status)}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4">{extension.description}</p>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {extension.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {feature}
                          </span>
                        ))}
                        {extension.features.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                            +{extension.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>⭐ {extension.rating}</span>
                        <span>📥 {extension.installs.toLocaleString()}</span>
                      </div>
                      <span>v{extension.version}</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm">
                        {getPricingDisplay(extension.pricing)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated {new Date(extension.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {extension.status === 'available' && (
                        <button
                          onClick={() => handleInstall(extension.id)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Install
                        </button>
                      )}
                      {extension.status === 'installed' && (
                        <button
                          onClick={() => handleUninstall(extension.id)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Uninstall
                        </button>
                      )}
                      {extension.status === 'coming_soon' && (
                        <button
                          disabled
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
                        >
                          Coming Soon
                        </button>
                      )}
                      {extension.status === 'premium' && (
                        <button
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <ShieldCheckIcon className="h-4 w-4 mr-2" />
                          Upgrade
                        </button>
                      )}
                      
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Learn more"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredExtensions.length === 0 && (
          <div className="text-center py-12">
            <PuzzlePieceIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No extensions found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Extensions;
