import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AccountsOverviewChart from './AccountsOverviewChart';
import GlobalHealthDashboard from './GlobalHealthDashboard';
import BillingChart from './BillingChart';
import PendingUpgrades from './PendingUpgrades';
import DashboardAccountsTable from './DashboardAccountsTable';
import {
  AccountsOverview,
  MonthlyBilling,
  PendingUpgrade,
  DashboardAccount
} from '../../types';
import { apiService } from '../../services/api';
import { logger } from '../../utils/logger';

interface CloudDashboardProps {
  selectedRegion: string;
}

const CloudDashboard: React.FC<CloudDashboardProps> = ({ selectedRegion }) => {
  const [loading, setLoading] = useState(true);
  const [accountsOverview, setAccountsOverview] = useState<AccountsOverview>({
    totalAccounts: 0,
    activeAccounts: 0,
    inactiveAccounts: 0
  });
  const [billingData, setBillingData] = useState<MonthlyBilling[]>([]);
  const [pendingUpgrades, setPendingUpgrades] = useState<PendingUpgrade[]>([]);
  const [accounts, setAccounts] = useState<DashboardAccount[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedRegion]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data
      const [
        accountsData,
        billingDataRes,
        upgradesData,
        accountsTableData
      ] = await Promise.all([
        fetchAccountsOverview(),
        fetchBillingData(),
        fetchPendingUpgrades(),
        fetchAccounts()
      ]);

      setAccountsOverview(accountsData);
      setBillingData(billingDataRes);
      setPendingUpgrades(upgradesData);
      setAccounts(accountsTableData);
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountsOverview = async (): Promise<AccountsOverview> => {
    try {
      const response = await apiService.request<AccountsOverview>('/api/dashboard/accounts-overview', {}, true);
      if (response.data && typeof response.data === 'object' && 'totalAccounts' in response.data) {
        return response.data;
      }
      return { totalAccounts: 0, activeAccounts: 0, inactiveAccounts: 0 };
    } catch (error) {
      logger.error('Error fetching accounts overview:', error);
      return { totalAccounts: 0, activeAccounts: 0, inactiveAccounts: 0 };
    }
  };

  const fetchBillingData = async (): Promise<MonthlyBilling[]> => {
    try {
      const response = await apiService.request<MonthlyBilling[]>('/api/dashboard/monthly-billing', {}, true);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('Error fetching billing data:', error);
      return [];
    }
  };

  const fetchPendingUpgrades = async (): Promise<PendingUpgrade[]> => {
    try {
      const response = await apiService.request<PendingUpgrade[]>('/api/dashboard/pending-upgrades', {}, true);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('Error fetching pending upgrades:', error);
      return [];
    }
  };

  const fetchAccounts = async (): Promise<DashboardAccount[]> => {
    try {
      const response = await apiService.request<DashboardAccount[]>('/api/dashboard/accounts', {}, true);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      logger.error('Error fetching accounts:', error);
      return [];
    }
  };

  const handleEditAccount = (account: DashboardAccount) => {
    // Implement edit functionality
    logger.log('Edit account:', account);
  };

  const handleRemoveAccount = async (accountId: string) => {
    try {
      await apiService.request(`/api/dashboard/accounts/${accountId}`, {
        method: 'DELETE'
      }, false);
      // Refresh accounts list
      const updatedAccounts = await fetchAccounts();
      setAccounts(updatedAccounts);
      // Refresh overview
      const overview = await fetchAccountsOverview();
      setAccountsOverview(overview);
    } catch (error) {
      logger.error('Error removing account:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Accounts</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">{accountsOverview.totalAccounts}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Accounts</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{accountsOverview.activeAccounts}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Row - 3 Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <AccountsOverviewChart data={accountsOverview} loading={loading} />
          <GlobalHealthDashboard loading={loading} />
          <BillingChart data={billingData} loading={loading} />
        </motion.div>

        {/* Middle Row - Pending Upgrades (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <PendingUpgrades data={pendingUpgrades} loading={loading} />
        </motion.div>

        {/* Bottom Section - Accounts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <DashboardAccountsTable
            accounts={accounts}
            onEdit={handleEditAccount}
            onRemove={handleRemoveAccount}
            loading={loading}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CloudDashboard;
