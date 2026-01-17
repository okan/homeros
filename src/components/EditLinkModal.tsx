import { useState, useEffect, useMemo } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { TagInput } from './TagInput';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useModalStore } from '../store/useModalStore';

const isValidUrl = (string: string): boolean => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const EditLinkModal = () => {
  const { isEditLinkModalOpen, editLinkSlotId, editLinkId, editLinkData, closeEditLinkModal } =
    useModalStore();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [urlError, setUrlError] = useState('');
  const updateLink = useBookmarkStore((state) => state.updateLink);
  const slots = useBookmarkStore((state) => state.slots);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    slots.forEach((slot) =>
      slot.links.forEach((link) => link.tags?.forEach((tag) => tagSet.add(tag)))
    );
    return Array.from(tagSet).sort();
  }, [slots]);

  useEffect(() => {
    if (editLinkData) {
      setTitle(editLinkData.title);
      setUrl(editLinkData.url);
      setDescription(editLinkData.description || '');
      setTags(editLinkData.tags || []);
    }
  }, [editLinkData]);

  useEffect(() => {
    if (url && !isValidUrl(url) && url.length > 5) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError('');
    }
  }, [url]);

  const handleUrlBlur = () => {
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      setUrl('https://' + url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim() && isValidUrl(url) && editLinkSlotId && editLinkId) {
      updateLink(
        editLinkSlotId,
        editLinkId,
        title.trim(),
        url.trim(),
        description.trim() || undefined,
        tags.length > 0 ? tags : undefined,
      );
      handleClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setTags([]);
    setUrlError('');
    closeEditLinkModal();
  };

  const isFormValid = title.trim() && url.trim() && isValidUrl(url);

  return (
    <Modal isOpen={isEditLinkModalOpen} onClose={handleClose} title="Edit Link">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          autoFocus
          className="w-full px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-interactive-primary focus:ring-2 focus:ring-interactive-primary/20 transition-all"
        />

        <div className="space-y-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder="https://example.com"
            className={`w-full px-coarse py-normal text-value bg-bg-content border rounded-control focus:outline-none transition-all ${
              urlError 
                ? 'border-accent-danger focus:border-accent-danger' 
                : 'border-border-element focus:border-interactive-primary focus:ring-2 focus:ring-interactive-primary/20'
            }`}
          />
          {urlError && (
            <p className="flex items-center gap-1 text-accent text-accent-danger">
              <AlertCircle className="w-3 h-3" />
              {urlError}
            </p>
          )}
        </div>

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-coarse py-normal text-value bg-bg-content border border-border-element rounded-control focus:outline-none focus:border-interactive-primary focus:ring-2 focus:ring-interactive-primary/20 transition-all"
        />

        <TagInput
          tags={tags}
          onChange={setTags}
          suggestions={allTags}
          placeholder="Add tags (optional)"
        />

        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full flex items-center justify-center gap-fine px-coarse py-normal bg-interactive-primary hover:bg-interactive-primary-hover active:bg-interactive-primary-active text-white rounded-control transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Check className="w-4 h-4" />
          <span className="text-value font-medium">Save Changes</span>
        </button>
      </form>
    </Modal>
  );
};
