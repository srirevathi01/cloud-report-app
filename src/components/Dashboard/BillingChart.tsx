import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Expand, DollarSign, TrendingUp } from '../icons';
import { MonthlyBilling } from '../../types';
import ExpandableChartModal from './ExpandableChartModal';

interface BillingChartProps {
  data: MonthlyBilling[];
  loading?: boolean;
}

const BillingChart: React.FC<BillingChartProps> = ({ data, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalBilling = data.reduce((sum, item) => sum + item.amount, 0);
  const averageBilling = data.length > 0 ? totalBilling / data.length : 0;
  const highestBilling = Math.max(...data.map(item => item.amount));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900">{data.accountName}</p>
          <p className="text-sm text-slate-600">
            {data.currency} {data.amount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">{data.month}</p>
          {data.trend && (
            <p className={`text-xs mt-1 ${
              data.trend === 'up' ? 'text-red-600' :
              data.trend === 'down' ? 'text-green-600' : 'text-slate-600'
            }`}>
              {data.changePercentage !== undefined &&
                `${data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'} ${Math.abs(data.changePercentage).toFixed(1)}%`
              }
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const ChartContent = ({ size = 'normal' }: { size?: 'normal' | 'expanded' }) => {
    const height = size === 'expanded' ? 400 : 250;
    const displayData = size === 'expanded' ? data : data.slice(0, 5);

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="accountName"
            tick={{ fontSize: 12 }}
            angle={size === 'expanded' ? 0 : -45}
            textAnchor="end"
            height={size === 'expanded' ? 40 : 80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="amount" fill="#10b981" name="Amount (USD)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-green-600 to-emerald-600"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ y: -4 }}
        className="group backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 relative"
      >
        {/* Gradient Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Billing</h3>
                <p className="text-xs text-slate-500 font-medium">Last month per account</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-200 group/btn"
              title="Expand chart"
            >
              <Expand className="w-5 h-5 text-slate-600 group-hover/btn:text-green-600 transition-colors" />
            </button>
          </div>

          {/* Chart */}
          <div className="px-6 pt-2">
            <ChartContent />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-6 pt-2">
            <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-slate-900">
                ${totalBilling.toLocaleString()}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">Total</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200/50 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-blue-600">
                ${averageBilling.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-blue-700 font-semibold mt-1">Average</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200/50 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-green-600">
                ${highestBilling.toLocaleString()}
              </div>
              <div className="text-xs text-green-700 font-semibold mt-1">Highest</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Modal */}
      <ExpandableChartModal
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title="Monthly Billing - Detailed View"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div className="text-4xl font-bold text-slate-900 mb-2">
                ${totalBilling.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total Billing</div>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                ${averageBilling.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-blue-700">Average per Account</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${highestBilling.toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Highest Account</div>
            </div>
          </div>
          <ChartContent size="expanded" />

          {/* Detailed Table */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Detailed Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Account</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">Amount</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Month</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((billing, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{billing.accountName}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                        {billing.currency} {billing.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600">{billing.month}</td>
                      <td className="px-4 py-3 text-center">
                        {billing.trend && billing.changePercentage !== undefined && (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            billing.trend === 'up' ? 'bg-red-100 text-red-700' :
                            billing.trend === 'down' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            <TrendingUp className={`w-3 h-3 ${
                              billing.trend === 'down' ? 'rotate-180' : ''
                            }`} />
                            {Math.abs(billing.changePercentage).toFixed(1)}%
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ExpandableChartModal>
    </>
  );
};

export default BillingChart;
