import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentTextIcon,
  PhotoIcon,
  DocumentIcon,
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document' | 'spreadsheet' | 'presentation' | 'other';
  size: number;
  uploaded_by: string;
  uploaded_at: string;
  category: 'brochure' | 'contract' | 'proposal' | 'invoice' | 'other';
  tags: string[];
  url: string;
  thumbnail_url?: string;
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pdf' | 'image' | 'document' | 'spreadsheet' | 'presentation' | 'other'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'brochure' | 'contract' | 'proposal' | 'invoice' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Simulated data - in real app, this would come from Supabase
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Property Brochure - Downtown Condo',
          type: 'pdf',
          size: 2048576, // 2MB
          uploaded_by: 'John Doe',
          uploaded_at: '2024-01-15T10:30:00Z',
          category: 'brochure',
          tags: ['property', 'condo', 'downtown'],
          url: '#',
          thumbnail_url: 'https://via.placeholder.com/150x200/4F46E5/FFFFFF?text=PDF'
        },
        {
          id: '2',
          name: 'Sales Contract Template',
          type: 'document',
          size: 512000, // 512KB
          uploaded_by: 'Jane Smith',
          uploaded_at: '2024-01-14T14:20:00Z',
          category: 'contract',
          tags: ['contract', 'template', 'legal'],
          url: '#'
        },
        {
          id: '3',
          name: 'Property Photos - Villa Collection',
          type: 'image',
          size: 3145728, // 3MB
          uploaded_by: 'Mike Johnson',
          uploaded_at: '2024-01-13T09:15:00Z',
          category: 'brochure',
          tags: ['photos', 'villa', 'collection'],
          url: '#',
          thumbnail_url: 'https://via.placeholder.com/150x200/10B981/FFFFFF?text=IMG'
        },
        {
          id: '4',
          name: 'Monthly Sales Report',
          type: 'spreadsheet',
          size: 1024000, // 1MB
          uploaded_by: 'Sarah Wilson',
          uploaded_at: '2024-01-12T16:45:00Z',
          category: 'other',
          tags: ['report', 'sales', 'monthly'],
          url: '#'
        },
        {
          id: '5',
          name: 'Client Proposal - Luxury Homes',
          type: 'presentation',
          size: 1536000, // 1.5MB
          uploaded_by: 'Alex Brown',
          uploaded_at: '2024-01-11T11:30:00Z',
          category: 'proposal',
          tags: ['proposal', 'luxury', 'homes'],
          url: '#'
        },
        {
          id: '6',
          name: 'Invoice - January 2024',
          type: 'pdf',
          size: 256000, // 256KB
          uploaded_by: 'Finance Team',
          uploaded_at: '2024-01-10T08:00:00Z',
          category: 'invoice',
          tags: ['invoice', 'finance', 'january'],
          url: '#',
          thumbnail_url: 'https://via.placeholder.com/150x200/EF4444/FFFFFF?text=PDF'
        }
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
      case 'image':
        return <PhotoIcon className="h-8 w-8 text-green-500" />;
      case 'document':
        return <DocumentIcon className="h-8 w-8 text-blue-500" />;
      case 'spreadsheet':
        return <DocumentIcon className="h-8 w-8 text-green-600" />;
      case 'presentation':
        return <DocumentIcon className="h-8 w-8 text-orange-500" />;
      default:
        return <DocumentTextIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'brochure':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-green-100 text-green-800';
      case 'proposal':
        return 'bg-purple-100 text-purple-800';
      case 'invoice':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents
    .filter(doc => 
      (filter === 'all' || doc.type === filter) &&
      (categoryFilter === 'all' || doc.category === categoryFilter) &&
      (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

  const handleDocumentClick = (document: Document) => {
    // In a real app, this would open the document or navigate to a viewer
    window.open(document.url, '_blank');
  };

  const handleDownload = (document: Document) => {
    // In a real app, this would trigger a download
    console.log('Downloading:', document.name);
  };

  const handleDelete = async (documentId: string) => {
    // In a real app, this would delete the document
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                <p className="text-gray-600">Manage and organize your documents</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/documents/uploads')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div 
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/brochures')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Brochures</h3>
                  <p className="text-sm text-gray-600">Property marketing materials</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/documents/uploads')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PlusIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Uploads</h3>
                  <p className="text-sm text-gray-600">Manage uploaded files</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FolderIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Templates</h3>
                  <p className="text-sm text-gray-600">Document templates</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DocumentIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Contracts</h3>
                  <p className="text-sm text-gray-600">Legal documents</p>
                </div>
              </div>
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
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-2">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Type:</span>
            </div>
            
            {['all', 'pdf', 'image', 'document', 'spreadsheet', 'presentation', 'other'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All' : type.toUpperCase()}
              </button>
            ))}

            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm font-medium text-gray-700">Category:</span>
      </div>

            {['all', 'brochure', 'contract', 'proposal', 'invoice', 'other'].map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading documents...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">
                  {searchTerm || filter !== 'all' || categoryFilter !== 'all'
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by uploading your first document."
                  }
                </p>
                {!searchTerm && filter === 'all' && categoryFilter === 'all' && (
                  <button
                    onClick={() => navigate('/documents/uploads')}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Upload Document
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'p-6' : 'divide-y divide-gray-200'}>
                <AnimatePresence>
                  {filteredDocuments.map((document) => (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={viewMode === 'grid' 
                        ? 'inline-block w-full sm:w-64 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer'
                        : 'p-4 hover:bg-gray-50 transition-colors cursor-pointer'
                      }
                      onClick={() => handleDocumentClick(document)}
                    >
                      {viewMode === 'grid' ? (
                        <div className="text-center">
                          <div className="mb-3">
                            {document.thumbnail_url ? (
                              <img 
                                src={document.thumbnail_url} 
                                alt={document.name}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                {getFileIcon(document.type)}
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{document.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{formatFileSize(document.size)}</p>
                          <div className="flex items-center justify-center space-x-1 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                              {document.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                            <ClockIcon className="h-3 w-3" />
                            {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getFileIcon(document.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">{formatFileSize(document.size)}</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                                {document.category}
                              </span>
                              <div className="flex items-center text-sm text-gray-500">
                                <UserIcon className="h-3 w-3 mr-1" />
                                {document.uploaded_by}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(document);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentClick(document);
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="View"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(document.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents; 