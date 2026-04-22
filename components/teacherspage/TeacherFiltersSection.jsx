import React from "react";
import { StaffRole } from "../../types";

/**
 * COMPONENT: TeacherFiltersSection
 * DESCRIPTION: Filter tabs and search input for staff list.
 */
const TeacherFiltersSection = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onPermissionHistoryClick,
}) => {
  const tabs = [
    { id: "all", label: "All" },
    { id: StaffRole.Teacher, label: "Teachers" },
    { id: StaffRole.AssistantTeacher, label: "Assistants" },
    { id: StaffRole.OfficeWorker, label: "Office" },
    { id: StaffRole.Guard, label: "Guard" },
    { id: StaffRole.Cleaner, label: "Cleaner" },
  ];

  return (
    <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      {/* Tab pill group */}
      <div className="flex items-center flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/40"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Vertical divider */}
        <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-0.5" />

        {/* Permission History */}
        <button
          onClick={onPermissionHistoryClick}
          title="View permission history for all staff"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all
            text-amber-600 dark:text-amber-400
            hover:bg-white dark:hover:bg-slate-700
            hover:shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Permission History
        </button>
      </div>

      {/* Search bar */}
      <div className="relative w-full md:w-72">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or contact…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl
            bg-white dark:bg-slate-800/70
            border border-slate-200 dark:border-slate-700/60
            text-slate-800 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400
            transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TeacherFiltersSection;
