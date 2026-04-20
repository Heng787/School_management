import React, { useState, useRef } from "react";
import { useData } from "../../context/DataContext";

/**
 * COMPONENT: DataManager
 * DESCRIPTION: Handles JSON export/import of the entire school database,
 * and provides a danger-zone "Delete All Data" action.
 */
const DataManager = () => {
  const {
    students,
    staff,
    classes,
    events,
    subjects,
    levels,
    timeSlots,
    grades,
    adminPassword,
    importAllData,
    deleteAllData,
  } = useData();

  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  // --- Delete All Data modal state ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Exports all application data to a JSON file.
   */
  const handleExport = async () => {
    const fullData = {
      students,
      staff,
      classes,
      events,
      subjects,
      levels,
      timeSlots,
      adminPassword,
      exportDate: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(fullData, null, 2);
    const fileName = `school_admin_backup_${new Date().toISOString().split("T")[0]}.json`;

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "JSON Backup",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
        console.warn(
          "File picker failed, falling back to standard download:",
          err,
        );
      }
    }

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Imports application data from a JSON backup file.
   */
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      window.confirm(
        "WARNING a backup will overwrite ALL current data in this application. This action cannot be undone. Are you sure?",
      )
    ) {
      setIsImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data || typeof data !== "object") {
          throw new Error("Invalid backup file format must be an object.");
        }

        await importAllData(data);
        alert("Database restored successfully!");
      } catch (err) {
        console.error("Import Error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        alert(
          `Failed to import backup: ${message}\n\nPlease ensure the file is a valid SchoolAdmin backup JSON.`,
        );
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  /**
   * Executes the bulk delete after the user has confirmed.
   */
  const handleDeleteAllData = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await deleteAllData();
      setShowDeleteModal(false);
      setConfirmText("");
    } catch (err) {
      console.error("Delete All Data Error:", err);
      alert("An error occurred while deleting data. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const subjectCount = Object.values(subjects).reduce((acc, curr) => acc + curr.length, 0);

  const recordCounts = [
    { label: "Students", count: students.length },
    { label: "Staff",    count: staff.length },
    { label: "Classes",  count: classes.length },
    { label: "Subjects", count: subjectCount },
    { label: "Grades",   count: grades.length },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2 transition-colors">
        Data Management
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 transition-colors">
        Take control of your database by exporting backups or restoring from a
        previous file.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Backup Card --- */}
        <div className="p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-between transition-colors">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-100 dark:shadow-none transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-1 transition-colors">
              Backup Database
            </h3>
            <p className="text-sm text-blue-700/70 dark:text-blue-400/80 mb-6 transition-colors">
              Download a copy of all your records. This will open a window
              asking you where to save the file on your computer.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            Save To...
          </button>
        </div>

        {/* --- Restore Card --- */}
        <div className="p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 flex flex-col justify-between transition-colors">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-100 dark:shadow-none transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-1 transition-colors">
              Restore Database
            </h3>
            <p className="text-sm text-amber-700/70 dark:text-amber-400/80 mb-6 transition-colors">
              Upload a previously saved backup file to restore all student and
              staff data.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isImporting ? "Restoring..." : "Import from File"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* --- Storage Info --- */}
      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
              Storage Information
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 transition-colors">
              Your data is currently stored in your browser's local storage on
              this computer. It is not shared with any servers. Regular backups
              are recommended.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* --- DANGER ZONE ---------------------------------------- */}
      {/* ======================================================= */}
      <div className="mt-8 p-6 rounded-2xl border-2 border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-100 dark:shadow-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-400">
              Danger Zone
            </h3>
            <p className="text-sm text-red-700/70 dark:text-red-400/70 mt-1 mb-4">
              Permanently delete all students, staff, classes, and academic records.
              This action <span className="font-bold">cannot be undone</span>. Export a backup first.
            </p>
            <button
              id="delete-all-data-btn"
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-200 dark:shadow-none"
            >
              Delete All Data…
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* --- CONFIRMATION MODAL --------------------------------- */}
      {/* ======================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { if (!isDeleting) { setShowDeleteModal(false); setConfirmText(""); } }}
          />

          {/* Modal Panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/60 overflow-hidden">
            {/* Red header stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />

            <div className="p-7">
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 id="delete-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete All Data
                </h3>
              </div>

              <p className="text-sm text-gray-600 dark:text-slate-400 mb-5">
                This will <strong className="text-gray-900 dark:text-white">permanently erase</strong> the following records from your database and Supabase:
              </p>

              {/* Record count chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {recordCounts.map(({ label, count }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
                    <span className="w-4 h-4 bg-red-500 dark:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold leading-none">
                      {count > 99 ? "99+" : count}
                    </span>
                    {label}
                  </span>
                ))}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-700 dark:text-amber-400 mb-5 flex gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Subjects, levels, time slots, and settings are <strong>not</strong> affected.</span>
              </div>

              {/* Type-to-confirm */}
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                Type <span className="font-mono bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-1 py-0.5 rounded">DELETE</span> to confirm
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDeleteAllData()}
                placeholder="DELETE"
                autoComplete="off"
                disabled={isDeleting}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-red-500 dark:focus:border-red-500 rounded-xl text-sm text-gray-900 dark:text-white outline-none transition-colors disabled:opacity-50 placeholder-gray-300 dark:placeholder-slate-600 font-mono tracking-widest mb-5"
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setConfirmText(""); }}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-all-btn"
                  onClick={handleDeleteAllData}
                  disabled={confirmText !== "DELETE" || isDeleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-red-200 dark:shadow-none"
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Deleting…
                    </span>
                  ) : "Delete Everything"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManager;
