import { Plus } from 'lucide-react';
import { useModalStore } from '../store/useModalStore';

interface AddLinkButtonProps {
  slotId: string;
}

export const AddLinkButton = ({ slotId }: AddLinkButtonProps) => {
  const openAddLinkModal = useModalStore((state) => state.openAddLinkModal);

  return (
    <button
      onClick={() => openAddLinkModal(slotId)}
      className="w-full p-normal hover:bg-bg-wash rounded-content flex items-center justify-center gap-normal text-icon-placeholder hover:text-interactive-primary transition-colors group"
    >
      <Plus className="w-4 h-4" />
      <span className="text-accent">Add Link</span>
    </button>
  );
};
