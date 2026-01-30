import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Database, Network, HardDrive, Shield, DollarSign, BarChart3 } from './components/icons';
import { AWSAccount, Category, Resource } from './types';
import { apiService } from './services/api';
import { storageService } from './utils/storage';
import { logger } from './utils/logger';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ErrorBoundary from './components/ErrorBoundary';
import TopBar from './components/TopBar';
import ServiceTabs from './components/ServiceTabs';
import ResourceTable from './components/ResourceTable';
import ResourceModal from './components/ResourceModal';
import Login from './components/Login';
import AccountsPage from './components/AccountsPage';
import AlertModal from './components/AlertModal';
import { CloudDashboard } from './components/Dashboard';

const categories: Category[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
    services: ['overview'],
    endpoint: '/api/dashboard'
  },
  {
    id: 'compute',
    name: 'Compute',
    icon: <Cloud className="w-5 h-5" />,
    services: ['ec2', 'lambda', 'ecs'],
    endpoint: '/api/compute'
  },
  {
    id: 'networking',
    name: 'Networking',
    icon: <Network className="w-5 h-5" />,
    services: ['vpc', 'route53', 'apigateway', 'elb'],
    endpoint: '/api/networking'
  },
  {
    id: 'database',
    name: 'Database',
    icon: <Database className="w-5 h-5" />,
    services: ['rds', 'aurora', 'dynamodb', 'elasticache'],
    endpoint: '/api/database'
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: <HardDrive className="w-5 h-5" />,
    services: ['s3', 'ebs', 'efs'],
    endpoint: '/api/storage'
  },
  {
    id: 'security',
    name: 'Security',
    icon: <Shield className="w-5 h-5" />,
    services: ['iam', 'kms', 'waf'],
    endpoint: '/api/security'
  }
  // {
  //   id: 'monitoring',
  //   name: 'Monitoring',
  //   icon: <Activity className="w-5 h-5" />,
  //   services: ['cloudwatch', 'cloudtrail', 'xray'],
  //   endpoint: '/api/monitoring'
  // },
  // {
  //   id: 'billing',
  //   name: 'Billing',
  //   icon: <DollarSign className="w-5 h-5" />,
  //   services: ['overview'],
  //   endpoint: '/api/billing'
  // }
];

const DEFAULT_REGION = 'us-east-1';

const DashboardContent: React.FC = () => {
  // const { isAuthenticated, isLoading: authLoading } = useAuth();
  // Initialize accounts from localStorage
  const initializeAccounts = (): AWSAccount[] => {
    const stored = storageService.getAccounts();
    if (stored.length > 0) {
      return stored;
    }
    return [];
  };

  const [awsAccounts, setAwsAccounts] = useState<AWSAccount[]>(initializeAccounts());
  const [selectedAccount, setSelectedAccount] = useState<string>(() => {
    const accounts = initializeAccounts();
    const defaultAccount = accounts.find(acc => acc.isDefault);
    return defaultAccount?.accountId || (accounts.length > 0 ? accounts[0].accountId : '');
  });
  const [selectedRegion, setSelectedRegion] = useState<string>(DEFAULT_REGION);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
  const [selectedService, setSelectedService] = useState<string>(categories[0].services[0]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingResourceId, setLoadingResourceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'accounts'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show error modal when error occurs
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // Fetch regions when account changes (only if authenticated)
  useEffect(() => {
    if (selectedAccount) {
      fetchRegions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount]);

  
  // Fetch resources when category, service, account, or region changes (only if authenticated)
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     // Don't make API calls if not authenticated
  //     return;
  //   }

  //   // Skip resource fetching for dashboard category (it handles its own data fetching)
  //   if (selectedCategory.id === 'dashboard') {
  //     return;
  //   }

  //   if (selectedAccount) {
  //     fetchResources();
  //   } else {
  //     setResources([]);
  //     setError('Please add an AWS account to get started');
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedCategory, selectedService, selectedAccount, selectedRegion, isAuthenticated]);
  useEffect(() => {
  if (selectedCategory.id === 'dashboard') {
    return;
  }

  if (selectedAccount) {
    fetchResources();
  } else {
    setResources([]);
    setError('Please add an AWS account to get started');
  }
}, [selectedCategory, selectedService, selectedAccount, selectedRegion]);


  const fetchRegions = async () => {
    if (!selectedAccount) return;

    try {
      logger.log('Fetching regions for account:', selectedAccount);
      const regions = await apiService.fetchRegions(selectedAccount);

      if (regions.length > 0) {
        setAvailableRegions(regions);
        logger.log('Loaded regions:', regions.length);

        if (!regions.includes(selectedRegion)) {
          setSelectedRegion(regions[0]);
        }
      } else {
        setAvailableRegions([]);
      }
    } catch (err) {
      logger.error('Error fetching regions:', err);
      setAvailableRegions([]);
    }
  };

  const fetchResources = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError(null);
    setSelectedResource(null);

    try {
      logger.log('Fetching resources:', {
        category: selectedCategory.id,
        service: selectedService,
        account: selectedAccount,
        region: selectedRegion
      });

      const resourceData = await apiService.fetchResources(
        selectedCategory.endpoint,
        selectedService,
        selectedAccount,
        selectedRegion
      );

      setResources(resourceData);
      logger.log(`Successfully loaded ${resourceData.length} ${selectedService} resource(s)`);
    } catch (err: any) {
      logger.error('Error fetching resources:', err);
      setError(err.message || 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceDetails = async (resourceId: string) => {
    if (!selectedAccount) return;

    setLoadingResourceId(resourceId);

    try {
      logger.log('Fetching resource details for:', resourceId);

      const details = await apiService.fetchResourceDetails(
        selectedCategory.endpoint,
        selectedService,
        selectedAccount,
        selectedRegion,
        resourceId
      );

      setSelectedResource(details);
      setIsModalOpen(true);
      setLoadingResourceId(null);
      logger.log('Loaded resource details for:', resourceId);
    } catch (err) {
      logger.error('Error fetching resource details:', err);
      setLoadingResourceId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    apiService.clearCache();
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    apiService.clearCache();
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedService(category.services[0]);
  };

  const handleAccountsUpdate = (updatedAccounts: AWSAccount[]) => {
    setAwsAccounts(updatedAccounts);
    storageService.saveAccounts(updatedAccounts);

    const accountExists = updatedAccounts.some(acc => acc.accountId === selectedAccount);
    if (!accountExists) {
      const defaultAccount = updatedAccounts.find(acc => acc.isDefault);
      if (defaultAccount) {
        setSelectedAccount(defaultAccount.accountId);
      } else if (updatedAccounts.length > 0) {
        setSelectedAccount(updatedAccounts[0].accountId);
      } else {
        setSelectedAccount('');
      }
    }
  };

  const handleAddAccount = (newAccount: AWSAccount) => {
    const updatedAccounts = [...awsAccounts, newAccount];
    handleAccountsUpdate(updatedAccounts);
  };

  const handleDeleteAccount = (id: string) => {
    const accountToRemove = awsAccounts.find(acc => acc.id === id);
    if (accountToRemove?.isDefault && awsAccounts.length > 1) {
      const updatedAccounts = awsAccounts
        .filter(acc => acc.id !== id)
        .map((acc, index) => ({
          ...acc,
          isDefault: index === 0
        }));
      handleAccountsUpdate(updatedAccounts);
    } else {
      handleAccountsUpdate(awsAccounts.filter(acc => acc.id !== id));
    }
  };

  const handleSetDefaultAccount = (id: string) => {
    const updatedAccounts = awsAccounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id
    }));
    handleAccountsUpdate(updatedAccounts);
  };

  // Show accounts view if no accounts are configured
  useEffect(() => {
    if (awsAccounts.length === 0) {
      setCurrentView('accounts');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show login page if not authenticated
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-slate-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return <Login />;
  // }

  return (
    <ErrorBoundary>
      <div className="h-screen bg-white dark:bg-slate-900 flex flex-col">
        <TopBar
          awsAccounts={awsAccounts}
          selectedAccount={selectedAccount}
          selectedRegion={selectedRegion}
          regions={availableRegions}
          onAccountChange={handleAccountChange}
          onRegionChange={handleRegionChange}
        />

        <div className="flex flex-1 overflow-hidden relative h-full">
          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden fixed bottom-4 right-4 z-50 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all"
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isSidebarOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </motion.svg>
          </motion.button>

          {/* Overlay for mobile */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <motion.div
            className={`
              fixed lg:static inset-y-0 left-0 z-[45]
              w-64 bg-white dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 shadow-xl overflow-y-auto
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
            initial={false}
            animate={{
              x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -256,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-4">
              <motion.h2
                className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                Categories
              </motion.h2>
              <div className="space-y-2">
                {categories.map((category, index) => {
                  const isActive = selectedCategory.id === category.id && currentView === 'dashboard';
                  // Define specific gradients for each category
                  const getGradientColors = (categoryId: string) => {
                    switch (categoryId) {
                      case 'networking':
                        return 'from-blue-500 to-blue-600';
                      default:
                        return 'from-blue-400 to-purple-500';
                    }
                  };
                  const gradientClass = getGradientColors(category.id);

                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => {
                        handleCategorySelect(category);
                        setCurrentView('dashboard');
                        setIsSidebarOpen(false);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 overflow-hidden ${
                        isActive
                          ? `bg-gradient-to-r ${gradientClass} text-white shadow-lg`
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-md font-semibold'
                      }`}
                    >
                      {/* Active indicator gradient */}
                      {isActive && (
                        <motion.div
                          layoutId="activeCategory"
                          className={`absolute inset-0 bg-gradient-to-r ${gradientClass}`}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      {/* Icon with gradient background */}
                      <div className={`relative z-10 p-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-white/25 backdrop-blur-sm'
                          : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900'
                      }`}>
                        {React.isValidElement(category.icon) && React.cloneElement(category.icon, {
                          className: `w-5 h-5 ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`
                        } as any)}
                      </div>

                      <span className={`relative z-10 font-semibold text-sm ${
                        isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-800 dark:group-hover:text-slate-100'
                      }`}>
                        {category.name}
                      </span>

                      {/* Hover gradient effect */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Accounts Section */}
            <div className="relative z-10 p-4 mt-2 border-t border-slate-200 dark:border-slate-700">
              <motion.h2
                className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Settings
              </motion.h2>
              <div className="space-y-2">
                <motion.button
                  onClick={() => {
                    setCurrentView('accounts');
                    setIsSidebarOpen(false);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 overflow-hidden ${
                    currentView === 'accounts'
                      ? 'bg-gradient-to-r from-indigo-500 to-pink-600 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100 hover:shadow-md font-semibold'
                  }`}
                >
                  {/* Active indicator gradient */}
                  {currentView === 'accounts' && (
                    <motion.div
                      layoutId="activeSettings"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-600"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Icon with gradient background */}
                  <div className={`relative z-10 p-2 rounded-lg transition-all ${
                    currentView === 'accounts'
                      ? 'bg-white/25 backdrop-blur-sm'
                      : 'bg-slate-200 group-hover:bg-indigo-100'
                  }`}>
                    <svg
                      className={`w-5 h-5 ${currentView === 'accounts' ? 'text-white' : 'text-slate-700 group-hover:text-indigo-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>

                  <span className={`relative z-10 font-semibold text-sm ${
                    currentView === 'accounts' ? 'text-white' : 'text-slate-700 group-hover:text-slate-800'
                  }`}>
                    Accounts
                  </span>

                  {/* Hover gradient effect */}
                  {currentView !== 'accounts' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  )}
                </motion.button>

                {/* Add Account Button */}
                <motion.button
                  onClick={() => {
                    setCurrentView('accounts');
                    setIsSidebarOpen(false);
                    // Trigger add form after a short delay
                    setTimeout(() => {
                      const addButton = document.querySelector('[data-add-account-btn]') as HTMLButtonElement;
                      if (addButton) addButton.click();
                    }, 100);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 overflow-hidden text-slate-700 hover:bg-green-100 hover:shadow-md border-2 border-dashed border-slate-400 hover:border-green-500"
                >
                  {/* Icon with gradient background */}
                  <div className="relative z-10 p-2 rounded-lg transition-all bg-slate-200 group-hover:bg-green-200">
                    <svg
                      className="w-5 h-5 text-slate-700 group-hover:text-green-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>

                  <span className="relative z-10 font-semibold text-sm text-slate-700 group-hover:text-green-800">
                    Add Account
                  </span>

                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            {currentView === 'dashboard' && selectedCategory.id === 'dashboard' ? (
              <div className="flex-1 overflow-y-auto h-full">
                <CloudDashboard
                  selectedRegion={selectedRegion}
                />
              </div>
            ) : currentView === 'dashboard' ? (
              <>
                {/* Service Tabs */}
                <ServiceTabs
                  services={selectedCategory.services}
                  selectedService={selectedService}
                  onServiceSelect={setSelectedService}
                />

                {/* Resources View - Full Screen Table */}
                <div className="flex-1 overflow-hidden h-full">
                  <ResourceTable
                    resources={resources}
                    loading={loading}
                    error={error}
                    onResourceClick={fetchResourceDetails}
                    loadingResourceId={loadingResourceId}
                    service={selectedService}
                    categoryName={selectedCategory.name}
                  />
                </div>

                {/* Resource Details Modal */}
                {isModalOpen && (
                  <ResourceModal
                    resource={selectedResource}
                    onClose={handleCloseModal}
                  />
                )}
              </>
            ) : null}

            {currentView === 'accounts' && (
              <AccountsPage
                accounts={awsAccounts}
                selectedAccount={selectedAccount}
                onAccountSelect={handleAccountChange}
                onSetDefault={handleSetDefaultAccount}
                onDeleteAccount={handleDeleteAccount}
                onAddAccount={handleAddAccount}
              />
            )}
          </div>
        </div>
      </div>

      {/* Error Alert Modal */}
      {error && showErrorModal && (
        <AlertModal
          type="error"
          title="Error"
          message={error}
          onClose={() => {
            setShowErrorModal(false);
            setError(null);
          }}
          actions={
            <>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setError(null);
                }}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </>
          }
        />
      )}
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <AuthProvider>
          <DashboardContent />
        </AuthProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
};

export default App;