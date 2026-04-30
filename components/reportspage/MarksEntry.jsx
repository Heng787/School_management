import React, { useState, useMemo, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { gradesService } from "../../services/gradesService";
import MarksPrintModal from "./MarksPrintModal";
import * as XLSX from "xlsx";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const useSession = (key, fallback = "") => {
  const [value, setValue] = useState(() => sessionStorage.getItem(key) || fallback);
  const set = (v) => {
    setValue(v);
    v ? sessionStorage.setItem(key, v) : sessionStorage.removeItem(key);
  };
  return [value, set];
};

const getScoreStyle = (val) => {
  const n = parseFloat(val);
  if (isNaN(n) || val === "") return "text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";
  if (n >= 9.0) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50";
  if (n < 5.0) return "text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50";
  return "text-slate-800 dark:text-white bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const TableHeader = ({ subjects }) => (
  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-30 shadow-sm">
    <tr>
      <th className="w-64 px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-50 dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 z-40">
        Student Name
      </th>
      {subjects.map(sub => (
        <th key={sub} className="px-4 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest min-w-[110px]">
          {sub}
        </th>
      ))}
      <th className="w-24 px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest border-l border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        Avg
      </th>
    </tr>
  </thead>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const MarksEntry = () => {
  const { students, classes, subjects, grades, draftGrades, saveDraftGradeBatch, enrollments, staff } = useData();

  // --- PERSISTED FILTERS ---
  const [selectedClassId, setSelectedClassId] = useSession("reports_marks_class", "");
  const [selectedTerm, setSelectedTerm] = useSession("reports_marks_term", "Midterm");

  // --- LOCAL STATE ---
  const [localGrades, setLocalGrades] = useState({});
  const [modifiedIds, setModifiedIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // --- DERIVED DATA ---
  const combinedGrades = useMemo(() => {
    const merged = new Map(grades.map(g => [g.id, g]));
    if (draftGrades) draftGrades.forEach(g => merged.set(g.id, g));
    return Array.from(merged.values());
  }, [grades, draftGrades]);

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

  const classSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const existing = Array.from(new Set(combinedGrades.filter(g => g.classId === selectedClassId && g.term === selectedTerm).map(g => g.subject)));
    if (existing.length > 0) return existing;
    const category = /^K\s*\d+/.test((selectedClass.level || "").trim().toUpperCase()) ? "Kid" : "JuniorSenior";
    return subjects[category] || [];
  }, [combinedGrades, selectedClass, selectedTerm, subjects, selectedClassId]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const enrolledIds = new Set(enrollments.filter(e => e.classId === selectedClassId).map(e => e.studentId));
    return students.filter(s => enrolledIds.has(s.id));
  }, [students, selectedClass, enrollments, selectedClassId]);

  // --- INITIALIZATION ---
  const lastLoadedRef = React.useRef(""); // Format: classId|term

  useEffect(() => {
    if (!selectedClassId) return;
    
    const contextKey = `${selectedClassId}|${selectedTerm}`;
    const isNewContext = lastLoadedRef.current !== contextKey;

    if (isNewContext) {
      const initial = gradesService.initializeLocalGrades(classStudents, classSubjects, combinedGrades, selectedClassId, selectedTerm);
      setLocalGrades(initial);
      setModifiedIds(new Set());
      setSaveSuccess(false);
      lastLoadedRef.current = contextKey;
    }
  }, [classStudents, classSubjects, selectedClassId, selectedTerm]); // Removed 'grades' to prevent sync-induced resets

  // --- HANDLERS ---
  const handleGradeChange = (studentId, subject, value) => {
    const processed = gradesService.processGradeInput(value);
    setLocalGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subject]: processed }
    }));
    setModifiedIds(prev => new Set(prev).add(studentId));
    setSaveSuccess(false);
  };

  const handleSaveAll = async () => {
    if (modifiedIds.size === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const records = gradesService.buildGradeRecords(modifiedIds, localGrades, classSubjects, combinedGrades, selectedClassId, selectedTerm);
      if (records.length > 0) await saveDraftGradeBatch(records);
      setSaveSuccess(true);
      setModifiedIds(new Set());
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save marks. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyNav = (e, row, col) => {
    const directions = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], Enter: [1, 0], ArrowUp: [-1, 0] };
    const dir = directions[e.key];
    if (!dir) return;
    e.preventDefault();
    const nextRow = Math.max(0, Math.min(classStudents.length - 1, row + dir[0]));
    const nextCol = Math.max(0, Math.min(classSubjects.length - 1, col + dir[1]));
    const target = document.querySelector(`[data-cell="${nextRow}-${nextCol}"]`);
    if (target) { target.focus(); target.select(); }
  };

  const handleExportExcel = () => {
    if (!selectedClass || !classStudents.length) return;
    const data = classStudents.map((s, idx) => {
      const sGrades = localGrades[s.id] || {};
      const row = { "NO": idx + 1, "NAME": s.name, "SEX": s.sex || "M" };
      classSubjects.forEach(sub => row[sub.toUpperCase()] = sGrades[sub] || 0);
      const scores = classSubjects.map(sub => parseFloat(sGrades[sub]) || 0);
      row["AVG"] = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : "0.00";
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Academic Marks");
    XLSX.writeFile(wb, `Marks_${selectedClass.name}_${selectedTerm}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ─── FILTERS & ACTIONS ─── */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col xl:flex-row items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto">
          <div className="flex-1 min-w-[320px]">
            <label htmlFor="class-roster-select" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Class Roster (Marks 0.0 - 10.0)</label>
            <select
              id="class-roster-select"
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
            >
              <option value="">Select Target Class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level}) — {staff.find(s => s.id === c.teacherId)?.name || 'No Teacher'}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <label htmlFor="academic-term-select" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Academic Term</label>
            <select id="academic-term-select" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-800 dark:text-white outline-none">
              {["Midterm", "Finals", "Q1", "Q2", "Q3", "Q4"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {selectedClassId && classStudents.length > 0 && (
          <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
            {modifiedIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Unsaved Draft</span>
              </div>
            )}
            
            <button aria-label="Print marks report" onClick={() => setIsPrintModalOpen(true)} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
            <button aria-label="Export marks to Excel" onClick={handleExportExcel} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving || modifiedIds.size === 0}
              className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:opacity-40 ${saveSuccess ? 'bg-emerald-500' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'}`}
            >
              {isSaving ? "Synchronizing..." : saveSuccess ? "Marks Secured ✓" : "Save Batch Marks"}
            </button>
          </div>
        )}
      </div>

      {/* ─── DATA TABLE ─── */}
      {!selectedClassId ? (
        <div className="py-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-300 mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select a class roster to begin data entry</p>
        </div>
      ) : classStudents.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 font-bold italic">No students currently enrolled in this class.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
          <div className="overflow-auto max-h-[700px] scrollbar-thin">
            <table className="min-w-full border-separate border-spacing-0">
              <TableHeader subjects={classSubjects} />
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStudents.map((student, rIdx) => {
                  const sGrades = localGrades[student.id] || {};
                  const scores = classSubjects.map(sub => parseFloat(sGrades[sub])).filter(n => !isNaN(n));
                  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "0.0";
                  const isModified = modifiedIds.has(student.id);

                  return (
                    <tr key={student.id} className={`transition-colors ${isModified ? "bg-amber-50/20 dark:bg-amber-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}>
                      <td className="px-6 py-4 sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-20 shadow-xl">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${isModified ? 'bg-amber-100 text-amber-600' : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'}`}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
                              {student.name}
                              {isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500">ID: {student.id}</p>
                          </div>
                        </div>
                      </td>
                      {classSubjects.map((sub, cIdx) => (
                        <td key={sub} className="p-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            aria-label={`${sub} mark for ${student.name}`}
                            data-cell={`${rIdx}-${cIdx}`}
                            value={sGrades[sub] ?? ""}
                            onKeyDown={e => handleKeyNav(e, rIdx, cIdx)}
                            onFocus={e => e.target.select()}
                            onChange={e => handleGradeChange(student.id, sub, e.target.value)}
                            className={`w-full text-center py-3 rounded-2xl border-2 font-black text-sm outline-none transition-all 
                              focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500/50 focus:bg-white dark:focus:bg-slate-800
                              ${getScoreStyle(sGrades[sub])}`}
                            placeholder="—"
                          />
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                        <span className={`text-sm font-black ${parseFloat(avg) >= 9 ? 'text-emerald-500' : parseFloat(avg) < 5 && parseFloat(avg) > 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>{avg}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MarksPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedClass={selectedClass}
        selectedTerm={selectedTerm}
        students={classStudents}
        subjects={classSubjects}
        localGrades={localGrades}
        staff={staff}
      />
    </div>
  );
};

export default MarksEntry;
