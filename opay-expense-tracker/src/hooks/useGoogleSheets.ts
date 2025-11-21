import { useState, useEffect, useCallback } from 'react';
import { googleSheetsService } from '../services/googleSheetsService';
import { ExpenseData } from '../types/index';

export interface UseGoogleSheetsReturn {
  isInitialized: boolean;
  isSignedIn: boolean;
  isExporting: boolean;
  user: any | null;
  userSpreadsheets: any[];
  initializeGoogleAPI: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  exportExpenses: (expenses: ExpenseData[], spreadsheetTitle?: string) => Promise<string>;
  exportToExistingSpreadsheet: (expenses: ExpenseData[], spreadsheetId: string) => Promise<void>;
  getUserSpreadsheets: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export function useGoogleSheets(): UseGoogleSheetsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [userSpreadsheets, setUserSpreadsheets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize Google API
  const initializeGoogleAPI = useCallback(async () => {
    try {
      clearError();
      await googleSheetsService.initializeGapi();
      setIsInitialized(true);
      
      // Check if already signed in
      if (googleSheetsService.isSignedIn()) {
        setIsSignedIn(true);
        setUser(googleSheetsService.getCurrentUser());
      }
    } catch (err) {
      console.error('Failed to initialize Google API:', err);
      setError('Failed to initialize Google API. Please make sure Google API is properly configured.');
    }
  }, [clearError]);

  // Sign in to Google
  const signIn = useCallback(async () => {
    try {
      clearError();
      setIsExporting(true);
      await googleSheetsService.signIn();
      setIsSignedIn(true);
      setUser(googleSheetsService.getCurrentUser());
    } catch (err) {
      console.error('Failed to sign in:', err);
      setError('Failed to sign in to Google. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [clearError]);

  // Sign out from Google
  const signOut = useCallback(async () => {
    try {
      clearError();
      await googleSheetsService.signOut();
      setIsSignedIn(false);
      setUser(null);
      setUserSpreadsheets([]);
    } catch (err) {
      console.error('Failed to sign out:', err);
      setError('Failed to sign out from Google.');
    }
  }, [clearError]);

  // Export expenses to new spreadsheet
  const exportExpenses = useCallback(async (expenses: ExpenseData[], spreadsheetTitle?: string): Promise<string> => {
    try {
      clearError();
      setIsExporting(true);
      const spreadsheetUrl = await googleSheetsService.exportExpenses(expenses, spreadsheetTitle);
      return spreadsheetUrl;
    } catch (err) {
      console.error('Failed to export expenses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export expenses to Google Sheets';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [clearError]);

  // Export expenses to existing spreadsheet
  const exportToExistingSpreadsheet = useCallback(async (expenses: ExpenseData[], spreadsheetId: string): Promise<void> => {
    try {
      clearError();
      setIsExporting(true);
      await googleSheetsService.exportToExistingSpreadsheet(expenses, spreadsheetId);
    } catch (err) {
      console.error('Failed to export to existing spreadsheet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export expenses to the selected spreadsheet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [clearError]);

  // Get user's spreadsheets
  const getUserSpreadsheets = useCallback(async () => {
    try {
      clearError();
      const spreadsheets = await googleSheetsService.getUserSpreadsheets();
      setUserSpreadsheets(spreadsheets);
    } catch (err) {
      console.error('Failed to get user spreadsheets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load your Google Spreadsheets';
      setError(errorMessage);
    }
  }, [clearError]);

  // Initialize on mount
  useEffect(() => {
    initializeGoogleAPI();
  }, [initializeGoogleAPI]);

  // Listen for auth changes
  useEffect(() => {
    if (!isInitialized) return;

    const checkAuthState = () => {
      const signedIn = googleSheetsService.isSignedIn();
      setIsSignedIn(signedIn);
      if (signedIn) {
        setUser(googleSheetsService.getCurrentUser());
      } else {
        setUser(null);
      }
    };

    // Set up auth state listener
    if (typeof window !== 'undefined' && (window as any).gapi) {
      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      if (authInstance) {
        authInstance.isSignedIn.listen(checkAuthState);
        checkAuthState(); // Initial check
      }
    }
  }, [isInitialized]);

  return {
    isInitialized,
    isSignedIn,
    isExporting,
    user,
    userSpreadsheets,
    initializeGoogleAPI,
    signIn,
    signOut,
    exportExpenses,
    exportToExistingSpreadsheet,
    getUserSpreadsheets,
    error,
    clearError
  };
}