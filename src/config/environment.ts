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
  apiBaseUrl: 'http://13.127.94.173',
  env: 'development',

  // AWS Cognito Configuration
  cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_oATLPBxAZ',
    clientId: '4v8fnuvgfqqefe67pq4hjtaalm',
    domain: 'us-east-1oatlpbxaz.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'http://localhost:3000',
    redirectSignOut: 'http://localhost:3000',
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
