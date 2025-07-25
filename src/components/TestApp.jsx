import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import '../App.css';

// Mock authentication component for testing
function TestApp() {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [activeMenu, setActiveMenu] = useState('');
  const [activeSubMenu, setActiveSubMenu] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Mock authentication toggle for testing
  const toggleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
    if (!isAuthenticated) {
      // Reset state when logging out
      setSelectedAccount('');
      setActiveMenu('');
      setActiveSubMenu('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Authentication Toggle */}
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-center">
        <span className="text-sm text-yellow-800 mr-4">
          Test Mode: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </span>
        <button 
          onClick={toggleAuth}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
        >
          {isAuthenticated ? 'Logout (Test)' : 'Login (Test)'}
        </button>
      </div>

      <Header 
        selectedAccount={selectedAccount}
        onAccountChange={handleAccountChange}
        isAuthenticated={isAuthenticated}
      />
      
      {isAuthenticated && (
        <div className="flex h-[calc(100vh-113px)]">
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
        <div className="flex items-center justify-center h-[calc(100vh-113px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Cloud Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Please sign in with your Microsoft account to continue.
            </p>
            <p className="text-sm text-gray-500">
              (Use the test toggle above to simulate authentication)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestApp;

