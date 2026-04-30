import React from "react";

/**
 * COMPONENT: StudentSearchBar
 * DESCRIPTION: Search bar component for filtering students by name, ID, or phone.
 */
const StudentSearchBar = ({ searchTerm, setSearchTerm }) => {
  const [localSearch, setLocalSearch] = React.useState(searchTerm);

  React.useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  return (
    <div className="flex-1 max-w-md w-full relative group">
      <label htmlFor="student-search" className="sr-only">Search students by name, ID, or phone</label>
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        id="student-search"
        type="text"
        placeholder="Search by name, ID, or phone…"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl
          bg-white dark:bg-slate-800/70
          border border-slate-200 dark:border-slate-700/60
          text-slate-800 dark:text-slate-100
          placeholder:text-slate-500 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400
          transition-all shadow-sm"
      />
      {localSearch && (
        <button
          onClick={() => {
            setLocalSearch("");
            setSearchTerm("");
          }}
          aria-label="Clear search"
          className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:text-primary-500"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default StudentSearchBar;
