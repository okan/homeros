import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  Scissors,
  SquarePen,
  Palette,
  SlidersHorizontal,
  Puzzle,
  Database,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from './Modal';
import { ThemePicker } from './ThemePicker';
import { ToolbarSettings } from './ToolbarSettings';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useTodoStore } from '../store/useTodoStore';
import { useHabitStore } from '../store/useHabitStore';
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
  onOpenSnippetManager: () => void;
}

type ImportMode = 'replace' | 'merge';
type ImportStep = 'select' | 'confirm' | 'success' | 'error';
type SettingsTab = 'appearance' | 'toolbar' | 'features' | 'data';

const TABS: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: 'appearance', label: 'Theme', icon: Palette },
  { id: 'toolbar', label: 'Toolbar', icon: SlidersHorizontal },
  { id: 'features', label: 'Features', icon: Puzzle },
  { id: 'data', label: 'Data', icon: Database },
];

export const SettingsModal = ({ isOpen, onClose, onOpenSnippetManager }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [importStep, setImportStep] = useState<ImportStep>('select');
  const [importData, setImportData] = useState<HomerosExport | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('replace');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { slots, loadFromStorage } = useBookmarkStore();
  const { todos, loadTodosFromStorage } = useTodoStore();
  const { habits, loadHabits } = useHabitStore();
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
              <p className="text-value text-text-primary font-medium mb-2">File contents:</p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>
                  • {importSummary?.slots} slots with {importSummary?.links} links
                </li>
                <li>• {importSummary?.todos} todos</li>
                <li>• {importSummary?.habits} habits</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-value text-text-primary font-medium">Import mode:</p>
              <label className="flex items-start gap-3 p-3 rounded-control border border-border-element cursor-pointer hover:bg-bg-wash transition-colors">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-value text-text-primary font-medium">Replace all data</p>
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
                  <p className="text-value text-text-primary font-medium">Merge with existing</p>
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
            <p className="text-value text-text-primary font-medium mb-1">Import successful!</p>
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
            <p className="text-value text-text-primary font-medium mb-1">Import failed</p>
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
        // Fixed height so the modal doesn't resize when switching tabs
        return (
          <div className="flex gap-4 h-[420px]">
            <div
              role="tablist"
              aria-label="Settings sections"
              aria-orientation="vertical"
              className="w-36 shrink-0 space-y-1 border-r border-border-element pr-3"
            >
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-control text-value font-medium transition-colors text-left ${
                    activeTab === id
                      ? 'bg-interactive-primary/10 text-interactive-primary'
                      : 'text-text-secondary hover:bg-bg-wash hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 min-w-0 overflow-y-auto">
              {activeTab === 'appearance' && <ThemePicker />}

              {activeTab === 'toolbar' && <ToolbarSettings />}

              {activeTab === 'features' && (
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
                          },
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
                        <p className="text-value text-text-primary font-medium">Text Snippets</p>
                        <p className="text-sm text-text-secondary">Quick access & copy</p>
                      </div>
                    </div>
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        settings.enabled ? 'bg-interactive-primary' : 'bg-border-element'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          settings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </button>

                  {settings.enabled && (
                    <button
                      onClick={onOpenSnippetManager}
                      className="w-full flex items-center gap-3 p-3 rounded-control border border-border-element hover:bg-bg-wash transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-interactive-primary/10 flex items-center justify-center">
                        <SquarePen className="w-5 h-5 text-interactive-primary" />
                      </div>
                      <div>
                        <p className="text-value text-text-primary font-medium">Manage Snippets</p>
                        <p className="text-sm text-text-secondary">
                          View, add, and edit your snippets
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-2">
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center gap-3 p-3 rounded-control border border-border-element hover:bg-bg-wash transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-interactive-primary/10 flex items-center justify-center">
                      <Download className="w-5 h-5 text-interactive-primary" />
                    </div>
                    <div>
                      <p className="text-value text-text-primary font-medium">Export All Data</p>
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
                      <p className="text-value text-text-primary font-medium">Import Data</p>
                      <p className="text-sm text-text-secondary">Restore from a backup file</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  <div className="pt-2 border-t border-border-element">
                    <p className="text-xs text-text-placeholder">
                      Current data: {slots.length} slots, {todos.length} todos, {habits.length}{' '}
                      habits
                    </p>
                  </div>
                </div>
              )}
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
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()} wide={importStep === 'select'}>
      {renderContent()}
    </Modal>
  );
};
