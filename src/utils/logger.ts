import { ENABLE_LOGGING } from '../config/constants';

export const logger = {
  log: (...args: any[]) => {
    if (ENABLE_LOGGING) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (ENABLE_LOGGING) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (ENABLE_LOGGING) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (ENABLE_LOGGING) {
      console.info(...args);
    }
  }
};
