import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-component pointer-events-none">
        <div
          className="bg-bg-content rounded-container border border-border-element max-w-md w-full pointer-events-auto transform transition-all duration-200 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-component">
            <h2 className="text-header3 text-text-primary font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-fine text-icon-placeholder hover:text-text-primary transition-colors rounded-control hover:bg-bg-wash"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-component">{children}</div>
        </div>
      </div>
    </>
  );
};

