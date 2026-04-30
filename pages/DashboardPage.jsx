import React, { useMemo, useState } from 'react';

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import PerformanceChart from '../components/charts/PerformanceChart';
import {
  AdminDashboard,
  TeacherDashboard,
  OfficeWorkerDashboard,
} from '../components/icons/dashboards/RoleDashboards';
import { useData } from '../context/DataContext';

import { StudentStatus, UserRole } from '../types';

// ─── Subcomponents ────────────────────────────────────────────────────────────
const TrendUpIcon = () => (
  <>
    <svg
      className="w-3 h-3 text-emerald-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
    <span className="sr-only">Increasing</span>
  </>
);

const TrendDownIcon = () => (
  <>
    <svg
      className="w-3 h-3 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
    <span className="sr-only">Decreasing</span>
  </>
);

const StaffIcon = () => (
  <svg
    className="w-5 h-5 text-blue-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"
    />
  </svg>
);

const ClassIcon = () => (
  <svg
    className="w-5 h-5 text-indigo-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

/**
 * A reusable KPI card component for displaying key metrics.
 */
const KpiCard = ({ title, value, trend, subValue, badge, icon }) => (
  <div className="glass-light dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-premium hover:shadow-premium-hover transition-all duration-500 relative overflow-hidden group glass-card">
    <div className="flex justify-between items-start mb-1.5 sm:mb-2">
      <h3 className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {title}
      </h3>
      <div aria-hidden="true">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline space-x-2">
      <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
        {value}
      </p>
    </div>
    <div className="mt-3 flex items-center justify-between">
      {subValue && (
        <p className="text-xs text-slate-500 font-medium">{subValue}</p>
      )}
      {trend !== undefined && (
        <div
          className={`flex items-center space-x-1 text-xs font-bold ${trend >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'} px-2 py-1 rounded-full`}
        >
          {trend >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  </div>
);

/**
 * A simple mini-calendar widget for the dashboard.
 */
const MiniCalendar = () => {
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const currentDay = today.getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startDay }, (_, i) => i);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="glass-light dark:bg-slate-900 p-5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-premium h-full transition-all duration-500 glass-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-700 dark:text-slate-200">Calendar</h3>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-slate-500 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm" role="grid">
        {padding.map((i) => (
          <div key={`pad-${i}`} role="gridcell" />
        ))}
        {days.map((d) => (
          <div
            key={d}
            role="button"
            tabIndex="0"
            aria-label={`${d} ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}${d === currentDay ? ', Today' : ''}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault())}
            className={`
              h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              ${d === currentDay ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
            `}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-500 font-medium mb-2 uppercase">
          Today's Focus
        </p>
        <div className="space-y-2">
          <div className="flex items-center text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium flex-1">
              Staff Meeting
            </span>
            <span className="text-slate-500">14:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Displays the gender distribution of students using a pie chart.
 */
const GenderDistributionChart = ({ students }) => {
  const data = useMemo(() => {
    const males = students.filter((s) => s.sex === 'Male').length;
    const females = students.filter((s) => s.sex === 'Female').length;

    return [
      { name: 'Boys', value: males, color: '#3b82f6' },
      { name: 'Girls', value: females, color: '#ec4899' },
    ];
  }, [students]);

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * The primary landing page for authenticated users.
 * Displays role-specific KPI cards, charts, and calendar widgets.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.navigate - Function to trigger navigation between app pages.
 */
const DashboardPage = ({ navigate }) => {
  // --- State & Data ---
  const { students, subjects, classes, staff, enrollments, currentUser } = useData();
  const [subjectFilter, setSubjectFilter] = useState('All');

  // --- Memoized Data ---
  const activeStudents = useMemo(
    () => students.filter((s) => s.status === StudentStatus.Active),
    [students],
  );

  const uniqueSubjects = useMemo(() => {
    const all = [
      ...(subjects.Kid || []),
      ...(subjects.JuniorSenior || []),
    ];
    return ['All', ...all];
  }, [subjects]);

  // --- Render Logic ---
  const renderDashboard = () => {
    switch (currentUser?.role) {
      case UserRole.Admin:
        return <AdminDashboard navigate={navigate} />;
      case UserRole.Teacher:
        return <TeacherDashboard navigate={navigate} />;
      case UserRole.OfficeWorker:
        return <OfficeWorkerDashboard />;
      default:
        return <AdminDashboard navigate={navigate} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            {currentUser?.role} <span className="text-primary-600">Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Welcome back,{' '}
            <span className="text-slate-900 dark:text-slate-200 font-bold border-b border-primary-500/30">
              {currentUser?.name}
            </span>
            . Here's what's happening today.
          </p>
        </div>
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2.5 uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;
