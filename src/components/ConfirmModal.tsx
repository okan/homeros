import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-component">
        <p className="text-value text-text-secondary">{message}</p>
      </div>
      <div className="flex gap-fine">
        <button
          onClick={handleConfirm}
          className="flex-1 px-coarse py-normal bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-control transition-colors text-value font-medium"
        >
          {confirmText}
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-coarse py-normal bg-bg-wash hover:bg-border-element text-text-primary rounded-control transition-colors text-value"
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
};
