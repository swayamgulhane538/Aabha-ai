import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalPortalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl'
  showCloseButton?: boolean;
  className?: string;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
  className = ''
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const savedScrollY = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[var(--bg-modal-overlay)] backdrop-blur-md overflow-hidden animate-fade-in font-sans select-none"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-[var(--bg-surface)] rounded-[24px] sm:rounded-[28px] border border-[var(--border)] shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden my-auto animate-modal-in ${className}`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Modal Header */}
        {title && (
          <div
            className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--border)] shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-tight">
              {title}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] border border-[var(--border)] transition cursor-pointer flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body with internal scrolling */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-5 sm:p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ModalPortal;
