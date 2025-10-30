import React from 'react';
import { Cloud } from './icons';
import { AWSAccount } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  awsAccounts: AWSAccount[];
  selectedAccount: string;
  selectedRegion: string;
  regions: string[];
  onAccountChange: (accountId: string) => void;
  onRegionChange: (region: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  awsAccounts,
  selectedAccount,
  selectedRegion,
  regions,
  onAccountChange,
  onRegionChange
}) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Cloud Central</h1>
            <p className="text-xs text-slate-500">AWS Resource Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">AWS Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => onAccountChange(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              {awsAccounts.map((account) => (
                <option key={account.id} value={account.accountId}>
                  {account.name} ({account.accountId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.length > 0 ? (
                regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))
              ) : (
                <>
                  <option value="us-east-1">us-east-1</option>
                  <option value="ap-south-1">ap-south-1</option>
                </>
              )}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
              <div className="text-right">
                <div className="text-xs font-medium text-slate-700">{user?.username || 'User'}</div>
                {user?.email && <div className="text-xs text-slate-500">{user.email}</div>}
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-all"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
