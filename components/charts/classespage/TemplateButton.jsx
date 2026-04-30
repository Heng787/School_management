import React from "react";

const TemplateButton = ({ onDownload }) => {
  return (
    <button
      onClick={onDownload}
      className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-bold shadow-sm shrink-0"
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Template
    </button>
  );
};

export default TemplateButton;
