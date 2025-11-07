import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Expand, Users } from '../icons';
import { AccountsOverview } from '../../types';
import ExpandableChartModal from './ExpandableChartModal';

interface AccountsOverviewChartProps {
  data: AccountsOverview;
  loading?: boolean;
}

const COLORS = {
  active: '#10b981',
  inactive: '#ef4444'
};

const AccountsOverviewChart: React.FC<AccountsOverviewChartProps> = ({ data, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const chartData = [
    { name: 'Active', value: data.activeAccounts, color: COLORS.active },
    { name: 'Inactive', value: data.inactiveAccounts, color: COLORS.inactive }
  ];

  const ChartContent = ({ size = 'normal' }: { size?: 'normal' | 'expanded' }) => {
    const height = size === 'expanded' ? 400 : 250;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={size === 'expanded' ? 80 : 60}
            outerRadius={size === 'expanded' ? 140 : 90}
            paddingAngle={5}
            dataKey="value"
            label={size === 'expanded'}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-blue-600 to-purple-600"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -4 }}
        className="group backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 relative"
      >
        {/* Gradient Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Accounts Overview</h3>
                <p className="text-xs text-slate-500 font-medium">Distribution & Status</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 group/btn"
              title="Expand chart"
            >
              <Expand className="w-5 h-5 text-slate-600 group-hover/btn:text-blue-600 transition-colors" />
            </button>
          </div>

          {/* Chart */}
          <div className="px-6 pt-2">
            <ChartContent />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-6 pt-2">
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-slate-900">{data.totalAccounts}</div>
              <div className="text-xs text-slate-600 font-semibold mt-1">Total</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200/50 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-green-600">{data.activeAccounts}</div>
              <div className="text-xs text-green-700 font-semibold mt-1">Active</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl border border-red-200/50 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-red-600">{data.inactiveAccounts}</div>
              <div className="text-xs text-red-700 font-semibold mt-1">Inactive</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Modal */}
      <ExpandableChartModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title="Accounts Overview - Detailed View"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div className="text-4xl font-bold text-slate-900 mb-2">{data.totalAccounts}</div>
              <div className="text-sm text-slate-600">Total Accounts</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">{data.activeAccounts}</div>
              <div className="text-sm text-green-700">Active Accounts</div>
              <div className="text-xs text-green-600 mt-1">
                {((data.activeAccounts / data.totalAccounts) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <div className="text-4xl font-bold text-red-600 mb-2">{data.inactiveAccounts}</div>
              <div className="text-sm text-red-700">Inactive Accounts</div>
              <div className="text-xs text-red-600 mt-1">
                {((data.inactiveAccounts / data.totalAccounts) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <ChartContent size="expanded" />
        </div>
      </ExpandableChartModal>
    </>
  );
};

export default AccountsOverviewChart;
