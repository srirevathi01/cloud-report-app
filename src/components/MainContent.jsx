import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';

const MainContent = ({ selectedAccount, activeMenu, activeSubMenu }) => {
  const [apiResponse, setApiResponse] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(false);

  // AWS Regions list
  const awsRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
    'ap-south-1', 'sa-east-1', 'ca-central-1'
  ];

  const callApi = async (endpoint) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`);
      const data = await response.text();
      setApiResponse(data);
    } catch (error) {
      setApiResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApiCall = (action) => {
    if (!selectedAccount) return;

    let endpoint = '';
    switch (action) {
      case 'list-regions':
        endpoint = `/api/${selectedAccount}/regions`;
        break;
      case 'list-resources':
        endpoint = `/api/${selectedAccount}/resources`;
        break;
      case 'list-resource-by-region':
        if (!selectedRegion) {
          setApiResponse('Please select a region first');
          return;
        }
        endpoint = `/api/${selectedAccount}/resources/${selectedRegion}`;
        break;
      default:
        return;
    }

    callApi(endpoint);
  };

  if (!selectedAccount) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Welcome to Cloud Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Please select an account from the dropdown in the header to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (activeMenu !== 'regions') {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Feature Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This feature will be implemented later. For now, please use the Regions menu.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Regions Management</h1>
        
        <div className="grid gap-6">
          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Available Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => handleApiCall('list-regions')}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  List Regions
                </Button>
                
                <Button 
                  onClick={() => handleApiCall('list-resources')}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  List Resources
                </Button>
              </div>
              
              {/* Region Selection for List Resource by Region */}
              <div className="flex items-center gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {awsRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => handleApiCall('list-resource-by-region')}
                  disabled={loading || !selectedRegion}
                  className="bg-primary hover:bg-primary/90"
                >
                  List Resource by Region
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Response */}
          <Card>
            <CardHeader>
              <CardTitle>API Response</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">
                    {apiResponse || 'No response yet. Click an action button to make an API call.'}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default MainContent;

