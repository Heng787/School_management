import React from "react";

const InfoCard = ({ title, value, subtitle, dotColor }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h3>
      {dotColor && <div className={`w-3 h-3 rounded-full shadow-sm ${dotColor}`} />}
    </div>
    <div>
      <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{value}</p>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-500 mt-1">{subtitle}</p>
    </div>
  </div>
);

const CloudSyncStatus = ({ triggerSync, lastSyncedAt, isSyncing, isOnline }) => {
  const formatLastSynced = () => {
    if (!lastSyncedAt) return "Never";
    const diffMins = Math.floor((new Date() - new Date(lastSyncedAt)) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`;
    return new Date(lastSyncedAt).toLocaleDateString();
  };

  const handleClearCache = () => {
    if (window.confirm("Clear all cached data? This will reload the application.")) {
      localStorage.clear();
      location.reload();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Cloud Engine</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your local data cache and synchronization protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <InfoCard
          title="Network Link"
          value={isOnline ? "Connected" : "Offline"}
          subtitle={isOnline ? "Secure connection active" : "Local mode active"}
          dotColor={isOnline ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"}
        />
        <InfoCard
          title="Last Synchronized"
          value={formatLastSynced()}
          subtitle={lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : "No sync data"}
          dotColor="bg-primary-500 shadow-primary-500/20"
        />
      </div>

      <div className={`mb-8 p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${isSyncing ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/30" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isSyncing ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600" : "bg-white dark:bg-slate-800 text-slate-500"}`}>
          {isSyncing ? (
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          )}
        </div>
        <div>
          <p className={`text-sm font-black ${isSyncing ? "text-primary-900 dark:text-primary-300" : "text-slate-700 dark:text-slate-300"}`}>
            {isSyncing ? "Data Exchange in Progress..." : "Data Synchronized"}
          </p>
          <p className={`text-xs font-bold mt-0.5 ${isSyncing ? "text-primary-600 dark:text-primary-400" : "text-slate-500"}`}>
            {isSyncing ? "Please do not close the application" : "All local changes are backed up"}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={triggerSync}
          disabled={isSyncing || !isOnline}
          className="flex-1 py-4 bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
        >
          {isSyncing ? "Syncing..." : "Force Sync Now"}
        </button>
        <button
          onClick={handleClearCache}
          disabled={isSyncing}
          className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
        >
          Clear Local Cache
        </button>
      </div>

      <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl flex items-start gap-4">
        <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-black text-amber-900 dark:text-amber-300">System Information</p>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-500 mt-1">Data syncs automatically when online. Clearing the cache removes all offline data. Use only for troubleshooting.</p>
        </div>
      </div>
    </div>
  );
};

export default CloudSyncStatus;
