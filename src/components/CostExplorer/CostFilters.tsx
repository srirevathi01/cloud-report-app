import React, { useState } from 'react';
import { CostFilter } from '../../types';

interface CostFiltersProps {
  filters: CostFilter;
  onFilterChange: (filters: Partial<CostFilter>) => void;
  onApply: () => void;
  loading: boolean;
}

const CostFilters: React.FC<CostFiltersProps> = ({ filters, onFilterChange, onApply, loading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickDateRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'Last 12 months', days: 365 },
    { label: 'Year to date', days: null },
  ];

  const handleQuickDateRange = (days: number | null) => {
    const endDate = new Date();
    let startDate: Date;

    if (days === null) {
      // Year to date
      startDate = new Date(endDate.getFullYear(), 0, 1);
    } else {
      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    onFilterChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>
      </div>

      <div className="space-y-4">
        {/* Quick Date Ranges */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Quick Date Ranges</label>
          <div className="flex flex-wrap gap-2">
            {quickDateRanges.map(range => (
              <button
                key={range.label}
                onClick={() => handleQuickDateRange(range.days)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Granularity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Granularity</label>
          <div className="flex gap-2">
            {['DAILY', 'MONTHLY', 'HOURLY'].map(gran => (
              <button
                key={gran}
                onClick={() => onFilterChange({ granularity: gran as any })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.granularity === gran
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {gran.charAt(0) + gran.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Group By */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Group By</label>
          <select
            value={filters.groupBy}
            onChange={(e) => onFilterChange({ groupBy: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SERVICE">Service</option>
            <option value="REGION">Region</option>
            <option value="USAGE_TYPE">Usage Type</option>
            <option value="TAG">Tag</option>
            <option value="ACCOUNT">Account</option>
          </select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Service Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Services</label>
              <input
                type="text"
                placeholder="Enter service names (comma-separated)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const services = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  onFilterChange({ services: services.length > 0 ? services : undefined });
                }}
              />
              <p className="text-xs text-slate-500 mt-1">e.g., Amazon EC2, Amazon S3, AWS Lambda</p>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Regions</label>
              <input
                type="text"
                placeholder="Enter regions (comma-separated)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const regions = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  onFilterChange({ regions: regions.length > 0 ? regions : undefined });
                }}
              />
              <p className="text-xs text-slate-500 mt-1">e.g., us-east-1, us-west-2, eu-west-1</p>
            </div>

            {/* Account Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Accounts</label>
              <input
                type="text"
                placeholder="Enter account IDs (comma-separated)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const accounts = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  onFilterChange({ accounts: accounts.length > 0 ? accounts : undefined });
                }}
              />
              <p className="text-xs text-slate-500 mt-1">For consolidated billing / multi-account setups</p>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Tags</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tag Key (e.g., Environment)"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Tag Value (e.g., Production)"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Filter costs by resource tags</p>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={onApply}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Apply Filters
              </>
            )}
          </button>
          <button
            onClick={() => {
              onFilterChange({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                granularity: 'DAILY',
                groupBy: 'SERVICE',
                services: undefined,
                regions: undefined,
                accounts: undefined,
                tags: undefined
              });
            }}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-sm font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostFilters;
