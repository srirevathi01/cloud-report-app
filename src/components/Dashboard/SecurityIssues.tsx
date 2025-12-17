import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, Shield, AlertCircle, Info } from '../icons';
import { SecurityControl } from '../../types';
import ExpandableChartModal from './ExpandableChartModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SecurityIssuesProps {
  controls: SecurityControl[];
  loading?: boolean;
}

const SecurityIssues: React.FC<SecurityIssuesProps> = ({ controls, loading }) => {
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [showExpandModal, setShowExpandModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'failed' | 'passed'>('all');

  // Filter controls based on selected filter
  const filteredControls = controls.filter(control => {
    if (selectedFilter === 'failed') return control.status === 'FAILED';
    if (selectedFilter === 'passed') return control.status === 'PASSED';
    return true;
  });

  // Group controls by category (extracted from control ID)
  const groupedControls = filteredControls.reduce((acc, control) => {
    const category = control.control.split('.')[0]; // e.g., "EC2" from "EC2.1"
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(control);
    return acc;
  }, {} as Record<string, SecurityControl[]>);

  // Prepare data for visualization
  const statusData = [
    { name: 'Passed', value: controls.filter(c => c.status === 'PASSED').length, color: '#10b981' },
    { name: 'Failed', value: controls.filter(c => c.status === 'FAILED').length, color: '#ef4444' }
  ];

  const categoryData = Object.keys(groupedControls).map(category => ({
    category,
    passed: groupedControls[category].filter(c => c.status === 'PASSED').length,
    failed: groupedControls[category].filter(c => c.status === 'FAILED').length,
    total: groupedControls[category].length
  }));

  const getSeverityColor = (failedCount: number) => {
    if (failedCount === 0) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (failedCount <= 5) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (failedCount <= 10) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EC2':
      case 'S3':
      case 'RDS':
      case 'Lambda':
        return <Shield className="w-5 h-5" />;
      case 'IAM':
      case 'KMS':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Controls</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">AWS Security Hub Compliance</p>
              </div>
            </div>

            <button
              onClick={() => setShowExpandModal(true)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              View Charts
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'failed', 'passed'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedFilter === filter
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === 'failed' && ` (${controls.filter(c => c.status === 'FAILED').length})`}
                {filter === 'passed' && ` (${controls.filter(c => c.status === 'PASSED').length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Controls List */}
        <div className="p-6 max-h-[600px] overflow-y-auto space-y-3">
          {Object.keys(groupedControls).length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No controls found</p>
            </div>
          ) : (
            Object.keys(groupedControls).map(category => (
              <div key={category} className="space-y-2">
                {/* Category Header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-slate-700 dark:text-slate-300">
                    {getCategoryIcon(category)}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{category}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">
                    {groupedControls[category].length} controls
                  </span>
                </div>

                {/* Controls in Category */}
                {groupedControls[category].map(control => (
                  <motion.div
                    key={control.control}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      control.status === 'FAILED'
                        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                        : 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedControl(expandedControl === control.control ? null : control.control)}
                      className="w-full p-4 text-left hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                              {control.control}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              control.status === 'PASSED'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {control.status}
                            </span>
                            {control.status === 'FAILED' && (
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(control.failed_count)}`}>
                                {control.failed_count} Failed
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{control.name}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedControl === control.control ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedControl === control.control && control.failed_resources.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <div className="p-4 bg-white/50 dark:bg-slate-800/50">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                              Failed Resources ({control.failed_resources.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {control.failed_resources.map((resource, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                                >
                                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto">
                                    {JSON.stringify(resource, null, 2)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Expandable Chart Modal */}
      <ExpandableChartModal
        isOpen={showExpandModal}
        onClose={() => setShowExpandModal(false)}
        title="Security Controls Visualization"
      >
        <div className="space-y-8">
          {/* Status Distribution Pie Chart */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Status Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown Bar Chart */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Controls by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="category" className="text-slate-600 dark:text-slate-400" />
                <YAxis className="text-slate-600 dark:text-slate-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="passed" fill="#10b981" name="Passed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ExpandableChartModal>
    </>
  );
};

export default SecurityIssues;
