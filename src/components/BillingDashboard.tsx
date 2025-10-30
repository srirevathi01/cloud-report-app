import React, { useState, useEffect, useCallback } from 'react';
import { BillingData } from '../types';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

interface BillingDashboardProps {
  accountId: string;
  region: string;
}

const BillingDashboard: React.FC<BillingDashboardProps> = ({ accountId, region }) => {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'anomalies' | 'optimizations'>('overview');

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      logger.log('Fetching billing data for account:', accountId);
      const data = await apiService.fetchBillingData(accountId, region);
      setBillingData(data);
      logger.log('Billing data loaded successfully');
    } catch (err: any) {
      logger.error('Error fetching billing data:', err);
      setError(err.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, [accountId, region]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getMonthName = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold mb-1">Error Loading Billing Data</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={fetchBillingData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-slate-600">No billing data available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header with Summary Cards */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">AWS Billing & Cost Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total Spend Card */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Total Spend (6M)</h3>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(billingData.totalSpend)}</p>
                <p className="text-xs text-slate-500 mt-1">Last 6 months</p>
              </div>

              {/* Average Monthly Spend */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Avg Monthly</h3>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(billingData.averageMonthlySpend)}</p>
                <p className="text-xs text-slate-500 mt-1">Per month average</p>
              </div>

              {/* Cost Anomalies */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Anomalies</h3>
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-slate-800">{billingData.anomalies.length}</p>
                <p className="text-xs text-slate-500 mt-1">Requires attention</p>
              </div>

              {/* Potential Savings */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Potential Savings</h3>
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(billingData.optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0))}
                </p>
                <p className="text-xs text-slate-500 mt-1">Optimization opportunities</p>
              </div>
            </div>

            {/* View Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedView('overview')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedView === 'overview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                6-Month Overview
              </button>
              <button
                onClick={() => setSelectedView('detailed')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedView === 'detailed'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                3-Month Detailed
              </button>
              <button
                onClick={() => setSelectedView('anomalies')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedView === 'anomalies'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                Cost Anomalies
              </button>
              <button
                onClick={() => setSelectedView('optimizations')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedView === 'optimizations'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                Optimizations
              </button>
            </div>
          </div>

          {/* 6-Month Overview */}
          {selectedView === 'overview' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Last 6 Months Spending Trend</h3>
                <div className="space-y-3">
                  {billingData.last6Months.map((month, idx) => {
                    const maxAmount = Math.max(...billingData.last6Months.map(m => m.amount));
                    const percentage = (month.amount / maxAmount) * 100;

                    return (
                      <div key={month.month} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{getMonthName(month.month)}</span>
                          <span className="font-semibold text-slate-800">{formatCurrency(month.amount, month.currency)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Month Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Current Month - Top Services</h3>
                <div className="space-y-3">
                  {billingData.currentMonth.services.slice(0, 5).map(service => (
                    <div key={service.service} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{service.service}</span>
                          {service.trend && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              service.trend === 'up' ? 'bg-red-100 text-red-700' :
                              service.trend === 'down' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {service.trend === 'up' ? '↑' : service.trend === 'down' ? '↓' : '→'}
                              {service.changePercentage ? ` ${Math.abs(service.changePercentage).toFixed(1)}%` : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {service.percentage.toFixed(1)}% of total spend
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-800">{formatCurrency(service.amount, service.currency)}</div>
                        {service.changeAmount !== undefined && (
                          <div className={`text-xs ${service.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                            {service.changeAmount >= 0 ? '+' : ''}{formatCurrency(service.changeAmount, service.currency)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3-Month Detailed View */}
          {selectedView === 'detailed' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Last 3 Months - Service-wise Breakdown</h3>
              <div className="space-y-6">
                {billingData.last3MonthsDetailed.map(month => (
                  <div key={month.month} className="border-b border-slate-200 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-semibold text-slate-700">{getMonthName(month.month)}</h4>
                      <span className="text-lg font-bold text-slate-800">{formatCurrency(month.amount, month.currency)}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {month.services.map(service => (
                        <div key={service.service} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <div className="font-medium text-slate-800 text-sm">{service.service}</div>
                            <div className="text-xs text-slate-600">{service.percentage.toFixed(1)}%</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-800 text-sm">{formatCurrency(service.amount, service.currency)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Anomalies View */}
          {selectedView === 'anomalies' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Cost Anomalies & Unusual Spending Patterns</h3>
              {billingData.anomalies.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-600 font-medium">No cost anomalies detected</p>
                  <p className="text-slate-500 text-sm mt-1">Your spending patterns are normal</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingData.anomalies.map((anomaly, idx) => (
                    <div key={idx} className={`border rounded-lg p-4 ${getSeverityColor(anomaly.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getSeverityColor(anomaly.severity)}`}>
                            {anomaly.severity}
                          </span>
                          <h4 className="font-semibold text-slate-800">{anomaly.service}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-700">
                            +{formatCurrency(anomaly.changeAmount)}
                          </div>
                          <div className="text-sm text-red-600">
                            +{anomaly.changePercentage.toFixed(1)}% increase
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-slate-600">Previous Month:</span>
                          <span className="ml-2 font-medium text-slate-800">{formatCurrency(anomaly.previousMonth)}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Current Month:</span>
                          <span className="ml-2 font-medium text-slate-800">{formatCurrency(anomaly.currentMonth)}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded p-3 border border-slate-200">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-medium text-slate-700 text-sm">Recommendation:</p>
                            <p className="text-slate-600 text-sm mt-1">{anomaly.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cost Optimizations View */}
          {selectedView === 'optimizations' && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Cost Optimization Opportunities</h3>
              <div className="mb-4">
                <p className="text-sm text-slate-600">
                  Potential total savings: <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(billingData.optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0))}
                  </span> per month
                </p>
              </div>
              {billingData.optimizations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-600 font-medium">No optimization opportunities found</p>
                  <p className="text-slate-500 text-sm mt-1">Your resources are well-optimized</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingData.optimizations.map((optimization, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getPriorityColor(optimization.priority)}`}>
                            {optimization.priority} priority
                          </span>
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                            {optimization.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-600">Potential Savings</div>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(optimization.potentialSavings)}/mo
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="font-semibold text-slate-800 mb-1">{optimization.service}</h4>
                        <div className="text-sm text-slate-600">
                          Current monthly cost: <span className="font-medium text-slate-800">{formatCurrency(optimization.currentCost)}</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <div>
                            <p className="font-medium text-slate-700 text-sm">Recommendation:</p>
                            <p className="text-slate-600 text-sm mt-1">{optimization.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
