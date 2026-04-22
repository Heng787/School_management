import React from "react";

/**
 * COMPONENT: StudentHeaderActions
 * DESCRIPTION: Header section with action buttons for export, import, and adding students.
 */
const StudentHeaderActions = ({
  onExport,
  onDownloadTemplate,
  onImport,
  onAddStudent,
  fileInputRef,
  isAdmin,
  isOffice,
  selectedCount,
  onBulkDelete,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
          Student Records
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Manage enrollments, levels and student data
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Bulk delete — appears when rows are selected */}
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onBulkDelete}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl transition-all
              text-red-600 dark:text-red-400
              bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800/40
              hover:bg-red-100 dark:hover:bg-red-900/40
              animate-in fade-in zoom-in duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete ({selectedCount})
          </button>
        )}

        {(isAdmin || isOffice) && (
          <>
            {/* Export */}
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all
                text-slate-600 dark:text-slate-300
                bg-white dark:bg-slate-800/60
                border border-slate-200 dark:border-slate-700
                hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export
            </button>

            {/* Template */}
            <button
              type="button"
              onClick={onDownloadTemplate}
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

            {/* Import */}
            <button
              type="button"
              onClick={onImport}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all
                text-white bg-indigo-600 border border-indigo-500
                hover:bg-indigo-500 shadow-sm shadow-indigo-900/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import CSV/XLSX
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => onImport(e)}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />

            {/* New Student – primary CTA */}
            <button
              type="button"
              onClick={onAddStudent}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-white
                shadow-lg shadow-primary-900/25 transition-all"
              style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              New Student
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentHeaderActions;
