import { apiService } from './api';
import { SecurityIssue, SecurityStats, Category, Resource } from '../types';
import { getResourceId, getResourceDisplayName } from '../utils/resourceHelpers';
import { logger } from '../utils/logger';
import { securityCache } from '../utils/securityCache';

export class CategorySecurityService {
  /**
   * Fetch security data for a specific category
   * Uses POST requests to get detailed resource information with security findings
   */
  async fetchCategorySecurity(
    category: Category,
    accountId: string,
    region: string,
    forceRefresh: boolean = false
  ): Promise<{ issues: SecurityIssue[]; stats: SecurityStats }> {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = securityCache.load(category.id, accountId, region);
      if (cached) {
        logger.log(`Using cached security data for ${category.id}`);
        return { issues: cached.issues, stats: cached.stats };
      }
    }

    logger.log(`Fetching security data for category: ${category.name}`);
    const allIssues: SecurityIssue[] = [];

    // Fetch resources for each service in the category
    for (const service of category.services) {
      try {
        logger.log(`Fetching ${service} resources...`);

        // Step 1: Get list of resources (GET request)
        const resources = await apiService.fetchResources(
          category.endpoint,
          service,
          accountId,
          region
        );

        if (resources.length === 0) {
          logger.log(`No ${service} resources found`);
          continue;
        }

        logger.log(`Found ${resources.length} ${service} resources, fetching details...`);

        // Step 2: Get detailed info with security findings (POST request)
        const resourceIds = resources.map((r) => getResourceId(r));

        // Fetch in batches of 20 to avoid overloading
        const batchSize = 20;
        for (let i = 0; i < resourceIds.length; i += batchSize) {
          const batch = resourceIds.slice(i, i + batchSize);

          try {
            const detailedResources = await this.fetchResourceBatch(
              category.endpoint,
              service,
              accountId,
              region,
              batch
            );

            // Extract security issues from detailed resources
            const batchIssues = this.extractSecurityIssues(
              detailedResources,
              category,
              service
            );
            allIssues.push(...batchIssues);

            logger.log(
              `Batch ${Math.floor(i / batchSize) + 1}: Found ${batchIssues.length} security issues`
            );
          } catch (err) {
            logger.error(`Error fetching batch for ${service}:`, err);
            // Continue with next batch
          }
        }
      } catch (err) {
        logger.error(`Error fetching ${service}:`, err);
        // Continue with next service
      }
    }

    // Calculate statistics
    const stats = this.calculateStats(allIssues);

    // Cache the results
    securityCache.save(category.id, accountId, region, allIssues, stats);

    logger.log(
      `Category ${category.name}: ${allIssues.length} total issues (${stats.critical} critical, ${stats.high} high, ${stats.medium} medium, ${stats.low} low)`
    );

    return { issues: allIssues, stats };
  }

  /**
   * Fetch detailed resource information in batch using POST request
   */
  private async fetchResourceBatch(
    endpoint: string,
    service: string,
    accountId: string,
    region: string,
    resourceIds: string[]
  ): Promise<Resource[]> {
    // Use apiService which includes Authorization header
    const resources = await apiService.fetchResourcesBatch(
      endpoint,
      service,
      accountId,
      region,
      resourceIds
    );

    logger.log(`Fetched ${resources.length} resources for ${service}`);
    return resources;
  }

  /**
   * Extract security issues from resources
   */
  private extractSecurityIssues(
    resources: Resource[],
    category: Category,
    service: string
  ): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    logger.log(`Extracting security issues from ${resources.length} resources`);

    // Filter out null/undefined resources
    const validResources = resources.filter((r) => r != null);

    validResources.forEach((resource) => {
      // Handle nested data structure - check both resource.data and resource
      const resourceData = resource.data || resource;

      // Extract security findings from all possible locations
      const securityFindings = this.extractFindings(resourceData.security_findings, resource.security_findings);
      const recommendations = this.extractFindings(resourceData.recommendations, resource.recommendations);

      // Combine all findings
      const allFindings = [...securityFindings, ...recommendations];

      if (allFindings.length > 0) {
        logger.log(`Found ${allFindings.length} findings for resource ${getResourceId(resource)}`);
      }

      // Process each finding
      allFindings.forEach((finding) => {
        if (!finding) return;

        // Normalize and validate severity
        const normalizedSeverity = this.normalizeSeverity(finding.severity || finding.impact || finding.risk_level);

        issues.push({
          resourceId: getResourceId(resource),
          resourceName: getResourceDisplayName(resource),
          category: category.name,
          service: service,
          finding: {
            ...finding,
            severity: normalizedSeverity,
          },
          resource: resource,
        });
      });
    });

    logger.log(`Extracted ${issues.length} total security issues`);
    return issues;
  }

  /**
   * Extract findings from various possible sources
   */
  private extractFindings(...sources: any[]): any[] {
    for (const source of sources) {
      if (Array.isArray(source) && source.length > 0) {
        return source;
      }
    }
    return [];
  }

  /**
   * Normalize severity levels to standard format
   */
  private normalizeSeverity(severity: any): 'critical' | 'high' | 'medium' | 'low' {
    if (!severity) return 'medium';

    const severityStr = severity.toString().toLowerCase().trim();

    // Map various severity terms to standard levels
    if (severityStr.includes('critical') || severityStr.includes('severe') || severityStr === '1') {
      return 'critical';
    }

    if (severityStr.includes('high') || severityStr === '2') {
      return 'high';
    }

    if (severityStr.includes('medium') || severityStr.includes('moderate') || severityStr === '3') {
      return 'medium';
    }

    if (severityStr.includes('low') || severityStr === '4') {
      return 'low';
    }

    // Default to medium if unknown
    return 'medium';
  }

  /**
   * Calculate security statistics
   */
  private calculateStats(issues: SecurityIssue[]): SecurityStats {
    const stats: SecurityStats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: issues.length,
    };

    issues.forEach((issue) => {
      const severity = issue.finding.severity.toLowerCase();
      if (severity === 'critical') stats.critical++;
      else if (severity === 'high') stats.high++;
      else if (severity === 'medium') stats.medium++;
      else if (severity === 'low') stats.low++;
    });

    return stats;
  }

  /**
   * Group issues by severity
   */
  groupBySeverity(issues: SecurityIssue[]): Record<string, SecurityIssue[]> {
    return issues.reduce((acc, issue) => {
      const severity = issue.finding.severity;
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(issue);
      return acc;
    }, {} as Record<string, SecurityIssue[]>);
  }

  /**
   * Clear cache for category
   */
  clearCache(categoryId: string): void {
    securityCache.clear(categoryId);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    securityCache.clearAll();
  }
}

export const categorySecurityService = new CategorySecurityService();
