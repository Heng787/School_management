import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { motion } from 'framer-motion';

/**
 * COMPONENT: Modal
 * DESCRIPTION: A reusable accessible modal wrapper that handles focus trapping,
 * backdrop clicks, ARIA roles, and draggability.
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

  return (
    <div 
      ref={constraintsRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-8 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[95vh] flex flex-col border border-slate-200 dark:border-slate-800 transition-colors duration-200 ${className}`}
      >
        {/* Drag Handle Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing group">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors" />
        </div>

        <div className="p-6 sm:p-8 pt-2 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default Modal;
