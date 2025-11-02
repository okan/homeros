import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2, Globe } from 'lucide-react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useModalStore } from '../store/useModalStore';
import { getFaviconUrls } from '../utils/favicon';
import type { Link as LinkType } from '../types';
import { useState } from 'react';

interface LinkProps {
  link: LinkType;
  slotId: string;
  isEditMode: boolean;
}

export const Link = ({ link, slotId, isEditMode }: LinkProps) => {
  const deleteLink = useBookmarkStore((state) => state.deleteLink);
  const { openConfirmModal, openEditLinkModal } = useModalStore();
  const [faviconUrls] = useState(() => getFaviconUrls(link.url));
  const [currentFaviconIndex, setCurrentFaviconIndex] = useState(0);
  const [faviconFailed, setFaviconFailed] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    deleteLink(slotId, link.id);
  };

  const handleEdit = () => {
    openEditLinkModal(slotId, link.id, link.title, link.url, link.description);
  };

  const handleFaviconError = () => {
    if (currentFaviconIndex < faviconUrls.length - 1) {
      setCurrentFaviconIndex(currentFaviconIndex + 1);
    } else {
      setFaviconFailed(true);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-normal p-normal hover:bg-bg-wash rounded-control transition-all duration-200 ease-out"
    >
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-icon-placeholder hover:text-icon-default opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      <a href={link.url} className="flex-1 flex items-center gap-normal min-w-0">
        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
          {faviconFailed || faviconUrls.length === 0 ? (
            <Globe className="w-4 h-4 text-icon-placeholder" />
          ) : (
            <img
              src={faviconUrls[currentFaviconIndex]}
              alt=""
              className="w-4 h-4"
              onError={handleFaviconError}
            />
          )}
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-normal">
          <div className="text-value text-text-primary truncate">{link.title}</div>
          {link.description && (
            <div className="text-accent text-text-placeholder/50 truncate">{link.description}</div>
          )}
        </div>
      </a>

      {isEditMode && (
        <div className="flex gap-fine opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-fine text-icon-placeholder hover:text-interactive-primary transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() =>
              openConfirmModal(
                'Delete Link',
                'Are you sure you want to delete this link? This action cannot be undone.',
                handleDelete,
              )
            }
            className="p-fine text-icon-placeholder hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
