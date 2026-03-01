import { create } from 'zustand';
import { ReactNode } from 'react';

type ToastType = 'success' | 'error';

interface ToastStore {
  message: ReactNode | null;
  type: ToastType;
  isVisible: boolean;
  showToast: (message: ReactNode, duration?: number, type?: ToastType) => void;
  hideToast: () => void;
}

let toastTimerId: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
  message: null,
  type: 'success',
  isVisible: false,
  showToast: (message, duration = 2000, type = 'success') => {
    if (toastTimerId) clearTimeout(toastTimerId);
    set({ message, type, isVisible: true });
    toastTimerId = setTimeout(() => {
      set({ isVisible: false });
      toastTimerId = null;
    }, duration);
  },
  hideToast: () => {
    if (toastTimerId) clearTimeout(toastTimerId);
    toastTimerId = null;
    set({ isVisible: false });
  },
}));
