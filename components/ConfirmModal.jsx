import React from 'react';
import Modal from './ui/Modal';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Delete', 
  cancelText = 'Cancel', 
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-100',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
  };

  const iconColors = {
    danger: 'text-red-500 bg-red-50',
    warning: 'text-amber-500 bg-amber-50',
    primary: 'text-blue-500 bg-blue-50'
  };

  return (
    <Modal 
      onClose={onClose} 
      ariaLabelledBy="confirm-modal-title"
      maxWidth="max-w-md"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${iconColors[type]}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 id="confirm-modal-title" className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 rounded-lg"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors[type]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
