import React, { useState } from 'react';
import { SavingsPlan } from '../../types';

interface SavingsPlansPanelProps {
  savingsPlans: SavingsPlan[];
  onRefresh: () => void;
}

const SavingsPlansPanel: React.FC<SavingsPlansPanelProps> = ({ savingsPlans, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
  const [planTypeFilter, setPlanTypeFilter] = useState<'all' | 'Compute' | 'EC2' | 'SageMaker'>('all');

  // Filter Savings Plans
  const filteredPlans = savingsPlans.filter(plan => {
    const statusMatch = filter === 'all' || plan.status.toLowerCase() === filter;
    const typeMatch = planTypeFilter === 'all' || plan.planType === planTypeFilter;
    return statusMatch && typeMatch;
  });

  // Calculate summary statistics
  const activePlans = savingsPlans.filter(p => p.status === 'active');
  const totalCommitment = activePlans.reduce((sum, p) => sum + (p.hourlyCommitment * 730), 0); // Monthly commitment
  const totalSavings = activePlans.reduce((sum, p) => sum + (p.savingsAmount || 0), 0);
  const avgUtilization = activePlans.length > 0
    ? activePlans.reduce((sum, p) => sum + (p.utilizationPercentage || 0), 0) / activePlans.length
    : 0;

  // Group by plan type
  const plansByType = activePlans.reduce((acc, plan) => {
    acc[plan.planType] = (acc[plan.planType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-700 bg-green-100';
      case 'expired':
        return 'text-slate-600 bg-slate-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getUtilizationColor = (utilization: number | undefined) => {
    if (!utilization) return 'text-slate-600';
    if (utilization >= 90) return 'text-green-700';
    if (utilization >= 70) return 'text-yellow-700';
    return 'text-red-700';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

  const getMonthsRemaining = (endDate: string | undefined) => {
    if (!endDate) return null;
    const months = Math.floor((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
    return months;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Active Plans</h3>
          <p className="text-3xl font-bold text-slate-800">{activePlans.length}</p>
          <p className="text-xs text-slate-500 mt-1">Savings Plans</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Monthly Commitment</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalCommitment)}</p>
          <p className="text-xs text-slate-500 mt-1">Hourly commitment × 730</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Savings</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
          <p className="text-xs text-slate-500 mt-1">vs On-Demand pricing</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Avg Utilization</h3>
          <p className={`text-3xl font-bold ${avgUtilization >= 90 ? 'text-green-600' : avgUtilization >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
            {avgUtilization.toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all plans</p>
        </div>
      </div>

      {/* Plan Type Distribution */}
      {activePlans.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Plan Type Distribution</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(plansByType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  type === 'Compute' ? 'bg-blue-500' :
                  type === 'EC2' ? 'bg-purple-500' : 'bg-green-500'
                }`} />
                <span className="text-sm font-medium text-slate-700">{type}</span>
                <span className="text-sm text-slate-500">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Status:</span>
              <div className="flex gap-1">
                {['all', 'active', 'expired', 'pending'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Type:</span>
              <div className="flex gap-1">
                {['all', 'Compute', 'EC2', 'SageMaker'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPlanTypeFilter(type as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      planTypeFilter === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Savings Plans List */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Savings Plans Found</h3>
          <p className="text-slate-600 mb-4">
            {filter === 'all' && planTypeFilter === 'all'
              ? 'You don\'t have any Savings Plans yet. Consider purchasing Savings Plans to save up to 72% on your AWS compute usage.'
              : 'No Savings Plans match your current filters.'}
          </p>
          {(filter !== 'all' || planTypeFilter !== 'all') && (
            <button
              onClick={() => { setFilter('all'); setPlanTypeFilter('all'); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan, index) => {
            const monthsRemaining = getMonthsRemaining(plan.end);
            const isExpiringSoon = monthsRemaining !== null && monthsRemaining <= 3 && monthsRemaining >= 0;

            return (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-sm border ${
                  isExpiringSoon ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200'
                } p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{plan.planType} Savings Plan</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                      {plan.paymentOption && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-700 bg-blue-100">
                          {plan.paymentOption}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">Plan ID: {plan.id}</p>
                  </div>
                  {isExpiringSoon && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
                      <svg className="w-4 h-4 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-yellow-700">Expires in {monthsRemaining} months</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Hourly Commitment</p>
                    <p className="text-lg font-semibold text-slate-800">{formatCurrency(plan.hourlyCommitment)}/hr</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Monthly Commitment</p>
                    <p className="text-lg font-semibold text-slate-800">{formatCurrency(plan.hourlyCommitment * 730)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Total Savings</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(plan.savingsAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Savings %</p>
                    <p className="text-lg font-semibold text-green-600">{(plan.savingsPercentage || 0).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Utilization</span>
                    <span className={`text-sm font-semibold ${getUtilizationColor(plan.utilizationPercentage)}`}>
                      {(plan.utilizationPercentage || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        (plan.utilizationPercentage || 0) >= 90 ? 'bg-green-600' :
                        (plan.utilizationPercentage || 0) >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(plan.utilizationPercentage || 0, 100)}%` }}
                    />
                  </div>
                  {plan.utilizationPercentage && plan.utilizationPercentage < 70 && (
                    <p className="text-xs text-red-600 mt-1">
                      Low utilization detected. Consider adjusting your commitment or workload patterns.
                    </p>
                  )}
                </div>

                {/* Date Range */}
                <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-slate-500">Start Date:</span>
                      <span className="ml-2 font-medium text-slate-700">{formatDate(plan.start)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">End Date:</span>
                      <span className="ml-2 font-medium text-slate-700">{formatDate(plan.end)}</span>
                    </div>
                    {plan.term && (
                      <div>
                        <span className="text-xs text-slate-500">Term:</span>
                        <span className="ml-2 font-medium text-slate-700">{plan.term}</span>
                      </div>
                    )}
                  </div>
                  {monthsRemaining !== null && monthsRemaining > 0 && (
                    <span className="text-xs text-slate-500">
                      {monthsRemaining} months remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      {activePlans.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Recommendations
          </h3>
          <ul className="space-y-2">
            {avgUtilization < 90 && (
              <li className="text-sm text-blue-800">
                • Your average Savings Plan utilization is {avgUtilization.toFixed(0)}%. Increase utilization by running more workloads to maximize savings.
              </li>
            )}
            {activePlans.some(p => (p.utilizationPercentage || 0) < 70) && (
              <li className="text-sm text-blue-800">
                • Some plans have low utilization. Consider right-sizing your commitment or consolidating workloads.
              </li>
            )}
            {activePlans.filter(p => {
              const months = getMonthsRemaining(p.end);
              return months !== null && months <= 3;
            }).length > 0 && (
              <li className="text-sm text-blue-800">
                • Plans expiring soon. Review your compute usage patterns and consider renewing with adjusted commitments.
              </li>
            )}
            <li className="text-sm text-blue-800">
              • Savings Plans offer more flexibility than Reserved Instances. Consider Compute Savings Plans for maximum flexibility across EC2, Lambda, and Fargate.
            </li>
          </ul>
        </div>
      )}

      {/* Info Section */}
      {/* {savingsPlans.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">About Savings Plans</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <strong>Savings Plans</strong> offer flexible pricing models that provide significant savings on AWS compute usage in exchange for a commitment to a consistent amount of usage (measured in $/hour) for a 1 or 3 year term.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Compute Savings Plans</h4>
                <p className="text-xs text-slate-600">
                  Most flexible. Up to 66% savings. Applies to EC2, Lambda, and Fargate usage regardless of region, instance family, size, or OS.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-purple-800 mb-2">EC2 Instance Savings Plans</h4>
                <p className="text-xs text-slate-600">
                  Up to 72% savings. Applies to EC2 usage within a selected instance family in a chosen region. Flexible across size, OS, and tenancy.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-green-800 mb-2">SageMaker Savings Plans</h4>
                <p className="text-xs text-slate-600">
                  Up to 64% savings on SageMaker instance usage regardless of instance family, size, or region.
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SavingsPlansPanel;
