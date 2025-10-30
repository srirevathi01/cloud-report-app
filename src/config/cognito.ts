// Cognito configuration for AWS Cognito + Identity Center SAML integration
import { environment, validateEnvironment } from './environment';

export const cognitoConfig = {
  region: environment.cognito.region,
  userPoolId: environment.cognito.userPoolId,
  userPoolWebClientId: environment.cognito.clientId,
  oauth: {
    domain: environment.cognito.domain,
    scope: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
    redirectSignIn: environment.cognito.redirectSignIn,
    redirectSignOut: environment.cognito.redirectSignOut,
    responseType: 'code' as const, // Use authorization code flow with PKCE
  },
  // The exact name you gave the SAML IdP in Cognito (e.g., 'IdentityCenter', 'AWSIdentityCenter', or your custom name)
  identityProvider: environment.cognito.identityProvider,
};

export const validateCognitoConfig = (): boolean => {
  const { isValid } = validateEnvironment();
  return isValid;
};
