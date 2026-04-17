import React, { useState, useEffect } from "react";
import {
  MarksEntry,
  ExportCenter,
  AttendanceReport,
} from "../components/reportspage";

/**
 * PAGE: ReportsPage
 * DESCRIPTION: Container page that routes between Marks Entry, Attendance, and Export sub-views.
 */
const ReportsPage = () => {
  // --- STATE & ROUTING ---
  const getInitialReportsTab = () => {
    const stored = sessionStorage.getItem("reports_initial_tab");
    if (stored) {
      sessionStorage.removeItem("reports_initial_tab");
      if (
        stored === "export" ||
        stored === "attendance" ||
        stored === "marks"
      ) {
        return stored;
      }
    }

    const parts = window.location.pathname.split("/");
    const sub = parts[2]?.toLowerCase();
    if (sub === "attendance") return "attendance";
    if (sub === "export") return "export";
    return "marks";
  };

  const [activeTab, setActiveTab] = useState(getInitialReportsTab);

  // --- SIDE EFFECTS ---
  useEffect(() => {
    const handleTabChange = (e) => {
      const tab = e.detail?.tab;
      if (
        tab &&
        (tab === "marks" || tab === "attendance" || tab === "export")
      ) {
        setActiveTab(tab);
      }
    };
    window.addEventListener("reports-tab-change", handleTabChange);
    return () =>
      window.removeEventListener("reports-tab-change", handleTabChange);
  }, []);

  // --- RENDER ---
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Tab Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-20 shadow-sm transition-colors">
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
          <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("marks")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "marks"
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              📝 Marks Entry
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "attendance"
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              📊 Attendance Report
            </button>
            <button
              onClick={() => setActiveTab("export")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === "export"
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              📥 Export Data
            </button>
          </div>
        </div>
        {/* Mobile Tab Selector */}
        <div className="md:hidden mt-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
          >
            <option value="marks">📝 Marks Entry</option>
            <option value="attendance">📊 Attendance Report</option>
            <option value="export">📥 Export Data</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === "marks" && <MarksEntry />}
          {activeTab === "attendance" && <AttendanceReport />}
          {activeTab === "export" && <ExportCenter />}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
