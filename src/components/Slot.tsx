import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { useModalStore } from '../store/useModalStore';
import { Link } from './Link';
import { AddLinkButton } from './AddLinkButton';
import { IconPicker, getIconComponent } from './IconPicker';
import type { Slot as SlotType } from '../types';

interface SlotProps {
  slot: SlotType;
  isEditMode: boolean;
}

export const Slot = ({ slot, isEditMode }: SlotProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(slot.name);
  const [icon, setIcon] = useState(slot.icon);
  const { updateSlot, deleteSlot } = useBookmarkStore();
  const openConfirmModal = useModalStore((state) => state.openConfirmModal);

  useEffect(() => {
    if (!isEditMode && isEditing) {
      setIsEditing(false);
      setName(slot.name);
      setIcon(slot.icon);
    }
  }, [isEditMode, isEditing, slot.name, slot.icon]);

  const IconComponent = getIconComponent(slot.icon);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slot.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateSlot(slot.id, name.trim(), icon);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(slot.name);
    setIcon(slot.icon);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteSlot(slot.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-bg-content/80 backdrop-blur-sm rounded-container p-coarse flex flex-col transition-all border border-border-element hover:border-border-element/30 min-h-[200px]"
    >
      <div className="flex items-center gap-normal pb-normal mb-normal group">
        {isEditMode && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-icon-placeholder hover:text-icon-default transition-colors"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex-1 flex gap-fine">
            <IconPicker selectedIcon={icon} onSelect={setIcon} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-coarse py-fine text-header3 border border-border-element rounded-control focus:outline-none focus:border-interactive-primary"
              autoFocus
            />
            <button
              type="submit"
              className="p-fine text-interactive-primary hover:text-interactive-primary-hover transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-fine text-icon-placeholder hover:text-icon-default transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-normal flex-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bg-wash to-border-element flex items-center justify-center">
                <IconComponent className="w-4 h-4 text-icon-default" />
              </div>
              <h2 className="text-header3 text-text-primary font-semibold">{slot.name}</h2>
            </div>
            {isEditMode && (
              <div className="flex gap-fine opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-fine text-icon-placeholder hover:text-interactive-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    openConfirmModal(
                      'Delete Slot',
                      `Are you sure you want to delete "${slot.name}" and all its links? This action cannot be undone.`,
                      handleDelete,
                    )
                  }
                  className="p-fine text-icon-placeholder hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-fine">
        <SortableContext
          items={slot.links.map((link) => link.id)}
          strategy={verticalListSortingStrategy}
        >
          {slot.links.map((link) => (
            <Link key={link.id} link={link} slotId={slot.id} isEditMode={isEditMode} />
          ))}
        </SortableContext>

        {isEditMode && <AddLinkButton slotId={slot.id} />}
      </div>
    </div>
  );
};
