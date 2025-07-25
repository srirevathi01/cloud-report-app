import React, { useState } from 'react';
import { useIsAuthenticated } from "@azure/msal-react";
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './App.css';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [activeMenu, setActiveMenu] = useState('');
  const [activeSubMenu, setActiveSubMenu] = useState('');

  const handleAccountChange = (account) => {
    setSelectedAccount(account);
    // Reset menu selections when account changes
    setActiveMenu('');
    setActiveSubMenu('');
  };

  const handleMenuClick = (menuId, subMenuId = '') => {
    setActiveMenu(menuId);
    setActiveSubMenu(subMenuId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        selectedAccount={selectedAccount}
        onAccountChange={handleAccountChange}
        isAuthenticated={isAuthenticated}
      />
      
      {isAuthenticated && (
        <div className="flex h-[calc(100vh-73px)]">
          <Sidebar 
            selectedAccount={selectedAccount}
            onMenuClick={handleMenuClick}
          />
          
          <MainContent 
            selectedAccount={selectedAccount}
            activeMenu={activeMenu}
            activeSubMenu={activeSubMenu}
          />
        </div>
      )}
      
      {!isAuthenticated && (
        <div className="flex items-center justify-center h-[calc(100vh-73px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Cloud Dashboard
            </h2>
            <p className="text-gray-600">
              Please sign in with your Microsoft account to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

