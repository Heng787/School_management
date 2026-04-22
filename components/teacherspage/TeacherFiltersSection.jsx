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
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6 flex flex-col md:flex-row justify-between gap-4 overflow-hidden transition-colors duration-300">
      {/* Tab Filters */}
      <div className="flex flex-wrap bg-gray-100 dark:bg-slate-800 p-1 rounded-lg w-full md:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="w-px bg-gray-300 dark:bg-slate-700 mx-2 my-1"></div>

        <button
          onClick={onPermissionHistoryClick}
          className="px-4 py-2 rounded-md text-sm font-semibold text-amber-600 dark:text-amber-500 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all flex items-center space-x-1"
          title="View permission history for all staff"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Permission History
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative flex-grow max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or contact..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
        />
      </div>
    </div>
  );
};

export default TeacherFiltersSection;
