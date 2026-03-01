import { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle2, Moon, Sun, Scissors } from 'lucide-react';
import { Modal } from './Modal';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useTodoStore } from '../store/useTodoStore';
import { useHabitStore } from '../store/useHabitStore';
import { useThemeStore } from '../store/useThemeStore';
import { useSnippetStore } from '../store/useSnippetStore';
import { useModalStore } from '../store/useModalStore';
import {
  createExportData,
  downloadExport,
  validateImport,
  getImportSummary,
  mergeBookmarks,
  mergeTodos,
  mergeHabits,
  regenerateIds,
  type ImportSummary,
} from '../utils/dataExport';
import type { HomerosExport } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportMode = 'replace' | 'merge';
type ImportStep = 'select' | 'confirm' | 'success' | 'error';

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [importStep, setImportStep] = useState<ImportStep>('select');
  const [importData, setImportData] = useState<HomerosExport | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('replace');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { slots, loadFromStorage } = useBookmarkStore();
  const { todos, loadTodosFromStorage } = useTodoStore();
  const { habits, loadHabits } = useHabitStore();
  const { isDarkMode, setTheme } = useThemeStore();
  const { snippets, settings, setSnippetsEnabled, clearSnippets } = useSnippetStore();
  const { openConfirmModal } = useModalStore();

  const handleExport = () => {
    const exportData = createExportData(slots, todos, habits);
    downloadExport(exportData);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateImport(content);

      if (!result.valid || !result.data) {
        setError(result.error || 'Unknown error');
        setImportStep('error');
        return;
      }

      setImportData(result.data);
      setImportSummary(getImportSummary(result.data));
      setImportStep('confirm');
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setImportStep('error');
    };

    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    if (!importData) return;

    if (importMode === 'replace') {
      const newData = regenerateIds(importData);
      loadFromStorage(newData.data.bookmarks);
      loadTodosFromStorage(newData.data.todos);
      loadHabits(newData.data.habits);
    } else {
      const mergedBookmarks = mergeBookmarks(slots, importData.data.bookmarks);
      const mergedTodos = mergeTodos(todos, importData.data.todos);
      const mergedHabits = mergeHabits(habits, importData.data.habits);

      loadFromStorage(mergedBookmarks);
      loadTodosFromStorage(mergedTodos);
      loadHabits(mergedHabits);
    }

    setImportStep('success');
  };

  const resetImport = () => {
    setImportStep('select');
    setImportData(null);
    setImportSummary(null);
    setImportMode('replace');
    setError('');
  };

  const handleClose = () => {
    resetImport();
    onClose();
  };

  const renderContent = () => {
    switch (importStep) {
      case 'confirm':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-bg-wash rounded-control">
              <p className="text-value text-text-primary font-medium mb-2">
                File contents:
              </p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• {importSummary?.slots} slots with {importSummary?.links} links</li>
                <li>• {importSummary?.todos} todos</li>
                <li>• {importSummary?.habits} habits</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-value text-text-primary font-medium">
                Import mode:
              </p>
              <label className="flex items-start gap-3 p-3 rounded-control border border-border-element cursor-pointer hover:bg-bg-wash transition-colors">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-value text-text-primary font-medium">
                    Replace all data
                  </p>
                  <p className="text-sm text-text-secondary">
                    Delete existing data and import everything fresh
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-control border border-border-element cursor-pointer hover:bg-bg-wash transition-colors">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-value text-text-primary font-medium">
                    Merge with existing
                  </p>
                  <p className="text-sm text-text-secondary">
                    Keep existing data and add new items (skips duplicates)
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={resetImport}
                className="flex-1 px-coarse py-normal text-value font-medium text-text-secondary bg-bg-wash hover:bg-bg-content rounded-control transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="flex-1 px-coarse py-normal text-value font-medium text-white bg-interactive-primary hover:bg-interactive-primary-hover rounded-control transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-value text-text-primary font-medium mb-1">
              Import successful!
            </p>
            <p className="text-sm text-text-secondary mb-4">
              Your data has been {importMode === 'replace' ? 'restored' : 'merged'}.
            </p>
            <button
              onClick={handleClose}
              className="px-coarse py-normal text-value font-medium text-white bg-interactive-primary hover:bg-interactive-primary-hover rounded-control transition-colors"
            >
              Done
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-value text-text-primary font-medium mb-1">
              Import failed
            </p>
            <p className="text-sm text-text-secondary mb-4">{error}</p>
            <button
              onClick={resetImport}
              className="px-coarse py-normal text-value font-medium text-white bg-interactive-primary hover:bg-interactive-primary-hover rounded-control transition-colors"
            >
              Try again
            </button>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-value font-medium text-text-primary mb-3">
                Appearance
              </h3>
              <button
                onClick={() => setTheme(!isDarkMode)}
                className="w-full flex items-center justify-between p-3 rounded-control border border-border-element hover:bg-bg-wash transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-interactive-primary/10 flex items-center justify-center">
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-interactive-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-interactive-primary" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-value text-text-primary font-medium">
                      Dark Mode
                    </p>
                    <p className="text-sm text-text-secondary">
                      {isDarkMode ? 'Currently enabled' : 'Currently disabled'}
                    </p>
                  </div>
                </div>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-interactive-primary' : 'bg-border-element'
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </div>
              </button>
            </div>

            <div>
              <h3 className="text-value font-medium text-text-primary mb-3">
                Snippets
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (settings.enabled && snippets.length > 0) {
                      openConfirmModal(
                        'Disable Snippets?',
                        'Disabling this feature will permanently delete all your snippets. Do you want to continue?',
                        () => {
                          setSnippetsEnabled(false);
                          clearSnippets();
                        }
                      );
                    } else {
                      setSnippetsEnabled(!settings.enabled);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-control border border-border-element hover:bg-bg-wash transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-interactive-primary/10 flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-interactive-primary" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-value text-text-primary font-medium">Text Snippets</p>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-interactive-primary/10 text-interactive-primary ml-2">
                          New
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">Quick access & copy</p>
                    </div>
                  </div>
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-interactive-primary' : 'bg-border-element'
                      }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-value font-medium text-text-primary mb-3">
                Data Management
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 p-3 rounded-control border border-border-element hover:bg-bg-wash transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-interactive-primary/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-interactive-primary" />
                  </div>
                  <div>
                    <p className="text-value text-text-primary font-medium">
                      Export All Data
                    </p>
                    <p className="text-sm text-text-secondary">
                      Download a backup of all your data
                    </p>
                  </div>
                </button>

                <label className="w-full flex items-center gap-3 p-3 rounded-control border border-border-element hover:bg-bg-wash transition-colors text-left cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-interactive-primary/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-interactive-primary" />
                  </div>
                  <div>
                    <p className="text-value text-text-primary font-medium">
                      Import Data
                    </p>
                    <p className="text-sm text-text-secondary">
                      Restore from a backup file
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-border-element">
              <p className="text-xs text-text-placeholder">
                Current data: {slots.length} slots, {todos.length} todos, {habits.length} habits
              </p>
            </div>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (importStep) {
      case 'confirm':
        return 'Import Data';
      case 'success':
        return 'Import Complete';
      case 'error':
        return 'Import Error';
      default:
        return 'Settings';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()}>
      {renderContent()}
    </Modal>
  );
};
