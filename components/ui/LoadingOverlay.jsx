import React from "react";

const LoadingOverlay = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 min-w-[200px] animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
