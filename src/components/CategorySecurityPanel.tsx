import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
} from './icons';
import { SecurityIssue, SecurityStats, Category } from '../types';
import { categorySecurityService } from '../services/categorySecurityService';
import { getSeverityColor } from '../utils/resourceHelpers';
import { logger } from '../utils/logger';

interface CategorySecurityPanelProps {
  category: Category;
  accountId: string;
  region: string;
  onNavigateToResource: (service: string, resourceId: string) => void;
}

const CategorySecurityPanel: React.FC<CategorySecurityPanelProps> = ({
  category,
  accountId,
  region,
  onNavigateToResource,
}) => {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState<SecurityStats>({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
  });
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [issuesBySeverity, setIssuesBySeverity] = useState<Record<string, SecurityIssue[]>>({});

  // Reset state when category changes
  useEffect(() => {
    setExpanded(false);
    setStats({
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    });
    setIssues([]);
    setSelectedSeverity(null);
    setIssuesBySeverity({});
  }, [category.id]);

  useEffect(() => {
    if (expanded && accountId) {
      loadSecurityData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, accountId, region, category.id]);

  const loadSecurityData = async (forceRefresh: boolean = false) => {
    setLoading(true);
    try {
      logger.log(`Loading security data for ${category.name}...`);

      const result = await categorySecurityService.fetchCategorySecurity(
        category,
        accountId,
        region,
        forceRefresh
      );

      setStats(result.stats);
      setIssues(result.issues);

      // Group by severity
      const grouped = categorySecurityService.groupBySeverity(result.issues);
      setIssuesBySeverity(grouped);

      logger.log(`Loaded ${result.stats.total} issues for ${category.name}`);
    } catch (err) {
      logger.error(`Error loading security data for ${category.name}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    categorySecurityService.clearCache(category.id);
    loadSecurityData(true);
  };

  const handleIssueClick = (issue: SecurityIssue) => {
    onNavigateToResource(issue.service, issue.resourceId);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const severityLevels = [
    { key: 'critical', label: 'Critical', count: stats.critical, color: 'text-red-600' },
    { key: 'high', label: 'High', count: stats.high, color: 'text-orange-600' },
    { key: 'medium', label: 'Medium', count: stats.medium, color: 'text-yellow-600' },
    { key: 'low', label: 'Low', count: stats.low, color: 'text-blue-600' },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Compact Header - Always Visible */}
      <div
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-blue-100 transition-all group cursor-pointer"
      >
        <div
          className="flex items-center gap-3 flex-1"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={`p-1.5 rounded-lg ${stats.total > 0 ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Shield className={`w-4 h-4 ${stats.total > 0 ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
              Security Insights
              {stats.total > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                  {stats.total}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Inline severity badges - only show when collapsed */}
          {!expanded && stats.total > 0 && (
            <div className="flex items-center gap-1.5">
              {stats.critical > 0 && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                  {stats.critical} C
                </span>
              )}
              {stats.high > 0 && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">
                  {stats.high} H
                </span>
              )}
              {stats.medium > 0 && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
                  {stats.medium} M
                </span>
              )}
              {stats.low > 0 && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                  {stats.low} L
                </span>
              )}
            </div>
          )}

          {/* Refresh Button */}
          {stats.total >= 0 && expanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={loading}
              className="p-1.5 hover:bg-blue-200 rounded-lg transition-all disabled:opacity-50"
              title="Refresh security data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-700 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <div onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content with smooth animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="border-t border-blue-200 bg-white">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-xs text-slate-600">Analyzing security...</p>
            </div>
          ) : stats.total === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <Shield className="w-10 h-10 mx-auto mb-2 text-green-500 opacity-50" />
              <p className="font-medium text-green-700 text-sm">All Clear!</p>
              <p className="text-xs mt-1">No security issues found</p>
            </div>
          ) : (
            <>
              {/* Compact Severity Filters */}
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <div className="flex flex-wrap gap-1.5">
                  {severityLevels.map((level) => (
                    <button
                      key={level.key}
                      onClick={() =>
                        setSelectedSeverity(selectedSeverity === level.key ? null : level.key)
                      }
                      disabled={level.count === 0}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                        level.count === 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : selectedSeverity === level.key
                          ? `${getSeverityColor(level.key)} shadow-md ring-2 ring-offset-1`
                          : `${getSeverityColor(level.key)} hover:shadow-sm`
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {getSeverityIcon(level.key)}
                        <span>{level.label}</span>
                        <span className="font-bold">({level.count})</span>
                      </div>
                    </button>
                  ))}

                  {selectedSeverity && (
                    <button
                      onClick={() => setSelectedSeverity(null)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Issues List - Fixed Height */}
              <div className="h-80 overflow-y-auto divide-y divide-slate-200 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {(selectedSeverity ? issuesBySeverity[selectedSeverity] || [] : issues).map(
                  (issue, index) => (
                    <button
                      key={index}
                      onClick={() => handleIssueClick(issue)}
                      className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`p-1 rounded ${getSeverityColor(issue.finding.severity)}`}>
                            {getSeverityIcon(issue.finding.severity)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(
                                issue.finding.severity
                              )}`}
                            >
                              {issue.finding.severity}
                            </span>
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {issue.service}
                            </span>
                            {issue.finding.type && (
                              <span className="text-xs text-slate-500">{issue.finding.type}</span>
                            )}
                          </div>

                          <h4 className="font-medium text-sm text-slate-800 mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {issue.resourceName}
                          </h4>

                          <p className="text-xs text-slate-600 mb-1 line-clamp-2">
                            {issue.finding.message}
                          </p>

                          {issue.finding.recommendation && (
                            <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 mt-1.5">
                              <p className="text-xs text-blue-800 line-clamp-2">
                                <strong>💡 Tip:</strong> {issue.finding.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                )}

                {selectedSeverity &&
                  (!issuesBySeverity[selectedSeverity] ||
                    issuesBySeverity[selectedSeverity].length === 0) && (
                    <div className="p-8 text-center text-slate-500">
                      <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No {selectedSeverity} severity issues</p>
                    </div>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySecurityPanel;
