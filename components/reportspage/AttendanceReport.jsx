import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { AttendanceStatus } from "../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const getCutoffDate = (timeRange) => {
  const d = new Date();
  const ops = {
    "7days": () => d.setDate(d.getDate() - 7),
    "30days": () => d.setDate(d.getDate() - 30),
    thisMonth: () => d.setDate(1),
    "90days": () => d.setDate(d.getDate() - 90),
    ytd: () => d.setMonth(0, 1),
  };
  ops[timeRange]?.();
  return d.toLocaleDateString("en-CA");
};

const downloadCSV = (filename, rows) => {
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
  }).click();
  URL.revokeObjectURL(url);
};

const formatDate = (dateStr) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });

// ─── Shared UI ────────────────────────────────────────────────────────────────

const Card = ({ className = "", children }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors ${className}`}
  >
    {children}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
    {message}
  </div>
);

const StatBadge = ({ label, value, color }) => {
  const colors = {
    green: "text-emerald-500 dark:text-emerald-400",
    red: "text-red-500 dark:text-red-400",
    amber: "text-amber-500 dark:text-amber-400",
    purple: "text-purple-500 dark:text-purple-400",
  };
  const valueColors = {
    green: "text-emerald-700 dark:text-emerald-500",
    red: "text-red-700 dark:text-red-500",
    amber: "text-amber-700 dark:text-amber-500",
    purple: "text-purple-700 dark:text-purple-500",
  };
  return (
    <div className="text-center">
      <p className={`text-[10px] font-bold uppercase ${colors[color]}`}>
        {label}
      </p>
      <p className={`text-xl font-black ${valueColors[color]}`}>{value}</p>
    </div>
  );
};

// ─── Top Absences Section ─────────────────────────────────────────────────────

const TIME_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "90days", label: "Last 3 Months" },
  { value: "ytd", label: "Year to Date (YTD)" },
];

const TopAbsences = ({ topAbsences, timeRange, onTimeRangeChange }) => (
  <Card className="p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <svg
          className="w-5 h-5 text-red-500"
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
        Most Absent Students
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Timeframe:
        </span>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 font-semibold outline-none"
        >
          {TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
    {topAbsences.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {topAbsences.map(({ student, count }) => (
          <div
            key={student.id}
            className="group flex bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300"
          >
            <div className="w-2.5 bg-red-500 shrink-0 group-hover:bg-red-600 transition-colors" />
            <div className="flex flex-1 items-center p-4 gap-4">
              <p className="flex-1 text-base font-bold text-slate-800 dark:text-white truncate">
                {student.name}
              </p>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-700 shrink-0">
                <span className="text-3xl font-black text-red-600">
                  {count}
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Total
                  </span>
                  <span className="text-[10px] font-black text-red-500 uppercase">
                    Absences
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState message="No absence records found." />
    )}
  </Card>
);

// ─── Flagged Students Banner ──────────────────────────────────────────────────

const FlaggedBanner = ({ flaggedStudents, onUnflag }) => {
  if (!flaggedStudents.length) return null;
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🚩</span>
        <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase">
          Students Flagged for Follow-Up ({flaggedStudents.length})
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {flaggedStudents.map((s) => (
          <span
            key={s.student.id}
            className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full"
          >
            🚩 {s.student.name} — {s.absent} absence{s.absent !== 1 ? "s" : ""}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnflag(s.student.id);
              }}
              className="ml-1 font-black hover:text-orange-900 dark:hover:text-orange-100"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Attendance History (expanded row) ───────────────────────────────────────

const HistoryRow = ({ stat, isAdminOrOffice, onExport, onExcuse }) => (
  <tr className="bg-primary-50/10 dark:bg-primary-950/10">
    <td colSpan={5} className="px-8 py-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase">
          History Overview
        </p>
        <button
          onClick={onExport}
          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-400 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
        >
          📥 Export CSV
        </button>
      </div>
      {stat.history.length > 0 ? (
        <div className="flex flex-col border-l-2 border-slate-200 dark:border-slate-700 ml-2 space-y-4">
          {stat.history.map((record, i) => {
            const isAbsent = record.status === AttendanceStatus.Absent;
            const isLate = record.status === AttendanceStatus.Late;
            return (
              <div key={i} className="relative pl-6">
                <div
                  className={`absolute -left-[9px] top-2.5 w-4 h-4 rounded-full border-4 ${isAbsent ? "bg-red-500 border-red-50 dark:border-slate-900" : isLate ? "bg-amber-500 border-amber-50 dark:border-slate-900" : "bg-purple-500 border-purple-50 dark:border-slate-900"}`}
                />
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div>
                    <span
                      className={`text-sm font-black uppercase ${isAbsent ? "text-red-600 dark:text-red-400" : isLate ? "text-amber-600 dark:text-amber-400" : "text-purple-600 dark:text-purple-400"}`}
                    >
                      {record.status}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(record.date)}
                    </span>
                  </div>
                  {isAdminOrOffice && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExcuse(record);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      ✓ Excuse
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl flex items-center gap-3">
          <svg
            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-emerald-800 dark:text-emerald-300 font-bold">
            Perfect attendance!
          </p>
        </div>
      )}
    </td>
  </tr>
);

// ─── Class Table ──────────────────────────────────────────────────────────────

const ClassTable = ({
  stats,
  flaggedIds,
  expandedId,
  onRowClick,
  onToggleFlag,
  onExport,
  onExcuse,
  isAdminOrOffice,
}) => (
  <Card>
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-end space-x-8">
      <StatBadge
        label="Total Present"
        value={stats.reduce((a, s) => a + s.present, 0)}
        color="green"
      />
      <StatBadge
        label="Total Absent"
        value={stats.reduce((a, s) => a + s.absent, 0)}
        color="red"
      />
      <StatBadge
        label="Total Late"
        value={stats.reduce((a, s) => a + s.late, 0)}
        color="amber"
      />
      <StatBadge
        label="Total Permission"
        value={stats.reduce((a, s) => a + s.permission, 0)}
        color="purple"
      />
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {[
              {
                label: "Student Info",
                cls: "text-slate-500 dark:text-slate-400 text-left",
              },
              {
                label: "Present",
                cls: "text-emerald-600 dark:text-emerald-400 text-center",
              },
              {
                label: "Absent",
                cls: "text-red-600 dark:text-red-400 text-center",
              },
              {
                label: "Late",
                cls: "text-amber-600 dark:text-amber-400 text-center",
              },
              {
                label: "Perm",
                cls: "text-purple-600 dark:text-purple-400 text-center",
              },
              {
                label: "Flag",
                cls: "text-slate-400 dark:text-slate-500 text-center",
              },
            ].map(({ label, cls }) => (
              <th
                key={label}
                className={`px-6 py-4 text-xs font-bold uppercase ${cls}`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
          {stats.map((stat) => {
            const { student, present, absent, late, permission } = stat;
            const isFlagged = flaggedIds.has(student.id);
            const isExpanded = expandedId === student.id;
            const canFlag = absent >= 3;

            const rowBg = isFlagged
              ? "bg-orange-50 dark:bg-orange-950/30"
              : isExpanded
                ? "bg-primary-50 dark:bg-primary-900/20"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50";

            const avatarCls = isFlagged
              ? "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200";

            return (
              <React.Fragment key={student.id}>
                <tr
                  onClick={() => onRowClick(student.id)}
                  className={`cursor-pointer transition-colors ${rowBg}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarCls}`}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          {student.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          ID: {student.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                      {present}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`font-bold px-3 py-1 rounded-lg ${canFlag ? "text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-900/40" : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20"}`}
                    >
                      {absent}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg">
                      {late}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg">
                      {permission}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {canFlag ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFlag(student.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${isFlagged ? "bg-orange-500 text-white border-orange-500" : "bg-white dark:bg-slate-800 text-orange-500 border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/30"}`}
                      >
                        🚩
                      </button>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">
                        —
                      </span>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <HistoryRow
                    stat={stat}
                    isAdminOrOffice={isAdminOrOffice}
                    onExport={(e) => onExport(e, stat)}
                    onExcuse={(record) => onExcuse(record)}
                  />
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AttendanceReport = () => {
  const {
    students,
    classes,
    attendance,
    enrollments,
    updateAttendance,
    currentUser,
    staff,
  } = useData();

  const [selectedClassId, setSelectedClassId] = useSession(
    "reports_attendance_class",
  );
  const [timeRange, setTimeRange] = useSession(
    "reports_attendance_time",
    "today",
  );
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [flaggedIds, setFlaggedIds] = useState(new Set());

  const isAdminOrOffice = ["Admin", "Office Worker"].includes(
    currentUser?.role,
  );

  const filteredAttendance = useMemo(() => {
    const cutoff = getCutoffDate(timeRange);
    return attendance.filter((a) => a.date >= cutoff);
  }, [attendance, timeRange]);

  const topAbsences = useMemo(() => {
    const counts = {};
    filteredAttendance.forEach((a) => {
      if (a.status === AttendanceStatus.Absent)
        counts[a.studentId] = (counts[a.studentId] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({
        student: students.find((s) => s.id === id),
        count,
      }))
      .filter((x) => x.student);
  }, [filteredAttendance, students]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  );

  const classStudentsStats = useMemo(() => {
    if (!selectedClass) return [];
    const ids = new Set(
      enrollments
        .filter((e) => e.classId === selectedClass.id)
        .map((e) => e.studentId),
    );
    return students
      .filter((s) => ids.has(s.id))
      .map((student) => {
        const recs = filteredAttendance.filter(
          (a) =>
            a.studentId === student.id &&
            (a.classId === selectedClass.id || !a.classId),
        );
        const present = recs.filter(
          (a) => a.status === AttendanceStatus.Present,
        ).length;
        const absent = recs.filter(
          (a) => a.status === AttendanceStatus.Absent,
        ).length;
        const late = recs.filter(
          (a) => a.status === AttendanceStatus.Late,
        ).length;
        const permission = recs.filter(
          (a) => a.status === AttendanceStatus.Permission,
        ).length;
        const history = recs
          .filter((a) => a.status !== AttendanceStatus.Present)
          .sort((a, b) => b.date.localeCompare(a.date));
        return {
          student,
          present,
          absent,
          late,
          permission,
          total: present + absent + late + permission,
          history,
        };
      });
  }, [students, selectedClass, enrollments, filteredAttendance]);

  const flaggedStudents = useMemo(
    () => classStudentsStats.filter((s) => flaggedIds.has(s.student.id)),
    [classStudentsStats, flaggedIds],
  );

  const toggleFlag = (id) =>
    setFlaggedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleExport = (e, stat) => {
    e.stopPropagation();
    const rows = [
      "Student Name,Student ID,Class,Date,Status",
      ...attendance
        .filter((a) => a.studentId === stat.student.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(
          (r) =>
            `${stat.student.name},${stat.student.id},${selectedClass?.name ?? ""},${r.date},${r.status}`,
        ),
    ];
    downloadCSV(
      `attendance_${stat.student.name.replace(/\s+/g, "_")}_${new Date().toLocaleDateString("en-CA")}.csv`,
      rows,
    );
  };

  return (
    <div className="space-y-6">
      <TopAbsences
        topAbsences={topAbsences}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <FlaggedBanner flaggedStudents={flaggedStudents} onUnflag={toggleFlag} />

      {/* Class Selector */}
      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Detailed Class Report
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setExpandedStudentId(null);
            }}
            className="w-full md:w-96 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white outline-none"
          >
            <option value="">Choose a class...</option>
            {classes.map((c) => {
              const teacher = staff?.find((s) => s.id === c.teacherId);
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                  {teacher ? ` (Teacher: ${teacher.name})` : ""} | {c.schedule}
                </option>
              );
            })}
          </select>
        </div>
        {selectedClassId && (
          <p className="text-xs text-slate-400 italic">
            Tap a row to view history
          </p>
        )}
      </Card>

      {/* Class Table */}
      {selectedClassId &&
        (classStudentsStats.length === 0 ? (
          <EmptyState message="This class has no students enrolled yet." />
        ) : (
          <ClassTable
            stats={classStudentsStats}
            flaggedIds={flaggedIds}
            expandedId={expandedStudentId}
            onRowClick={(id) =>
              setExpandedStudentId((p) => (p === id ? null : id))
            }
            onToggleFlag={toggleFlag}
            onExport={handleExport}
            onExcuse={(record) =>
              updateAttendance({ ...record, status: AttendanceStatus.Present })
            }
            isAdminOrOffice={isAdminOrOffice}
          />
        ))}
    </div>
  );
};

export default AttendanceReport;
