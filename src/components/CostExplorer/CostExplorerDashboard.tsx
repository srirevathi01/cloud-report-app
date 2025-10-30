import React, { useState, useCallback, useEffect } from 'react';
import { CostFilter, CostExplorerData, Budget, ReservedInstance, SavingsPlan, CostAllocationTag } from '../../types';
import { apiService } from '../../services/api';
import { logger } from '../../utils/logger';
import CostFilters from './CostFilters';
import CostChart from './CostChart';
import BudgetManager from './BudgetManager';
import ReservedInstancePanel from './ReservedInstancePanel';
import SavingsPlansPanel from './SavingsPlansPanel';
import CostAllocationPanel from './CostAllocationPanel';
import CostTable from './CostTable';

interface CostExplorerDashboardProps {
  accountId: string;
  region: string;
}

const CostExplorerDashboard: React.FC<CostExplorerDashboardProps> = ({ accountId, region }) => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'budgets' | 'ri' | 'savings-plans' | 'tags'>('explorer');
  const [costData, setCostData] = useState<CostExplorerData | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [reservedInstances, setReservedInstances] = useState<ReservedInstance[]>([]);
  const [savingsPlans, setSavingsPlans] = useState<SavingsPlan[]>([]);
  const [allocationTags, setAllocationTags] = useState<CostAllocationTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CostFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    granularity: 'DAILY',
    groupBy: 'SERVICE'
  });

  const fetchCostData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      logger.log('Fetching cost explorer data with filters:', filters);
      const data = await apiService.fetchCostExplorerData(accountId, region, filters);
      setCostData(data);
      logger.log('Cost explorer data loaded successfully');
    } catch (err: any) {
      logger.error('Error fetching cost data:', err);
      setError(err.message || 'Failed to load cost data');
    } finally {
      setLoading(false);
    }
  }, [accountId, region, filters]);

  const fetchBudgets = useCallback(async () => {
    try {
      const data = await apiService.fetchBudgets(accountId, region);
      setBudgets(data);
    } catch (err: any) {
      logger.error('Error fetching budgets:', err);
    }
  }, [accountId, region]);

  const fetchReservedInstances = useCallback(async () => {
    try {
      const data = await apiService.fetchReservedInstances(accountId, region);
      setReservedInstances(data);
    } catch (err: any) {
      logger.error('Error fetching reserved instances:', err);
    }
  }, [accountId, region]);

  const fetchSavingsPlans = useCallback(async () => {
    try {
      const data = await apiService.fetchSavingsPlans(accountId, region);
      setSavingsPlans(data);
    } catch (err: any) {
      logger.error('Error fetching savings plans:', err);
    }
  }, [accountId, region]);

  const fetchAllocationTags = useCallback(async () => {
    try {
      const data = await apiService.fetchCostAllocationTags(accountId, region);
      setAllocationTags(data);
    } catch (err: any) {
      logger.error('Error fetching allocation tags:', err);
    }
  }, [accountId, region]);

  useEffect(() => {
    if (activeTab === 'explorer') {
      fetchCostData();
    } else if (activeTab === 'budgets') {
      fetchBudgets();
    } else if (activeTab === 'ri') {
      fetchReservedInstances();
    } else if (activeTab === 'savings-plans') {
      fetchSavingsPlans();
    } else if (activeTab === 'tags') {
      fetchAllocationTags();
    }
  }, [activeTab, fetchCostData, fetchBudgets, fetchReservedInstances, fetchSavingsPlans, fetchAllocationTags]);

  const handleFilterChange = (newFilters: Partial<CostFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Billing</h1>
            <p className="text-sm text-slate-600 mt-1">Visualize, understand, and manage your AWS costs and usage over time</p>
          </div>
          {/* <ExportMenu
            costData={costData}
            filters={filters}
            onExport={(format: string) => logger.log('Exporting to', format)}
          /> */}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'explorer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Cost Explorer
          </button>
          {/* <button
            onClick={() => setActiveTab('budgets')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'budgets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Budgets
          </button> */}
          <button
            onClick={() => setActiveTab('ri')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'ri'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Reserved Instances
          </button>
          <button
            onClick={() => setActiveTab('savings-plans')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'savings-plans'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Savings Plans
          </button>
          {/* <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'tags'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Cost Allocation Tags
          </button> */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1600px] mx-auto">
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              {/* Filters */}
              <CostFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={fetchCostData}
                loading={loading}
              />

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading cost data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-red-800 font-semibold mb-1">Error Loading Cost Data</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                      <button
                        onClick={fetchCostData}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              ) : costData && costData.summary ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <h3 className="text-sm font-medium text-slate-600 mb-2">Total Cost</h3>
                      <p className="text-2xl font-bold text-slate-800">{formatCurrency(costData.summary.total || 0)}</p>
                      <p className="text-xs text-slate-500 mt-1">For selected period</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <h3 className="text-sm font-medium text-slate-600 mb-2">Average Monthly Cost</h3>
                      <p className="text-2xl font-bold text-slate-800">{formatCurrency(costData.summary.average || 0)}</p>
                      <p className="text-xs text-slate-500 mt-1">Per day average</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <h3 className="text-sm font-medium text-slate-600 mb-2">Change from Previous</h3>
                      <p className={`text-2xl font-bold ${(costData.summary.change || 0) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {(costData.summary.change || 0) >= 0 ? '+' : ''}{formatCurrency(costData.summary.change || 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(costData.summary.changePercentage || 0) >= 0 ? '+' : ''}{(costData.summary.changePercentage || 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <h3 className="text-sm font-medium text-slate-600 mb-2">Top Service</h3>
                      <p className="text-lg font-bold text-slate-800">
                        {(costData.topServices && costData.topServices[0]?.service) || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {costData.topServices && costData.topServices[0] ? formatCurrency(costData.topServices[0].amount) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  {costData.timeSeries && costData.timeSeries.length > 0 && (
                    <CostChart data={costData} filters={filters} />
                  )}

                  {/* Data Table */}
                  {costData.timeSeries && costData.timeSeries.length > 0 && (
                    <CostTable data={costData} filters={filters} />
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-slate-600">
                  <p>No cost data available. Adjust your filters and try again.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'budgets' && (
            <BudgetManager
              budgets={budgets}
              onBudgetCreate={() => fetchBudgets()}
              onBudgetUpdate={() => fetchBudgets()}
              onBudgetDelete={() => fetchBudgets()}
            />
          )}

          {activeTab === 'ri' && (
            <ReservedInstancePanel
              reservedInstances={reservedInstances}
              onRefresh={fetchReservedInstances}
            />
          )}

          {activeTab === 'savings-plans' && (
            <SavingsPlansPanel
              savingsPlans={savingsPlans}
              onRefresh={fetchSavingsPlans}
            />
          )}

          {activeTab === 'tags' && (
            <CostAllocationPanel
              tags={allocationTags}
              onRefresh={fetchAllocationTags}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CostExplorerDashboard;
