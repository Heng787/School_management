import React, { useState, useEffect, useMemo, useRef } from "react";
import { useData } from "../context/DataContext";
import { AttendanceStatus } from "../types";
import { gradeId } from "../services/mappers";
import { useFocusTrap } from "../hooks/useFocusTrap";
// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ModalShell = ({ size = "max-w-xl", children, isDraggingEnabled = true }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!isDraggingEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientY - rect.top > 80) return; // Only allow dragging from header
    if (['BUTTON', 'INPUT', 'SELECT', 'A'].includes(e.target.tagName)) return;

    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const trapRef = useFocusTrap(true);

  return (
    <div ref={trapRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 bg-slate-900/10 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden pointer-events-auto">
      <div
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
        onMouseDown={handleMouseDown}
        className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full ${size} overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-slate-200/50 dark:border-slate-800 ${isDragging ? 'shadow-3xl ring-4 ring-primary-500/10 cursor-grabbing select-none' : ''}`}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ title, subtitle, icon, onClose, children }) => (
  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 shrink-0">
        {icon}
      </div>
      <div>
        <h2 id="modal-title" className="text-xl font-black text-slate-800 dark:text-white font-display leading-tight">{title}</h2>
        <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {children}
      <button aria-label="Close dialog" onClick={onClose} className="p-2 text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
        <CloseIcon />
      </button>
    </div>
  </div>
);

// ─── ATTENDANCE MODAL ─────────────────────────────────────────────────────────

export const AttendanceModal = ({ classData, students, onClose }) => {
  const { attendance, draftAttendance, saveDraftAttendanceBatch } = useData();
  const [date, setDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [statusMap, setStatusMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const lastLoadedRef = useRef(""); // date|classId

  useEffect(() => {
    const contextKey = `${date}|${classData.id}`;
    if (lastLoadedRef.current === contextKey) return;

    const merged = new Map(attendance.map(a => [a.id, a]));
    if (draftAttendance) draftAttendance.forEach(a => merged.set(a.id, a));
    const allRecords = Array.from(merged.values());

    const dailyRecords = allRecords.filter(a => a.date === date && (a.classId === classData.id || !a.classId));
    const initialMap = Object.fromEntries(students.map(s => [
      s.id, dailyRecords.find(a => a.studentId === s.id)?.status ?? AttendanceStatus.Present
    ]));
    setStatusMap(initialMap);
    lastLoadedRef.current = contextKey;
  }, [date, students, attendance, classData.id]);

  const filteredStudents = useMemo(() => 
    students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [students, searchTerm]);

  const handleSave = async () => {
    const payload = students.map(s => ({
      id: `att_${classData.id}_${date}_${s.id}`,
      studentId: s.id,
      classId: classData.id,
      date,
      status: statusMap[s.id] ?? AttendanceStatus.Present,
    }));
    saveDraftAttendanceBatch(payload);
    onClose();
  };

  return (
    <ModalShell size="max-w-2xl">
      <ModalHeader 
        title="Class Attendance" 
        subtitle={classData.name} 
        onClose={onClose}
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
      >
        <div className="flex items-center gap-2">
          <label htmlFor="attendance-date" className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">Date</label>
          <input
            id="attendance-date"
            type="date"
            value={date}
            max={new Date().toLocaleDateString("en-CA")}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </ModalHeader>

      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
        <label htmlFor="student-filter" className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">Student</label>
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            id="student-filter"
            type="text"
            placeholder="Filter by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <button onClick={() => setStatusMap(Object.fromEntries(students.map(s => [s.id, AttendanceStatus.Present])))} className="px-4 py-2.5 text-xs font-black text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 rounded-2xl border border-primary-100 dark:border-primary-800 transition-all uppercase tracking-widest">
          All Present
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-slate-950/20 scrollbar-thin">
        <div className="space-y-2">
          {filteredStudents.map(student => (
            <div key={student.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{student.name}</span>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {Object.values(AttendanceStatus).map(status => (
                  <button
                    key={status}
                    aria-pressed={statusMap[student.id] === status}
                    onClick={() => setStatusMap(p => ({ ...p, [student.id]: status }))}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-tighter ${statusMap[student.id] === status ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm" : "text-slate-500 hover:text-slate-600"}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
        <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Cancel</button>
        <button onClick={handleSave} className="px-8 py-2.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all">Save Changes</button>
      </div>
    </ModalShell>
  );
};

// ─── GRADES MODAL ─────────────────────────────────────────────────────────────

const DEFAULT_TERMS = ["Midterm", "Finals", "Q1", "Q2", "Q3", "Q4"];

const getScoreStyle = (val) => {
  const n = parseFloat(val);
  if (isNaN(n) || val === "") return "text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800";
  if (n >= 9.0) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50";
  if (n < 5.0) return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50";
  return "text-slate-800 dark:text-white bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700";
};

export const GradesModal = ({ classData, students, onClose }) => {
  const { grades, draftGrades, subjects: globalSubjects, saveDraftGradeBatch } = useData();
  const [term, setTerm] = useState("Midterm");
  const [scoreMap, setScoreMap] = useState({});
  const [isModified, setIsModified] = useState(false);

  // Merge permanent grades with local drafts
  const combinedGrades = useMemo(() => {
    const merged = new Map(grades.map(g => [g.id, g]));
    if (draftGrades) draftGrades.forEach(g => merged.set(g.id, g));
    return Array.from(merged.values());
  }, [grades, draftGrades]);

  // Determine available terms
  const terms = useMemo(() => {
    const set = new Set(combinedGrades.filter(g => g.classId === classData.id).map(g => g.term));
    DEFAULT_TERMS.forEach(t => set.add(t));
    return Array.from(set);
  }, [combinedGrades, classData.id]);

  // Determine subjects based on class level
  const subjects = useMemo(() => {
    const existing = Array.from(new Set(combinedGrades.filter(g => g.classId === classData.id && g.term === term).map(g => g.subject)));
    if (existing.length > 0) return existing;
    const category = /^K\s*\d+/.test((classData.level || "").trim().toUpperCase()) ? "Kid" : "JuniorSenior";
    return globalSubjects[category] || [];
  }, [combinedGrades, classData.id, classData.level, term, globalSubjects]);

  // Initialize score map
  const lastLoadedRef = useRef(""); // term|classId

  useEffect(() => {
    const contextKey = `${term}|${classData.id}`;
    if (lastLoadedRef.current === contextKey) return;

    const relevant = combinedGrades.filter(g => g.term === term && g.classId === classData.id);
    const map = Object.fromEntries(students.map(s => [
      s.id, Object.fromEntries(subjects.map(sub => [
        sub, relevant.find(g => g.studentId === s.id && g.subject === sub)?.score ?? ""
      ]))
    ]));
    setScoreMap(map);
    setIsModified(false);
    lastLoadedRef.current = contextKey;
  }, [term, students, combinedGrades, subjects, classData.id]);

  // Auto-save effect
  useEffect(() => {
    if (!isModified) return;
    const timer = setTimeout(() => {
      const existing = combinedGrades.filter(g => g.term === term && g.classId === classData.id);
      const records = students.flatMap(s => 
        subjects.filter(sub => scoreMap[s.id]?.[sub] !== "" && scoreMap[s.id]?.[sub] !== undefined)
          .map(sub => {
            const found = existing.find(g => g.studentId === s.id && g.subject === sub);
            return {
              id: found?.id ?? gradeId(classData.id, s.id, sub, term),
              studentId: s.id,
              classId: classData.id,
              subject: sub,
              score: Number(scoreMap[s.id][sub]),
              term
            };
          })
      );
      if (records.length > 0) saveDraftGradeBatch(records);
    }, 2000);
    return () => clearTimeout(timer);
  }, [scoreMap, isModified, students, subjects, term, classData.id, combinedGrades, saveDraftGradeBatch]);

  const handleSave = () => {
    const existing = combinedGrades.filter(g => g.term === term && g.classId === classData.id);
    const records = students.flatMap(s => 
      subjects.filter(sub => scoreMap[s.id]?.[sub] !== "" && scoreMap[s.id]?.[sub] !== undefined)
        .map(sub => ({
          id: existing.find(g => g.studentId === s.id && g.subject === sub)?.id ?? gradeId(classData.id, s.id, sub, term),
          studentId: s.id, classId: classData.id, subject: sub, score: Number(scoreMap[s.id][sub]), term
        }))
    );
    saveDraftGradeBatch(records);
    setIsModified(false);
    onClose();
  };

  const handleKeyNav = (e, row, col) => {
    const directions = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], Enter: [1, 0], ArrowUp: [-1, 0] };
    const dir = directions[e.key];
    if (!dir) return;
    e.preventDefault();
    const nextRow = Math.max(0, Math.min(students.length - 1, row + dir[0]));
    const nextCol = Math.max(0, Math.min(subjects.length - 1, col + dir[1]));
    const target = document.querySelector(`[data-cell="${nextRow}-${nextCol}"]`);
    if (target) { target.focus(); target.select(); }
  };

  return (
    <ModalShell size="max-w-7xl">
      <ModalHeader 
        title={`${term} Score Sheet`} 
        subtitle={`Room ${classData.name} • Level ${classData.level}`} 
        onClose={onClose}
        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5L6 9v6l5 4V5zM15.5 8.5a4.5 4.5 0 010 7M19 6a8.5 8.5 0 010 12" /></svg>}
      >
        <div className="flex items-center gap-2">
          <label htmlFor="academic-term" className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">Term</label>
          <select id="academic-term" value={term} onChange={e => setTerm(e.target.value)} className="px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary-500">
            {terms.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </ModalHeader>

      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/20 scrollbar-thin">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-30 bg-slate-100 dark:bg-slate-900 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] sticky left-0 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40">Student</th>
              {subjects.map(sub => (
                <th key={sub} className="px-4 py-4 text-center border-b-2 border-slate-200 dark:border-slate-800 min-w-[100px]">
                  <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase leading-none mb-1">{sub}</p>
                  <span className="text-[9px] font-bold text-rose-500 uppercase">Max 10</span>
                </th>
              ))}
              <th className="px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-l border-slate-200 dark:border-slate-800">Avg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {students.map((student, rIdx) => {
              const rowScores = subjects.map(s => parseFloat(scoreMap[student.id]?.[s])).filter(n => !isNaN(n));
              const avg = rowScores.length ? (rowScores.reduce((a, b) => a + b, 0) / rowScores.length).toFixed(1) : "0.0";
              return (
                <tr key={student.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-20 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-xs">{student.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none mb-1">{student.name}</p>
                        <p className="text-[10px] font-medium text-slate-500">ID: {student.id}</p>
                      </div>
                    </div>
                  </td>
                    {subjects.map((sub, cIdx) => (
                      <td key={sub} className="p-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          aria-label={`${sub} mark for ${student.name}`}
                          data-cell={`${rIdx}-${cIdx}`}
                          value={scoreMap[student.id]?.[sub] ?? ""}
                          onKeyDown={e => handleKeyNav(e, rIdx, cIdx)}
                          onFocus={e => e.target.select()}
                          onChange={e => {
                            let v = e.target.value;
                            // Basic number validation
                            if (v !== "" && isNaN(parseFloat(v)) && v !== ".") return;
                            if (parseFloat(v) > 10) v = "10";
                            
                            setScoreMap(p => ({ ...p, [student.id]: { ...p[student.id], [sub]: v } }));
                            setIsModified(true);
                          }}
                          className={`w-full text-center py-2.5 rounded-xl border-2 font-black text-sm outline-none transition-all 
                            focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500/50 focus:bg-white dark:focus:bg-slate-800
                            ${getScoreStyle(scoreMap[student.id]?.[sub])}`}
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

      <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          {isModified ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Unsaved Changes</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800 animate-in fade-in zoom-in duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Draft Secured</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Discard</button>
          <button onClick={handleSave} className="px-10 py-2.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all">Save Marks</button>
        </div>
      </div>
    </ModalShell>
  );
};
