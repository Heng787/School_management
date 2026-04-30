import React, { useState, useMemo, useEffect } from "react";
import { useData } from "../../../context/DataContext";
import { UserRole, AttendanceStatus, Page } from "../../../types";
import PerformanceChart from "../../charts/PerformanceChart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { AttendanceModal, GradesModal } from "../../TeacherActionsModals";

// --- Shared Components ---
// --- Shared Components ---
const Card = ({ title, action, children, className = "", noPadding = false }) => (
  <div
    className={`glass-card bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 ${noPadding ? "" : "p-6"} ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-5 relative z-10">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {title}
        </h3>
        {action ? action : <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />}
      </div>
    )}
    <div className="relative z-10">{children}</div>
  </div>
);

const StatCard = ({ title, value, subText, trend, trendType = "up", icon, colorClass = "blue" }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20",
    primary: "text-primary-600 bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/20",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20",
  };

  return (
    <Card className="!p-5 hover:border-primary-500/30">
      <div className="flex justify-between items-start group">
        <div className="min-w-0">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
              {value}
            </h3>
            {subText && (
              <span className="text-base text-slate-500 dark:text-slate-500 font-medium tracking-tight">
                {subText}
              </span>
            )}
          </div>
          {trend && (
            <div className={`mt-3 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold w-fit border ${
              trendType === "up" 
                ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30" 
                : "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30"
            }`}>
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[colorClass]} border shadow-sm`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// --- Admin Dashboard ---
export const AdminDashboard = ({ navigate }) => {
  const {
    students,
    staff,
    classes,
    enrollments,
    attendance,
    events,
    staffPermissions,
    grades,
    activityLogs,
    clearActivityLogs,
  } = useData();

  // 1. Student Lifecycle & Attendance
  const today = new Date().toLocaleDateString("en-CA");
  const studentIds = new Set(students.map((s) => s.id));
  const todaysAttendance = attendance.filter(
    (a) => a.date === today && studentIds.has(a.studentId),
  );
  const uniquePresentStudents = new Set(
    todaysAttendance
      .filter((a) => a.status === AttendanceStatus.Present)
      .map((a) => a.studentId),
  );
  const totalMarkedToday = new Set(todaysAttendance.map((a) => a.studentId))
    .size;
  const attendanceRate =
    totalMarkedToday > 0
      ? Math.round((uniquePresentStudents.size / totalMarkedToday) * 100)
      : 0;

  const currentMonth = new Date().getMonth();
  const newAdmissions = students.filter(
    (s) => new Date(s.enrollmentDate).getMonth() === currentMonth,
  ).length;

  const enrollmentTrends = [
    { month: "Oct", count: Math.max(0, students.length - 8) },
    { month: "Nov", count: Math.max(0, students.length - 5) },
    { month: "Dec", count: Math.max(0, students.length - 4) },
    { month: "Jan", count: Math.max(0, students.length - 2) },
    { month: "Feb", count: students.length },
    { month: "Mar", count: students.length + newAdmissions },
  ];

  // 4. Staff Attendance
  const [pendingLeaves, setPendingLeaves] = useState(0);

  useEffect(() => {
    import("../../../services/messageService").then((m) => {
      m.fetchMessages("admin", true).then((msgs) => {
        const count = msgs.filter(
          (msg) =>
            msg.type === "leave_request" && msg.metadata?.status === "pending",
        ).length;
        setPendingLeaves(count);
      });
    });
  }, []);

  // Get unique ids of staff who are strictly on leave today
  const absentStaffIds = new Set(
    staffPermissions
      .filter((p) => p.startDate <= today && p.endDate >= today)
      .map((p) => p.staffId),
  );

  const absentTeachersCount = absentStaffIds.size;

  const staffStatuses = staff.map((s) => {
    const leave = staffPermissions.find(
      (p) => p.staffId === s.id && p.startDate <= today && p.endDate >= today,
    );
    return {
      ...s,
      status: leave ? "On Leave" : "Available",
      leaveDetails: leave ? leave.type : "",
    };
  });

  // Recent activity
  const recentActivity = activityLogs.slice(0, 5).map(log => ({
    id: log.id,
    type: log.action.toLowerCase().includes('issue') ? 'Issue' : 'Entry',
    personName: log.action.split('"')[1] || 'Staff',
    timestamp: new Date(log.id).toISOString(),
    purpose: log.action
  }));
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // 4. Enhanced Analytics
  const classPerformance = classes
    .map((c) => {
      const classStudents = enrollments
        .filter((e) => e.classId === c.id)
        .map((e) => e.studentId);
      const classGrades = grades.filter((g) =>
        classStudents.includes(g.studentId),
      );
      const avg = classGrades.length
        ? classGrades.reduce((sum, g) => sum + g.score, 0) / classGrades.length
        : 0;
      return { name: c.name, avg: avg.toFixed(1) };
    })
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
    .slice(0, 3);

  const atRiskStudents = students
    .map((s) => {
      const studentGrades = grades.filter((g) => g.studentId === s.id);
      const avg = studentGrades.length
        ? studentGrades.reduce((sum, g) => sum + g.score, 0) /
          studentGrades.length
        : 10;
      return { name: s.name, avg: avg.toFixed(1) };
    })
    .filter((s) => parseFloat(s.avg) < 5.0 && parseFloat(s.avg) > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={students.length}
          trend={`+${newAdmissions} new this month`}
          trendType="up"
          colorClass="primary"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
            </svg>
          }
        />
        <StatCard
          title="Daily Attendance"
          value={`${attendanceRate}%`}
          trend="2% vs yesterday"
          trendType="up"
          colorClass="emerald"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Staff Availability"
          value={staff.length - absentTeachersCount}
          subText={`/ ${staff.length}`}
          trend={`${pendingLeaves} requests pending`}
          trendType="amber"
          colorClass="amber"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944V21m0-18.056L3.382 5.984m8.618-3.04l8.618 3.04M12 21.056L3.382 5.984M12 21.056l8.618-15.072" />
            </svg>
          }
        />
        <Card title="Enrollment Trend" className="!p-5">
          <div className="h-20 w-[110%] -ml-2 -mb-2 text-primary-500 transition-colors duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrends}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="url(#colorTrend)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate && navigate(Page.Students)}
          className="flex items-center justify-center gap-2 p-2.5 bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-500 hover:shadow-md transition-all text-sm font-bold active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
        <button
          onClick={() => navigate && navigate(Page.Messages)}
          className="flex items-center justify-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm font-bold text-slate-700 dark:text-slate-200 active:scale-95"
        >
          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Announcement
        </button>
        <button
          onClick={() => navigate && navigate(Page.Schedule)}
          className="flex items-center justify-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm font-bold text-slate-700 dark:text-slate-200 active:scale-95"
        >
          <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Schedule Event
        </button>
        <button
          onClick={() => {
            sessionStorage.setItem("reports_initial_tab", "export");
            if (navigate) navigate(Page.Reports);
          }}
          className="flex items-center justify-center gap-2 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm font-bold text-slate-700 dark:text-slate-200 active:scale-95"
        >
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <div className="lg:col-span-2 space-y-6">
          <Card title="Average Performance by Level">
            <div className="h-[300px] w-full mt-4">
              <PerformanceChart />
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Top Performing Classes">
              <div className="space-y-4">
                {classPerformance.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm transition-colors">
                        #{i + 1}
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                        {c.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white transition-colors">
                      {c.avg}{" "}
                      <span className="text-xs text-slate-500 dark:text-slate-500 transition-colors">Avg</span>
                    </span>
                  </div>
                ))}
                {classPerformance.length === 0 && (
                  <p className="text-sm text-slate-500 italic">
                    No grade data available
                  </p>
                )}
              </div>
            </Card>
            <Card title="At-Risk Students (Avg < 5.0)">
              <div className="space-y-3">
                {atRiskStudents.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-600 shadow-sm shadow-rose-200 dark:shadow-none transition-all"></div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm transition-colors">
                        {s.name}
                      </span>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm transition-colors">
                      {s.avg}
                    </span>
                  </div>
                ))}
                {atRiskStudents.length === 0 && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2 transition-colors">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    No students currently at risk!
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Upcoming Events">
            <div className="space-y-4">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="flex gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 shrink-0">
                    <span className="text-[10px] font-bold uppercase">
                      {new Date(e.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-lg font-black leading-none">
                      {new Date(e.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {e.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {e.description}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div
                  className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default"
                  title="Example Event Placeholder"
                >
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 rounded-xl text-slate-500 border border-slate-200 shrink-0">
                    <span className="text-[10px] font-bold uppercase">Oct</span>
                    <span className="text-lg font-black leading-none">15</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-600 text-sm">
                      Staff Meeting (Example)
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      Discussing Q4 curriculum changes in the main hall.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card 
            title="Recent Activity"
            action={
              <button 
                onClick={clearActivityLogs}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
              >
                Clear
              </button>
            }
          >
            <div className="space-y-4">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 group transition-all">
                  <div
                    className={`mt-1 flex items-center justify-center w-6 h-6 rounded-full shrink-0 transition-colors ${log.type === "Entry" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d={
                          log.type === "Entry"
                            ? "M5 13l4 4L19 7"
                            : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        }
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 transition-colors">
                      <span className="font-bold">{log.personName}</span>{" "}
                      {log.type === "Entry" ? "checked in" : "logged an issue"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 transition-colors">
                      <span className="text-[10px] text-slate-500 dark:text-slate-600 font-medium transition-colors">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {log.purpose && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium truncate max-w-[150px] transition-colors">
                          — {log.purpose}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div
                  className="flex items-start gap-3 opacity-50 grayscale cursor-default transition-all hover:grayscale-0"
                  title="Example Activity Placeholder"
                >
                  <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full shrink-0 bg-slate-200 text-slate-500">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">
                      <span className="font-bold">System Admin</span> updated
                      settings
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">
                        08:00 AM
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                        — Example activity log
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Today's Staff Status">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {staffStatuses
                .sort((a, b) => (a.status === "On Leave" ? -1 : 1))
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-400 flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 transition-colors">
                        <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm truncate transition-colors">
                          {s.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 truncate transition-colors">
                          {s.role}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 transition-colors">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${s.status === "Available" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/20" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/20"}`}
                      >
                        {s.status}
                      </span>
                      {s.leaveDetails && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 font-semibold transition-colors">
                          {s.leaveDetails}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Teacher Dashboard ---
export const TeacherDashboard = ({ navigate }) => {
  const { 
    currentUser, classes, enrollments, students, 
    draftGrades, publishClassGrades, attendance,
    draftAttendance, publishClassAttendance,
    tasks, updateTask, addTask 
  } = useData();
  const [isSending, setIsSending] = useState({}); // {[classId]: boolean}
  const myClasses = classes.filter((c) => c.teacherId === currentUser?.id);
  const myClassIds = new Set(myClasses.map((c) => c.id));
  const myStudentsCount = enrollments.filter((e) => myClassIds.has(e.classId)).length;

  const [actionState, setActionState] = useState(null);
  const [sentStatus, setSentStatus] = useState({});
  const [newTaskText, setNewTaskText] = useState("");

  const handleSendToAdmin = async (e, classId) => {
    e.stopPropagation();
    if (isSending[classId]) return;

    setIsSending(prev => ({ ...prev, [classId]: true }));
    try {
      const p1 = publishClassGrades(classId);
      const p2 = publishClassAttendance(classId);
      await Promise.all([p1, p2]);
      
      setSentStatus((prev) => ({ ...prev, [classId]: true }));
      setTimeout(() => {
        setSentStatus((prev) => ({ ...prev, [classId]: false }));
      }, 5000);
    } catch (err) {
      console.error("Failed to publish data", err);
      alert("Failed to send to admin");
    } finally {
      setIsSending(prev => ({ ...prev, [classId]: false }));
    }
  };

  const getStudentsForClass = (classId) => {
    const classEnrolls = enrollments.filter((e) => e.classId === classId);
    return classEnrolls
      .map((e) => students.find((s) => s.id === e.studentId))
      .filter(Boolean);
  };

  // --- Real Data Calculation ---
  const myStudentsEnrollments = enrollments.filter(e => myClassIds.has(e.classId));
  const myStudentIds = new Set(myStudentsEnrollments.map(e => e.studentId));
  const myAttendance = attendance.filter(a => myStudentIds.has(a.studentId));

  const avgAttendance = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const thisMonthRecs = myAttendance.filter(a => a.date.startsWith(currentMonth));
    
    if (thisMonthRecs.length === 0) return 100; // Default if no records yet
    
    const attendedCount = thisMonthRecs.filter(r => 
      r.status === AttendanceStatus.Present || 
      r.status === AttendanceStatus.Late || 
      r.status === AttendanceStatus.Permission
    ).length;
    
    return Math.round((attendedCount / thisMonthRecs.length) * 100);
  }, [myAttendance]);

  const avgGrade = "A-";

  const weeklyAttendanceData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const today = new Date();
    return days.map((day, i) => {
      // Logic to get data for the last 5 days
      const d = new Date();
      d.setDate(today.getDate() - (4 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayRecs = myAttendance.filter(a => a.date === dateStr);
      
      if (dayRecs.length === 0) return { day, rate: 100 }; // Default
      
      const attended = dayRecs.filter(r => 
        r.status === AttendanceStatus.Present || 
        r.status === AttendanceStatus.Late || 
        r.status === AttendanceStatus.Permission
      ).length;
      
      return { day, rate: Math.round((attended / dayRecs.length) * 100) };
    });
  }, [myAttendance]);

  const pendingTasks = useMemo(() => tasks ? tasks.filter(t => !t.done) : [], [tasks]);
  const pendingTasksCount = pendingTasks.length;
  
  const handleToggleTask = (t) => {
    updateTask(t.id, { done: !t.done });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask({ 
      text: newTaskText.trim(), 
      done: false,
      urgency: "Medium",
      color: "primary"
    });
    setNewTaskText("");
  };


  return (
    <div className="space-y-6">
      {/* 1. Stat Cards Top Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="!p-5 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0 shadow-lg shadow-primary-100 dark:shadow-none hover:scale-[1.02] transition-all duration-500 group">
          <p className="text-primary-100/80 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 transition-colors">Total Students</p>
          <h3 className="text-4xl font-black tracking-tighter drop-shadow-sm">{myStudentsCount}</h3>
          <div className="mt-4 p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <p className="text-[9px] font-bold text-center">Manage your classroom</p>
          </div>
        </Card>
        <Card className="!p-5 transition-all duration-500 hover:-translate-y-1 group">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 transition-colors">Monthly Avg Attendance</p>
          <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{avgAttendance}%</h3>
          <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit border border-emerald-100">
             <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
             Excellent
          </div>
        </Card>
        <Card className="!p-5 transition-all duration-500 hover:-translate-y-1">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 transition-colors">Class Average</p>
          <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{avgGrade}</h3>
          <div className="mt-4 text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full w-fit border border-primary-100 uppercase tracking-widest">
             Academic Peak
          </div>
        </Card>
        <Card className="!p-5 transition-all duration-500 hover:-translate-y-1">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 transition-colors">Pending Tasks</p>
          <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{pendingTasksCount}</h3>
          <div className="mt-4 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full w-fit border border-rose-100 uppercase tracking-widest">
             Action Required
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">My Classes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {myClasses.map((c) => {
              const classEnrollments = enrollments.filter((e) => e.classId === c.id);
              const draftsForClass = draftGrades ? draftGrades.filter((g) => g.classId === c.id) : [];
              return (
                <Card
                  key={c.id}
                  title={c.name}
                  className="hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{c.schedule}</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {classEnrollments.length} Students Enrolled
                        </p>
                      </div>
                      {classEnrollments.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(Page.Students);
                          }}
                          className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 hover:underline"
                        >
                          View Students &rarr;
                        </button>
                      )}
                    </div>
                    
                    {/* 2. Grade Distribution Bars */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        <span>Grade Mix</span>
                        <span>{Math.round(Math.random() * 20 + 70)}% Passing</span>
                      </div>
                      <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/50 dark:border-slate-700 shadow-inner">
                        <div className="bg-emerald-500 rounded-l-full shadow-sm" style={{ width: "40%" }}></div>
                        <div className="bg-primary-500 shadow-sm" style={{ width: "30%" }}></div>
                        <div className="bg-amber-400 shadow-sm" style={{ width: "20%" }}></div>
                        <div className="bg-rose-500 rounded-r-full shadow-sm" style={{ width: "10%" }}></div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionState({ type: "attendance", classId: c.id });
                          }}
                          className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-primary-500 transition-all"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionState({ type: "grades", classId: c.id });
                          }}
                          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          Grades
                        </button>
                      </div>
                      <button
                        onClick={(e) => handleSendToAdmin(e, c.id)}
                        disabled={sentStatus[c.id] || isSending[c.id] || (draftsForClass.length === 0 && (draftAttendance || []).filter(a => a.classId === c.id).length === 0)}
                        className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                          sentStatus[c.id]
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 dark:bg-slate-900 dark:text-emerald-500 dark:border-emerald-800/50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
                        }`}
                      >
                        {isSending[c.id] ? (
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                             <span>Sending...</span>
                          </div>
                        ) : sentStatus[c.id] ? (
                          <span>Sent successfully!</span>
                        ) : (
                          <span>
                            {(draftsForClass.length > 0 || (draftAttendance || []).filter(a => a.classId === c.id).length > 0) 
                              ? `Send to Admin (${draftsForClass.length + (draftAttendance || []).filter(a => a.classId === c.id).length})` 
                              : "Send to Admin"}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* 3. Second Class Card Placeholder if needed */}
            {myClasses.length < 2 && (
              <Card className="flex flex-col items-center justify-center border-dashed bg-slate-50 dark:bg-slate-950 opacity-70">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">New Class Assignment</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Pending admin approval</p>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 6. Weekly attendance bars */}
            <Card title="Weekly Attendance">
              <div className="h-40 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 4. To-do panel with urgency */}
            <Card title="Action Items">
              <div className="space-y-4">
                {/* Add Task Input */}
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </form>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                  {tasks.filter(t => !t.done).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-500 italic">No tasks yet. Enjoy your day!</p>
                    </div>
                  ) : (
                    tasks.filter(t => !t.done).map(task => (
                      <div 
                        key={task.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          task.done 
                            ? "bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/50 opacity-60" 
                            : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900/30"
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <button
                            onClick={() => handleToggleTask(task)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              task.done 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : "border-slate-300 dark:border-slate-700 hover:border-primary-500"
                            }`}
                          >
                            {task.done && (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span className={`text-sm font-semibold truncate transition-all ${
                            task.done 
                              ? "text-slate-500 dark:text-slate-500 line-through" 
                              : "text-slate-700 dark:text-slate-300"
                          }`}>
                            {task.text}
                          </span>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 text-[9px] font-black uppercase rounded-full tracking-tighter ${
                          task.done
                            ? "bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-600"
                            : `bg-${task.color || 'primary'}-100 text-${task.color || 'primary'}-700 dark:bg-${task.color || 'primary'}-900/30 dark:text-${task.color || 'primary'}-400`
                        }`}>
                          {task.done ? 'Done' : (task.urgency || 'Normal')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {/* 5. Schedule with status badges */}
          <Card title="Today's Schedule">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              {myClasses.length > 0 ? myClasses.map((c, i) => {
                let status = "Upcoming";
                let statusColor = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                
                if (i === 0) {
                  status = "Done";
                  statusColor = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
                } else if (i === 1) {
                  status = "Now";
                  statusColor = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 relative after:absolute after:top-0 after:right-0 after:-mr-1 after:-mt-1 after:w-2 after:h-2 after:bg-blue-500 after:rounded-full after:animate-ping";
                }

                return (
                  <div key={`sched-${c.id}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{c.name}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${statusColor}`}>{status}</span>
                      </div>
                      <time className="text-xs text-slate-500 dark:text-slate-400">{c.schedule}</time>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">No classes scheduled for today.</p>
              )}
            </div>
          </Card>

          <Card title="Recent Activity">
            <div className="space-y-4">
              {[
                { title: "Attendance Submitted", time: "10:30 AM", desc: "Room 4 - Morning Session", icon: "✓", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
                { title: "Grades Updated", time: "Yesterday", desc: "Midterm scores for K1", icon: "A", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
                { title: "Message to Admin", time: "Mon, 9:00 AM", desc: "Requested student transfer", icon: "💬", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" }
              ].map((act, i) => (
                <div key={i} className="flex space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${act.color}`}>
                    {act.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{act.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-1.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {actionState?.type === "attendance" && (
        <AttendanceModal
          classData={classes.find((c) => c.id === actionState.classId)}
          students={getStudentsForClass(actionState.classId)}
          onClose={() => setActionState(null)}
        />
      )}

      {actionState?.type === "grades" && (
        <GradesModal
          classData={classes.find((c) => c.id === actionState.classId)}
          students={getStudentsForClass(actionState.classId)}
          onClose={() => setActionState(null)}
        />
      )}
    </div>
  );
};

// --- Office Worker Dashboard ---
export const OfficeWorkerDashboard = () => {
  const {
    students, updateStudent,
    classes, enrollments,
    staff, staffPermissions,
    tasks, updateTask, addTask,
    activityLogs, addActivityLog, clearActivityLogs,
    currentUser,
  } = useData();

  // 1. Enrollment Queue — real pending students
  const pendingStudents = students.filter(s => s.status === 'Pending');

  const handleEnrollmentAction = (student, action) => {
    const newStatus = action === 'approve' ? 'Active' : 'Dropout';
    updateStudent({ ...student, status: newStatus });
    addActivityLog({
      action: `${action === 'approve' ? 'Approved' : 'Rejected'} enrollment for ${student.name}`
    });
  };

  // 2. Room Capacity — real data
  const capacity = 30;
  const roomData = classes.map(c => {
    const enrolled = enrollments.filter(e => e.classId === c.id).length;
    return { ...c, enrolled, pct: Math.min(100, Math.round((enrolled / capacity) * 100)), isFull: enrolled >= capacity };
  }).sort((a, b) => b.enrolled - a.enrolled);

  // 3. Staff on Duty — real leave data
  const today = new Date().toLocaleDateString('en-CA');
  const onDutyStaff = staff.map(s => {
    const leave = staffPermissions.find(p => p.staffId === s.id && p.startDate <= today && p.endDate >= today);
    return { ...s, status: leave ? 'On Leave' : 'On Duty', leaveType: leave?.type || '' };
  }).sort((a, b) => (a.status === 'On Leave' ? 1 : -1));

  // 4. Tasks — from DataContext (persisted in localStorage)
  const [newTaskText, setNewTaskText] = useState('');
  const pendingTaskCount = tasks.filter(t => !t.done).length;

  const handleToggleTask = (t) => {
    updateTask(t.id, { done: !t.done });
    if (!t.done) addActivityLog({ action: `Completed task: ${t.text}` });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask({ text: newTaskText.trim(), done: false });
    setNewTaskText('');
  };

  // 5. Messages — from Supabase via messageService
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    import('../../../services/messageService').then(m => {
      m.fetchMessages(currentUser?.id, currentUser?.role === 'Admin').then(msgs => {
        const recent = msgs
          .filter(msg => msg.recipientId === (currentUser?.id) || msg.senderId === currentUser?.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setMessages(recent);
      });
    });
  }, [currentUser]);

  // 6. Activity Log — from DataContext (persisted in localStorage), today only
  const todayLogs = activityLogs
    .slice()
    .reverse()
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="!p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg shadow-purple-100 dark:shadow-none hover:scale-[1.02] transition-transform">
          <p className="text-purple-100 text-xs font-bold uppercase tracking-wider mb-1">Total Students</p>
          <h3 className="text-3xl font-extrabold">{students.length}</h3>
        </Card>
        <Card className="!p-5 hover:-translate-y-1 transition-transform">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Staff On Duty</p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            {onDutyStaff.filter(s => s.status === 'On Duty').length}
            <span className="text-lg font-medium text-slate-500"> / {staff.length}</span>
          </h3>
        </Card>
        <Card className="!p-5 hover:-translate-y-1 transition-transform">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Tasks</p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{pendingTaskCount}</h3>
        </Card>
        <Card className="!p-5 hover:-translate-y-1 transition-transform">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Available Rooms</p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">{roomData.filter(r => !r.isFull).length}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrollment Queue */}
          <Card title="Enrollment Queue">
            <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              {pendingStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{s.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {s.level || 'Unknown Level'} • Applied {s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEnrollmentAction(s, 'reject')}
                      className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button
                      onClick={() => handleEnrollmentAction(s, 'approve')}
                      className="p-2 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {pendingStudents.length === 0 && (
                <div className="py-10 flex flex-col items-center text-slate-500">
                  <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm">No pending enrollments</p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Messages */}
            <Card title="Recent Messages">
              <div className="space-y-4 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {messages.map(msg => (
                  <div key={msg.id} className="relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-slate-200 dark:before:bg-slate-700">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{msg.senderName || 'System'}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{msg.content}</p>
                    {msg.type === 'leave_request' && <span className="inline-block mt-1 text-[10px] font-bold uppercase text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">Leave Request</span>}
                  </div>
                ))}
                {messages.length === 0 && <p className="text-sm text-slate-500 italic">No messages yet.</p>}
              </div>
            </Card>

            {/* Tasks */}
            <Card title="My To-Dos">
              <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                {tasks.filter(t => !t.done).map(t => (
                  <label key={t.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                    <input type="checkbox" checked={t.done} onChange={() => handleToggleTask(t)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                    <span className={`text-sm font-medium ${t.done ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{t.text}</span>
                  </label>
                ))}
                {tasks.filter(t => !t.done).length === 0 && <p className="text-xs text-slate-500 italic">No tasks yet.</p>}
              </div>
              <form onSubmit={handleAddTask} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  placeholder="Add new task..."
                  className="flex-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" className="px-3 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-500 transition-colors">Add</button>
              </form>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Room Capacity */}
          <Card title="Room Capacity">
            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {roomData.map(r => (
                <div key={r.id}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300 truncate">{r.name}</span>
                    <span className={r.isFull ? 'text-rose-500' : r.pct > 80 ? 'text-amber-500' : 'text-emerald-500'}>{r.enrolled}/{capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${r.isFull ? 'bg-rose-500' : r.pct > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              {roomData.length === 0 && <p className="text-sm text-slate-500 italic">No room data available.</p>}
            </div>
          </Card>

          {/* Staff on Duty */}
          <Card title="Staff on Duty">
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {onDutyStaff.map(s => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${s.status === 'On Duty' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-sm font-bold leading-tight ${s.status === 'On Duty' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-500'}`}>{s.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.role}</p>
                    </div>
                  </div>
                  {s.status === 'On Leave' && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full uppercase shrink-0">
                      {s.leaveType || 'On Leave'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Log */}
          <Card 
            title="Activity Log"
            action={
              <button 
                onClick={clearActivityLogs}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
              >
                Clear
              </button>
            }
          >
            <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {todayLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{log.action}</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
              {todayLogs.length === 0 && (
                <p className="text-xs text-slate-500 italic">No activity logged yet today.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};



