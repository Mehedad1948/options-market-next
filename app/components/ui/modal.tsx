// components/ui/modal.tsx
'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div 
        className="
          bg-white dark:bg-slate-900 
          border-0 md:border border-slate-200 dark:border-slate-800 
          w-full h-full md:h-auto md:max-w-md 
          rounded-none md:rounded-2xl 
          shadow-none md:shadow-2xl 
          overflow-hidden 
          flex flex-col
          animate-in fade-in zoom-in-95 duration-200
          md:max-h-[85vh]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-4 py-4 md:px-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-4 md:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
