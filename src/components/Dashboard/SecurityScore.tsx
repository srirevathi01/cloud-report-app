import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from '../icons';
import { SecurityReportSummary } from '../../types';

interface SecurityScoreProps {
  summary: SecurityReportSummary;
  loading?: boolean;
}

const SecurityScore: React.FC<SecurityScoreProps> = ({ summary, loading }) => {
  // Calculate security score (percentage of passed controls)
  const securityScore = summary.total > 0
    ? Math.round((summary.passed / summary.total) * 100)
    : 0;

  // Determine color and status based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', bg: 'from-green-500 to-green-600', status: 'Excellent' };
    if (score >= 75) return { color: 'text-blue-600', bg: 'from-blue-500 to-blue-600', status: 'Good' };
    if (score >= 60) return { color: 'text-yellow-600', bg: 'from-yellow-500 to-yellow-600', status: 'Fair' };
    if (score >= 40) return { color: 'text-orange-600', bg: 'from-orange-500 to-orange-600', status: 'Poor' };
    return { color: 'text-red-600', bg: 'from-red-500 to-red-600', status: 'Critical' };
  };

  const scoreInfo = getScoreColor(securityScore);

  // Calculate circle progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (securityScore / 100) * circumference;

  if (loading) {
    return (
      <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${scoreInfo.bg} flex items-center justify-center shadow-lg`}>
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Score</h3>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="45"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="45"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              className={scoreInfo.color}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className={`text-4xl font-bold ${scoreInfo.color}`}
            >
              {securityScore}%
            </motion.div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
              {scoreInfo.status}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
        >
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Total</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.passed}</div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Passed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.failed}</div>
          <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">Failed</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SecurityScore;
