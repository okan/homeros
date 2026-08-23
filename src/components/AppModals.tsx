import { useModalStore } from '../store/useModalStore';
import { useToastStore } from '../store/useToastStore';
import { useOnboarding } from '../hooks/useOnboarding';
import { AddLinkModal } from './AddLinkModal';
import { EditLinkModal } from './EditLinkModal';
import { ConfirmModal } from './ConfirmModal';
import { SearchOverlay } from './SearchOverlay';
import { SettingsModal } from './SettingsModal';
import { SnippetManagerModal } from './SnippetManagerModal';
import { OnboardingCarousel } from './OnboardingCarousel';
import { Toast } from './Toast';

interface AppModalsProps {
  isSearchOpen: boolean;
  onCloseSearch: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  isSnippetManagerOpen: boolean;
  onCloseSnippetManager: () => void;
  onOpenSnippetManager: () => void;
}

export const AppModals = ({
  isSearchOpen,
  onCloseSearch,
  isSettingsOpen,
  onCloseSettings,
  isSnippetManagerOpen,
  onCloseSnippetManager,
  onOpenSnippetManager,
}: AppModalsProps) => {
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

  const { message: toastMessage, isVisible: isToastVisible, type: toastType } = useToastStore();
  const { showOnboarding, isLoading: isOnboardingLoading, completeOnboarding } = useOnboarding();

  return (
    <>
      {addLinkSlotId && (
        <AddLinkModal
          isOpen={isAddLinkModalOpen}
          onClose={closeAddLinkModal}
          slotId={addLinkSlotId}
        />
      )}

      <EditLinkModal />

      <SearchOverlay isOpen={isSearchOpen} onClose={onCloseSearch} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        onOpenSnippetManager={onOpenSnippetManager}
      />

      <SnippetManagerModal isOpen={isSnippetManagerOpen} onClose={onCloseSnippetManager} />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
        title={confirmTitle}
        message={confirmMessage}
      />

      {!isOnboardingLoading && showOnboarding && (
        <OnboardingCarousel onComplete={completeOnboarding} />
      )}

      <Toast message={toastMessage} isVisible={isToastVisible} type={toastType} />
    </>
  );
};
