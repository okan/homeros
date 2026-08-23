import { CheckCircle2, AlertCircle } from 'lucide-react';
import React from 'react';

interface ToastProps {
    message: React.ReactNode;
    isVisible: boolean;
    type?: 'success' | 'error';
}

export const Toast = ({ message, isVisible, type = 'success' }: ToastProps) => {
    if (!isVisible) return null;

    const isError = type === 'error';

    return (
        <div className="fixed bottom-component left-1/2 -translate-x-1/2 z-[300]">
            <div className="animate-scale-in">
                <div className="flex items-center gap-3 px-5 py-3 glass-strong rounded-full border border-border-element">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isError ? 'bg-accent-danger/10' : 'bg-accent-success/10'}`}>
                        {isError ? (
                            <AlertCircle className="w-5 h-5 text-accent-danger" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-accent-success" />
                        )}
                    </div>
                    <div className="text-value font-medium text-text-primary">
                        {message}
                    </div>
                </div>
            </div>
        </div>
    );
};
