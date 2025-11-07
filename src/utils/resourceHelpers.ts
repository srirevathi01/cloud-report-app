// Map of resource ID field priorities
const RESOURCE_ID_FIELDS: string[] = [
  // Compute
  'InstanceId',           // EC2
  'FunctionName',         // Lambda
  'ClusterName',          // ECS
  // Storage
  'VolumeId',             // EBS volumes
  'FileSystemId',         // EFS
  // Networking
  'VpcId',                // VPC
  'LoadBalancerArn',      // ELB/ALB/NLB
  'LoadBalancerName',     // Classic ELB
  'HostedZoneId',         // Route53
  'id',                   // API Gateway (lowercase)
  'Id',                   // Route53
  // Database
  'DBInstanceIdentifier', // RDS
  'DBClusterIdentifier',  // Aurora
  'TableName',            // DynamoDB
  'CacheClusterId',       // ElastiCache
  // Security
  'UserName',             // IAM Users
  'RoleName',             // IAM Roles
  'GroupName',            // IAM Groups, X-Ray Groups
  'KeyId',                // KMS Keys
  // Monitoring
  'logGroupName',         // CloudWatch Logs
  'AlarmName',            // CloudWatch Alarms
  'TrailARN',             // CloudTrail (primary)
  'name',                 // API Gateway name (lowercase)
  'Name',                 // CloudTrail name, S3 buckets, general fallback
];

export const getResourceId = (resource: Record<string, any>): string => {
  for (const field of RESOURCE_ID_FIELDS) {
    if (resource[field]) {
      return String(resource[field]);
    }
  }
  return 'Unknown';
};

export const getResourceDisplayName = (resource: Record<string, any>): string => {
  // For EC2 instances, show Name tag if available
  if (resource.InstanceId && resource.Name) {
    return `${resource.Name} (${resource.InstanceId})`;
  }

  // For API Gateway, prefer showing the name instead of ID
  if (resource.name && resource.id) {
    return `${resource.name} (${resource.id})`;
  }

  // For resources with Name field, show Name with ID
  if (resource.Name && resource.InstanceId) {
    return `${resource.Name} (${resource.InstanceId})`;
  }

  return getResourceId(resource);
};

export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300'
  };
  return colors[severity] || colors.low;
};

// Map service to friendly display name
export const getServiceDisplayName = (service: string): string => {
  const serviceNames: Record<string, string> = {
    ec2: 'EC2',
    lambda: 'Lambda',
    ecs: 'ECS',
    vpc: 'VPC',
    route53: 'Route 53',
    apigateway: 'API Gateway',
    elb: 'ELB',
    rds: 'RDS',
    aurora: 'Aurora',
    dynamodb: 'DynamoDB',
    elasticache: 'ElastiCache',
    s3: 'S3',
    ebs: 'EBS',
    efs: 'EFS',
    iam: 'IAM',
    kms: 'KMS',
    waf: 'WAF',
    cloudwatch: 'CloudWatch',
    cloudtrail: 'CloudTrail',
    xray: 'X-Ray'
  };
  return serviceNames[service] || service.toUpperCase();
};

// Check if service should show status column
export const shouldShowStatusColumn = (service: string): boolean => {
  const servicesWithStatus = [
    'ec2',        // Instance state (running, stopped, etc.)
    'lambda',     // Function state
    'ecs',        // Cluster/service status
    'rds',        // DB instance status
    'aurora',     // Cluster status
    'dynamodb',   // Table status
    'efs',        // Lifecycle state
    'elasticache' // Cache cluster status
  ];
  return servicesWithStatus.includes(service);
};

// Get the state/status of a resource in a normalized way
export const getResourceState = (resource: Record<string, any>): string | null => {
  // Check for State field (EC2, ECS, etc.)
  if (resource.State) {
    if (typeof resource.State === 'object' && resource.State.Name) {
      return resource.State.Name;
    }
    if (typeof resource.State === 'string') {
      return resource.State;
    }
  }

  // Check for Status field
  if (resource.Status) {
    if (typeof resource.Status === 'string') {
      return resource.Status;
    }
  }

  // Check for DBInstanceStatus (RDS)
  if (resource.DBInstanceStatus) {
    return resource.DBInstanceStatus;
  }

  // Check for FunctionState (Lambda)
  if (resource.FunctionState) {
    return resource.FunctionState;
  }

  // Check for TableStatus (DynamoDB)
  if (resource.TableStatus) {
    return resource.TableStatus;
  }

  // Check for LifecycleState (EFS)
  if (resource.LifecycleState) {
    return resource.LifecycleState;
  }

  return null;
};

// Get important information based on service type with field labels
export const getResourceImportantInfo = (resource: Record<string, any>, service: string): Array<{ label: string; value: string }> => {
  const info: Array<{ label: string; value: string }> = [];

  switch (service) {
    case 'ec2':
      if (resource.InstanceType) info.push({ label: 'Instance Type', value: resource.InstanceType });
      if (resource.PrivateIpAddress) info.push({ label: 'Private IP', value: resource.PrivateIpAddress });
      if (resource.PublicIpAddress) info.push({ label: 'Public IP', value: resource.PublicIpAddress });
      break;

    case 'lambda':
      if (resource.Runtime) info.push({ label: 'Runtime', value: resource.Runtime });
      if (resource.MemorySize) info.push({ label: 'Memory', value: `${resource.MemorySize}MB` });
      if (resource.Timeout) info.push({ label: 'Timeout', value: `${resource.Timeout}s` });
      break;

    case 'ecs':
      if (resource.status) info.push({ label: 'Status', value: resource.status });
      if (resource.runningTasksCount !== undefined) info.push({ label: 'Running Tasks', value: `${resource.runningTasksCount}` });
      break;

    case 'rds':
      if (resource.Engine) info.push({ label: 'Engine', value: resource.Engine });
      if (resource.DBInstanceClass) info.push({ label: 'Instance Class', value: resource.DBInstanceClass });
      if (resource.AllocatedStorage) info.push({ label: 'Storage', value: `${resource.AllocatedStorage}GB` });
      break;

    case 'aurora':
      if (resource.Engine) info.push({ label: 'Engine', value: resource.Engine });
      if (resource.DBClusterMembers) info.push({ label: 'Instances', value: `${resource.DBClusterMembers.length}` });
      break;

    case 'dynamodb':
      if (resource.BillingMode) info.push({ label: 'Billing Mode', value: resource.BillingMode });
      if (resource.ItemCount !== undefined) info.push({ label: 'Item Count', value: `${resource.ItemCount}` });
      break;

    case 's3':
      if (resource.CreationDate) info.push({ label: 'Created', value: new Date(resource.CreationDate).toLocaleDateString() });
      break;

    case 'ebs':
      if (resource.VolumeType) info.push({ label: 'Volume Type', value: resource.VolumeType });
      if (resource.Size) info.push({ label: 'Size', value: `${resource.Size}GB` });
      if (resource.Iops) info.push({ label: 'IOPS', value: `${resource.Iops}` });
      break;

    case 'efs':
      if (resource.PerformanceMode) info.push({ label: 'Performance Mode', value: resource.PerformanceMode });
      if (resource.ThroughputMode) info.push({ label: 'Throughput Mode', value: resource.ThroughputMode });
      break;

    case 'vpc':
      if (resource.CidrBlock) info.push({ label: 'CIDR Block', value: resource.CidrBlock });
      if (resource.IsDefault) info.push({ label: 'Type', value: 'Default VPC' });
      break;

    case 'elb':
      if (resource.Type) info.push({ label: 'Type', value: resource.Type });
      if (resource.Scheme) info.push({ label: 'Scheme', value: resource.Scheme });
      if (resource.DNSName) info.push({ label: 'DNS Name', value: resource.DNSName });
      break;

    case 'route53':
      if (resource.ResourceRecordSetCount) info.push({ label: 'Records', value: `${resource.ResourceRecordSetCount}` });
      break;

    case 'apigateway':
      if (resource.protocolType) info.push({ label: 'Protocol', value: resource.protocolType });
      if (resource.apiEndpoint) info.push({ label: 'Endpoint', value: resource.apiEndpoint });
      break;

    case 'iam':
      if (resource.CreateDate) info.push({ label: 'Created', value: new Date(resource.CreateDate).toLocaleDateString() });
      if (resource.Arn) info.push({ label: 'ARN', value: 'Available' });
      break;

    case 'kms':
      if (resource.KeyState) info.push({ label: 'Key State', value: resource.KeyState });
      if (resource.KeyUsage) info.push({ label: 'Key Usage', value: resource.KeyUsage });
      break;

    case 'elasticache':
      if (resource.Engine) info.push({ label: 'Engine', value: resource.Engine });
      if (resource.CacheNodeType) info.push({ label: 'Node Type', value: resource.CacheNodeType });
      if (resource.NumCacheNodes) info.push({ label: 'Nodes', value: `${resource.NumCacheNodes}` });
      break;

    default:
      // Generic fallback
      if (resource.Type) info.push({ label: 'Type', value: resource.Type });
      if (resource.Region) info.push({ label: 'Region', value: resource.Region });
      break;
  }

  return info;
};
