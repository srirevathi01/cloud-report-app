import { AWSAccount } from '../types';

const STORAGE_KEYS = {
  AWS_ACCOUNTS: 'aws_accounts',
} as const;

export const storageService = {
  getAccounts: (): AWSAccount[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AWS_ACCOUNTS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // Validate the structure
      if (!Array.isArray(parsed)) {
        console.error('Invalid accounts data structure');
        return [];
      }

      // Validate each account object
      const validAccounts = parsed.filter((account: any) => {
        return (
          account &&
          typeof account === 'object' &&
          typeof account.id === 'string' &&
          typeof account.name === 'string' &&
          typeof account.accountId === 'string' &&
          /^\d{12}$/.test(account.accountId) // Valid AWS account ID format
        );
      });

      return validAccounts;
    } catch (error) {
      console.error('Error reading accounts from localStorage:', error);
      return [];
    }
  },

  saveAccounts: (accounts: AWSAccount[]): boolean => {
    try {
      localStorage.setItem(STORAGE_KEYS.AWS_ACCOUNTS, JSON.stringify(accounts));
      return true;
    } catch (error) {
      console.error('Error saving accounts to localStorage:', error);
      return false;
    }
  },

  clearAccounts: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AWS_ACCOUNTS);
    } catch (error) {
      console.error('Error clearing accounts from localStorage:', error);
    }
  }
};
