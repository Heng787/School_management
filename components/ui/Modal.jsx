import React, { useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/**
 * COMPONENT: Modal
 * DESCRIPTION: A reusable accessible modal wrapper that handles focus trapping,
 * backdrop clicks, and ARIA roles.
 */
const Modal = ({ 
  children, 
  onClose, 
  title, 
  ariaLabelledBy, 
  maxWidth = 'max-w-lg',
  className = '' 
}) => {
  const containerRef = useFocusTrap(true);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 w-full ${maxWidth} max-h-[95vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
