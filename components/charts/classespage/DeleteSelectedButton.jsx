import React from "react";

const DeleteSelectedButton = ({ selectedCount, onDelete }) => {
  return (
    <button
      onClick={onDelete}
      className="bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 text-xs sm:text-sm font-bold shadow-sm shrink-0"
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
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      <span>Delete ({selectedCount})</span>
    </button>
  );
};

export default DeleteSelectedButton;
