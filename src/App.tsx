import { useState, useEffect, useCallback } from 'react';
import { useThemeStore } from './store/useThemeStore';
import { useBookmarkStore } from './store/useBookmarkStore';
import { useTodoStore } from './store/useTodoStore';
import { useChromeStorage } from './hooks/useChromeStorage';
import { useTodoStorage } from './hooks/useTodoStorage';
import { useSnippetStorage } from './hooks/useSnippetStorage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Toolbar } from './components/Toolbar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { TodoPanel } from './components/TodoPanel';
import { AppModals } from './components/AppModals';

function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSnippetManagerOpen, setIsSnippetManagerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useChromeStorage();
  useTodoStorage();
  useSnippetStorage();

  const toggleEditMode = useBookmarkStore((state) => state.toggleEditMode);
  const toggleTodoPanel = useTodoStore((state) => state.toggleTodoPanel);

  useKeyboardShortcuts({
    onSearch: () => setIsSearchOpen(true),
    onToggleEditMode: toggleEditMode,
    onToggleTodoPanel: toggleTodoPanel,
    onEscape: () => setIsSearchOpen(false),
  });

  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);
  const handleCloseSnippetManager = useCallback(() => setIsSnippetManagerOpen(false), []);

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <TodoPanel />

      <Toolbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSnippetManager={() => setIsSnippetManagerOpen(true)}
      />

      <main id="main-content" className="max-w-7xl mx-auto px-page py-section min-h-screen flex flex-col justify-center" role="main">
        <BookmarkGrid />
      </main>

      <AppModals
        isSearchOpen={isSearchOpen}
        onCloseSearch={handleCloseSearch}
        isSettingsOpen={isSettingsOpen}
        onCloseSettings={handleCloseSettings}
        isSnippetManagerOpen={isSnippetManagerOpen}
        onCloseSnippetManager={handleCloseSnippetManager}
      />
    </div>
  );
}

export default App;
