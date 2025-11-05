import { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal } from './Modal';
import { useBookmarkStore } from '../store/useBookmarkStore';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotId: string;
}

export const AddLinkModal = ({ isOpen, onClose, slotId }: AddLinkModalProps) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const addLink = useBookmarkStore((state) => state.addLink);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      addLink(slotId, title.trim(), url.trim(), description.trim() || undefined);
      setTitle('');
      setUrl('');
      setDescription('');
      onClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Link">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          autoFocus
          className="w-full px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 mb-fine transition-colors"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
          className="w-full px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 mb-fine transition-colors"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-coarse py-normal text-accent bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-border-element/30 mb-component transition-colors"
        />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-fine px-coarse py-normal bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active text-white rounded-control transition-colors"
        >
          <Check className="w-4 h-4" />
          <span className="text-value font-medium">Add Link</span>
        </button>
      </form>
    </Modal>
  );
};
