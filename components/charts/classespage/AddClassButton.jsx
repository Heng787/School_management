import React from "react";

const AddClassButton = ({ onAdd }) => {
  return (
    <button
      onClick={onAdd}
      className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-500 active:scale-95 transition-all duration-300 flex items-center gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/20 shrink-0"
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
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span className="whitespace-nowrap">Add Class</span>
    </button>
  );
};

export default AddClassButton;
