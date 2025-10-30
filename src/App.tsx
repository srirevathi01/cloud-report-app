import React, { useState, useEffect } from 'react';
import { Cloud, Database, Network, HardDrive, Shield, DollarSign } from './components/icons';
import { AWSAccount, Category, Resource } from './types';
import { apiService } from './services/api';
import { storageService } from './utils/storage';
import { logger } from './utils/logger';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import TopBar from './components/TopBar';
import ServiceTabs from './components/ServiceTabs';
import ResourceTable from './components/ResourceTable';
import ResourceModal from './components/ResourceModal';
import CategorySecurityPanel from './components/CategorySecurityPanel';
import Login from './components/Login';
import AccountsPage from './components/AccountsPage';
import CostExplorerDashboard from './components/CostExplorer/CostExplorerDashboard';
import AlertModal from './components/AlertModal';

const categories: Category[] = [
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
  },
  // {
  //   id: 'monitoring',
  //   name: 'Monitoring',
  //   icon: <Activity className="w-5 h-5" />,
  //   services: ['cloudwatch', 'cloudtrail', 'xray'],
  //   endpoint: '/api/monitoring'
  // },
  {
    id: 'billing',
    name: 'Billing',
    icon: <DollarSign className="w-5 h-5" />,
    services: ['overview'],
    endpoint: '/api/billing'
  }
];

const DEFAULT_REGION = 'us-east-1';

const DashboardContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  // Show error modal when error occurs
  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // Fetch regions when account changes (only if authenticated)
  useEffect(() => {
    if (isAuthenticated && selectedAccount) {
      fetchRegions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, isAuthenticated]);

  // Fetch resources when category, service, account, or region changes (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      // Don't make API calls if not authenticated
      return;
    }

    if (selectedAccount) {
      fetchResources();
    } else {
      setResources([]);
      setError('Please add an AWS account to get started');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedService, selectedAccount, selectedRegion, isAuthenticated]);

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

  const handleNavigateToResourceFromSecurity = (service: string, resourceId: string) => {
    // Switch to the service
    setSelectedService(service);

    // Wait for resources to load, then select the resource
    setTimeout(() => {
      fetchResourceDetails(resourceId);
    }, 500);
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
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        <TopBar
          awsAccounts={awsAccounts}
          selectedAccount={selectedAccount}
          selectedRegion={selectedRegion}
          regions={availableRegions}
          onAccountChange={handleAccountChange}
          onRegionChange={handleRegionChange}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-slate-200 shadow-sm overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Categories
              </h2>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategorySelect(category);
                      setCurrentView('dashboard');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      selectedCategory.id === category.id && currentView === 'dashboard'
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts Section */}
            <div className="p-4 border-t border-slate-200">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Settings
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => setCurrentView('accounts')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === 'accounts'
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="font-medium text-sm">Accounts</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {currentView === 'dashboard' && selectedCategory.id === 'billing' ? (
              <CostExplorerDashboard
                accountId={selectedAccount}
                region={selectedRegion}
              />
            ) : currentView === 'dashboard' ? (
              <>
                {/* Security Panel */}
                {selectedAccount && (
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <CategorySecurityPanel
                      category={selectedCategory}
                      accountId={selectedAccount}
                      region={selectedRegion}
                      onNavigateToResource={handleNavigateToResourceFromSecurity}
                    />
                  </div>
                )}

                {/* Service Tabs */}
                <ServiceTabs
                  services={selectedCategory.services}
                  selectedService={selectedService}
                  onServiceSelect={setSelectedService}
                />

                {/* Resources View - Full Screen Table */}
                <div className="flex-1 overflow-hidden">
                  <ResourceTable
                    resources={resources}
                    loading={loading}
                    error={error}
                    onResourceClick={fetchResourceDetails}
                    loadingResourceId={loadingResourceId}
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
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
