import React, { useState } from "react";

/**
 * COMPONENT: IncidentModal
 * DESCRIPTION: Modal for submitting incident reports
 */
const IncidentModal = ({ onSend, onClose }) => {
  const [severity, setSeverity] = useState("Low");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    const content = `Incident Report [${severity}]\n${description}`;
    onSend(content, { severity });
    onClose();
  };

  const severityStyles = {
    Low: "border-yellow-400 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400",
    Medium: "border-orange-400 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400",
    High: "border-red-500 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md transition-colors duration-300">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white transition-colors">
                Incident Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 transition-colors">
                Report to school administrator
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
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide transition-colors">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Low", "Medium", "High"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${severity === s ? severityStyles[s] + " scale-[1.02]" : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700"}`}
                >
                  {s === "Low" ? "🟡" : s === "Medium" ? "🟠" : "🔴"} {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide transition-colors">
              What Happened?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe the incident clearly and in detail..."
              rows={4}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:outline-none resize-none bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors"
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
              className="flex-1 py-2.5 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
            >
              File Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentModal;
