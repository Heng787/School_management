import React from "react";

/**
 * COMPONENT: StudentSearchBar
 * DESCRIPTION: Search bar component for filtering students by name, ID, or phone.
 */
const StudentSearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex-1 max-w-md w-full relative group">
      <svg
        className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search by name, ID, or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
    </div>
  );
};

export default StudentSearchBar;
