import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resource } from '../types';
import { X, AlertCircle, CheckCircle, XCircle } from './icons';
import { getResourceDisplayName, getSeverityColor } from '../utils/resourceHelpers';

interface ResourceModalProps {
  resource: Resource | null;
  onClose: () => void;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ resource, onClose }) => {
  if (!resource) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <XCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Get key-value pairs to display (excluding internal fields)
  const getDisplayProperties = () => {
    const excludeKeys = ['security_findings', 'recommendations'];
    const entries = Object.entries(resource)
      .filter(([key, value]) =>
        !excludeKeys.includes(key) &&
        value !== null &&
        value !== undefined &&
        value !== '' &&
        (typeof value !== 'object' || (typeof value === 'object' && !Array.isArray(value)))
      )
      .slice(0, 12); // Limit to first 12 properties

    return entries;
  };

  const displayProperties = getDisplayProperties();
  const securityFindings = resource.security_findings || [];
  const recommendations = resource.recommendations || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0.25 }}
              className="relative backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient Background Accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 pointer-events-none"></div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative z-10 px-6 py-5 border-b border-slate-200 flex items-center justify-between backdrop-blur-lg bg-gradient-to-r from-blue-50/60 to-purple-50/60"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-medium bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      Resource Details
                    </h2>
                    <p className="text-sm text-slate-600 font-medium mt-0.5">
                      {getResourceDisplayName(resource)}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-50"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </motion.div>

            {/* Content */}
            <div className="relative z-10 overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="p-6 space-y-6">
                {/* Properties Grid */}
                {displayProperties.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider">
                        Properties
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayProperties.map(([key, value], index) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="group backdrop-blur-sm bg-white/60 rounded-xl p-4 border border-slate-200/50 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <dt className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm text-slate-700 font-medium break-all">
                            {typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </dd>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Security Findings */}
                {securityFindings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Security Findings ({securityFindings.length})
                    </h3>
                    <div className="space-y-3">
                      {securityFindings.map((finding, index) => (
                        <div
                          key={index}
                          className={`rounded-lg p-4 border-l-4 ${getSeverityColor(finding.severity)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getSeverityIcon(finding.severity)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium uppercase tracking-wider">
                                  {finding.severity}
                                </span>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs text-slate-600">
                                  {finding.type}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 font-medium mb-2">
                                {finding.message}
                              </p>
                              {finding.recommendation && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <p className="text-xs font-medium text-slate-600 mb-1">
                                    Recommendation:
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    {finding.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Recommendations ({recommendations.length})
                    </h3>
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <AlertCircle className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium uppercase tracking-wider text-blue-700">
                                  {rec.type}
                                </span>
                              </div>
                              <p className="text-sm text-blue-700 font-medium mb-2">
                                {rec.message}
                              </p>
                              {rec.recommendation && (
                                <div className="mt-2 pt-2 border-t border-blue-200">
                                  <p className="text-xs font-medium text-blue-600 mb-1">
                                    Action:
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    {rec.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No additional data */}
                {displayProperties.length === 0 &&
                 securityFindings.length === 0 &&
                 recommendations.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600">No additional details available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 px-6 py-4 border-t border-slate-200 backdrop-blur-lg bg-gradient-to-r from-blue-50/60 to-purple-50/60 flex justify-end gap-3"
            >
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl hover:from-blue-500 hover:to-purple-600 transition-all font-medium shadow-md"
              >
                Close
              </motion.button>
            </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ResourceModal;
