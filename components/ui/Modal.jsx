import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * COMPONENT: Modal
 * DESCRIPTION: A reusable accessible modal wrapper that handles focus trapping,
 * backdrop clicks, ARIA roles, and draggability. Now uses Portals to ensure
 * it always renders at the top of the DOM tree.
 */
const Modal = ({ 
  children, 
  onClose, 
  title, 
  ariaLabelledBy, 
  maxWidth = 'max-w-lg',
  className = '',
  fullScreen = false
}) => {
  const containerRef = useFocusTrap(true);
  const constraintsRef = useRef(null);

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

  const modalContent = (
    <div 
      ref={constraintsRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        initial={{ opacity: 0, scale: fullScreen ? 1 : 0.95, y: fullScreen ? 0 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: fullScreen ? 1 : 0.95, y: fullScreen ? 0 : 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`bg-white dark:bg-slate-900 shadow-2xl w-full flex flex-col border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          fullScreen 
            ? 'fixed inset-0 h-screen w-screen z-[10000] rounded-none border-0' 
            : `rounded-3xl border ${maxWidth} max-h-[90vh] mx-4`
        } ${className}`}
      >
        <div className={`overflow-y-auto flex-1 flex flex-col ${fullScreen ? 'p-0' : 'p-6 sm:p-8 pt-6'}`}>
          {title && !fullScreen && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white dark:group-[.bg-white]:text-slate-900">
                {title}
              </h2>
            </div>
          )}
          {children}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
