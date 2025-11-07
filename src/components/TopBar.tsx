import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-lg bg-white/95 border-b border-slate-200 shadow-md sticky top-0 z-50"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-3 sm:gap-4">
        {/* Logo and Title */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-3 flex-shrink-0"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-sm opacity-70 group-hover:opacity-90 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
              <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cloud Central
            </h1>
          </div>
        </motion.div>

        {/* Controls - Stack on mobile, inline on desktop */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap"
        >
          {/* AWS Account Selector */}
          <div className="flex-1 sm:flex-none group min-w-0">
            <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase tracking-wide">
              AWS Account
            </label>
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={(e) => onAccountChange(e.target.value)}
                className="w-full sm:w-auto pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl bg-white text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:min-w-[200px] hover:border-blue-400 transition-all shadow-md appearance-none cursor-pointer"
              >
                {awsAccounts.map((account) => (
                  <option key={account.id} value={account.accountId}>
                    {account.name} ({account.accountId})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Region Selector */}
          <div className="flex-1 sm:flex-none group min-w-0">
            <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase tracking-wide">
              Region
            </label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="w-full sm:w-auto pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl bg-white text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:min-w-[150px] hover:border-purple-400 transition-all shadow-md appearance-none cursor-pointer"
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
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* User Info and Sign Out */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl flex-1 sm:flex-none border border-slate-300 shadow-md min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-700 leading-tight truncate">{user?.username || 'User'}</div>
                {user?.email && <div className="text-[10px] text-slate-500 hidden md:block leading-tight truncate">{user.email}</div>}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="group px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl text-xs font-semibold transition-all whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex-shrink-0"
              title="Sign out"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TopBar;
