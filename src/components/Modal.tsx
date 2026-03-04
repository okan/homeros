import { X } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const stableOnClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-50 transition-opacity" 
        onClick={stableOnClose}
        aria-hidden="true"
      />
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-component pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          ref={modalRef}
          className="glass-strong rounded-container border border-border-element max-w-md w-full pointer-events-auto transform transition-all duration-200 ease-out shadow-card-lg animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-component">
            <h2 id="modal-title" className="text-header3 text-text-primary font-semibold">{title}</h2>
            <button
              ref={closeButtonRef}
              onClick={stableOnClose}
              className="p-fine text-icon-placeholder hover:text-text-primary transition-colors rounded-control hover:bg-bg-wash focus:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div className="p-component">{children}</div>
        </div>
      </div>
    </>
  );
};

