/**
 * Environment configuration
 * Centralized location for all application configuration
 * Update values directly in this file instead of using .env files
 */

export interface Environment {
  // API Configuration
  apiBaseUrl: string;
  env: 'development' | 'production' | 'staging';

  // AWS Cognito Configuration
  cognito: {
    region: string;
    userPoolId: string;
    clientId: string;
    domain: string;
    redirectSignIn: string;
    redirectSignOut: string;
    identityProvider: string;
  };

  // Runtime Environment
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
}

/**
 * Environment configuration
 * Update these values directly for your environment
 */
export const environment: Environment = {
  // API Configuration
  apiBaseUrl: 'http://cloud-report-alb-357980303.us-east-1.elb.amazonaws.com',
  env: 'development',

  // AWS Cognito Configuration
  cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_Qe5yZvwHa',
    clientId: '6jsu25e6vn6di2770j5gc2q57n',
    domain: 'us-east-1qe5yzvwha.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://d1fd4y10eleeus.cloudfront.net',
    redirectSignOut: 'https://d1fd4y10eleeus.cloudfront.net',
    identityProvider: 'IAMSAML',
  },

  // Runtime flags (derived from env)
  get isDevelopment() { return this.env === 'development'; },
  get isProduction() { return this.env === 'production'; },
  get isStaging() { return this.env === 'staging'; },
};

/**
 * Validate that required environment variables are set
 */
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!environment.cognito.userPoolId) {
    errors.push('REACT_APP_COGNITO_USER_POOL_ID is required');
  }

  if (!environment.cognito.clientId) {
    errors.push('REACT_APP_COGNITO_CLIENT_ID is required');
  }

  if (!environment.cognito.domain) {
    errors.push('REACT_APP_COGNITO_DOMAIN is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
