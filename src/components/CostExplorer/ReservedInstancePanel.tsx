import React, { useState } from 'react';
import { ReservedInstance } from '../../types';

interface ReservedInstancePanelProps {
  reservedInstances: ReservedInstance[];
  onRefresh: () => void;
}

const ReservedInstancePanel: React.FC<ReservedInstancePanelProps> = ({ reservedInstances, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'payment-pending'>('all');
  const [sortBy, setSortBy] = useState<'utilization' | 'expiry' | 'savings'>('utilization');

  // Filter RIs
  const filteredRIs = reservedInstances.filter(ri => {
    if (filter === 'all') return true;
    return ri.state.toLowerCase() === filter.replace('-', '');
  });

  // Sort RIs
  const sortedRIs = [...filteredRIs].sort((a, b) => {
    if (sortBy === 'utilization') {
      return (b.utilizationPercentage || 0) - (a.utilizationPercentage || 0);
    } else if (sortBy === 'expiry') {
      return new Date(a.end || '').getTime() - new Date(b.end || '').getTime();
    } else {
      return (b.estimatedSavings || 0) - (a.estimatedSavings || 0);
    }
  });

  // Calculate summary statistics
  const activeRIs = reservedInstances.filter(ri => ri.state === 'active');
  const totalUtilization = activeRIs.length > 0
    ? activeRIs.reduce((sum, ri) => sum + (ri.utilizationPercentage || 0), 0) / activeRIs.length
    : 0;
  const totalSavings = reservedInstances.reduce((sum, ri) => sum + (ri.estimatedSavings || 0), 0);
  const expiringRIs = activeRIs.filter(ri => {
    const daysUntilExpiry = Math.floor((new Date(ri.end || '').getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  });

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'active':
        return 'text-green-700 bg-green-100';
      case 'expired':
        return 'text-slate-600 bg-slate-100';
      case 'payment-pending':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (endDate: string | undefined) => {
    if (!endDate) return null;
    const days = Math.floor((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Active RIs</h3>
          <p className="text-3xl font-bold text-slate-800">{activeRIs.length}</p>
          <p className="text-xs text-slate-500 mt-1">Reserved Instances</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Average Utilization</h3>
          <p className={`text-3xl font-bold ${totalUtilization >= 80 ? 'text-green-600' : totalUtilization >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {totalUtilization.toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all active RIs</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Savings</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
          <p className="text-xs text-slate-500 mt-1">Compared to On-Demand</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Expiring Soon</h3>
          <p className="text-3xl font-bold text-yellow-600">{expiringRIs.length}</p>
          <p className="text-xs text-slate-500 mt-1">Within 30 days</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <div className="flex gap-1">
              {['all', 'active', 'expired', 'payment-pending'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:border-slate-400 transition-all"
            >
              <option value="utilization">Utilization</option>
              <option value="expiry">Expiry Date</option>
              <option value="savings">Savings</option>
            </select>

            <button
              onClick={onRefresh}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Reserved Instances List */}
      {sortedRIs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Reserved Instances Found</h3>
          <p className="text-slate-600 mb-4">
            {filter === 'all'
              ? 'You don\'t have any Reserved Instances yet.'
              : `No ${filter.replace('-', ' ')} Reserved Instances found.`}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
            >
              View All RIs
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Instance Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Count</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Utilization</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Est. Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedRIs.map((ri, index) => {
                  const daysUntilExpiry = getDaysUntilExpiry(ri.end);
                  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

                  return (
                    <tr key={index} className={`hover:bg-slate-50 transition-colors ${isExpiringSoon ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{ri.instanceType}</p>
                            <p className="text-xs text-slate-500">{ri.availabilityZone || 'Regional'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-800">{ri.instanceCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(ri.state)}`}>
                          {ri.state}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {ri.utilizationPercentage !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2 w-20">
                              <div
                                className={`h-2 rounded-full ${
                                  ri.utilizationPercentage >= 80 ? 'bg-green-600' :
                                  ri.utilizationPercentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${ri.utilizationPercentage}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${
                              ri.utilizationPercentage >= 80 ? 'text-green-700' :
                              ri.utilizationPercentage >= 50 ? 'text-yellow-700' : 'text-red-700'
                            }`}>
                              {ri.utilizationPercentage.toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-800">{ri.offeringType || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-800">{formatDate(ri.start)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm text-slate-800">{formatDate(ri.end)}</span>
                          {isExpiringSoon && (
                            <p className="text-xs text-yellow-700 font-medium mt-0.5">
                              Expires in {daysUntilExpiry} days
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(ri.estimatedSavings || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {activeRIs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Recommendations
          </h3>
          <ul className="space-y-2">
            {totalUtilization < 80 && (
              <li className="text-sm text-blue-800">
                • Your average RI utilization is {totalUtilization.toFixed(0)}%. Consider right-sizing or converting underutilized RIs to Savings Plans for more flexibility.
              </li>
            )}
            {expiringRIs.length > 0 && (
              <li className="text-sm text-blue-800">
                • {expiringRIs.length} Reserved Instance{expiringRIs.length > 1 ? 's' : ''} expiring within 30 days. Review and renew to maintain cost savings.
              </li>
            )}
            {activeRIs.some(ri => (ri.utilizationPercentage || 0) < 50) && (
              <li className="text-sm text-blue-800">
                • Some RIs have less than 50% utilization. Consider modifying instance families or selling unused capacity on the RI Marketplace.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReservedInstancePanel;
