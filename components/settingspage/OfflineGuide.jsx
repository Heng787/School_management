import React from "react";

const OfflineGuide = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Offline Portal Guide</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">This system operates as a Progressive Web App (PWA). Once initialized, it lives directly on your device.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black shrink-0 shadow-sm">1</div>
            <div>
              <p className="font-black text-slate-800 dark:text-slate-200">System Installation</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">On desktop browsers (Chrome/Edge), click the <strong className="text-slate-700 dark:text-slate-300">Install Icon (+)</strong> in the address bar. On mobile, tap <strong className="text-slate-700 dark:text-slate-300">Add to Home Screen</strong>.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black shrink-0 shadow-sm">2</div>
            <div>
              <p className="font-black text-slate-800 dark:text-slate-200">Offline Access</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Once installed, launch the application directly from your desktop or app drawer. It will function fully even with <strong className="text-rose-500 dark:text-rose-400">no internet connection</strong>.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-black rounded-3xl p-8 text-white relative overflow-hidden border-2 border-slate-800 dark:border-slate-800/50 shadow-xl">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              Deployment Tip
            </p>
            <p className="text-sm leading-relaxed text-slate-300 font-medium">
              If deploying to other staff members, ensure they access the portal <span className="text-white font-black border-b-2 border-primary-500 pb-0.5">once while connected</span>. The application core will automatically cache, enabling perpetual offline usage on that specific hardware.
            </p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </span>
          System Architecture Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[9px] uppercase font-black tracking-widest text-slate-500">Service Worker</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">Cached & Ready</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[9px] uppercase font-black tracking-widest text-slate-500">Data Persistence</p>
            <p className="text-sm font-black text-primary-600 dark:text-primary-400 mt-1">Local + Cloud Sync</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[9px] uppercase font-black tracking-widest text-slate-500">Deployment Version</p>
            <p className="text-sm font-black text-slate-700 dark:text-slate-300 mt-1">v7.1.0 (Production)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineGuide;
