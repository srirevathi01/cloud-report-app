import React from 'react';
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Resource Details
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {getResourceDisplayName(resource)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6 space-y-6">
                {/* Properties Grid */}
                {displayProperties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                      Properties
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayProperties.map(([key, value]) => (
                        <div key={key} className="bg-slate-50 rounded-lg p-4">
                          <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm text-slate-900 font-medium break-all">
                            {typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Findings */}
                {securityFindings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
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
                                <span className="text-xs font-semibold uppercase tracking-wider">
                                  {finding.severity}
                                </span>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs text-slate-600">
                                  {finding.type}
                                </span>
                              </div>
                              <p className="text-sm text-slate-900 font-medium mb-2">
                                {finding.message}
                              </p>
                              {finding.recommendation && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <p className="text-xs font-semibold text-slate-700 mb-1">
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
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Recommendations ({recommendations.length})
                    </h3>
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <AlertCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                                  {rec.type}
                                </span>
                              </div>
                              <p className="text-sm text-blue-900 font-medium mb-2">
                                {rec.message}
                              </p>
                              {rec.recommendation && (
                                <div className="mt-2 pt-2 border-t border-blue-200">
                                  <p className="text-xs font-semibold text-blue-800 mb-1">
                                    Action:
                                  </p>
                                  <p className="text-xs text-blue-700">
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
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;
