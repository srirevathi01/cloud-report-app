import { environment } from './environment';

// API Configuration
export const API_BASE_URL = environment.apiBaseUrl;
export const ENVIRONMENT = environment.env;

// Logging configuration
export const ENABLE_LOGGING = environment.isDevelopment;
