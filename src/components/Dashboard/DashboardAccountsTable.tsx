import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Users, AlertCircle } from '../icons';
import { DashboardAccount } from '../../types';

interface DashboardAccountsTableProps {
  accounts: DashboardAccount[];
  onEdit: (account: DashboardAccount) => void;
  onRemove: (accountId: string) => void;
  loading?: boolean;
}

const DashboardAccountsTable: React.FC<DashboardAccountsTableProps> = ({
  accounts,
  onEdit,
  onRemove,
  loading
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleRemoveClick = (accountId: string) => {
    if (confirmDelete === accountId) {
      onRemove(accountId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(accountId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="backdrop-blur-lg bg-white/90 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">AWS Accounts Management</h3>
            <p className="text-sm text-slate-600 font-medium">{accounts.length} accounts configured</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Account Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Onboarding Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Project Manager
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Architect Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">No accounts found</p>
                    <p className="text-sm text-slate-500 mt-1">Add your first AWS account to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              accounts.map((account, index) => (
                <motion.tr
                  key={account.accountId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="font-semibold text-slate-900">{account.accountName}</div>
                      <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                        {account.accountId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(account.onboardedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {account.projectManager}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {account.architectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(account)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit account"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveClick(account.accountId)}
                        className={`p-2 rounded-lg transition-colors ${
                          confirmDelete === account.accountId
                            ? 'bg-red-100 text-red-700'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={confirmDelete === account.accountId ? 'Click again to confirm' : 'Remove account'}
                      >
                        {confirmDelete === account.accountId ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {accounts.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-600">
              Showing <span className="font-semibold text-slate-900">{accounts.length}</span> account(s)
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardAccountsTable;
