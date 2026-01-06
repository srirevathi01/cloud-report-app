// Authentication service for AWS Cognito integration
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { jwtDecode } from 'jwt-decode';
import { cognitoConfig } from '../config/cognito';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

export interface CognitoTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  sub: string;
  email?: string;
  email_verified?: boolean;
  'cognito:groups'?: string[];
  'cognito:username'?: string;
  exp: number;
  iat: number;
  iss: string;
}

export interface UserInfo {
  username: string;
  email?: string;
  groups: string[];
  attributes: { [key: string]: string };
}

class AuthService {
  private userPool: CognitoUserPool;
  private currentUser: CognitoUser | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: cognitoConfig.userPoolId,
      ClientId: cognitoConfig.userPoolWebClientId,
    });
  }

  /**
   * Get the currently authenticated Cognito user
   */
  getCurrentUser(): CognitoUser | null {
    return this.userPool.getCurrentUser();
  }

  /**
   * Sign in with username and password (for non-SAML users)
   */
  signIn(username: string, password: string): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          this.currentUser = cognitoUser;
          this.scheduleTokenRefresh(session);
          logger.info('User signed in successfully');
          resolve(session);
        },
        onFailure: (err) => {
          logger.error('Sign in failed:', err);
          reject(err);
        },
        newPasswordRequired: (userAttributes) => {
          logger.warn('New password required');
          reject(new Error('New password required'));
        },
      });
    });
  }

  /**
   * Redirect to Cognito Hosted UI for SAML authentication
   */
  signInWithSAML(): void {
    // const { domain, redirectSignIn, scope, responseType } = cognitoConfig.oauth;

    // Generate PKCE challenge
    // const codeVerifier = this.generateCodeVerifier();
    // sessionStorage.setItem('pkce_code_verifier', codeVerifier);

    // this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
    //   const params = new URLSearchParams({
    //     client_id: cognitoConfig.userPoolWebClientId,
    //     response_type: responseType,
    //     scope: scope.join(' '),
    //     redirect_uri: redirectSignIn,
    //     identity_provider: cognitoConfig.identityProvider,
    //     code_challenge: codeChallenge,
    //     code_challenge_method: 'S256',
    //   });

    //   const authUrl = `https://${domain}/oauth2/authorize?${params.toString()}`;
    //   logger.info('Redirecting to SAML authentication');
    //   window.location.href = authUrl;
    // });
  }

  /**
   * Handle OAuth callback and exchange authorization code for tokens
   * Uses backend proxy to securely handle client secret
   */
  async handleAuthCallback(code: string): Promise<CognitoTokens> {
    const { redirectSignIn } = cognitoConfig.oauth;
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

    if (!codeVerifier) {
      throw new Error('Missing PKCE code verifier');
    }

    // Use backend API to exchange code for tokens (keeps client secret secure)
    const tokenExchangeUrl = `${environment.apiBaseUrl}/api/auth/token-exchange`;

    logger.info('Exchanging authorization code via backend proxy');

    const response = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        code_verifier: codeVerifier,
        redirect_uri: redirectSignIn,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Token exchange failed:', error);
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokens = await response.json();

    // Store tokens securely
    this.storeTokens({
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    // Clean up PKCE verifier
    sessionStorage.removeItem('pkce_code_verifier');

    logger.info('Successfully exchanged authorization code for tokens via backend');
    return {
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  }

  /**
   * Get current session tokens
   */
  async getSession(): Promise<CognitoUserSession | null> {
    const user = this.getCurrentUser();

    if (!user) {
      // Try to get tokens from storage (for SAML flow)
      const tokens = this.getStoredTokens();
      if (tokens) {
        try {
          const session = this.createSessionFromTokens(tokens);

          // Schedule token refresh if not already scheduled
          if (!this.refreshTimer) {
            this.scheduleTokenRefresh(session);
            logger.info('Scheduled token refresh for session loaded from storage');
          }

          return session;
        } catch (error) {
          logger.error('Failed to create session from stored tokens:', error);
          return null;
        }
      }
      return null;
    }

    return new Promise((resolve, reject) => {
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          logger.error('Failed to get session:', err);
          reject(err);
        } else {
          resolve(session);
        }
      });
    });
  }

  /**
   * Get the current ID token
   */
  async getIdToken(): Promise<string | null> {
    // First try to get from sessionStorage (SAML flow)
    const tokens = this.getStoredTokens();

    if (tokens && tokens.idToken) {
      // Check if token is expired or about to expire
      if (this.isTokenExpiringSoon(tokens.idToken)) {
        logger.info('Token expiring soon, refreshing...');
        try {
          await this.refreshSession();
          // Get refreshed token from storage
          const refreshedTokens = this.getStoredTokens();
          if (!refreshedTokens?.idToken) {
            this.clearTokens();
            throw new Error('Failed to get refreshed token');
          }
          logger.info('Token refreshed successfully');
          return refreshedTokens.idToken;
        } catch (refreshError) {
          logger.error('Token refresh failed:', refreshError);
          this.clearTokens();
          throw new Error('Session expired. Please sign in again.');
        }
      }
      return tokens.idToken;
    }

    // Fallback to Cognito session (username/password flow)
    try {
      const session = await this.getSession();
      if (session) {
        return session.getIdToken().getJwtToken();
      }
    } catch (error) {
      logger.error('Failed to get Cognito session:', error);
    }

    return null;
  }

  /**
   * Get the current access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // First try to get from sessionStorage (SAML flow)
      const tokens = this.getStoredTokens();
      if (tokens && tokens.accessToken) {
        logger.log('Retrieved access token from sessionStorage');
        return tokens.accessToken;
      }

      // Fallback to Cognito session (username/password flow)
      const session = await this.getSession();
      if (session) {
        const token = session.getAccessToken().getJwtToken();
        logger.log('Retrieved access token from Cognito session');
        return token;
      }

      logger.warn('No access token available');
      return null;
    } catch (error) {
      logger.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Decode and get user information from ID token
   */
  async getUserInfo(): Promise<UserInfo | null> {
    const idToken = await this.getIdToken();

    if (!idToken) {
      return null;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(idToken);

      return {
        username: decoded['cognito:username'] || decoded.sub,
        email: decoded.email,
        groups: decoded['cognito:groups'] || [],
        attributes: {
          sub: decoded.sub,
          email: decoded.email || '',
          email_verified: decoded.email_verified ? 'true' : 'false',
        },
      };
    } catch (error) {
      logger.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session !== null && session.isValid();
    } catch (error) {
      return false;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const user = this.getCurrentUser();

    if (user) {
      return new Promise((resolve) => {
        user.signOut(() => {
          this.clearTokens();
          this.currentUser = null;
          if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
          }
          logger.info('User signed out');
          resolve();
        });
      });
    } else {
      // For SAML flow, redirect to sign out endpoint
      this.clearTokens();
      const { domain, redirectSignOut } = cognitoConfig.oauth;
      const signOutUrl = `https://${domain}/logout?client_id=${cognitoConfig.userPoolWebClientId}&logout_uri=${encodeURIComponent(redirectSignOut)}`;
      window.location.href = signOutUrl;
    }
  }

  /**
   * Refresh the current session tokens
   */
  async refreshSession(): Promise<CognitoUserSession> {
    const user = this.getCurrentUser();

    if (!user) {
      // SAML flow: Use refresh token from storage
      const tokens = this.getStoredTokens();
      if (tokens?.refreshToken) {
        return this.refreshTokens(tokens.refreshToken);
      }
      throw new Error('No user session to refresh');
    }

    // Cognito user flow: Use Cognito SDK
    return new Promise((resolve, reject) => {
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          reject(err || new Error('No session found'));
          return;
        }

        if (session.isValid()) {
          resolve(session);
          return;
        }

        const refreshToken = session.getRefreshToken();
        user.refreshSession(refreshToken, (refreshErr, newSession) => {
          if (refreshErr) {
            logger.error('Cognito refresh failed:', refreshErr);
            reject(refreshErr);
          } else {
            this.storeTokens({
              idToken: newSession.getIdToken().getJwtToken(),
              accessToken: newSession.getAccessToken().getJwtToken(),
              refreshToken: newSession.getRefreshToken().getToken(),
            });
            this.scheduleTokenRefresh(newSession);
            logger.info('Session refreshed successfully');
            resolve(newSession);
          }
        });
      });
    });
  }

  /**
   * Refresh tokens using refresh token via backend proxy
   * Uses backend to securely handle client secret for confidential clients
   */
  private async refreshTokens(refreshToken: string): Promise<CognitoUserSession> {
    const refreshEndpoint = `${environment.apiBaseUrl}/api/auth/refresh-token`;

    const response = await fetch(refreshEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Token refresh failed:', errorText);
      throw new Error(`Failed to refresh tokens: ${errorText}`);
    }

    const tokens = await response.json();

    this.storeTokens({
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
      refreshToken: refreshToken, // Refresh token is not rotated in Cognito
    });

    logger.info('Tokens refreshed successfully');

    return this.createSessionFromTokens({
      idToken: tokens.id_token,
      accessToken: tokens.access_token,
      refreshToken: refreshToken,
    });
  }

  /**
   * Store tokens securely in sessionStorage
   */
  private storeTokens(tokens: CognitoTokens): void {
    sessionStorage.setItem('idToken', tokens.idToken);
    sessionStorage.setItem('accessToken', tokens.accessToken);
    sessionStorage.setItem('refreshToken', tokens.refreshToken);
    logger.info('Tokens stored in sessionStorage');
  }

  /**
   * Get stored tokens from sessionStorage
   */
  private getStoredTokens(): CognitoTokens | null {
    const idToken = sessionStorage.getItem('idToken');
    const accessToken = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');

    if (idToken && accessToken && refreshToken) {
      return { idToken, accessToken, refreshToken };
    }

    return null;
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  }

  /**
   * Create a CognitoUserSession from tokens
   */
  private createSessionFromTokens(tokens: CognitoTokens): CognitoUserSession {
    const { CognitoIdToken, CognitoAccessToken, CognitoRefreshToken } = require('amazon-cognito-identity-js');

    return new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: tokens.idToken }),
      AccessToken: new CognitoAccessToken({ AccessToken: tokens.accessToken }),
      RefreshToken: new CognitoRefreshToken({ RefreshToken: tokens.refreshToken }),
    });
  }

  /**
   * Schedule automatic token refresh before expiration
   */
  private scheduleTokenRefresh(session: CognitoUserSession): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const expirationTime = session.getIdToken().getExpiration() * 1000;
    const currentTime = Date.now();
    const expiresIn = expirationTime - currentTime;
    const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 0); // Refresh 5 minutes before expiry

    logger.info(`Token refresh scheduled in ${Math.floor(refreshTime / 60000)} minutes`);

    this.refreshTimer = setTimeout(() => {
      logger.info('Automatic token refresh triggered');
      this.refreshSession().catch((error) => {
        logger.error('Automatic token refresh failed:', error);
      });
    }, refreshTime);
  }

  /**
   * Generate PKCE code verifier
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }

  /**
   * Base64 URL encode
   */
  private base64URLEncode(array: Uint8Array): string {
    const str = Array.from(array)
      .map(byte => String.fromCharCode(byte))
      .join('');
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Check if a token is expired or expiring soon (within 5 minutes)
   */
  private isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      return expirationTime - currentTime <= fiveMinutes;
    } catch (error) {
      logger.error('Failed to decode token:', error);
      return true;
    }
  }
}

export const authService = new AuthService();
