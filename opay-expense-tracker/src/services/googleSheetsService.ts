// Using Google Identity Services (GIS) for OAuth, no googleapis import needed
import { ExpenseData } from '../types/index';

export interface GoogleSheetsConfig {
  clientId: string;
  scopes: string[];
}

class GoogleSheetsService {
  private gapi: any;
  private isGapiInitialized: boolean = false;
  private isAuthInitialized: boolean = false;

  constructor() {
    // Initialize gapi from global scope
    if (typeof window !== 'undefined') {
      this.gapi = (window as any).gapi;
    }
  }

  /**
   * Initialize Google API client
   */
  async initializeGapi(): Promise<void> {
    if (this.isGapiInitialized) return;

    return new Promise((resolve, reject) => {
      if (!this.gapi) {
        reject(new Error('Google API not loaded'));
        return;
      }

      this.gapi.load('client:auth2', async () => {
        try {
          await this.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            scope: 'https://www.googleapis.com/auth/spreadsheets'
          });

          this.isGapiInitialized = true;
          this.isAuthInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.isAuthInitialized && this.gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  /**
   * Sign in to Google
   */
  async signIn(): Promise<void> {
    if (!this.isGapiInitialized) {
      await this.initializeGapi();
    }

    const authInstance = this.gapi.auth2.getAuthInstance();
    await authInstance.signIn();
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    if (this.isAuthInitialized) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    }
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    if (this.isSignedIn()) {
      return this.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    }
    return null;
  }

  /**
   * Export expenses to Google Sheets
   */
  async exportExpenses(expenses: ExpenseData[], spreadsheetTitle?: string): Promise<string> {
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to export to Google Sheets');
    }

    // Create spreadsheet
    const spreadsheet = await this.createSpreadsheet(spreadsheetTitle || 'OPay Expense Export');
    
    // Prepare data for export
    const exportData = this.prepareExpenseData(expenses);
    
    // Write data to spreadsheet
    await this.writeDataToSpreadsheet(spreadsheet.spreadsheetId, exportData);
    
    return spreadsheet.spreadsheetUrl;
  }

  /**
   * Create a new spreadsheet
   */
  private async createSpreadsheet(title: string): Promise<any> {
    const response = await this.gapi.client.sheets.spreadsheets.create({
      properties: {
        title: title
      },
      sheets: [
        {
          properties: {
            title: 'Expenses'
          }
        }
      ]
    });

    return response.result;
  }

  /**
   * Prepare expense data for export
   */
  private prepareExpenseData(expenses: ExpenseData[]): (string | number)[][] {
    // Header row
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Notes'];
    
    // Data rows
    const data = expenses.map(expense => [
      expense.date,
      expense.description,
      expense.category,
      expense.amount.toString(),
      expense.notes || ''
    ]);

    return [headers, ...data];
  }

  /**
   * Write data to spreadsheet
   */
  private async writeDataToSpreadsheet(spreadsheetId: string, data: (string | number)[][]): Promise<void> {
    const range = 'A1:E' + data.length;
    
    await this.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: data
      }
    });

    // Format headers
    await this.formatHeaders(spreadsheetId, data.length);
  }

  /**
   * Format header row
   */
  private async formatHeaders(spreadsheetId: string, rowCount: number): Promise<void> {
    const requests = [
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 5
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.9,
                green: 0.9,
                blue: 0.9
              },
              textFormat: {
                bold: true
              }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      }
    ];

    await this.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests
      }
    });
  }

  /**
   * Get user's spreadsheets
   */
  async getUserSpreadsheets(): Promise<any[]> {
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to access spreadsheets');
    }

    const response = await this.gapi.client.drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      pageSize: 50,
      fields: 'files(id,name,modifiedTime)'
    });

    return response.result.files || [];
  }

  /**
   * Export expenses to existing spreadsheet
   */
  async exportToExistingSpreadsheet(expenses: ExpenseData[], spreadsheetId: string): Promise<void> {
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to export to Google Sheets');
    }

    // Prepare data for export
    const exportData = this.prepareExpenseData(expenses);
    
    // Clear existing data in the sheet and write new data
    const range = 'A1:E' + exportData.length;
    
    await this.gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'A:Z'
    });

    await this.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: exportData
      }
    });

    // Format headers
    await this.formatHeaders(spreadsheetId, exportData.length);
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();