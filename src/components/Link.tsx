import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2, Globe } from 'lucide-react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useModalStore } from '../store/useModalStore';
import { getFaviconUrl } from '../utils/favicon';
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
  const [faviconUrl] = useState(() => getFaviconUrl(link.url));
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
    openEditLinkModal(slotId, link.id, link.title, link.url, link.description, link.tags);
  };

  const handleFaviconError = () => {
    setFaviconFailed(true);
  };

  const content = (
    <>
      <div className="w-6 h-6 flex items-center justify-center">
        {faviconFailed || !faviconUrl ? (
          <Globe className="w-4 h-4 text-icon-placeholder" />
        ) : (
          <img
            src={faviconUrl}
            alt=""
            className="w-4 h-4"
            onError={handleFaviconError}
          />
        )}
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-normal">
        <span className="text-value text-text-primary truncate">{link.title}</span>
        {link.description && (
          <span className="text-value text-text-placeholder/40 truncate">
            {link.description}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-normal rounded-control transition-all duration-200 ease-out"
    >
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-icon-placeholder hover:text-icon-default opacity-0 group-hover:opacity-100 transition-opacity p-fine"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      <a 
        href={link.url} 
        className="flex-1 flex items-center gap-normal min-w-0 p-fine hover:bg-bg-wash rounded-control transition-all duration-200 hover:translate-x-0.5 group/link"
      >
        {content}
      </a>

      {isEditMode && (
        <div className="flex gap-fine opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity p-fine">
          <button
            onClick={handleEdit}
            className="p-fine text-icon-placeholder hover:text-interactive-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary rounded-control"
            aria-label={`Edit "${link.title}"`}
          >
            <Edit2 className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={() =>
              openConfirmModal(
                'Delete Link',
                'Are you sure you want to delete this link? This action cannot be undone.',
                handleDelete,
              )
            }
            className="p-fine text-icon-placeholder hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-danger rounded-control"
            aria-label={`Delete "${link.title}"`}
          >
            <Trash2 className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
