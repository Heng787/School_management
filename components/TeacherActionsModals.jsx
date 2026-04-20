import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../context/DataContext";
import { AttendanceStatus } from "../types";
import { gradeId } from "../services/mappers";

// ─── Shared ───────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const CloseBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
  >
    <CloseIcon />
  </button>
);

const ActionFooter = ({ onClose, onSave, saveLabel, isModified }) => (
  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
    <button
      onClick={onClose}
      className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
    >
      Cancel
    </button>
    <button
      onClick={onSave}
      className={`relative px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-sm ${
        isModified
          ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200/50 hover:shadow-lg"
          : "bg-primary-600 hover:bg-primary-700"
      }`}
    >
      {isModified && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      )}
      {saveLabel}
    </button>
  </div>
);

const EmptyRow = ({ colSpan }) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-6 py-12 text-center text-slate-400 bg-slate-50 italic"
    >
      No students enrolled in this class.
    </td>
  </tr>
);

const ModalShell = ({ size = "max-w-xl", children }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4">
    <div
      className={`bg-white rounded-2xl shadow-xl w-full ${size} overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]`}
    >
      {children}
    </div>
  </div>
);

// ─── Attendance Modal ─────────────────────────────────────────────────────────

const STATUS_COLORS = {
  [AttendanceStatus.Present]: "bg-emerald-500 text-white",
  [AttendanceStatus.Late]: "bg-amber-500 text-white",
  [AttendanceStatus.Absent]: "bg-red-500 text-white",
  [AttendanceStatus.Permission]: "bg-purple-500 text-white",
};

const today = () => new Date().toLocaleDateString("en-CA");

export const AttendanceModal = ({ classData, students, onClose }) => {
  const { attendance, saveAttendanceBatch } = useData();
  const [date, setDate] = useState(today);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    const existing = attendance.filter(
      (a) => a.date === date && (a.classId === classData.id || !a.classId),
    );
    setStatusMap(
      Object.fromEntries(
        students.map((s) => [
          s.id,
          existing.find((a) => a.studentId === s.id)?.status ??
            AttendanceStatus.Present,
        ]),
      ),
    );
  }, [date, students, attendance, classData.id]);

  const handleSave = async () => {
    await saveAttendanceBatch(
      students.map((s) => ({
        id: `att_${classData.id}_${date}_${s.id}`,
        studentId: s.id,
        classId: classData.id,
        date,
        status: statusMap[s.id] ?? AttendanceStatus.Present,
      })),
    );
    onClose();
  };

  return (
    <ModalShell>
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Attendance</h2>
          <p className="text-sm text-slate-500">{classData.name}</p>
        </div>
        <CloseBtn onClick={onClose} />
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-3">
          {students.length === 0 ? (
            <p className="text-center text-slate-500 py-4">
              No students enrolled in this class.
            </p>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50"
              >
                <span className="font-medium text-slate-800 mb-2 sm:mb-0">
                  {student.name}
                </span>
                <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200">
                  {Object.values(AttendanceStatus).map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setStatusMap((p) => ({ ...p, [student.id]: status }))
                      }
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                        statusMap[student.id] === status
                          ? STATUS_COLORS[status]
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ActionFooter
        onClose={onClose}
        onSave={handleSave}
        saveLabel="Save Attendance"
      />
    </ModalShell>
  );
};

// ─── Grades Modal ─────────────────────────────────────────────────────────────

const DEFAULT_TERMS = ["Midterm", "Finals", "Q1", "Q2", "Q3", "Q4"];

const scoreColor = (val) => {
  const n = parseFloat(val);
  if (isNaN(n) || val === "")
    return "text-slate-400 bg-slate-50 border-slate-100 hover:border-slate-300 hover:bg-white";
  if (n >= 9.0) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (n < 5.0) return "text-red-600 bg-red-50 border-red-100";
  return "text-slate-800 bg-white border-slate-300 shadow-sm";
};

const avgColor = (avg) => {
  const n = parseFloat(avg);
  if (n >= 9.0) return "text-emerald-600";
  if (n > 0 && n < 5.0) return "text-red-600";
  return "text-slate-700";
};

const clampScore = (val) => {
  if (val === "") return "";
  let n = parseFloat(val);
  if (n < 0) return "0";
  if (n > 10)
    return !val.includes(".") && val.length === 2 ? (n / 10).toString() : "10";
  return val;
};

const StudentNameCell = ({ student }) => (
  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap bg-white border-r border-slate-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
    <div className="flex items-center">
      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs mr-2 sm:mr-3 bg-gradient-to-br from-indigo-100 to-blue-100 text-blue-700 shadow-inner shrink-0">
        {student.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[80px] sm:max-w-none">
          {student.name}
        </p>
        <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 hidden sm:block">
          ID: {student.id}
        </p>
      </div>
    </div>
  </td>
);

export const GradesModal = ({ classData, students, onClose }) => {
  const { grades, draftGrades, subjects: globalSubjects, saveDraftGradeBatch } = useData();
  const [term, setTerm] = useState("Midterm");
  const [scoreMap, setScoreMap] = useState({});
  const [isModified, setIsModified] = useState(false);

  const combinedGrades = useMemo(() => {
    const merged = new Map(grades.map(g => [g.id, g]));
    if (draftGrades) {
      draftGrades.forEach(g => merged.set(g.id, g));
    }
    return Array.from(merged.values());
  }, [grades, draftGrades]);

  const availableTerms = useMemo(() => {
    const terms = new Set(
      combinedGrades.filter((g) => g.classId === classData.id).map((g) => g.term),
    );
    DEFAULT_TERMS.forEach((t) => terms.add(t));
    return Array.from(terms);
  }, [combinedGrades, classData.id]);

  const classSubjects = useMemo(() => {
    const existingSubs = Array.from(
      new Set(
        combinedGrades
          .filter((g) => g.classId === classData.id && g.term === term)
          .map((g) => g.subject),
      ),
    );
    if (existingSubs.length > 0) return existingSubs;

    const level = (classData.level || "").trim().toUpperCase();
    const category = /^K\s*\d+/.test(level) ? "Kid" : "JuniorSenior";
    return globalSubjects[category] || [];
  }, [combinedGrades, classData.id, classData.level, term, globalSubjects]);

  useEffect(() => {
    const existing = combinedGrades.filter(
      (g) => g.term === term && g.classId === classData.id,
    );
    setScoreMap(
      Object.fromEntries(
        students.map((s) => [
          s.id,
          Object.fromEntries(
            classSubjects.map((sub) => [
              sub,
              existing.find((g) => g.studentId === s.id && g.subject === sub)
                ?.score ?? "",
            ]),
          ),
        ]),
      ),
    );
  }, [term, students, combinedGrades, classSubjects, classData.id]);

  const handleScoreChange = (studentId, subject, val) => {
    setScoreMap((p) => ({
      ...p,
      [studentId]: { ...p[studentId], [subject]: clampScore(val) },
    }));
    setIsModified(true);
  };

  const handleSave = () => {
    const existing = combinedGrades.filter(
      (g) => g.term === term && g.classId === classData.id,
    );
    const records = students.flatMap((s) =>
      classSubjects
        .filter(
          (sub) =>
            scoreMap[s.id]?.[sub] !== undefined && scoreMap[s.id][sub] !== "",
        )
        .map((sub) => {
          const found = existing.find(
            (g) => g.studentId === s.id && g.subject === sub,
          );
          return {
            id: found?.id ?? gradeId(classData.id, s.id, sub, term),
            studentId: s.id,
            classId: classData.id,
            subject: sub,
            score: Number(scoreMap[s.id][sub]),
            term,
          };
        }),
    );

    setIsModified(false);
    onClose();
    if (records.length > 0)
      try {
        saveDraftGradeBatch(records);
      } catch (err) {
        console.error("Draft grade save failed:", err);
      }
  };

  const handleClose = () => {
    if (isModified && !window.confirm("You have unsaved grades. Are you sure you want to discard them?")) {
      return;
    }
    onClose();
  };

  // Arrow-key navigation between cells
  const handleKeyNav = (e, rowIdx, colIdx) => {
    const COLS = classSubjects.length;
    const ROWS = students.length;
    let nextRow = rowIdx;
    let nextCol = colIdx;

    if (e.key === 'ArrowRight') { nextCol = Math.min(colIdx + 1, COLS - 1); }
    else if (e.key === 'ArrowLeft') { nextCol = Math.max(colIdx - 1, 0); }
    else if (e.key === 'ArrowDown' || e.key === 'Enter') { nextRow = Math.min(rowIdx + 1, ROWS - 1); }
    else if (e.key === 'ArrowUp') { nextRow = Math.max(rowIdx - 1, 0); }
    else return;

    e.preventDefault();
    const next = document.querySelector(`[data-cell="${nextRow}-${nextCol}"]`);
    if (next) { next.focus(); next.select(); }
  };

  return (
    <ModalShell size="max-w-7xl">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start md:items-center bg-slate-50 shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-blue-900 uppercase tracking-wide">
            {term} Exam Score Sheet
          </h2>
          <p className="text-sm font-bold text-slate-600 mt-1">
            Room {classData.name}
            <span className="text-slate-300 mx-2">|</span>
            Level{" "}
            <span className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              {classData.level}
            </span>
          </p>
          <p className="text-xs font-bold text-slate-500 mt-1.5 uppercase tracking-widest">
            February - July 2026
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Term:
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
            >
              {availableTerms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <CloseBtn onClick={handleClose} />
        </div>
      </div>

      <div className="overflow-auto flex-1 bg-white relative">
        <div className="min-w-max w-full inline-block align-middle">
          <div className="sm:hidden absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-20" />
          <table className="min-w-max w-full divide-y divide-slate-100 border-separate border-spacing-0">
            <thead className="bg-slate-50 sticky top-0 z-30 shadow-sm">
              <tr>
                <th className="w-40 sm:w-64 px-4 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-blue-900 uppercase tracking-wider border-r border-slate-100 bg-slate-50 sticky left-0 z-40">
                  Student Name
                </th>
                {classSubjects.map((sub) => (
                  <th
                    key={sub}
                    className="px-2 sm:px-4 py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider min-w-[80px] sm:min-w-[100px] border-b-2 border-slate-200"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-blue-900 font-extrabold leading-tight">
                        {sub}
                      </span>
                      <span className="text-red-500 font-bold mt-1.5 lowercase tracking-normal">
                        10 points
                      </span>
                    </div>
                  </th>
                ))}
                <th className="w-20 sm:w-24 px-4 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-extrabold text-blue-900 uppercase tracking-wider border-l border-slate-100 bg-slate-50">
                  Avg
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {students.length === 0 ? (
                <EmptyRow colSpan={classSubjects.length + 2} />
              ) : (
                students.map((student) => {
                  const scores = classSubjects
                    .map((sub) => parseFloat(scoreMap[student.id]?.[sub]))
                    .filter((n) => !isNaN(n));
                  const avg = scores.length
                    ? (
                        scores.reduce((a, b) => a + b, 0) / scores.length
                      ).toFixed(1)
                    : "0.0";
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <StudentNameCell student={student} />
                      {classSubjects.map((sub, colIdx) => (
                        <td key={sub} className="px-1 sm:px-2 py-2 sm:py-3">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="0.0"
                            name={`score-${student.id}-${sub}`}
                            autoComplete="off"
                            data-cell={`${students.indexOf(student)}-${colIdx}`}
                            value={scoreMap[student.id]?.[sub] ?? ""}
                            onChange={(e) =>
                              handleScoreChange(student.id, sub, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyNav(e, students.indexOf(student), colIdx)}
                            className={`w-full text-center py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-bold transition-all focus:ring-2 focus:ring-primary-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${scoreColor(scoreMap[student.id]?.[sub])}`}
                          />
                        </td>
                      ))}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-bold border-l border-slate-100 bg-slate-50/30">
                        <span className={avgColor(avg)}>{avg}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ActionFooter
        onClose={handleClose}
        onSave={handleSave}
        saveLabel="Save Draft Marks"
        isModified={isModified}
      />
    </ModalShell>
  );
};
