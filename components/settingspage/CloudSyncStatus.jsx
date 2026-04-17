import React from "react";

/**
 * COMPONENT: CloudSyncStatus
 * DESCRIPTION: Displays cloud synchronization status and provides sync controls.
 */
const CloudSyncStatus = ({
  triggerSync,
  lastSyncedAt,
  isSyncing,
  isOnline,
}) => {
  /**
   * Format the last synced time for display.
   */
  const formatLastSynced = () => {
    if (!lastSyncedAt) return "Never";

    const date = new Date(lastSyncedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2 transition-colors">
        Cloud Synchronization
      </h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 transition-colors">
        Keep your data synchronized across all your devices and ensure no data
        loss.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Connection Status */}
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 dark:text-slate-300 transition-colors">Connection Status</h3>
            <div
              className={`w-3 h-3 rounded-full transition-colors ${isOnline ? "bg-green-500 dark:bg-green-400" : "bg-red-500 dark:bg-red-400"}`}
            ></div>
          </div>
          <p
            className={`text-2xl font-bold transition-colors ${isOnline ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-2 transition-colors">
            {isOnline
              ? "Your device is connected to the internet and can sync."
              : "Your device is currently offline. Changes will sync when you reconnect."}
          </p>
        </div>

        {/* Last Synced */}
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 transition-colors">
          <h3 className="font-bold text-gray-700 dark:text-slate-300 mb-4 transition-colors">Last Synchronized</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors">
            {formatLastSynced()}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-2 transition-colors">
            {lastSyncedAt
              ? new Date(lastSyncedAt).toLocaleString()
              : "No synchronization yet"}
          </p>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl transition-colors">
        <div className="flex items-center gap-3">
          {isSyncing ? (
            <>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <p className="text-sm font-bold text-blue-900 dark:text-blue-300">Syncing data...</p>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm font-bold text-green-900 dark:text-green-300">
                All data synchronized
              </p>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={triggerSync}
          disabled={isSyncing || !isOnline}
          className="px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <svg
            className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isSyncing ? "Synchronizing..." : "Sync Now"}
        </button>

        <button
          disabled={isSyncing}
          className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={() => {
            if (
              window.confirm(
                "Clear all cached data? This will reload the page.",
              )
            ) {
              localStorage.clear();
              location.reload();
            }
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear Cache
        </button>
      </div>

      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl transition-colors">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-300 font-bold">Sync Information</p>
            <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 transition-colors">
              Your data syncs automatically when changes are made and you're
              online. Clearing the cache will remove all local data. Use only if
              you're experiencing sync issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSyncStatus;
