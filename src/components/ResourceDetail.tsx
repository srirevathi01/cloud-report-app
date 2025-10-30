import React from 'react';
import { AlertCircle, XCircle, CheckCircle } from './icons';
import { Resource } from '../types';
import { getResourceDisplayName, getSeverityColor } from '../utils/resourceHelpers';

interface ResourceDetailProps {
  resource: Resource | null;
}

const ResourceDetail: React.FC<ResourceDetailProps> = ({ resource }) => {
  if (!resource) {
    return (
      <div className="flex-1 bg-slate-50 overflow-y-auto">
        <div className="flex items-center justify-center h-full text-slate-400">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a resource to view details</p>
            <p className="text-sm mt-2">Click on any resource from the list to see detailed information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            {getResourceDisplayName(resource)}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(resource)
              .filter(([key]) => !['security_findings', 'recommendations'].includes(key))
              .slice(0, 8)
              .map(([key, value]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-slate-800 font-medium truncate">
                    {value === null || value === undefined
                      ? '-'
                      : typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </p>
                </div>
              ))}
          </div>

          {resource.security_findings && resource.security_findings.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Security Findings
              </h4>
              <div className="space-y-3">
                {resource.security_findings.map((finding, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getSeverityColor(finding.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold uppercase">
                        {finding.severity}
                      </span>
                      <span className="text-xs bg-white px-2 py-1 rounded">
                        {finding.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{finding.message}</p>
                    {finding.recommendation && (
                      <p className="text-xs opacity-80">{finding.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resource.recommendations && resource.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                Recommendations
              </h4>
              <div className="space-y-3">
                {resource.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getSeverityColor(rec.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold uppercase">
                        {rec.severity}
                      </span>
                      <span className="text-xs bg-white px-2 py-1 rounded">
                        {rec.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{rec.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
