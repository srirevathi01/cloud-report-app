import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resource } from '../types';
import { getResourceId, getResourceDisplayName, getServiceDisplayName, getResourceState, getResourceImportantInfo, shouldShowStatusColumn } from '../utils/resourceHelpers';
import { ChevronUp, ChevronDown, Search, AlertCircle } from './icons';
import AlertModal from './AlertModal';

interface ResourceTableProps {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  onResourceClick: (resourceId: string) => void;
  loadingResourceId?: string | null;
  service: string;
  categoryName: string;
}

type SortDirection = 'asc' | 'desc';

const ResourceTable: React.FC<ResourceTableProps> = ({
  resources,
  loading,
  error,
  onResourceClick,
  loadingResourceId: externalLoadingResourceId,
  service,
  categoryName
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [internalLoadingResourceId, setInternalLoadingResourceId] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const loadingResourceId = externalLoadingResourceId !== undefined ? externalLoadingResourceId : internalLoadingResourceId;

  // Check if status column should be shown for this service
  const showStatusColumn = shouldShowStatusColumn(service);

  // Get column headers from first resource
  const columnHeaders = useMemo(() => {
    if (resources.length === 0) return [];
    const firstResourceInfo = getResourceImportantInfo(resources[0], service);
    return firstResourceInfo.map(info => info.label);
  }, [resources, service]);

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
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-12"
        >
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-300 dark:border-blue-700 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-blue-600 border-r-purple-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Loading Resources
          </h3>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">Please wait while we fetch your data...</p>
        </motion.div>
      </div>
    );
  }

  // Error state - show modal
  if (error && showErrorModal) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center bg-white p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Error Loading Resources</h3>
            <p className="text-slate-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
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
                className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-400 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
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
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Search and Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 backdrop-blur-lg bg-white/95 dark:bg-slate-800/95"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 sm:max-w-md relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl bg-white backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium shadow-md hover:shadow-lg transition-all"
            />
          </div>

          {/* Items per page and Results count - Combined on mobile */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white backdrop-blur-sm rounded-xl border border-slate-300 shadow-md">
              <label className="text-xs sm:text-sm text-slate-700 font-semibold whitespace-nowrap">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border-0 bg-transparent rounded-lg px-1 sm:px-2 py-1 text-xs sm:text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Results count - hide on very small screens */}
            <div className="text-xs sm:text-sm text-slate-700 font-semibold hidden md:block whitespace-nowrap px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-300 shadow-md">
              Showing {sortedResources.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedResources.length)} of {sortedResources.length} resources
            </div>
            {/* Compact count for mobile */}
            <div className="text-xs text-slate-700 font-semibold md:hidden whitespace-nowrap px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-300 shadow-md">
              {sortedResources.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, sortedResources.length)} of {sortedResources.length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      {paginatedResources.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex items-center justify-center p-4"
        >
          <div className="text-center backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl border border-white/20 p-8 sm:p-12 max-w-md">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-slate-700 mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              No Resources Found
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              {searchQuery ? 'Try adjusting your search query' : 'No resources available for this service'}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="overflow-x-auto">
            <div className="backdrop-blur-lg bg-white/95 rounded-2xl shadow-xl border border-slate-300 overflow-hidden">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gradient-to-r from-blue-100 to-purple-100 border-b border-slate-300 sticky top-0">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                      <button
                        onClick={handleSort}
                        className="flex items-center gap-1 sm:gap-2 text-xs font-medium text-slate-600 uppercase tracking-wider hover:text-blue-500 transition-colors group"
                      >
                        <span className="hidden sm:inline">Resource Name</span>
                        <span className="sm:hidden">Name</span>
                        <div className="p-1 rounded-lg bg-white/50 group-hover:bg-blue-50 transition-colors">
                          {sortDirection === 'asc' ?
                            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> :
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          }
                        </div>
                      </button>
                    </th>
                    {showStatusColumn && (
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                        <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Status
                        </div>
                      </th>
                    )}
                    {columnHeaders.map((header, idx) => (
                      <th key={idx} className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                        <div className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                          {header}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
              {paginatedResources.map((resource, index) => {
                const resourceId = getResourceId(resource) || '';
                const displayName = getResourceDisplayName(resource);
                const isLoadingThisResource = loadingResourceId === resourceId;
                const resourceState = getResourceState(resource);
                const importantInfo = getResourceImportantInfo(resource, service);

                // Determine status color
                const getStateColor = (state: string | null): string => {
                  if (!state) return '';
                  const stateLower = state.toLowerCase();
                  if (stateLower.includes('running') || stateLower.includes('available') || stateLower.includes('active')) {
                    return 'text-green-700 bg-green-50';
                  }
                  if (stateLower.includes('stopped') || stateLower.includes('terminated')) {
                    return 'text-red-700 bg-red-50';
                  }
                  if (stateLower.includes('pending') || stateLower.includes('stopping') || stateLower.includes('starting')) {
                    return 'text-yellow-700 bg-yellow-50';
                  }
                  return 'text-slate-700 bg-slate-50';
                };

                return (
                  <motion.tr
                    key={resourceId || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className={`group transition-all cursor-pointer ${
                      isLoadingThisResource
                        ? 'bg-gradient-to-r from-blue-100 to-purple-100'
                        : 'hover:bg-gradient-to-r hover:from-blue-100/60 hover:to-purple-100/60 hover:shadow-md'
                    }`}
                    onClick={() => handleResourceClick(resourceId)}
                    whileHover={{ scale: 1.005 }}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {isLoadingThisResource && (
                          <div className="relative">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-300"></div>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-blue-600 border-r-purple-600 absolute top-0 left-0"></div>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors">
                            {displayName}
                          </div>
                          {resourceId && resourceId !== displayName && (
                            <div className="text-xs sm:text-sm text-slate-600 truncate font-mono bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block border border-slate-300">
                              {resourceId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {showStatusColumn && (
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {resourceState ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-md ${getStateColor(resourceState)}`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              resourceState.toLowerCase().includes('running') || resourceState.toLowerCase().includes('available') || resourceState.toLowerCase().includes('active')
                                ? 'bg-green-500 animate-pulse'
                                : resourceState.toLowerCase().includes('stopped') || resourceState.toLowerCase().includes('terminated')
                                ? 'bg-red-500'
                                : 'bg-yellow-500 animate-pulse'
                            }`}></span>
                            {resourceState}
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm text-slate-400">-</span>
                        )}
                      </td>
                    )}
                    {importantInfo.map((info, idx) => (
                      <td key={idx} className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="text-xs sm:text-sm text-slate-600 font-medium truncate max-w-[200px]">
                          {info.value}
                        </div>
                      </td>
                    ))}
                  </motion.tr>
                );
              })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {paginatedResources.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-3 sm:p-4 border-t border-slate-100 backdrop-blur-lg bg-white/90"
        >
          <div className="flex items-center justify-between gap-2">
            <motion.button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-600 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </motion.button>

            <div className="flex items-center gap-1 sm:gap-2">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-slate-500 text-xs sm:text-sm font-medium">...</span>
                ) : (
                  <motion.button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-md scale-110'
                        : 'text-slate-600 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 border border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {page}
                  </motion.button>
                )
              ))}
            </div>

            <motion.button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-600 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              Next
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResourceTable;
