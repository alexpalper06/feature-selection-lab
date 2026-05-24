import React, {useEffect} from 'react';
import {X} from 'lucide-react';

const SIZES = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
} as const;

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
    size?: keyof typeof SIZES;
    className?: string;
}
// This component would be used for confirmation dialogs
export default function Modal({
                                  isOpen,
                                  onClose,
                                  title,
                                  children,
                                  size = 'md',
                                  className = ''
                              }: ModalProps): React.ReactElement | null {

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={[
                    'relative w-full flex flex-col bg-bg-main border border-border-main',
                    'rounded-xl shadow-2xl max-h-[90vh] animate-in fade-in zoom-in-95 duration-150',
                    SIZES[size],
                    className,
                ].join(' ')}
            >
                {/* Sticky title bar */}
                {title && (
                    <div
                        className="flex items-center justify-between px-6 py-4 border-b border-border-main flex-shrink-0">
                        <h2 id="modal-title" className="text-base font-semibold text-text-h">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close modal"
                            className="p-1.5 text-text-main/40 hover:text-text-main hover:bg-accent-bg rounded-md transition-colors"
                        >
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                )}

                {/* Scrollable Content Region */}
                <div className="overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}