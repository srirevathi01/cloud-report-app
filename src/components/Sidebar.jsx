import React, { useState } from 'react';
import { 
  Globe, 
  Server, 
  Shield, 
  Database, 
  Network, 
  Monitor,
  ChevronRight,
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const Sidebar = ({ selectedAccount, onMenuClick }) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      id: 'regions',
      label: 'Regions',
      icon: Globe,
      subItems: [
        { id: 'list-regions', label: 'List Regions' },
        { id: 'list-resources', label: 'List Resources' },
        { id: 'list-resource-by-region', label: 'List Resource by Region' }
      ]
    },
    {
      id: 'compute',
      label: 'Compute',
      icon: Server,
      subItems: []
    },
    {
      id: 'security-hub',
      label: 'Security Hub',
      icon: Shield,
      subItems: []
    },
    {
      id: 'database',
      label: 'Database',
      icon: Database,
      subItems: []
    },
    {
      id: 'networking',
      label: 'Networking',
      icon: Network,
      subItems: []
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Monitor,
      subItems: []
    }
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleSubItemClick = (parentId, subItemId) => {
    onMenuClick(parentId, subItemId);
  };

  if (!selectedAccount) {
    return null;
  }

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Account: {selectedAccount}
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus[item.id];
            const hasSubItems = item.subItems.length > 0;
            
            return (
              <div key={item.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 h-auto"
                  onClick={() => hasSubItems ? toggleMenu(item.id) : onMenuClick(item.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasSubItems && (
                    isExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {hasSubItems && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Button
                        key={subItem.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                        onClick={() => handleSubItemClick(item.id, subItem.id)}
                      >
                        {subItem.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

