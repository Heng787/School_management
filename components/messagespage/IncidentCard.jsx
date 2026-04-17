import React from "react";

/**
 * COMPONENT: IncidentCard
 * DESCRIPTION: Rich card for incident report messages
 */
const IncidentCard = ({ msg, isMine }) => {
  const severity = msg.metadata?.severity || "Low";
  const severityColor =
    severity === "High"
      ? "bg-red-500 text-white"
      : severity === "Medium"
        ? "bg-orange-400 text-white"
        : "bg-yellow-400 text-slate-800";

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm border transition-colors duration-300 ${isMine ? "border-primary-300 dark:border-primary-800/50" : "border-red-200 dark:border-red-800/30"}`}
      style={{ maxWidth: 300 }}
    >
      <div
        className={`px-4 py-2.5 flex items-center justify-between transition-colors ${isMine ? "bg-primary-500" : "bg-red-50 dark:bg-red-900/30"}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span
            className={`font-bold text-sm transition-colors ${isMine ? "text-white" : "text-red-800 dark:text-red-400"}`}
          >
            Incident Report
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityColor}`}
        >
          {severity.toUpperCase()}
        </span>
      </div>
      <div className="bg-white dark:bg-slate-900 px-4 py-3 transition-colors">
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
          {msg.content.includes("]")
            ? msg.content.split("]")[1]?.trim()
            : msg.content}
        </p>
      </div>
    </div>
  );
};

export default IncidentCard;
