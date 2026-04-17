import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import * as XLSX from "xlsx";

// ─── Icons ────────────────────────────────────────────────────────────────────

const DownloadIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const FileReadyIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const FileLockIcon = () => (
  <svg
    className="w-8 h-8 opacity-40"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const scoreToLetter = (avg) => {
  if (avg >= 9.0) return "A";
  if (avg >= 7.5) return "B";
  if (avg >= 6.0) return "C";
  if (avg >= 5.0) return "D";
  return "F";
};

const buildFilename = (mode, selectedClass, selectedLevel) => {
  const date = new Date().toLocaleDateString("en-CA");
  if (mode === "class" && selectedClass)
    return `class_export_${selectedClass.name.replace(/\s+/g, "_")}_${date}.xlsx`;
  if (mode === "level" && selectedLevel)
    return `level_export_${selectedLevel}_${date}.xlsx`;
  return null;
};

const buildExcel = (rows, filename) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [12, 20, 15, 12, 15, 14, 12].map((wch) => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, filename);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300 ${className}`}
  >
    {children}
  </div>
);

const ToggleGroup = ({ value, onChange, options }) => (
  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          value === opt.value
            ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const FieldSelect = ({ label, value, onChange, placeholder, options }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EXPORT_MODES = [
  { value: "class", label: "By Class" },
  { value: "level", label: "By Level" },
];

const ExportCenter = () => {
  const { students, classes, staff, grades, attendance, enrollments } = useData();

  const [exportMode, setExportMode] = useState("class");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const levels = useMemo(
    () => [...new Set(classes.map((c) => c.level))].sort(),
    [classes],
  );

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  );

  const targetStudents = useMemo(() => {
    if (exportMode === "class" && selectedClass) {
      const studentIds = new Set(enrollments.filter(e => e.classId === selectedClass.id).map(e => e.studentId));
      return students.filter(s => studentIds.has(s.id));
    }
    if (exportMode === "level" && selectedLevel) {
      const classIds = new Set(classes.filter((c) => c.level === selectedLevel).map((c) => c.id));
      const studentIds = new Set(enrollments.filter(e => classIds.has(e.classId)).map(e => e.studentId));
      return students.filter(s => studentIds.has(s.id));
    }
    return [];
  }, [students, classes, enrollments, exportMode, selectedClass, selectedLevel]);

  // Derived helpers using real data
  const getAttendancePct = (studentId) => {
    const recs = attendance?.filter((a) => a.studentId === studentId) ?? [];
    if (!recs.length) return "N/A";
    const present = recs.filter((a) => a.status === "Present").length;
    return `${Math.round((present / recs.length) * 100)}%`;
  };

  const getLetterGrade = (studentId) => {
    const studentGrades =
      grades?.filter((g) => g.studentId === studentId) ?? [];
    if (!studentGrades.length) return "N/A";
    const avg =
      studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length;
    return scoreToLetter(avg);
  };

  const hasTarget =
    (exportMode === "class" && !!selectedClass) ||
    (exportMode === "level" && !!selectedLevel);
  const filename = buildFilename(exportMode, selectedClass, selectedLevel);

  const handleDownload = () => {
    if (!targetStudents.length) return;
    const rows = targetStudents.map((s) => ({
      "Student ID": s.id,
      Name: s.name,
      "Contact Phone": s.phone || "N/A",
      DOB: s.dob || "N/A",
      "Enrollment Date": s.enrollmentDate || "N/A",
      "Attendance %": getAttendancePct(s.id),
      "Letter Grade": getLetterGrade(s.id),
    }));
    buildExcel(rows, filename);
  };

  // Options for selectors
  const classOptions = classes.map((c) => {
    const teacher = staff?.find((s) => s.id === c.teacherId);
    return {
      value: c.id,
      label: `${c.name} (${c.level})${teacher ? ` — ${teacher.name}` : ""} | ${c.schedule}`,
    };
  });

  const levelOptions = levels.map((l) => ({ value: l, label: l }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Config Panel ── */}
      <Card className="flex flex-col justify-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Data Export Configuration
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Download a formatted roster for a specific{" "}
          <strong className="text-slate-700 dark:text-slate-200">Class</strong>{" "}
          or entire{" "}
          <strong className="text-slate-700 dark:text-slate-200">Level</strong>.
          Includes{" "}
          <strong className="text-slate-700 dark:text-slate-200">
            Attendance %
          </strong>
          ,{" "}
          <strong className="text-slate-700 dark:text-slate-200">
            Contact
          </strong>
          , <strong className="text-slate-700 dark:text-slate-200">DOB</strong>,
          and{" "}
          <strong className="text-slate-700 dark:text-slate-200">
            Letter Grades
          </strong>
          .
        </p>

        <ToggleGroup
          value={exportMode}
          onChange={(v) => {
            setExportMode(v);
            setSelectedClassId("");
            setSelectedLevel("");
          }}
          options={EXPORT_MODES}
        />

        {exportMode === "class" ? (
          <FieldSelect
            label="Select a Class"
            value={selectedClassId}
            onChange={setSelectedClassId}
            placeholder="Choose a class to export..."
            options={classOptions}
          />
        ) : (
          <FieldSelect
            label="Select a Level (e.g. K1, K2)"
            value={selectedLevel}
            onChange={setSelectedLevel}
            placeholder="Choose a level to export..."
            options={levelOptions}
          />
        )}

        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-2">
          {hasTarget
            ? `${targetStudents.length} student${targetStudents.length !== 1 ? "s" : ""} selected for export`
            : "No target selected"}
        </p>
      </Card>

      {/* ── Preview & Download Panel ── */}
      <Card className="flex flex-col items-center justify-center text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
            hasTarget
              ? "bg-primary-50 dark:bg-primary-900/40 text-primary-500 dark:text-primary-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}
        >
          {hasTarget ? <FileReadyIcon /> : <FileLockIcon />}
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
          Export File
        </h3>

        <p className="text-sm border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 rounded-md text-slate-500 dark:text-slate-400 mb-6 min-w-[200px] truncate max-w-full">
          {filename ?? "No target selected"}
        </p>

        {hasTarget && (
          <div className="w-full mb-6 grid grid-cols-3 gap-3 text-center">
            {[
              {
                label: "Students",
                value: targetStudents.length,
                color: "text-primary-600 dark:text-primary-400",
              },
              {
                label: "Columns",
                value: 7,
                color: "text-slate-700 dark:text-slate-300",
              },
              {
                label: "Format",
                value: ".xlsx",
                color: "text-emerald-600 dark:text-emerald-400",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-100 dark:border-slate-700"
              >
                <p className={`text-base font-black ${color}`}>{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={!hasTarget}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <DownloadIcon className="w-5 h-5" />
          Download Excel Report (.xlsx)
        </button>
      </Card>
    </div>
  );
};

export default ExportCenter;
