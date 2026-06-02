import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  hideClose?: boolean;
}

export function Modal({ open, onClose, title, children, size = 'md', hideClose = false }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const maxW = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative w-full ${maxW} mx-auto bg-white rounded-t-4xl sm:rounded-4xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto`}>
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
            {!hideClose && onClose && (
              <button onClick={onClose} className="ml-auto p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}

export function BottomSheet({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-4xl shadow-2xl animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-6 py-3">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {onClose && (
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}
