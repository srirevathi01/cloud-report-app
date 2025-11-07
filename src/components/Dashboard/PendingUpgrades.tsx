import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, AlertTriangle, Info } from '../icons';
import { PendingUpgrade } from '../../types';

interface PendingUpgradesProps {
  data: PendingUpgrade[];
  loading?: boolean;
}

const PendingUpgrades: React.FC<PendingUpgradesProps> = ({ data, loading }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'scheduled':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <Info className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-purple-600 to-pink-600"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      whileHover={{ y: -4 }}
      className="group backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 relative"
    >
      {/* Gradient Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-slate-100/50">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Pending Version Upgrades</h3>
            <p className="text-xs text-slate-500 font-medium">{data.length} upgrades pending</p>
          </div>
        </div>

        {/* Upgrades List */}
        <div className="space-y-3 max-h-96 overflow-y-auto p-6">
          {data.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-slate-600 font-medium">All services are up to date</p>
              <p className="text-sm text-slate-500 mt-1">No pending upgrades</p>
            </div>
          ) : (
            data.map((upgrade) => (
              <div
                key={upgrade.id}
                className="p-4 border border-slate-200/50 rounded-xl hover:border-purple-300 hover:shadow-md transition-all bg-white/50"
              >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{upgrade.serviceName}</h4>
                    {getPriorityIcon(upgrade.priority)}
                  </div>
                  <p className="text-sm text-slate-600">{upgrade.accountName}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(upgrade.priority)}`}>
                    {upgrade.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(upgrade.upgradeStatus)}`}>
                    {upgrade.upgradeStatus}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Current:</span>
                  <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {upgrade.currentVersion}
                  </span>
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Target:</span>
                  <span className="font-mono font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    {upgrade.targetVersion}
                  </span>
                </div>
              </div>
              {upgrade.scheduledDate && (
                <div className="mt-2 text-xs text-slate-500">
                  Scheduled: {new Date(upgrade.scheduledDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ))
        )}
        </div>

        {/* Summary Footer */}
        {data.length > 0 && (
          <div className="p-6 pt-4 border-t border-slate-200/50">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl border border-red-200/50">
                <div className="text-xl font-bold text-red-600">
                  {data.filter(u => u.priority === 'high').length}
                </div>
                <div className="text-xs text-red-700 font-semibold mt-1">High Priority</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl border border-yellow-200/50">
                <div className="text-xl font-bold text-yellow-600">
                  {data.filter(u => u.priority === 'medium').length}
                </div>
                <div className="text-xs text-yellow-700 font-semibold mt-1">Medium</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200/50">
                <div className="text-xl font-bold text-green-600">
                  {data.filter(u => u.priority === 'low').length}
                </div>
                <div className="text-xs text-green-700 font-semibold mt-1">Low</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PendingUpgrades;
