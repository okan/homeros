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

export const useToastStore = create<ToastStore>((set) => ({
    message: null,
    type: 'success',
    isVisible: false,
    showToast: (message, duration = 2000, type = 'success') => {
        set({ message, type, isVisible: true });
        setTimeout(() => {
            set({ isVisible: false });
        }, duration);
    },
    hideToast: () => set({ isVisible: false }),
}));
