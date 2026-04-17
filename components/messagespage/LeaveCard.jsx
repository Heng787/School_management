import React from "react";
import {
  formatDate,
  daysBetween,
  statusColors,
  statusIcon,
} from "./messageHelpers";

/**
 * COMPONENT: LeaveCard
 * DESCRIPTION: Rich card for leave request messages
 */
const LeaveCard = ({ msg, isMine }) => {
  const m = msg.metadata || {};
  const days =
    m.startDate && m.endDate ? daysBetween(m.startDate, m.endDate) : 1;
  const status = m.status || "pending";

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm border transition-colors duration-300 ${isMine ? "border-primary-300 dark:border-primary-800/50" : "border-amber-200 dark:border-amber-800/30"}`}
      style={{ maxWidth: 300 }}
    >
      {/* Header strip */}
      <div
        className={`px-4 py-2.5 flex items-center gap-2 transition-colors ${isMine ? "bg-primary-500" : "bg-amber-50 dark:bg-amber-900/30"}`}
      >
        <span className="text-lg">📅</span>
        <span
          className={`font-bold text-sm transition-colors ${isMine ? "text-white" : "text-amber-800 dark:text-amber-400"}`}
        >
          Leave Request
        </span>
      </div>
      {/* Body */}
      <div className="bg-white dark:bg-slate-900 px-4 py-3 space-y-2 transition-colors">
        {m.leaveType && (
          <div className="flex items-center gap-1.5 transition-colors">
            <span className="text-xs text-slate-400 dark:text-slate-500">Type:</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {m.leaveType}
            </span>
          </div>
        )}
        {m.startDate && (
          <div className="bg-slate-50 dark:bg-slate-950 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
              📆 {formatDate(m.startDate)}
              {m.endDate &&
                m.endDate !== m.startDate &&
                ` → ${formatDate(m.endDate)}`}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5 transition-colors">
              {days} {days === 1 ? "day" : "days"} off
            </div>
          </div>
        )}
        {msg.content && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2 transition-colors">
            {/* strip the auto-generated prefix, show just the reason */}
            {msg.content.includes("Reason:")
              ? msg.content.split("Reason:")[1]?.trim()
              : msg.content}
          </p>
        )}
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusColors[status]}`}
        >
          <span>{statusIcon[status]}</span>
          <span className="uppercase tracking-wide">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default LeaveCard;
