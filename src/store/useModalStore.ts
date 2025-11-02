import { create } from 'zustand';

interface ModalStore {
  isAddLinkModalOpen: boolean;
  addLinkSlotId: string | null;
  openAddLinkModal: (slotId: string) => void;
  closeAddLinkModal: () => void;

  isEditLinkModalOpen: boolean;
  editLinkSlotId: string | null;
  editLinkId: string | null;
  editLinkData: { title: string; url: string; description?: string } | null;
  openEditLinkModal: (
    slotId: string,
    linkId: string,
    title: string,
    url: string,
    description?: string,
  ) => void;
  closeEditLinkModal: () => void;

  isConfirmModalOpen: boolean;
  confirmTitle: string;
  confirmMessage: string;
  confirmAction: (() => void) | null;
  openConfirmModal: (title: string, message: string, action: () => void) => void;
  closeConfirmModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isAddLinkModalOpen: false,
  addLinkSlotId: null,
  openAddLinkModal: (slotId: string) => set({ isAddLinkModalOpen: true, addLinkSlotId: slotId }),
  closeAddLinkModal: () => set({ isAddLinkModalOpen: false, addLinkSlotId: null }),

  isEditLinkModalOpen: false,
  editLinkSlotId: null,
  editLinkId: null,
  editLinkData: null,
  openEditLinkModal: (
    slotId: string,
    linkId: string,
    title: string,
    url: string,
    description?: string,
  ) =>
    set({
      isEditLinkModalOpen: true,
      editLinkSlotId: slotId,
      editLinkId: linkId,
      editLinkData: { title, url, description },
    }),
  closeEditLinkModal: () =>
    set({
      isEditLinkModalOpen: false,
      editLinkSlotId: null,
      editLinkId: null,
      editLinkData: null,
    }),

  isConfirmModalOpen: false,
  confirmTitle: '',
  confirmMessage: '',
  confirmAction: null,
  openConfirmModal: (title: string, message: string, action: () => void) =>
    set({
      isConfirmModalOpen: true,
      confirmTitle: title,
      confirmMessage: message,
      confirmAction: action,
    }),
  closeConfirmModal: () =>
    set({
      isConfirmModalOpen: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmAction: null,
    }),
}));
