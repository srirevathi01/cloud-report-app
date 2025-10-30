import React, { useState, useMemo } from 'react';
import { Resource } from '../types';
import { getResourceId, getResourceDisplayName } from '../utils/resourceHelpers';
import { ChevronUp, ChevronDown, Search, AlertCircle } from './icons';
import AlertModal from './AlertModal';

interface ResourceTableProps {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  onResourceClick: (resourceId: string) => void;
  loadingResourceId?: string | null;
}

type SortDirection = 'asc' | 'desc';

const ResourceTable: React.FC<ResourceTableProps> = ({
  resources,
  loading,
  error,
  onResourceClick,
  loadingResourceId: externalLoadingResourceId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [internalLoadingResourceId, setInternalLoadingResourceId] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const loadingResourceId = externalLoadingResourceId !== undefined ? externalLoadingResourceId : internalLoadingResourceId;

  // Filter resources based on search query
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;

    const query = searchQuery.toLowerCase();
    return resources.filter(resource => {
      const id = getResourceId(resource)?.toLowerCase() || '';
      const displayName = getResourceDisplayName(resource).toLowerCase();
      return id.includes(query) || displayName.includes(query);
    });
  }, [resources, searchQuery]);

  // Sort resources
  const sortedResources = useMemo(() => {
    const sorted = [...filteredResources];

    sorted.sort((a, b) => {
      const aValue = getResourceDisplayName(a).toLowerCase();
      const bValue = getResourceDisplayName(b).toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredResources, sortDirection]);

  // Paginate resources
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedResources.slice(startIndex, endIndex);
  }, [sortedResources, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedResources.length / itemsPerPage);

  // Handle sort
  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Handle resource click with loading state
  const handleResourceClick = (resourceId: string) => {
    if (externalLoadingResourceId === undefined) {
      setInternalLoadingResourceId(resourceId);
    }
    onResourceClick(resourceId);
  };

  // Reset loading state when resources change (only for internal state)
  React.useEffect(() => {
    if (externalLoadingResourceId === undefined) {
      setInternalLoadingResourceId(null);
    }
  }, [resources, externalLoadingResourceId]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Get page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Show error modal when error exists
  React.useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  // Error state - show modal
  if (error && showErrorModal) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center bg-white p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Resources</h3>
            <p className="text-slate-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <AlertModal
          type="error"
          title="Error Loading Resources"
          message={error}
          onClose={() => setShowErrorModal(false)}
          actions={
            <>
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </>
          }
        />
      </>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Search and Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Results count */}
          <div className="text-sm text-slate-600">
            Showing {sortedResources.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedResources.length)} of {sortedResources.length} resources
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {paginatedResources.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Resources Found</h3>
              <p className="text-slate-600">
                {searchQuery ? 'Try adjusting your search query' : 'No resources available for this service'}
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSort}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    Resource Name
                    {sortDirection === 'asc' ?
                      <ChevronUp className="w-4 h-4" /> :
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedResources.map((resource, index) => {
                const resourceId = getResourceId(resource) || '';
                const displayName = getResourceDisplayName(resource);
                const isLoadingThisResource = loadingResourceId === resourceId;

                return (
                  <tr
                    key={resourceId || index}
                    className={`transition-colors cursor-pointer ${isLoadingThisResource ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    onClick={() => handleResourceClick(resourceId)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {isLoadingThisResource && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{displayName}</div>
                          {resourceId && resourceId !== displayName && (
                            <div className="text-sm text-slate-500">{resourceId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {paginatedResources.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-slate-500">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-white border border-slate-300'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceTable;
