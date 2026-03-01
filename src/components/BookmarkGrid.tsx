import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useBookmarkStore } from '../store/useBookmarkStore';
import { Slot } from './Slot';
import { AddSlotButton } from './AddSlotButton';
import { EmptyState } from './EmptyState';

export const BookmarkGrid = () => {
  const slots = useBookmarkStore((state) => state.slots);
  const isEditMode = useBookmarkStore((state) => state.isEditMode);
  const reorderSlots = useBookmarkStore((state) => state.reorderSlots);
  const reorderLinks = useBookmarkStore((state) => state.reorderLinks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeSlot = slots.find((s) => s.id === active.id);
    const overSlot = slots.find((s) => s.id === over.id);

    if (activeSlot && overSlot) {
      const oldIndex = slots.findIndex((s) => s.id === active.id);
      const newIndex = slots.findIndex((s) => s.id === over.id);
      const newSlots = arrayMove(slots, oldIndex, newIndex);
      reorderSlots(newSlots);
      return;
    }

    for (const slot of slots) {
      const activeLink = slot.links.find((l) => l.id === active.id);
      const overLink = slot.links.find((l) => l.id === over.id);

      if (activeLink && overLink) {
        const oldIndex = slot.links.findIndex((l) => l.id === active.id);
        const newIndex = slot.links.findIndex((l) => l.id === over.id);
        const newLinks = arrayMove(slot.links, oldIndex, newIndex);
        reorderLinks(slot.id, newLinks);
        return;
      }
    }
  };

  if (slots.length === 0) {
    return (
      <>
        {!isEditMode && <EmptyState />}
        {isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-coarse">
            <AddSlotButton />
          </div>
        )}
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={slots.map((slot) => slot.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-coarse">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Slot slot={slot} isEditMode={isEditMode} />
            </div>
          ))}
          {isEditMode && (
            <div className="animate-fade-in-up" style={{ animationDelay: `${slots.length * 50}ms` }}>
              <AddSlotButton />
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};
