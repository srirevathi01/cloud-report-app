import React from 'react';
import { AlertCircle, ChevronRight } from './icons';
import { Resource } from '../types';
import { getResourceId, getResourceDisplayName } from '../utils/resourceHelpers';

interface ResourceListProps {
  resources: Resource[];
  selectedResource: Resource | null;
  loading: boolean;
  error: string | null;
  onResourceSelect: (resourceId: string) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  selectedResource,
  loading,
  error,
  onResourceSelect
}) => {
  return (
    <div className="w-96 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Resources</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            {resources.length} items
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && resources.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No resources found</p>
          </div>
        )}

        {!loading && !error && resources.length > 0 && (
          <div className="space-y-2">
            {resources.map((resource, index) => {
              const resourceId = getResourceId(resource);
              const displayName = getResourceDisplayName(resource);
              const hasFindings = resource.security_findings && resource.security_findings.length > 0;

              return (
                <button
                  key={index}
                  onClick={() => onResourceSelect(resourceId)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedResource && getResourceId(selectedResource) === resourceId
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">
                        {displayName}
                      </p>
                      {resource.State && (
                        <p className="text-xs text-slate-500 mt-1">
                          {typeof resource.State === 'object'
                            ? resource.State.Code || JSON.stringify(resource.State)
                            : resource.State}
                        </p>
                      )}
                      {resource.Status && (
                        <p className="text-xs text-slate-500 mt-1">
                          {typeof resource.Status === 'object'
                            ? resource.Status.Code || JSON.stringify(resource.Status)
                            : resource.Status}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {hasFindings && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceList;
