import { Folder, Code, Bookmark, ArrowRight, Settings } from 'lucide-react';
import { useBookmarkStore } from '../store/useBookmarkStore';

const QUICK_START_SLOTS = [
  { name: 'Work', icon: 'Folder', description: 'Your work-related links' },
  { name: 'Development', icon: 'Code', description: 'Dev tools & resources' },
  { name: 'Favorites', icon: 'Bookmark', description: 'Your favorite sites' },
];

export const EmptyState = () => {
  const { addSlot, toggleEditMode } = useBookmarkStore();

  const handleQuickStart = (slotName: string, icon: string) => {
    addSlot(slotName, icon);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center animate-fade-in-up">
      <div className="mb-6">
        <img src="/icon-128.png" alt="Homeros" className="w-20 h-20" />
      </div>

      <h1 className="text-header1 text-text-primary mb-2">
        Welcome to Homeros
      </h1>
      <p className="text-value text-text-secondary max-w-lg mb-8">
        Your new "New Tab". Organize bookmarks, track todos, and build daily habits.
      </p>

      <div className="w-full max-w-lg mb-8">
        <p className="text-accent text-text-placeholder uppercase tracking-wider mb-4">
          Quick Start
        </p>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_START_SLOTS.map((slot, index) => (
            <button
              key={slot.name}
              onClick={() => handleQuickStart(slot.name, slot.icon)}
              className="glass p-4 rounded-container border border-border-element hover:border-interactive-primary/50 transition-all duration-200 group animate-fade-in-up btn-press"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-bg-wash flex items-center justify-center group-hover:bg-interactive-selected transition-colors">
                {slot.icon === 'Folder' && <Folder className="w-5 h-5 text-icon-default group-hover:text-interactive-primary transition-colors" />}
                {slot.icon === 'Code' && <Code className="w-5 h-5 text-icon-default group-hover:text-interactive-primary transition-colors" />}
                {slot.icon === 'Bookmark' && <Bookmark className="w-5 h-5 text-icon-default group-hover:text-interactive-primary transition-colors" />}
              </div>
              <span className="text-value font-medium text-text-primary">{slot.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-text-placeholder">
        <span className="text-accent">or click</span>
        <button
          onClick={toggleEditMode}
          className="inline-flex items-center gap-1.5 text-accent text-interactive-primary hover:text-interactive-primary-hover transition-colors group"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Edit</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
        <span className="text-accent">to set up your own</span>
      </div>
    </div>
  );
};
