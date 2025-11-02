import {
  DndContext,
  closestCenter,
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBookmarkStore } from './store/useBookmarkStore';
import { useTodoStore } from './store/useTodoStore';
import { useModalStore } from './store/useModalStore';
import { useChromeStorage } from './hooks/useChromeStorage';
import { useTodoStorage } from './hooks/useTodoStorage';
import { Slot } from './components/Slot';
import { AddSlotButton } from './components/AddSlotButton';
import { EmptyState } from './components/EmptyState';
import { TodoPanel } from './components/TodoPanel';
import { AddLinkModal } from './components/AddLinkModal';
import { EditLinkModal } from './components/EditLinkModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Settings, Check, ListTodo } from 'lucide-react';

function App() {
  useChromeStorage();
  useTodoStorage();
  const { slots, isEditMode, toggleEditMode, reorderSlots, reorderLinks } = useBookmarkStore();
  const { toggleTodoPanel } = useTodoStore();
  const {
    isAddLinkModalOpen,
    addLinkSlotId,
    closeAddLinkModal,
    isConfirmModalOpen,
    confirmTitle,
    confirmMessage,
    confirmAction,
    closeConfirmModal,
  } = useModalStore();

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

  return (
    <div className="min-h-screen bg-bg-page">
      <TodoPanel />
      
      <div className="fixed top-coarse right-coarse z-50 flex items-center gap-fine">
        <button
          onClick={toggleTodoPanel}
          className="flex items-center gap-fine px-coarse py-fine rounded-control transition-all bg-transparent text-text-secondary hover:bg-bg-content hover:text-text-primary"
        >
          <ListTodo className="w-4 h-4" />
          <span className="text-value font-medium">TODOs</span>
        </button>
        
        <button
          onClick={toggleEditMode}
          className={`flex items-center gap-fine px-coarse py-fine rounded-control transition-all ${
            isEditMode
              ? 'bg-interactive-primary text-white hover:bg-interactive-primary-hover shadow-card-sm'
              : 'bg-transparent text-text-secondary hover:bg-bg-content hover:text-text-primary'
          }`}
        >
          {isEditMode ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-value font-medium">Done</span>
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              <span className="text-value font-medium">Customize</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-page py-section min-h-screen flex flex-col justify-center">
        {slots.length === 0 ? (
          <>
            {!isEditMode && <EmptyState />}
            {isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-coarse">
                <AddSlotButton />
              </div>
            )}
          </>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={slots.map((slot) => slot.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-coarse">
                {slots.map((slot) => (
                  <Slot key={slot.id} slot={slot} isEditMode={isEditMode} />
                ))}
                {isEditMode && <AddSlotButton />}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      
      {addLinkSlotId && (
        <AddLinkModal
          isOpen={isAddLinkModalOpen}
          onClose={closeAddLinkModal}
          slotId={addLinkSlotId}
        />
      )}

      <EditLinkModal />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
        title={confirmTitle}
        message={confirmMessage}
      />
    </div>
  );
}

export default App;
