import React from "react";

const ImportButton = ({ onImport }) => {
  return (
    <button
      onClick={onImport}
      className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-500 active:scale-95 transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-blue-900/20 shrink-0"
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
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      Import
    </button>
  );
};

export default ImportButton;
