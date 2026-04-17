import React, { useState, useRef } from "react";
import { useData } from "../../context/DataContext";

/**
 * COMPONENT: DataManager
 * DESCRIPTION: Handles JSON export/import of the entire school database.
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
    adminPassword,
    importAllData,
  } = useData();
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

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
        <div className="p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-between transition-colors">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-100 dark:shadow-none transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
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

        <div className="p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 flex flex-col justify-between transition-colors">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-100 dark:shadow-none transition-colors">
              <svg
                className="w-6 h-6"
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

      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
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
    </div>
  );
};

export default DataManager;
