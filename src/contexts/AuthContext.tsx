// Authentication Context Provider for React application
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserInfo } from '../services/authService';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';
import AlertModal from '../components/AlertModal';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  signIn: (username: string, password: string) => Promise<void>;
  signInWithSAML: () => void;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const callbackHandledRef = React.useRef(false);

  useEffect(() => {
    // Configure API service with token getter and refresher
    apiService.setTokenGetter(async () => {
      try {
        return await authService.getIdToken();
      } catch (error) {
        logger.error('Failed to get token, clearing auth state:', error);
        // Token retrieval failed (likely refresh failed), clear auth state
        setIsAuthenticated(false);
        setUser(null);
        // Return null instead of throwing - let the 401 handler deal with it
        return null;
      }
    });
    apiService.setTokenRefresher(async () => {
      try {
        await authService.refreshSession();
        logger.info('Token refreshed via API service');
      } catch (error) {
        logger.error('Failed to refresh token via API service:', error);
        // Force user to re-authenticate
        setIsAuthenticated(false);
        setUser(null);
        throw error;
      }
    });

    // Prevent double execution of callback handling (React 18 strict mode runs effects twice)
    if (callbackHandledRef.current) {
      return;
    }

    // Check if we have an OAuth callback first
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code || error) {
      callbackHandledRef.current = true;
      handleAuthCallback();
    } else {
      initializeAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);
        logger.info('User authenticated:', userInfo?.username);
      }
    } catch (error) {
      logger.error('Auth initialization failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCallback = async () => {
    setIsLoading(true);

    try {
      // Check if we're returning from OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        logger.error('OAuth error:', error);
        setIsAuthenticated(false);
        setUser(null);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setAuthError(`Authentication error: ${error}`);
        setShowAuthError(true);
        return;
      }

      if (code) {
        logger.info('Handling OAuth callback with code:', code.substring(0, 10) + '...');

        try {
          // Exchange authorization code for tokens
          await authService.handleAuthCallback(code);

          // Get user info
          const userInfo = await authService.getUserInfo();
          setUser(userInfo);
          setIsAuthenticated(true);

          logger.info('OAuth authentication successful for user:', userInfo?.username);

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error: any) {
          logger.error('OAuth callback handling failed:', error);
          setIsAuthenticated(false);
          setUser(null);

          // Show user-friendly error
          setAuthError(`Authentication failed: ${error.message || 'Please try again'}`);
          setShowAuthError(true);

          // Clean up URL even on error
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.signIn(username, password);

      const userInfo = await authService.getUserInfo();
      setUser(userInfo);
      setIsAuthenticated(true);

      logger.info('User signed in successfully');
    } catch (error) {
      logger.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithSAML = () => {
    authService.signInWithSAML();
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    return authService.getIdToken();
  };

  const getAccessToken = async (): Promise<string | null> => {
    return authService.getAccessToken();
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signInWithSAML,
    signOut,
    getIdToken,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authError && showAuthError && (
        <AlertModal
          type="error"
          title="Authentication Error"
          message={authError}
          onClose={() => {
            setShowAuthError(false);
            setAuthError(null);
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
