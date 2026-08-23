import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Command, ArrowRight, Globe, Scissors } from 'lucide-react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useSnippetStore } from '../store/useSnippetStore';
import { useToastStore } from '../store/useToastStore';
import { getFaviconUrl } from '../utils/favicon';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  url?: string;
  slotName: string;
  slotIcon?: string;
  description?: string;
  type: 'bookmark' | 'snippet';
  value?: string;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { slots } = useBookmarkStore();
  const { snippets, settings } = useSnippetStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    slots.forEach((slot) => {
      slot.links.forEach((link) => {
        const titleMatches = link.title.toLowerCase().includes(searchTerm);
        const descriptionMatches = link.description?.toLowerCase().includes(searchTerm);
        const tagsMatch = link.tags?.some((tag) => tag.toLowerCase().includes(searchTerm));

        if (titleMatches || descriptionMatches || tagsMatch) {
          results.push({
            id: link.id,
            title: link.title,
            url: link.url,
            slotName: slot.name,
            slotIcon: slot.icon,
            description: link.description,
            type: 'bookmark',
          });
        }
      });
    });

    if (settings.enabled) {
      snippets.forEach((snippet) => {
        if (snippet.key.toLowerCase().includes(searchTerm)) {
          results.push({
            id: snippet.id,
            title: snippet.key,
            slotName: 'Snippet',
            type: 'snippet',
            value: snippet.value,
          });
        }
      });
    }

    return results.slice(0, 8);
  }, [query, slots, snippets, settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const result = results[selectedIndex];
        if (result.type === 'bookmark' && result.url) {
          window.location.href = result.url;
          onClose();
        } else if (result.type === 'snippet' && result.value) {
          navigator.clipboard.writeText(result.value);
          showToast(
            <p>
              Copied <code className="font-mono bg-interactive-primary/10 text-interactive-primary px-1.5 py-0.5 rounded text-xs leading-none">
                {result.title}
              </code> to clipboard
            </p>
          );
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, showToast]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 top-[20%] z-[101] flex justify-center px-4">
        <div className="w-full max-w-xl glass-strong rounded-container border border-border-element shadow-2xl overflow-hidden animate-scale-in">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-element">
            <Search className="w-5 h-5 text-text-placeholder" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="flex-1 bg-transparent text-value text-text-primary placeholder:text-text-placeholder focus:outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-bg-wash text-accent text-text-placeholder">
              <Command className="w-3 h-3" />
              <span>K</span>
            </kbd>
          </div>

          {query.trim() && (
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="py-8 text-center text-text-placeholder">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-value">No results found</p>
                  <p className="text-accent">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => {
                    return (
                      <a
                        key={result.id}
                        href={result.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-control transition-colors cursor-pointer ${index === selectedIndex
                          ? 'bg-interactive-selected'
                          : 'hover:bg-bg-wash'
                          }`}
                        onClick={(e) => {
                          if (result.type === 'snippet' && result.value) {
                            e.preventDefault();
                            navigator.clipboard.writeText(result.value);
                            showToast(
                              <p>
                                Copied <code className="font-mono bg-interactive-primary/10 text-interactive-primary px-1.5 py-0.5 rounded text-xs leading-none">
                                  {result.title}
                                </code> to clipboard
                              </p>
                            );
                            onClose();
                          } else {
                            onClose();
                          }
                        }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-bg-wash flex items-center justify-center shrink-0">
                          {result.type === 'snippet' ? (
                            <Scissors className="w-4 h-4 text-interactive-primary" />
                          ) : result.url && getFaviconUrl(result.url) ? (
                            <img
                              src={getFaviconUrl(result.url)!}
                              alt=""
                              className="w-4 h-4"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Globe className="w-4 h-4 text-icon-placeholder" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-value font-medium text-text-primary truncate">
                              {result.title}
                            </span>
                            <span className="text-accent text-text-placeholder truncate">
                              in {result.slotName}
                            </span>
                          </div>
                          {result.description && (
                            <p className="text-accent text-text-placeholder truncate">
                              {result.description}
                            </p>
                          )}
                        </div>

                        {index === selectedIndex && (
                          <ArrowRight className="w-4 h-4 text-interactive-primary shrink-0" />
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center text-text-placeholder">
              <p className="text-value">Start typing to search your bookmarks</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-accent">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-bg-wash">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-bg-wash">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-bg-wash">↵</kbd>
                  to open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-bg-wash">esc</kbd>
                  to close
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
