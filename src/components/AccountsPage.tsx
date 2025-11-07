import React, { useState } from 'react';
import { Plus, Trash2, Save, X } from './icons';
import { AWSAccount } from '../types';
import AlertModal from './AlertModal';

interface AccountsPageProps {
  accounts: AWSAccount[];
  selectedAccount: string;
  onAccountSelect: (accountId: string) => void;
  onSetDefault: (id: string) => void;
  onDeleteAccount: (id: string) => void;
  onAddAccount: (account: AWSAccount) => void;
}

// Input sanitization helper
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, ''); // Remove angle brackets to prevent XSS
};

// Validate AWS Account ID format
const validateAccountId = (id: string): boolean => {
  // AWS Account IDs are exactly 12 digits
  return /^\d{12}$/.test(id);
};

// Validate account name
const validateAccountName = (name: string): boolean => {
  // Must be non-empty and contain only alphanumeric, spaces, hyphens, underscores
  return /^[a-zA-Z0-9\s\-_]{1,100}$/.test(name);
};

const AccountsPage: React.FC<AccountsPageProps> = ({
  accounts,
  selectedAccount,
  onAccountSelect,
  onSetDefault,
  onDeleteAccount,
  onAddAccount
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; account: AWSAccount | null }>({
    show: false,
    account: null
  });

  const handleNameChange = (value: string) => {
    setAccountName(value.slice(0, 100));
    setError(null);
    setSuccess(null);
  };

  const handleIdChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 12);
    setAccountId(digitsOnly);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const sanitizedName = sanitizeInput(accountName);
    const sanitizedId = accountId.trim();

    if (!sanitizedName) {
      setError('Account name is required');
      return;
    }

    if (!validateAccountName(sanitizedName)) {
      setError('Account name must contain only letters, numbers, spaces, hyphens, and underscores (max 100 characters)');
      return;
    }

    if (!validateAccountId(sanitizedId)) {
      setError('Account ID must be exactly 12 digits');
      return;
    }

    // Check for duplicate account ID
    if (accounts.some(acc => acc.accountId === sanitizedId)) {
      setError('This account ID already exists');
      return;
    }

    // Check for duplicate account name
    if (accounts.some(acc => acc.name.toLowerCase() === sanitizedName.toLowerCase())) {
      setError('This account name already exists');
      return;
    }

    const newAccount: AWSAccount = {
      id: Date.now().toString(),
      name: sanitizedName,
      accountId: sanitizedId,
      isDefault: accounts.length === 0
    };

    onAddAccount(newAccount);
    setAccountName('');
    setAccountId('');
    setSuccess(`Account "${sanitizedName}" added successfully!`);
    setShowAddForm(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setAccountName('');
    setAccountId('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">AWS Accounts</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Manage your AWS accounts. Select an account to use it in the dashboard.
                </p>
              </div>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  data-add-account-btn
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold shadow-sm hover:shadow"
                >
                  <Plus className="w-5 h-5" />
                  Add Account
                </button>
              )}
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Add Account Form (Collapsible) */}
            {showAddForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Add New AWS Account
                  </h3>
                  <button
                    onClick={handleCancelAdd}
                    className="p-1 text-slate-500 hover:text-slate-700 hover:bg-white rounded transition-all"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Account Name
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g., Production, Development"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        maxLength={100}
                        autoFocus
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {accountName.length}/100 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        AWS Account ID
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountId}
                        onChange={(e) => handleIdChange(e.target.value)}
                        placeholder="123456789012"
                        maxLength={12}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono bg-white"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {accountId.length}/12 digits
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      Save Account
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAdd}
                      className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg transition-all text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Count */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-600">
                Total accounts: <span className="font-semibold text-slate-800">{accounts.length}</span>
              </p>
              {accounts.length === 0 && !showAddForm && (
                <p className="text-amber-600 font-medium">Click "Add Account" to get started</p>
              )}
            </div>
          </div>

          {/* Accounts List */}
          {accounts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div className="bg-slate-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No accounts configured</h3>
              <p className="text-sm text-slate-600">Add your first AWS account to start using the dashboard</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`bg-white border rounded-lg p-5 transition-all cursor-pointer hover:shadow-md ${
                    selectedAccount === account.accountId
                      ? 'border-blue-400 bg-blue-50 shadow-sm ring-2 ring-blue-200'
                      : account.isDefault
                      ? 'border-blue-200 hover:border-blue-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => onAccountSelect(account.accountId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800 text-lg">{account.name}</h3>
                        {account.isDefault && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                        {selectedAccount === account.accountId && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        Account ID: <span className="font-mono font-medium text-slate-800">{account.accountId}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!account.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetDefault(account.id);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-all"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete({ show: true, account });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                        title="Delete account"
                        aria-label={`Delete ${account.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help Section */}
          {/* <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              How to find your AWS Account ID
            </h3>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside ml-6">
              <li>Sign in to the AWS Management Console</li>
              <li>Click on your account name in the top-right corner</li>
              <li>Your 12-digit Account ID will be displayed in the dropdown</li>
            </ol>
          </div> */}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete.show && confirmDelete.account && (
        <AlertModal
          type="warning"
          title="Confirm Delete"
          message={`Are you sure you want to delete "${confirmDelete.account.name}"? This action cannot be undone.`}
          onClose={() => setConfirmDelete({ show: false, account: null })}
          showCloseButton={false}
          actions={
            <>
              <button
                onClick={() => setConfirmDelete({ show: false, account: null })}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.account) {
                    onDeleteAccount(confirmDelete.account.id);
                    setConfirmDelete({ show: false, account: null });
                  }
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          }
        />
      )}
    </div>
  );
};

export default AccountsPage;
