import React from "react";

/**
 * COMPONENT: TeacherHeaderActions
 * DESCRIPTION: Header with action buttons (Export, Template, Import, Add Staff).
 */
const TeacherHeaderActions = ({
  onDownloadReport,
  onDownloadTemplate,
  onImportClick,
  onAddStaff,
  fileInputRef,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Staff Management</h1>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onDownloadReport}
          className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold flex items-center transition-colors"
          title="Export staff list to CSV"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Export
        </button>
        <button
          onClick={onDownloadTemplate}
          className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold flex items-center transition-colors"
          title="Download staff import template"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Template
        </button>
        <button
          onClick={onImportClick}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-all"
          title="Import staff from CSV or Excel"
        >
          Import CSV
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImportClick}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />
        <button
          onClick={onAddStaff}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 font-bold shadow-lg shadow-primary-200 dark:shadow-primary-900/20"
          title="Add new staff member"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Add Staff</span>
        </button>
      </div>
    </div>
  );
};

export default TeacherHeaderActions;
