import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { AttendanceStatus } from "../../types";
import AttendancePrintModal from "./AttendancePrintModal";

// ─── HELPERS & UTILS ──────────────────────────────────────────────────────────

const useSession = (key, fallback = "") => {
  const [value, setValue] = useState(() => sessionStorage.getItem(key) || fallback);
  const set = (v) => {
    setValue(v);
    v ? sessionStorage.setItem(key, v) : sessionStorage.removeItem(key);
  };
  return [value, set];
};

const getCutoffDate = (timeRange) => {
  const d = new Date();
  const options = {
    "7days": () => d.setDate(d.getDate() - 7),
    "30days": () => d.setDate(d.getDate() - 30),
    thisMonth: () => d.setDate(1),
    "90days": () => d.setDate(d.getDate() - 90),
    ytd: () => d.setMonth(0, 1),
  };
  options[timeRange]?.();
  return d.toLocaleDateString("en-CA");
};

const downloadCSV = (filename, rows) => {
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
};

const formatDate = (dateStr) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", month: "short", day: "2-digit"
  });

// ─── REUSABLE UI COMPONENTS ───────────────────────────────────────────────────

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const StatBadge = ({ label, value, colorClass }) => (
  <div className="text-center group">
    <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 opacity-60`}>{label}</p>
    <p className={`text-xl font-black ${colorClass} group-hover:scale-110 transition-transform`}>{value}</p>
  </div>
);

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const TopAbsenceItem = ({ student, count }) => (
  <div className="group flex bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 gap-4 items-center hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300">
    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-sm shrink-0">
      {student.name.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
      <p className="text-[10px] font-medium text-slate-500">ID: {student.id}</p>
    </div>
    <div className="text-right border-l border-slate-200 dark:border-slate-700 pl-4">
      <p className="text-2xl font-black text-rose-600 leading-none">{count}</p>
      <p className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">Absences</p>
    </div>
  </div>
);

const HistoryRecord = ({ record, onExcuse, isAdminOrOffice }) => {
  const isAbsent = record.status === AttendanceStatus.Absent;
  const isLate = record.status === AttendanceStatus.Late;
  const color = isAbsent ? "rose" : isLate ? "amber" : "purple";

  return (
    <div className="relative pl-6">
      <div className={`absolute -left-[7px] top-2.5 w-3.5 h-3.5 rounded-full border-4 bg-${color}-500 border-${color}-50 dark:border-slate-900`} />
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all">
        <div>
          <span className={`text-[11px] font-black uppercase tracking-widest text-${color}-600 dark:text-${color}-400`}>
            {record.status}
          </span>
          <span className="ml-3 text-xs font-bold text-slate-500 dark:text-slate-400">
            {formatDate(record.date)}
          </span>
        </div>
        {isAdminOrOffice && (
          <button
            onClick={() => onExcuse(record)}
            className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
          >
            Excuse
          </button>
        )}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const AttendanceReport = () => {
  const { students, classes, attendance, enrollments, updateAttendance, currentUser, staff } = useData();

  // --- PERSISTED FILTERS ---
  const [selectedClassId, setSelectedClassId] = useSession("reports_attendance_class");
  const [timeRange, setTimeRange] = useSession("reports_attendance_time", "30days");
  const [exportMonth, setExportMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // --- LOCAL UI STATE ---
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const isAdminOrOffice = ["Admin", "Office Worker"].includes(currentUser?.role);

  // --- DERIVED DATA ---
  const filteredAttendance = useMemo(() => {
    const cutoff = getCutoffDate(timeRange);
    return attendance.filter(a => a.date >= cutoff);
  }, [attendance, timeRange]);

  const topAbsences = useMemo(() => {
    const counts = {};
    filteredAttendance.forEach(a => {
      if (a.status === AttendanceStatus.Absent) counts[a.studentId] = (counts[a.studentId] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([id, count]) => ({ student: students.find(s => s.id === id), count }))
      .filter(x => x.student);
  }, [filteredAttendance, students]);

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

  const classStats = useMemo(() => {
    if (!selectedClass) return [];
    const enrolledIds = new Set(enrollments.filter(e => e.classId === selectedClass.id).map(e => e.studentId));
    
    return students.filter(s => enrolledIds.has(s.id)).map(student => {
      const recs = filteredAttendance.filter(a => a.studentId === student.id && (a.classId === selectedClass.id || !a.classId));
      const getCount = (s) => recs.filter(a => a.status === s).length;
      
      return {
        student,
        present: getCount(AttendanceStatus.Present),
        absent: getCount(AttendanceStatus.Absent),
        late: getCount(AttendanceStatus.Late),
        permission: getCount(AttendanceStatus.Permission),
        history: recs.filter(a => a.status !== AttendanceStatus.Present).sort((a, b) => b.date.localeCompare(a.date))
      };
    });
  }, [students, selectedClass, enrollments, filteredAttendance]);

  // --- HANDLERS ---
  const handleExportMonthly = () => {
    if (!selectedClass || !exportMonth) return;
    const [year, month] = exportMonth.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();
    const enrolledIds = new Set(enrollments.filter(e => e.classId === selectedClass.id).map(e => e.studentId));
    
    const rows = [
      `Monthly Attendance Report - ${selectedClass.name} (${selectedClass.level})`,
      `Month: ${exportMonth},Generated: ${new Date().toLocaleDateString()}`,
      "",
      "Student ID,Student Name," + Array.from({ length: daysInMonth }, (_, i) => i + 1).join(",")
    ];

    students.filter(s => enrolledIds.has(s.id)).forEach(s => {
      const row = [s.id, s.name];
      for (let i = 1; i <= daysInMonth; i++) {
        const date = `${year}-${month}-${String(i).padStart(2, "0")}`;
        const record = attendance.find(a => a.studentId === s.id && a.date === date && (a.classId === selectedClass.id || !a.classId));
        row.push(record ? record.status.charAt(0) : "");
      }
      rows.push(row.join(","));
    });

    downloadCSV(`Attendance_${selectedClass.name}_${exportMonth}.csv`, rows);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ─── TOP ANALYTICS SECTION ─── */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl">⚠️</span>
              High Absence Alert
            </h3>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Identifying risk patterns in the last {timeRange.replace('days', ' days')}</p>
          </div>
          <select 
            aria-label="Select Time Range"
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="90days">Last Quarter</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>

        {topAbsences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topAbsences.map(item => <TopAbsenceItem key={item.student.id} {...item} />)}
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-950/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-500">All students have excellent attendance for this timeframe! 🎉</p>
          </div>
        )}
      </Card>

      {/* ─── CLASS SELECTION & ACTIONS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <label htmlFor="class-select" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Class Selection</label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={e => { setSelectedClassId(e.target.value); setExpandedStudentId(null); }}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
            >
              <option value="">Select a class to view report...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level}) — {c.schedule}</option>)}
            </select>
          </div>
          {selectedClassId && (
            <div className="flex items-center gap-3 shrink-0 pt-6 sm:pt-0">
              <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden sm:block" />
              <button onClick={() => setIsPrintModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all active:scale-95">
                Print Report
              </button>
            </div>
          )}
        </Card>

        {selectedClassId && (
          <Card className="p-6">
            <label htmlFor="export-month" className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Data Export</label>
            <div className="flex gap-2">
              <input id="export-month" type="month" value={exportMonth} onChange={e => setExportMonth(e.target.value)} className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none" />
              <button aria-label="Download monthly attendance CSV" onClick={handleExportMonthly} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* ─── DETAILED CLASS TABLE ─── */}
      {selectedClassId && (
        <Card>
          <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-8 justify-center sm:justify-end">
            <StatBadge label="Present" value={classStats.reduce((a, s) => a + s.present, 0)} colorClass="text-emerald-500" />
            <StatBadge label="Absent" value={classStats.reduce((a, s) => a + s.absent, 0)} colorClass="text-rose-500" />
            <StatBadge label="Late" value={classStats.reduce((a, s) => a + s.late, 0)} colorClass="text-amber-500" />
            <StatBadge label="Permission" value={classStats.reduce((a, s) => a + s.permission, 0)} colorClass="text-purple-500" />
          </div>
          
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-8 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest">Student</th>
                  {["Present", "Absent", "Late", "Perm"].map(h => (
                    <th key={h} className="px-4 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStats.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-sm font-bold text-slate-300 uppercase tracking-widest">No students found in this class</td></tr>
                ) : classStats.map(stat => (
                  <React.Fragment key={stat.student.id}>
                    <tr 
                      role="button"
                      tabIndex={0}
                      aria-expanded={expandedStudentId === stat.student.id}
                      onClick={() => setExpandedStudentId(expandedStudentId === stat.student.id ? null : stat.student.id)} 
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setExpandedStudentId(expandedStudentId === stat.student.id ? null : stat.student.id))}
                      className={`cursor-pointer transition-colors ${expandedStudentId === stat.student.id ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${stat.absent >= 3 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {stat.student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{stat.student.name}</p>
                            <p className="text-[10px] font-medium text-slate-500">{stat.student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center font-black text-sm text-emerald-600">{stat.present}</td>
                      <td className="px-4 py-5 text-center font-black text-sm text-rose-600">{stat.absent}</td>
                      <td className="px-4 py-5 text-center font-black text-sm text-amber-600">{stat.late}</td>
                      <td className="px-4 py-5 text-center font-black text-sm text-purple-600">{stat.permission}</td>
                    </tr>
                    {expandedStudentId === stat.student.id && (
                      <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                        <td colSpan={5} className="px-12 py-8 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Detailed Attendance History</h4>
                          </div>
                          {stat.history.length > 0 ? (
                            <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-2 space-y-4">
                              {stat.history.map((rec, i) => (
                                <HistoryRecord key={i} record={rec} isAdminOrOffice={isAdminOrOffice} onExcuse={r => updateAttendance({ ...r, status: AttendanceStatus.Present })} />
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-4">
                              <span className="text-xl">🌟</span>
                              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Perfect attendance record! No absence or late records found.</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ─── PRINT MODAL ─── */}
      <AttendancePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedClass={selectedClass}
        exportMonth={exportMonth}
        students={classStats.map(s => s.student)}
        attendance={attendance}
        staff={staff}
      />
    </div>
  );
};

export default AttendanceReport;
