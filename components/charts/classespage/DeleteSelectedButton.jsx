import React from "react";

const DeleteSelectedButton = ({ selectedCount, onDelete }) => {
  return (
    <button
      onClick={onDelete}
      className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 px-4 py-2.5 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-bold shadow-sm shrink-0"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
      <span>Archive ({selectedCount})</span>
    </button>
  );
};

export default DeleteSelectedButton;
