import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import * as XLSX from "xlsx";

// ─── UTILS ────────────────────────────────────────────────────────────────────

/**
 * Maps numeric scores to letter grades for the report
 */
const getLetterGrade = (score) => {
  if (score >= 9.0) return "A";
  if (score >= 7.5) return "B";
  if (score >= 6.0) return "C";
  if (score >= 5.0) return "D";
  return "F";
};

/**
 * Handles the actual Excel file generation and download
 */
const generateExcelFile = (rows, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths for better readability
  worksheet["!cols"] = [12, 22, 15, 12, 18, 14, 12].map(width => ({ wch: width }));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Roster");
  XLSX.writeFile(workbook, filename);
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const PanelCard = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-800 p-8 transition-all duration-500 hover:shadow-2xl ${className}`}>
    {children}
  </div>
);

const ModeToggle = ({ value, onChange, options }) => (
  <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 shadow-inner">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
          value === opt.value
            ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-lg scale-[1.02]"
            : "text-slate-500 hover:text-slate-600 dark:hover:text-slate-200"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const InfoStat = ({ label, value, colorClass }) => (
  <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 group hover:bg-white dark:hover:bg-slate-800 transition-colors">
    <p className={`text-xl font-black mb-0.5 ${colorClass} group-hover:scale-110 transition-transform`}>{value}</p>
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const EXPORT_MODES = [
  { value: "class", label: "By Class" },
  { value: "level", label: "By Level" },
];

const ExportCenter = () => {
  const { students, classes, staff, grades, attendance, enrollments } = useData();

  // --- STATE ---
  const [exportMode, setExportMode] = useState("class");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // --- DERIVED DATA ---
  const levelOptions = useMemo(() => 
    [...new Set(classes.map(c => c.level))].sort().map(l => ({ value: l, label: l }))
  , [classes]);

  const classOptions = useMemo(() => 
    classes.map(c => {
      const teacher = staff?.find(s => s.id === c.teacherId);
      return {
        value: c.id,
        label: `${c.name} (${c.level}) ${teacher ? `— ${teacher.name}` : ""} | ${c.schedule}`
      };
    })
  , [classes, staff]);

  const targetStudents = useMemo(() => {
    if (exportMode === "class") {
      if (!selectedClassId) return [];
      const studentIds = new Set(enrollments.filter(e => e.classId === selectedClassId).map(e => e.studentId));
      return students.filter(s => studentIds.has(s.id));
    }
    
    if (exportMode === "level") {
      if (!selectedLevel) return [];
      const classIds = new Set(classes.filter(c => c.level === selectedLevel).map(c => c.id));
      const studentIds = new Set(enrollments.filter(e => classIds.has(e.classId)).map(e => e.studentId));
      return students.filter(s => studentIds.has(s.id));
    }
    
    return [];
  }, [students, classes, enrollments, exportMode, selectedClassId, selectedLevel]);

  const filename = useMemo(() => {
    const date = new Date().toLocaleDateString("en-CA");
    if (exportMode === "class" && selectedClassId) {
      const cls = classes.find(c => c.id === selectedClassId);
      return `Class_Report_${cls?.name.replace(/\s+/g, "_")}_${date}.xlsx`;
    }
    if (exportMode === "level" && selectedLevel) {
      return `Level_Report_${selectedLevel}_${date}.xlsx`;
    }
    return null;
  }, [exportMode, selectedClassId, selectedLevel, classes]);

  // --- LOGIC ---
  const handleDownload = () => {
    if (!targetStudents.length || !filename) return;

    const rows = targetStudents.map(s => {
      // Calc Attendance %
      const recs = attendance?.filter(a => a.studentId === s.id) ?? [];
      const attPct = recs.length ? `${Math.round((recs.filter(a => a.status === "Present").length / recs.length) * 100)}%` : "N/A";

      // Calc Letter Grade
      const sGrades = grades?.filter(g => g.studentId === s.id) ?? [];
      const avg = sGrades.length ? sGrades.reduce((acc, g) => acc + g.score, 0) / sGrades.length : null;
      const letter = avg !== null ? getLetterGrade(avg) : "N/A";

      return {
        "Student ID": s.id,
        "Name": s.name,
        "Contact Phone": s.phone || "—",
        "Date of Birth": s.dob || "—",
        "Enrollment Date": s.enrollmentDate || "—",
        "Attendance Rate": attPct,
        "Overall Grade": letter,
      };
    });

    generateExcelFile(rows, filename);
  };

  const hasSelection = (exportMode === "class" && !!selectedClassId) || (exportMode === "level" && !!selectedLevel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── CONFIGURATION PANEL ── */}
      <PanelCard className="flex flex-col justify-center">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 leading-tight">Export Engine</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Configure your parameters to generate official student rosters and performance data.</p>
        </div>

        <ModeToggle 
          value={exportMode} 
          onChange={(v) => { setExportMode(v); setSelectedClassId(""); setSelectedLevel(""); }} 
          options={EXPORT_MODES} 
        />

        <div className="space-y-6">
          {exportMode === "class" ? (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Select Target Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
              >
                <option value="">Choose a class to export...</option>
                {classOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Select Academic Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
              >
                <option value="">Choose a level to export...</option>
                {levelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${hasSelection ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{hasSelection ? 'Ready for generation' : 'Awaiting parameters'}</span>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{targetStudents.length} Record{targetStudents.length !== 1 ? 's' : ''} Identified</p>
        </div>
      </PanelCard>

      {/* ── PREVIEW & DOWNLOAD PANEL ── */}
      <PanelCard className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 ${hasSelection ? 'bg-primary-600 text-white shadow-2xl shadow-primary-500/40 rotate-0' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 -rotate-12'}`}>
          {hasSelection ? (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ) : (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>

        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Build Manifest</h3>
        <div className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-8 max-w-full">
          <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 truncate">{filename ?? "parameters_not_set.xlsx"}</p>
        </div>

        {hasSelection && (
          <div className="w-full mb-10 grid grid-cols-3 gap-4">
            <InfoStat label="Records" value={targetStudents.length} colorClass="text-primary-600 dark:text-primary-400" />
            <InfoStat label="Data Points" value="7" colorClass="text-slate-700 dark:text-slate-300" />
            <InfoStat label="Format" value=".XLSX" colorClass="text-emerald-600 dark:text-emerald-400" />
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={!hasSelection}
          className="w-full relative group bg-slate-900 dark:bg-primary-600 text-white py-5 px-8 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Generate Final Report
          </div>
        </button>
      </PanelCard>
    </div>
  );
};

export default ExportCenter;
