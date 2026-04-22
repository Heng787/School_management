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
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
          Staff Management
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Manage all school staff members and their access
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Export */}
        <button
          onClick={onDownloadReport}
          title="Export staff list to CSV"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all
            text-slate-600 dark:text-slate-300
            bg-white dark:bg-slate-800/60
            border border-slate-200 dark:border-slate-700
            hover:bg-slate-50 dark:hover:bg-slate-700
            hover:border-slate-300 dark:hover:border-slate-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export
        </button>

        {/* Template */}
        <button
          onClick={onDownloadTemplate}
          title="Download staff import template"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all
            text-emerald-600 dark:text-emerald-400
            bg-emerald-50 dark:bg-emerald-900/20
            border border-emerald-200 dark:border-emerald-800/60
            hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Template
        </button>

        {/* Import CSV */}
        <button
          onClick={onImportClick}
          title="Import staff from CSV or Excel"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all
            text-white
            bg-indigo-600
            border border-indigo-500
            hover:bg-indigo-500
            shadow-sm shadow-indigo-900/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import CSV
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onImportClick}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />

        {/* Add Staff – primary CTA */}
        <button
          onClick={onAddStaff}
          title="Add new staff member"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all
            text-white
            shadow-lg shadow-primary-900/30"
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add Staff
        </button>
      </div>
    </div>
  );
};

export default TeacherHeaderActions;
