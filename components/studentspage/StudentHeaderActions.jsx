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
      <div className="w-full md:w-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
          Student Records
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage enrollments and levels.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onBulkDelete}
            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-bold flex items-center transition-all animate-in fade-in zoom-in duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete ({selectedCount})
          </button>
        )}
        {(isAdmin || isOffice) && (
          <>
            <button
              type="button"
              onClick={onExport}
              className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold flex items-center transition-colors"
            >
              Export
            </button>
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold flex items-center transition-colors"
            >
              Template
            </button>
            <button
              type="button"
              onClick={onImport}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-all"
            >
              Import CSV/XLSX
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => onImport(e)}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />
            <button
              type="button"
              onClick={onAddStudent}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-bold shadow-lg shadow-primary-200 dark:shadow-primary-900/20 transition-all"
            >
              + New Student
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentHeaderActions;
