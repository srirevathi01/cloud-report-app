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
