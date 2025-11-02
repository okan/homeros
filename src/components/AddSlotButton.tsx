import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { IconPicker } from './IconPicker';

export const AddSlotButton = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const addSlot = useBookmarkStore((state) => state.addSlot);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addSlot(name.trim(), icon);
      setName('');
      setIcon('Folder');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setIcon('Folder');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-bg-content/80 backdrop-blur-sm rounded-container p-coarse min-h-[200px] flex flex-col justify-center border border-border-element/30"
      >
        <div className="flex items-center gap-normal mb-coarse">
          <IconPicker selectedIcon={icon} onSelect={setIcon} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Slot name"
            autoFocus
            className="flex-1 px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 transition-colors"
          />
        </div>
        <div className="flex gap-fine">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-fine px-coarse py-normal bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active text-white rounded-control transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="text-value font-bold">Add</span>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center px-coarse py-normal bg-bg-wash hover:bg-border-element text-text-primary rounded-control transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-transparent hover:bg-bg-wash/10 backdrop-blur-sm rounded-container border-2 border-dashed border-border-element hover:border-border-element/30 p-coarse flex flex-col min-h-[200px] transition-all">
      <button
        onClick={() => setIsAdding(true)}
        className="flex-1 flex flex-col items-center justify-center gap-normal text-icon-placeholder hover:text-interactive-primary transition-all group"
      >
        <Plus className="w-6 h-6" />
        <span className="text-value font-bold">Add Slot</span>
      </button>
    </div>
  );
};
