import React, { useState, useRef } from "react";
import { useData } from "../../context/DataContext";

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const ActionCard = ({ icon, title, description, buttonText, onClick, colorScheme, isInput, inputRef, onFileChange, disabled }) => {
  const colorMap = {
    blue: "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30 text-blue-900 dark:text-blue-300 icon-bg-blue-600 icon-text-white btn-bg-blue-600 hover-btn-bg-blue-700",
    amber: "bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30 text-amber-900 dark:text-amber-300 icon-bg-amber-600 icon-text-white btn-bg-amber-600 hover-btn-bg-amber-700"
  };
  const colors = colorMap[colorScheme];

  return (
    <div className={`p-8 rounded-3xl border ${colors.split(' text-')[0]} flex flex-col justify-between transition-all duration-300 hover:shadow-lg`}>
      <div>
        <div className={`w-14 h-14 rounded-2xl ${colors.match(/icon-bg-[^\s]+/)[0].replace('icon-', '')} ${colors.match(/icon-text-[^\s]+/)[0].replace('icon-', '')} flex items-center justify-center mb-6 shadow-xl`}>
          {icon}
        </div>
        <h3 className={`text-xl font-black ${colors.match(/text-[^\s]+ dark:text-[^\s]+/)[0]} mb-2`}>{title}</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">{description}</p>
      </div>
      
      {isInput ? (
        <>
          <button onClick={() => inputRef.current?.click()} disabled={disabled} className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50 shadow-xl ${colors.match(/btn-bg-[^\s]+/)[0].replace('btn-', '')} ${colors.match(/hover-btn-bg-[^\s]+/)[0].replace('hover-btn-', '')}`}>
            {disabled ? "Processing..." : buttonText}
          </button>
          <input type="file" ref={inputRef} onChange={onFileChange} accept=".json" className="hidden" />
        </>
      ) : (
        <button onClick={onClick} disabled={disabled} className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50 shadow-xl ${colors.match(/btn-bg-[^\s]+/)[0].replace('btn-', '')} ${colors.match(/hover-btn-bg-[^\s]+/)[0].replace('hover-btn-', '')}`}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

const DeleteModal = ({ show, onClose, onConfirm, confirmText, setConfirmText, isDeleting, recordCounts }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !isDeleting && onClose()} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/50 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-2 w-full bg-gradient-to-r from-red-500 to-rose-600" />
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 border border-red-200 dark:border-red-800/50">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Delete All Data</h3>
          </div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">This will <strong className="text-red-600 dark:text-red-400">permanently erase</strong> the following records from your database and Supabase:</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {recordCounts.map(({ label, count }) => (
              <span key={label} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl">
                <span className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-[10px]">{count > 99 ? "99+" : count}</span>
                {label}
              </span>
            ))}
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl text-xs font-bold text-amber-700 dark:text-amber-400 mb-6 flex gap-3">
            <span className="text-lg">ℹ️</span>
            <span className="mt-0.5">Settings and system configurations are <strong>not</strong> affected.</span>
          </div>

          <div className="mb-8">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Type <span className="text-red-500">DELETE</span> to confirm</label>
            <input
              type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onConfirm()} placeholder="DELETE" autoComplete="off" disabled={isDeleting}
              className="w-full px-5 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white font-mono tracking-widest text-center transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex gap-4">
            <button onClick={() => { onClose(); setConfirmText(""); }} disabled={isDeleting} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50">Cancel</button>
            <button onClick={onConfirm} disabled={confirmText !== "DELETE" || isDeleting} className="flex-1 py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all active:scale-95 disabled:opacity-40 shadow-xl shadow-red-500/20">
              {isDeleting ? "Deleting..." : "Erase Everything"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const DataManager = () => {
  const { students, staff, classes, events, subjects, levels, timeSlots, grades, adminPassword, importAllData, deleteAllData } = useData();
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExport = async () => {
    const fullData = { students, staff, classes, events, subjects, levels, timeSlots, adminPassword, exportDate: new Date().toISOString() };
    const jsonString = JSON.stringify(fullData, null, 2);
    const fileName = `school_admin_backup_${new Date().toISOString().split("T")[0]}.json`;

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({ suggestedName: fileName, types: [{ description: "JSON Backup", accept: { "application/json": [".json"] } }] });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        return;
      } catch (err) { if (err.name === "AbortError") return; }
    }

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = fileName; link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm("WARNING: A backup will overwrite ALL current data in this application. This action cannot be undone. Are you sure?")) {
      setIsImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data || typeof data !== "object") throw new Error("Invalid backup file format.");
        await importAllData(data);
        alert("Database restored successfully!");
      } catch (err) {
        alert(`Failed to import backup: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAllData = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await deleteAllData();
      setShowDeleteModal(false);
      setConfirmText("");
    } catch (err) {
      alert("An error occurred while deleting data. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const recordCounts = [
    { label: "Students", count: students.length },
    { label: "Staff", count: staff.length },
    { label: "Classes", count: classes.length },
    { label: "Subjects", count: Object.values(subjects).reduce((a, c) => a + c.length, 0) },
    { label: "Grades", count: grades.length },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Data Engine</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Export secure backups or restore your entire database from a local file.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <ActionCard
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
          title="Backup Database"
          description="Download an encrypted JSON copy of all academic records and system configurations."
          buttonText="Export JSON Backup"
          onClick={handleExport}
          colorScheme="blue"
        />
        <ActionCard
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}
          title="Restore Database"
          description="Upload a previously saved JSON backup to fully restore all data."
          buttonText="Import from File"
          isInput={true}
          inputRef={fileInputRef}
          onFileChange={handleImport}
          disabled={isImporting}
          colorScheme="amber"
        />
      </div>

      <div className="p-8 rounded-3xl border-2 border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 flex flex-col md:flex-row items-center gap-8 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xl shadow-red-500/20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-black text-red-800 dark:text-red-400 mb-1">Danger Zone</h3>
          <p className="text-sm font-medium text-red-700/80 dark:text-red-400/80">Permanently delete all students, staff, classes, and academic records. This action cannot be undone.</p>
        </div>
        <button onClick={() => setShowDeleteModal(true)} className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-red-500/20 shrink-0">
          Delete All Data
        </button>
      </div>

      <DeleteModal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteAllData} confirmText={confirmText} setConfirmText={setConfirmText} isDeleting={isDeleting} recordCounts={recordCounts} />
    </div>
  );
};

export default DataManager;
