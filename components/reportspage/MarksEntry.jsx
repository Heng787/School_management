import React, { useState, useMemo, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { gradesService } from "../../services/gradesService";

const useSession = (key, fallback = "") => {
  const [value, setValue] = useState(
    () => sessionStorage.getItem(key) || fallback,
  );
  const set = (v) => {
    setValue(v);
    v ? sessionStorage.setItem(key, v) : sessionStorage.removeItem(key);
  };
  return [value, set];
};

const MarksEntry = () => {
  const {
    students,
    classes,
    subjects,
    grades,
    draftGrades,
    saveDraftGradeBatch,
    enrollments,
    staff,
  } = useData();

  const combinedGrades = useMemo(() => {
    const merged = new Map(grades.map(g => [g.id, g]));
    if (draftGrades) draftGrades.forEach(g => merged.set(g.id, g));
    return Array.from(merged.values());
  }, [grades, draftGrades]);

  // --- INTERNAL STATE ---
  const [selectedClassId, setSelectedClassId] = useSession(
    "reports_marks_class",
    "",
  );
  const [selectedTerm, setSelectedTerm] = useSession(
    "reports_marks_term",
    "Midterm",
  );

  const [localGrades, setLocalGrades] = useState({});
  const [modifiedStudents, setModifiedStudents] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  );

  const classSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const classId = selectedClass.id;
    const term = selectedTerm;

    const existingSubs = Array.from(
      new Set(
        combinedGrades
          .filter((g) => g.classId === classId && g.term === term)
          .map((g) => g.subject),
      ),
    );
    if (existingSubs.length > 0) return existingSubs;

    const level = (selectedClass.level || "").trim().toUpperCase();
    const category = /^K\s*\d+/.test(level) ? "Kid" : "JuniorSenior";
    return subjects[category] || [];
  }, [combinedGrades, selectedClass, selectedTerm, subjects]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    const classEnrollments = enrollments.filter(
      (e) => e.classId === selectedClass.id,
    );
    const studentIds = classEnrollments.map((e) => e.studentId);
    return students.filter((s) => studentIds.includes(s.id));
  }, [students, selectedClass, enrollments]);

  // Initialize local grades when class or students change
  useEffect(() => {
    const initialGrades = gradesService.initializeLocalGrades(
      classStudents,
      classSubjects,
      combinedGrades,
      selectedClassId,
      selectedTerm,
    );
    setLocalGrades(initialGrades);
    setModifiedStudents(new Set());
    setSaveSuccess(false);
  }, [
    classStudents,
    classSubjects,
    grades,
    selectedClassId,
    selectedTerm,
    setLocalGrades,
    setModifiedStudents,
    setSaveSuccess,
  ]);

  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (modifiedStudents.size > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [modifiedStudents]);

  const handleGradeChange = (studentId, subject, value) => {
    setSaveSuccess(false);
    const processedValue = gradesService.processGradeInput(value);

    setLocalGrades((prev) => {
      const next = { ...prev };
      if (!next[studentId]) next[studentId] = {};
      next[studentId][subject] = processedValue;
      return next;
    });

    setModifiedStudents((prev) => {
      const next = new Set(prev);
      next.add(studentId);
      return next;
    });
  };

  const handleSaveAll = async () => {
    if (modifiedStudents.size === 0) return;

    setIsSaving(true);
    try {
      const recordsToSave = gradesService.buildGradeRecords(
        modifiedStudents,
        localGrades,
        classSubjects,
        combinedGrades,
        selectedClassId,
        selectedTerm,
      );
      if (recordsToSave.length > 0) {
        await saveDraftGradeBatch(recordsToSave);
      }

      setSaveSuccess(true);
      setModifiedStudents(new Set());
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert(
        "Failed to save grades. Please ensure you are not in private/incognito mode.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasNoSubjects = useMemo(() => {
    return Object.values(subjects).every((arr) => arr.length === 0);
  }, [subjects]);

  if (hasNoSubjects) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-6 rounded-xl text-center transition-colors">
        <p className="text-amber-800 dark:text-amber-400 font-medium">
          No subjects defined in the system.
        </p>
        <p className="text-amber-600 dark:text-amber-500 text-sm mt-1">
          Please go to Settings &gt; Subjects to add subjects first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Class (Marks out of 10.0)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                if (
                  modifiedStudents.size > 0 &&
                  !window.confirm(
                    "You have unsaved marks. Switch class and lose changes?",
                  )
                )
                  return;
              setSelectedClassId(e.target.value);
              }}
              className="w-full md:w-96 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              <option value="">Choose a class...</option>
              {classes.map((c) => {
                const teacher = staff?.find((s) => s.id === c.teacherId);
                const tName = teacher
                  ? ` (Tr: ${teacher.name})`
                  : " (No Teacher)";
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} | {c.level}
                    {tName} | {c.schedule || "No Schedule"}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => {
                if (
                  modifiedStudents.size > 0 &&
                  !window.confirm(
                    "You have unsaved marks. Switch term and lose changes?",
                  )
                )
                  return;
                setSelectedTerm(e.target.value);
              }}
              className="w-full sm:w-48 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              <option value="Midterm">Midterm</option>
              <option value="Finals">Finals</option>
              <option value="Q1">Quarter 1</option>
              <option value="Q2">Quarter 2</option>
              <option value="Q3">Quarter 3</option>
              <option value="Q4">Quarter 4</option>
            </select>
          </div>
        </div>
        {classStudents.length > 0 && (
          <div className="flex items-center space-x-4">
            {modifiedStudents.size > 0 && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-500 animate-pulse flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                UNSAVED CHANGES
              </span>
            )}
            <button
              onClick={handleSaveAll}
              disabled={isSaving || modifiedStudents.size === 0}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                saveSuccess
                  ? "bg-emerald-500"
                  : "bg-primary-600 hover:bg-primary-700 shadow-primary-200 dark:shadow-none"
              }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : saveSuccess ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              )}
              <span>
                {isSaving
                  ? "Saving..."
                  : saveSuccess
                    ? "Saved!"
                    : "Save Draft Marks"}
              </span>
            </button>
          </div>
        )}
      </div>

      {selectedClassId && classStudents.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl transition-colors">
          <p className="text-slate-500 dark:text-slate-400">
            This class has no students enrolled yet.
          </p>
        </div>
      ) : selectedClassId ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative transition-colors">
          <div className="overflow-auto max-h-[600px]">
            <div className="sm:hidden absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/80 dark:from-slate-900/80 to-transparent pointer-events-none z-20"></div>
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 table-fixed border-separate border-spacing-0">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-30 shadow-sm transition-colors">
                <tr>
                  <th className="w-40 sm:w-64 px-4 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 sticky left-0 z-40 transition-colors">
                    Student Name
                  </th>
                  {classSubjects.map((subject) => (
                    <th
                      key={subject}
                      className="px-2 sm:px-4 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[80px] sm:min-w-[120px]"
                    >
                      {subject}
                    </th>
                  ))}
                  <th className="w-20 sm:w-24 px-4 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700 transition-colors">
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                {classStudents.map((student) => {
                  const scores = classSubjects.map((sub) =>
                    Number(localGrades[student.id]?.[sub] || 0),
                  );
                  const avg =
                    scores.length > 0
                      ? (
                          scores.reduce((a, b) => a + b, 0) / scores.length
                        ).toFixed(1)
                      : "0.0";
                  const isModified = modifiedStudents.has(student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${isModified ? "bg-amber-50/30 dark:bg-amber-900/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"}`}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap bg-white dark:bg-slate-900 sticky left-0 z-20 border-r border-slate-100 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                        <div className="flex items-center">
                          <div
                            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs mr-2 sm:mr-3 shrink-0 transition-colors ${
                              isModified
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                            }`}
                          >
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center truncate max-w-[80px] sm:max-w-none transition-colors">
                              {student.name}
                              {isModified && (
                                <span
                                  className="ml-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                                  title="Unsaved changes"
                                ></span>
                              )}
                            </p>
                            <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 dark:text-slate-500 transition-colors hidden sm:block">
                              ID: {student.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      {classSubjects.map((subject) => (
                        <td key={subject} className="px-1 sm:px-2 py-2 sm:py-3">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="0.0"
                            name={`admin-score-${student.id}-${subject}`}
                            autoComplete="off"
                            value={localGrades[student.id]?.[subject] ?? ""}
                            onChange={(e) =>
                              handleGradeChange(
                                student.id,
                                subject,
                                e.target.value,
                                )
                            }
                            onFocus={(e) => e.target.select()}
                            className={`w-full text-center py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-bold transition-all focus:ring-2 focus:ring-primary-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              Number(localGrades[student.id]?.[subject]) >= 9.0
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50"
                                : Number(localGrades[student.id]?.[subject]) <
                                    5.0
                                  ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50"
                                  : "text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            }`}
                          />
                        </td>
                      ))}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center bg-slate-50/30 dark:bg-slate-800/20 border-l border-slate-100 dark:border-slate-800 transition-colors">
                        <span
                          className={`text-xs sm:text-sm font-black ${Number(avg) >= 9.0 ? "text-emerald-600 dark:text-emerald-400" : Number(avg) < 5.0 ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}
                        >
                          {avg}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 opacity-60 transition-colors">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-colors">
            <svg
              className="w-8 h-8 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
            Select a class from the menu above to begin recording marks (0.0 -
            10.0).
          </p>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
