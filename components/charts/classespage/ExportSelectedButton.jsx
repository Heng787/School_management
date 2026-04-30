import React from "react";

const ExportSelectedButton = ({ selectedCount, onExport }) => {
  return (
    <button
      onClick={onExport}
      className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 active:scale-95 transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-bold shadow-sm shrink-0"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Export ({selectedCount})</span>
    </button>
  );
};

export default ExportSelectedButton;
