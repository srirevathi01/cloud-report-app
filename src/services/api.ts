import { API_BASE_URL } from '../config/constants';
import { logger } from '../utils/logger';

export interface ApiResponse<T = any> {
  status: string;
  data: T;
  message?: string;
}

class ApiService {
  private baseURL: string;
  private requestCache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 30000; // 30 seconds
  private getTokenFunction: (() => Promise<string | null>) | null = null;
  private refreshTokenFunction: (() => Promise<void>) | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.requestCache = new Map();
  }

  /**
   * Set the function to get the authentication token
   */
  setTokenGetter(tokenGetter: () => Promise<string | null>): void {
    this.getTokenFunction = tokenGetter;
  }

  /**
   * Set the function to refresh the authentication token
   */
  setTokenRefresher(refresher: () => Promise<void>): void {
    this.refreshTokenFunction = refresher;
  }

  private getCacheKey(url: string, options?: RequestInit): string {
    return `${url}-${JSON.stringify(options || {})}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    useCache: boolean = true,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, options);

    // Check cache
    if (useCache && options?.method !== 'POST') {
      const cached = this.requestCache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        logger.log('Using cached response for:', url);
        return cached.data;
      }
    }

    logger.log('Fetching from:', url);

    // Get authentication token
    let authToken: string | null = null;
    if (this.getTokenFunction) {
      try {
        authToken = await this.getTokenFunction();
      } catch (error: any) {
        logger.error('Failed to get authentication token:', error);
        throw new Error(error.message || 'Authentication failed. Please sign in again.');
      }
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add existing headers
      if (options?.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      }

      // Add authorization header if token is available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('HTTP error response:', errorText);

        // Handle authentication errors with automatic retry
        if (response.status === 401) {
          logger.warn('Received 401 Unauthorized response');

          // Try to refresh token and retry once
          if (retryCount === 0 && this.refreshTokenFunction) {
            logger.info('Attempting to refresh token and retry request...');

            try {
              // Ensure only one refresh happens at a time
              if (this.isRefreshing && this.refreshPromise) {
                await this.refreshPromise;
              } else {
                this.isRefreshing = true;
                this.refreshPromise = this.refreshTokenFunction();
                await this.refreshPromise;
                this.isRefreshing = false;
                this.refreshPromise = null;
              }

              logger.info('Token refreshed successfully, retrying request...');
              // Retry the request with the new token
              return await this.request<T>(endpoint, options, useCache, retryCount + 1);
            } catch (refreshError) {
              logger.error('Failed to refresh token:', refreshError);
              this.isRefreshing = false;
              this.refreshPromise = null;
              throw new Error('Session expired. Please sign in again.');
            }
          } else {
            throw new Error('Authentication required. Please sign in again.');
          }
        }

        if (response.status === 403) {
          throw new Error('Access forbidden. You do not have permission to access this resource.');
        }

        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      logger.log('Response data:', responseData);

      // Handle nested response structure
      const data = responseData.data || responseData;

      // Cache the response
      if (useCache && options?.method !== 'POST') {
        this.requestCache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (err: any) {
      logger.error('Error in API request:', err);

      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to API server. Is it running on ${this.baseURL}?`);
      } else if (err instanceof SyntaxError) {
        throw new Error('Server returned invalid JSON response');
      }

      throw err;
    }
  }

  async fetchRegions(accountId: string): Promise<string[]> {
    const response = await this.request<any>(
      `/api/${accountId}/regions`,
      undefined,
      true
    );

    // Handle both old and new response formats
    if (response.status === 'success' && response.data) {
      // Old format: { status: 'success', data: [...] }
      const regions = response.data || [];
      return regions.map((r: any) => r.name || r).filter(Boolean);
    } else if ((response as any).active_regions) {
      // New format: { aws_account_id: '...', active_regions: [...], inactive_regions: [...] }
      return (response as any).active_regions.map((r: any) => r.RegionName || r.name || r).filter(Boolean);
    }

    return [];
  }

  async fetchResources(
    category: string,
    service: string,
    accountId: string,
    region: string
  ): Promise<any[]> {
    const response = await this.request<any>(
      `${category}/${service}?account_id=${accountId}&region=${region}`,
      undefined,
      true
    );

    if (response.status === 'success') {
      let resources = response.data || [];

      // Handle CloudWatch special case - data is an object with log_groups and alarms
      if (service === 'cloudwatch' && !Array.isArray(resources)) {
        resources = [
          ...(resources.log_groups || []),
          ...(resources.alarms || []),
        ];
      }

      // Ensure resources is always an array
      if (!Array.isArray(resources)) {
        logger.warn('API returned non-array data, converting to array:', resources);
        resources = [resources];
      }

      return resources;
    }

    throw new Error(response.message || `Failed to fetch ${service} resources`);
  }

  async fetchResourceDetails(
    category: string,
    service: string,
    accountId: string,
    region: string,
    resourceId: string
  ): Promise<any> {
    try {
      const response = await this.request<any>(
        `${category}/${service}?account_id=${accountId}&region=${region}`,
        {
          method: 'POST',
          body: JSON.stringify({ resource_ids: [resourceId] }),
        },
        false
      );

      logger.log('Resource details response:', response);

      // Handle different response structures
      if (response.status === 'success') {
        // Response has data array
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          return response.data[0];
        }

        // Response data is the object itself
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          return response.data;
        }
      }

      // If response itself is an array
      if (Array.isArray(response) && response.length > 0) {
        return response[0];
      }

      // If response is the object itself
      if (response && typeof response === 'object' && !response.status) {
        return response;
      }

      logger.warn('Unexpected response format for resource details:', response);
      throw new Error('No resource details found or invalid response format');
    } catch (err: any) {
      logger.error('Error fetching resource details:', err);
      throw err;
    }
  }

  async fetchResourcesBatch(
    category: string,
    service: string,
    accountId: string,
    region: string,
    resourceIds: string[]
  ): Promise<any[]> {
    try {
      const response = await this.request<any>(
        `${category}/${service}?account_id=${accountId}&region=${region}`,
        {
          method: 'POST',
          body: JSON.stringify({ resource_ids: resourceIds }),
        },
        false
      );

      logger.log('Resource batch response:', response);

      // Handle various response structures
      if (response.status === 'success' && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }

      // Check for nested data.data array
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // Check if response itself is an array
      if (Array.isArray(response)) {
        return response;
      }

      // Check for single resource object
      if (response?.data && typeof response.data === 'object') {
        return [response.data];
      }

      logger.warn('Unexpected batch response format:', response);
      return [];
    } catch (err: any) {
      logger.error('Error fetching resources batch:', err);
      return [];
    }
  }

  async fetchBillingData(accountId: string, region: string): Promise<any> {
    const response = await this.request<any>(
      `/api/billing/overview?account_id=${accountId}&region=${region}`,
      undefined,
      true
    );

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch billing data');
  }

  async fetchCostExplorerData(accountId: string, region: string, filters: any): Promise<any> {
    const params = new URLSearchParams({
      account_id: accountId,
      region: region,
      start_date: filters.startDate,
      end_date: filters.endDate,
      granularity: filters.granularity,
      group_by: filters.groupBy
    });

    const response = await this.request<any>(
      `/api/billing/cost-explorer?${params.toString()}`,
      undefined,
      true
    );

    if (response.status === 'success') {
      return response.data;
    }

    throw new Error(response.message || 'Failed to fetch cost explorer data');
  }

  async fetchBudgets(accountId: string, region: string): Promise<any[]> {
    const response = await this.request<any>(
      `/api/billing/budgets?account_id=${accountId}&region=${region}`,
      undefined,
      true
    );

    if (response.status === 'success') {
      return response.data || [];
    }

    return [];
  }

  async fetchReservedInstances(accountId: string, region: string): Promise<any[]> {
    const response = await this.request<any>(
      `/api/billing/reserved-instances?account_id=${accountId}&region=${region}`,
      undefined,
      true
    );

    if (response.status === 'success') {
      return response.data || [];
    }

    return [];
  }

  async fetchSavingsPlans(accountId: string, region: string): Promise<any[]> {
    const response = await this.request<any>(
      `/api/billing/savings-plans?account_id=${accountId}&region=${region}`,
      undefined,
      true
    );

    if (response.status === 'success') {
      return response.data || [];
    }

    return [];
  }

  async fetchCostAllocationTags(accountId: string, region: string): Promise<any[]> {
    const response = await this.request<any>(
      `/api/billing/cost-allocation-tags?account_id=${accountId}&region=${region}`,
      undefined,
      true
    );

    if (response.status === 'success') {
      return response.data || [];
    }

    return [];
  }

  clearCache(): void {
    this.requestCache.clear();
  }
}

export const apiService = new ApiService(API_BASE_URL);
