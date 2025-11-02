import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Modal } from './Modal';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useModalStore } from '../store/useModalStore';

export const EditLinkModal = () => {
  const { isEditLinkModalOpen, editLinkSlotId, editLinkId, editLinkData, closeEditLinkModal } =
    useModalStore();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const updateLink = useBookmarkStore((state) => state.updateLink);

  useEffect(() => {
    if (editLinkData) {
      setTitle(editLinkData.title);
      setUrl(editLinkData.url);
      setDescription(editLinkData.description || '');
    }
  }, [editLinkData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim() && editLinkSlotId && editLinkId) {
      updateLink(
        editLinkSlotId,
        editLinkId,
        title.trim(),
        url.trim(),
        description.trim() || undefined,
      );
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    closeEditLinkModal();
  };

  return (
    <Modal isOpen={isEditLinkModalOpen} onClose={handleClose} title="Edit Link">
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
          className="w-full flex items-center justify-center gap-fine px-coarse py-normal bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active text-white rounded-control transition-colors text-accent"
        >
          <Check className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </Modal>
  );
};
