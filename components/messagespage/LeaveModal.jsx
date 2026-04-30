import React, { useState } from "react";
import { formatDate, daysBetween } from "./messageHelpers";

/**
 * COMPONENT: LeaveModal
 * DESCRIPTION: Modal for submitting leave requests
 */
const LeaveModal = ({ onSend, onClose }) => {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [reason, setReason] = useState("");

  const days = daysBetween(startDate, endDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    const content = `Leave Request: ${leaveType}\nDate: ${startDate}${endDate !== startDate ? " to " + endDate : ""}\nReason: ${reason}`;
    onSend(content, { startDate, endDate, leaveType, status: "pending" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md transition-colors duration-300">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white transition-colors">
                Request Leave
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">
                Submit to school administrator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-500"
          >
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
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide transition-colors">
              Leave Type
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <option>Annual Leave</option>
              <option>Personal Leave</option>
              <option>Non-Personal Leave</option>
              <option>Emergency Leave</option>
              <option>Maternity / Paternity Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide transition-colors">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide transition-colors">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors"
              />
            </div>
          </div>
          {/* Duration badge */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-xl px-4 py-2 flex items-center gap-2 transition-colors">
            <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">
              {days} {days === 1 ? "day" : "days"} off
            </span>
            <span className="text-xs text-primary-400 dark:text-primary-500">
              · {formatDate(startDate)}
              {startDate !== endDate ? ` → ${formatDate(endDate)}` : ""}
            </span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide transition-colors">
              Reason / Details
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Explain the reason for your leave..."
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors"
            />
          </div>
          <div className="flex gap-3 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 dark:shadow-none"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveModal;
