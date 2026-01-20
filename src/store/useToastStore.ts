import { create } from 'zustand';
import { ReactNode } from 'react';

interface ToastStore {
    message: ReactNode | null;
    isVisible: boolean;
    showToast: (message: ReactNode, duration?: number) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    message: null,
    isVisible: false,
    showToast: (message, duration = 2000) => {
        set({ message, isVisible: true });
        setTimeout(() => {
            set({ isVisible: false });
        }, duration);
    },
    hideToast: () => set({ isVisible: false }),
}));
