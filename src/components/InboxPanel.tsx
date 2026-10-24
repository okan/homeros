import { useEffect, useRef, useState } from 'react';
import { Inbox, FolderInput, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useInboxStore } from '../store/useInboxStore';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useInboxActions } from '../hooks/useInboxActions';
import { Favicon } from './Favicon';
import { getIconComponent } from './IconPicker';
import type { Link } from '../types';

interface InboxItemProps {
  link: Link;
  isMoveOpen: boolean;
  onToggleMove: () => void;
  onMove: (slotId: string) => void;
  onRemove: () => void;
}

const InboxItem = ({ link, isMoveOpen, onToggleMove, onMove, onRemove }: InboxItemProps) => {
  const itemRef = useRef<HTMLLIElement>(null);
  const slots = useBookmarkStore((state) => state.slots);

  // The panel scrolls, so bring the opened slot list into view. Scrolling the whole item keeps
  // the link row visible; when the item is taller than the panel, 'nearest' aligns its top.
  useEffect(() => {
    if (isMoveOpen) itemRef.current?.scrollIntoView({ block: 'nearest' });
  }, [isMoveOpen]);

  return (
    <li
      ref={itemRef}
      className={`rounded-control transition-colors ${isMoveOpen ? 'bg-bg-wash' : ''}`}
    >
      <div className="flex items-center gap-fine pl-normal pr-fine py-fine">
        <a
          href={link.url}
          title={link.url}
          className="flex-1 flex items-center gap-normal min-w-0 group/link"
        >
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            <Favicon url={link.url} />
          </div>
          <span className="text-value text-text-primary truncate transition-colors group-hover/link:text-interactive-primary">
            {link.title}
          </span>
        </a>

        <button
          type="button"
          onClick={onToggleMove}
          title="Move to slot"
          aria-label={`Move "${link.title}" to a slot`}
          aria-expanded={isMoveOpen}
          className={`p-fine transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary rounded-control ${
            isMoveOpen
              ? 'text-interactive-primary'
              : 'text-icon-placeholder hover:text-interactive-primary'
          }`}
        >
          <FolderInput className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Remove"
          aria-label={`Remove "${link.title}" from inbox`}
          className="p-fine text-icon-placeholder hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-danger rounded-control"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {isMoveOpen && (
        <div role="group" aria-label="Move to" className="pl-section pr-fine pb-fine">
          {slots.length === 0 ? (
            <p className="px-normal py-fine text-accent text-text-secondary">Create a slot first</p>
          ) : (
            slots.map((slot) => {
              const SlotIcon = getIconComponent(slot.icon);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onMove(slot.id)}
                  className="w-full flex items-center gap-normal px-normal py-fine rounded-control text-left hover:bg-bg-content transition-colors"
                >
                  <SlotIcon
                    className="w-4 h-4 text-interactive-primary shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-value text-text-primary truncate">{slot.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </li>
  );
};

export const InboxPanel = () => {
  const links = useInboxStore((state) => state.links);
  const isCollapsed = useInboxStore((state) => state.isCollapsed);
  const toggleCollapsed = useInboxStore((state) => state.toggleCollapsed);
  const isEditMode = useBookmarkStore((state) => state.isEditMode);
  const { moveLink, removeLink } = useInboxActions();
  const [openMoveId, setOpenMoveId] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isEditMode) setOpenMoveId(null);
  }, [isEditMode]);

  useEffect(() => {
    if (!openMoveId) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpenMoveId(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMoveId(null);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMoveId]);

  const handleToggleCollapsed = () => {
    setOpenMoveId(null);
    toggleCollapsed();
  };

  const handleMove = (linkId: string, slotId: string) => {
    setOpenMoveId(null);
    moveLink(linkId, slotId);
  };

  const handleRemove = (linkId: string) => {
    if (openMoveId === linkId) setOpenMoveId(null);
    removeLink(linkId);
  };

  // Hidden in edit mode, like the rest of the toolbar
  if (links.length === 0 || isEditMode) return null;

  return (
    <aside
      ref={panelRef}
      aria-label="Inbox"
      className={`glass-strong rounded-container border border-border-element animate-fade-in-up ${
        isCollapsed ? '' : 'w-72'
      }`}
    >
      <button
        type="button"
        onClick={handleToggleCollapsed}
        aria-expanded={!isCollapsed}
        aria-controls="inbox-links"
        className="w-full flex items-center gap-normal px-coarse py-normal text-left rounded-container focus:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
      >
        <Inbox className="w-4 h-4 text-interactive-primary shrink-0" aria-hidden="true" />
        <span className="text-value font-medium text-text-primary">Inbox</span>
        <span className="text-accent text-text-placeholder">{links.length} to sort</span>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 ml-auto text-icon-placeholder" aria-hidden="true" />
        ) : (
          <ChevronUp className="w-4 h-4 ml-auto text-icon-placeholder" aria-hidden="true" />
        )}
      </button>

      {!isCollapsed && (
        <ul id="inbox-links" className="max-h-48 overflow-y-auto px-fine pb-fine">
          {links.map((link) => (
            <InboxItem
              key={link.id}
              link={link}
              isMoveOpen={openMoveId === link.id}
              onToggleMove={() => setOpenMoveId(openMoveId === link.id ? null : link.id)}
              onMove={(slotId) => handleMove(link.id, slotId)}
              onRemove={() => handleRemove(link.id)}
            />
          ))}
        </ul>
      )}
    </aside>
  );
};
