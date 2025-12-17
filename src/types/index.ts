export interface AWSAccount {
  id: string;
  name: string;
  accountId: string;
  isDefault?: boolean;
}

export interface Region {
  name: string;
  active: boolean;
}

export interface ResourceCount {
  service: string;
  count: number;
}

export interface SecurityFinding {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  recommendation?: string;
}

export interface Resource {
  InstanceId?: string;
  FunctionName?: string;
  ClusterName?: string;
  VolumeId?: string;
  FileSystemId?: string;
  VpcId?: string;
  LoadBalancerArn?: string;
  LoadBalancerName?: string;
  HostedZoneId?: string;
  id?: string;
  Id?: string;
  DBInstanceIdentifier?: string;
  DBClusterIdentifier?: string;
  TableName?: string;
  CacheClusterId?: string;
  UserName?: string;
  RoleName?: string;
  GroupName?: string;
  KeyId?: string;
  logGroupName?: string;
  AlarmName?: string;
  TrailARN?: string;
  name?: string;
  Name?: string;
  State?: any;
  Status?: any;
  security_findings?: SecurityFinding[];
  recommendations?: SecurityFinding[];
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  services: string[];
  endpoint: string;
}

export interface SecurityIssue {
  resourceId: string;
  resourceName: string;
  category: string;
  service: string;
  finding: SecurityFinding;
  resource: Resource;
}

export interface SecurityStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface MonthlyCost {
  month: string;
  amount: number;
  currency: string;
  services: ServiceCost[];
}

export interface ServiceCost {
  service: string;
  amount: number;
  currency: string;
  percentage: number;
  trend?: 'up' | 'down' | 'stable';
  changeAmount?: number;
  changePercentage?: number;
}

export interface CostAnomaly {
  service: string;
  currentMonth: number;
  previousMonth: number;
  changeAmount: number;
  changePercentage: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface BillingForecast {
  month: string;
  estimatedAmount: number;
  confidenceLevel: string;
}

export interface CostOptimization {
  type: string;
  service: string;
  currentCost: number;
  potentialSavings: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BillingData {
  last6Months: MonthlyCost[];
  last3MonthsDetailed: MonthlyCost[];
  currentMonth: MonthlyCost;
  anomalies: CostAnomaly[];
  forecast: BillingForecast[];
  optimizations: CostOptimization[];
  totalSpend: number;
  averageMonthlySpend: number;
}

export interface CostFilter {
  startDate: string;
  endDate: string;
  granularity: 'DAILY' | 'MONTHLY' | 'HOURLY';
  groupBy: 'SERVICE' | 'REGION' | 'USAGE_TYPE' | 'TAG' | 'ACCOUNT';
  services?: string[];
  regions?: string[];
  accounts?: string[];
  tags?: Record<string, string>;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  alerts: BudgetAlert[];
  status: 'ok' | 'warning' | 'exceeded';
}

export interface BudgetAlert {
  id: string;
  threshold: number;
  type: 'ACTUAL' | 'FORECASTED';
  notificationEmail: string;
  triggered: boolean;
}

export interface CostAllocationTag {
  key: string;
  values: string[];
  totalCost: number;
  breakdown: {
    value: string;
    cost: number;
    percentage: number;
  }[];
}

export interface ReservedInstance {
  id: string;
  instanceType: string;
  instanceCount: number;
  availabilityZone?: string;
  state: string;
  start?: string;
  end?: string;
  duration?: number;
  offeringType?: string;
  offeringClass?: string;
  productDescription?: string;
  utilizationPercentage?: number;
  estimatedSavings?: number;
}

export interface SavingsPlan {
  id: string;
  planType: string;
  status: string;
  hourlyCommitment: number;
  start?: string;
  end?: string;
  term?: string;
  paymentOption?: string;
  region?: string;
  utilizationPercentage?: number;
  savingsAmount?: number;
  savingsPercentage?: number;
}

export interface CostForecast {
  date: string;
  predictedAmount: number;
  actualAmount?: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

export interface CostExplorerData {
  timeSeries: {
    date: string;
    amount: number;
    breakdown: Record<string, number>;
  }[];
  summary: {
    total: number;
    average: number;
    change: number;
    changePercentage: number;
  };
  topServices: ServiceCost[];
  filters: CostFilter;
}

// Dashboard types
export interface DashboardAccount {
  accountId: string;
  accountName: string;
  onboardedDate: string;
  projectManager: string;
  architectName: string;
}

export interface AccountsOverview {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
}

export interface SecurityIssueByAccount {
  accountName: string;
  accountId: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface MonthlyBilling {
  accountId: string;
  accountName: string;
  amount: number;
  currency: string;
  month: string;
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
}

export interface PendingUpgrade {
  id: string;
  serviceName: string;
  accountId: string;
  accountName: string;
  currentVersion: string;
  targetVersion: string;
  upgradeStatus: 'pending' | 'in-progress' | 'scheduled';
  scheduledDate?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface GlobalHealthStatus {
  status: 'operational' | 'degraded' | 'outage';
  affectedRegions: string[];
  affectedServices: string[];
  message: string;
  lastChecked: string;
}

export interface DashboardFilters {
  accountIds: string[];
  architectNames: string[];
}

// Security Hub Report types
export interface SecurityControl {
  control: string;
  name: string;
  status: 'PASSED' | 'FAILED';
  failed_count: number;
  failed_resources: any[];
}

export interface SecurityReportSummary {
  total: number;
  passed: number;
  failed: number;
  errors: number;
}

export interface SecurityReport {
  account_id: string;
  region: string;
  timestamp: string;
  summary: SecurityReportSummary;
  results: SecurityControl[];
}
