import React, { useState } from 'react';
import { CostExplorerData, CostFilter } from '../../types';

interface CostTableProps {
  data: CostExplorerData;
  filters: CostFilter;
}

const CostTable: React.FC<CostTableProps> = ({ data }) => {
  const [sortColumn, setSortColumn] = useState<string>('amount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Flatten time series data for table view
  const tableData = data.timeSeries.flatMap(item =>
    Object.entries(item.breakdown).map(([service, amount]) => ({
      date: item.date,
      service,
      amount,
      percentage: (amount / item.amount) * 100
    }))
  );

  // Sort data
  const sortedData = [...tableData].sort((a, b) => {
    const aVal = a[sortColumn as keyof typeof a];
    const bVal = b[sortColumn as keyof typeof b];
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Cost Breakdown</h2>
        <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                onClick={() => handleSort('date')}
              >
                Date {sortColumn === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                onClick={() => handleSort('service')}
              >
                Service {sortColumn === 'service' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                onClick={() => handleSort('amount')}
              >
                Cost {sortColumn === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-800">
                  {new Date(row.date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-sm text-slate-800">{row.service}</td>
                <td className="py-3 px-4 text-sm text-slate-800 text-right font-medium">
                  {formatCurrency(row.amount)}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 text-right">
                  {row.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostTable;
