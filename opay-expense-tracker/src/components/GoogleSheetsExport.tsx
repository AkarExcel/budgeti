import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, Plus, User, LogOut, X } from 'lucide-react';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { ExpenseData } from '../types/index';

interface GoogleSheetsExportProps {
  expenses: ExpenseData[];
  disabled?: boolean;
}

export function GoogleSheetsExport({ expenses, disabled = false }: GoogleSheetsExportProps) {
  const {
    isInitialized,
    isSignedIn,
    isExporting,
    user,
    userSpreadsheets,
    signIn,
    signOut,
    exportExpenses,
    exportToExistingSpreadsheet,
    getUserSpreadsheets,
    error,
    clearError
  } = useGoogleSheets();

  const [exportMode, setExportMode] = useState<'new' | 'existing'>('new');
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('OPay Expense Export');
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load user spreadsheets when signed in
  useEffect(() => {
    if (isSignedIn) {
      getUserSpreadsheets();
    }
  }, [isSignedIn, getUserSpreadsheets]);

  // Clear error when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      clearError();
    }
  }, [isDialogOpen, clearError]);

  // Handle export to new spreadsheet
  const handleExportNew = async () => {
    if (!spreadsheetTitle.trim()) {
      toast.error('Please enter a spreadsheet title');
      return;
    }

    try {
      const url = await exportExpenses(expenses, `${spreadsheetTitle}${customNotes ? ` - ${customNotes}` : ''}`);
      toast.success('Expenses exported successfully!');
      setIsDialogOpen(false);
      
      // Open the spreadsheet in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    }
  };

  // Handle export to existing spreadsheet
  const handleExportExisting = async () => {
    if (!selectedSpreadsheetId) {
      toast.error('Please select a spreadsheet');
      return;
    }

    try {
      await exportToExistingSpreadsheet(expenses, selectedSpreadsheetId);
      toast.success('Expenses exported successfully!');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    }
  };

  // Handle sign in
  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      toast.error('Failed to sign in to Google');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast.error('Failed to sign out from Google');
    }
  };

  const exportDisabled = disabled || isExporting || expenses.length === 0;

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setIsDialogOpen(true)}
        disabled={exportDisabled}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" />
        Export to Sheets
      </button>

      {/* Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                <h2 className="text-lg font-semibold text-neutral-900">Export to Google Sheets</h2>
              </div>
              <button 
                onClick={() => setIsDialogOpen(false)} 
                className="p-1 hover:bg-neutral-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Description */}
              <p className="text-sm text-neutral-600">
                Export your expenses to Google Sheets for further analysis and sharing.
              </p>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Sign In/Out Section */}
              {!isSignedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <User className="h-4 w-4" />
                    Sign in to Google to export your expenses
                  </div>
                  <button 
                    onClick={handleSignIn} 
                    className="w-full py-2 bg-primary-500 text-white rounded-md hover:bg-primary-400 disabled:opacity-50"
                    disabled={!isInitialized || isExporting}
                  >
                    {isInitialized ? 'Sign in with Google' : 'Loading...'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* User Info and Sign Out */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>Signed in as {user?.getName?.() || 'User'}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-1 text-neutral-500 hover:bg-neutral-100 rounded"
                    >
                      <LogOut className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Export Mode Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-neutral-700">Export Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExportMode('new')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm border ${
                          exportMode === 'new' 
                            ? 'bg-primary-500 text-white border-primary-500' 
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <Plus className="h-4 w-4 mr-1 inline" />
                        New Sheet
                      </button>
                      <button
                        onClick={() => setExportMode('existing')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm border ${
                          exportMode === 'existing' 
                            ? 'bg-primary-500 text-white border-primary-500' 
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        } ${userSpreadsheets.length === 0 ? 'opacity-50' : ''}`}
                        disabled={userSpreadsheets.length === 0}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-1 inline" />
                        Existing
                      </button>
                    </div>
                  </div>

                  {/* Export Configuration */}
                  {exportMode === 'new' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Spreadsheet Title
                        </label>
                        <input
                          type="text"
                          value={spreadsheetTitle}
                          onChange={(e) => setSpreadsheetTitle(e.target.value)}
                          placeholder="Enter spreadsheet title"
                          disabled={isExporting}
                          className="w-full py-2 px-3 border border-neutral-200 rounded-md focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={customNotes}
                          onChange={(e) => setCustomNotes(e.target.value)}
                          placeholder="Add any notes for this export"
                          disabled={isExporting}
                          rows={2}
                          className="w-full py-2 px-3 border border-neutral-200 rounded-md focus:border-primary-500 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Select Spreadsheet
                      </label>
                      <select 
                        value={selectedSpreadsheetId} 
                        onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                        disabled={isExporting || userSpreadsheets.length === 0}
                        className="w-full py-2 px-3 border border-neutral-200 rounded-md focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Choose a spreadsheet</option>
                        {userSpreadsheets.map((sheet) => (
                          <option key={sheet.id} value={sheet.id}>
                            {sheet.name} (Modified: {new Date(sheet.modifiedTime).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                      {userSpreadsheets.length === 0 && (
                        <p className="text-xs text-neutral-500 mt-1">
                          No spreadsheets found. Create a new one instead.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Export Button */}
                  <button
                    onClick={exportMode === 'new' ? handleExportNew : handleExportExisting}
                    disabled={isExporting || (exportMode === 'new' && !spreadsheetTitle.trim()) || (exportMode === 'existing' && !selectedSpreadsheetId)}
                    className="w-full py-2 bg-primary-500 text-white rounded-md hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export {expenses.length} Expenses
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}