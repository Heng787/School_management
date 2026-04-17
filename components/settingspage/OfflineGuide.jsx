import React from "react";

/**
 * COMPONENT: OfflineGuide
 * DESCRIPTION: Displays instructions for PWA installation and offline usage.
 */
const OfflineGuide = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300 transition-colors">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">
          How to Use Offline
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
          This portal is a Progressive Web App (PWA). Once visited, it lives on
          your device.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold shrink-0 transition-colors">
              1
            </div>
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300 transition-colors">Install the App</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 transition-colors">
                On Chrome or Edge (Desktop), click the{" "}
                <strong>Install Icon (+)</strong> in the address bar. On Mobile,
                use <strong>"Add to Home Screen"</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold shrink-0 transition-colors">
              2
            </div>
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300 transition-colors">Open from Desktop</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 transition-colors">
                Once installed, an icon appears on your Desktop or Apps folder.
                Open this icon even when you have <strong>no internet</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-black rounded-xl p-6 text-white relative overflow-hidden transition-colors border border-slate-800 dark:border-slate-800/50">
          <div className="relative z-10">
            <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">
              Pro Tip
            </p>
            <p className="text-sm leading-relaxed text-slate-300 font-medium">
              If you share the link with someone else, tell them to visit the
              site{" "}
              <span className="text-white font-bold underline decoration-primary-500 underline-offset-2">
                once while online
              </span>
              . After that, they can use it offline forever on that device.
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-4 flex items-center transition-colors">
          <svg
            className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          System Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600">
              Offline Shell
            </p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              Cached & Ready
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600">
              Data Storage
            </p>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              Local + Sync
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-600">
              Sync Version
            </p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              v7.0.0 (Production)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineGuide;
