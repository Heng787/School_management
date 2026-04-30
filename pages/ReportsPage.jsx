import React, { useState, useEffect } from 'react';

import {
  MarksEntry,
  ExportCenter,
  AttendanceReport,
} from '../components/reportspage';

/**
 * PAGE: ReportsPage
 * DESCRIPTION: Container page that routes between Marks Entry, Attendance, and Export sub-views.
 */
const ReportsPage = () => {
  // --- State & Routing ---
  const getInitialReportsTab = () => {
    const stored = sessionStorage.getItem('reports_initial_tab');
    if (stored) {
      sessionStorage.removeItem('reports_initial_tab');
      if (
        stored === 'export' ||
        stored === 'attendance' ||
        stored === 'marks'
      ) {
        return stored;
      }
    }

    const parts = window.location.pathname.split('/');
    const sub = parts[2]?.toLowerCase();
    if (sub === 'attendance') return 'attendance';
    if (sub === 'export') return 'export';
    return 'marks';
  };

  const [activeTab, setActiveTab] = useState(getInitialReportsTab);

  // --- Side Effects ---
  useEffect(() => {
    const handleTabChange = (e) => {
      const tab = e.detail;
      if (
        tab &&
        (tab === 'marks' || tab === 'attendance' || tab === 'export')
      ) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('reportsTabChange', handleTabChange);
    return () =>
      window.removeEventListener('reportsTabChange', handleTabChange);
  }, []);

  // --- Render ---
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-10 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Academic Reports
          </h1>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === 'marks' && <MarksEntry />}
          {activeTab === 'attendance' && <AttendanceReport />}
          {activeTab === 'export' && <ExportCenter />}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
