import React from "react";
import {
  EditClassButton,
  DeleteClassButton,
  EditClassButtonMobile,
  DeleteClassButtonMobile,
} from ".";

const ClassRow = ({
  cls,
  isHighlighted,
  isSelected,
  isExpanded,
  isAdmin,
  isOffice,
  teacherName,
  studentCount,
  capacity,
  percentage,
  enrolledStudentsInClass,
  highlightedRowRef,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleSelect,
}) => {
  return (
    <div
      key={cls.id}
      ref={isHighlighted ? highlightedRowRef : null}
      className={`group transition-all duration-300 border-b border-slate-200/60 dark:border-slate-800/60 last:border-0 ${
        isSelected
          ? "bg-emerald-50/80 dark:bg-emerald-900/20"
          : isHighlighted
            ? "bg-yellow-50 dark:bg-yellow-900/20"
            : isExpanded
              ? "bg-slate-50/90 dark:bg-slate-800/60 shadow-inner"
              : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 hover:shadow-sm"
      }`}
    >
      <div
        role="button"
        tabIndex="0"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} details for ${cls.name}`}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 dark:focus:ring-emerald-400 rounded-2xl"
        onClick={() => onToggleExpand(isExpanded ? null : cls.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand(isExpanded ? null : cls.id);
          }
        }}
      >
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {(isAdmin || isOffice) && (
            <div className="flex items-center h-full">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect(cls.id);
                }}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${cls.name}`}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 rounded-xl shrink-0 hidden sm:block border border-indigo-100 dark:border-indigo-800 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="min-w-[140px] max-w-[200px]">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {cls.name}
                </p>
                <span className="sm:hidden inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  {cls.level}
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-600 font-medium dark:text-slate-400">
                <svg
                  className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="truncate">{teacherName}</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 pl-4 border-l border-slate-300 dark:border-slate-800">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black tracking-widest bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700 shadow-sm shrink-0 uppercase">
              {cls.level}
            </span>

            <div className="w-48 shrink-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-semibold tracking-wide flex items-center pr-2">
                  Enrollment
                </span>
                <span
                  className={`font-bold ${percentage >= 100 ? "text-red-600 dark:text-red-400" : percentage > 80 ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"}`}
                >
                  {studentCount}{" "}
                  <span
                    className={`${percentage >= 100 ? "text-red-500" : "text-slate-600 dark:text-slate-400"} font-bold ml-0.5`}
                  >
                    / {capacity}
                  </span>
                </span>
              </div>
              <div 
                role="progressbar"
                aria-valuenow={studentCount}
                aria-valuemin="0"
                aria-valuemax={capacity}
                aria-label={`Enrollment for ${cls.name}: ${studentCount} out of ${capacity}`}
                className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner flex"
              >
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                    percentage >= 100
                      ? "bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                      : percentage > 80
                        ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        {(isAdmin || isOffice) && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`hidden sm:flex items-center justify-end gap-1 w-auto pl-4 transition-opacity relative z-20 opacity-0 group-hover:opacity-100`}
          >
            <EditClassButton onEdit={(e) => onEdit(e, cls)} />
            {isAdmin && (
              <DeleteClassButton onDelete={(e) => onDelete(e, cls)} />
            )}
          </div>
        )}

        {/* Mobile Actions */}
        {(isAdmin || isOffice) && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="sm:hidden flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-300 dark:border-slate-800"
          >
            <EditClassButtonMobile onEdit={(e) => onEdit(e, cls)} />
            {isAdmin && (
              <DeleteClassButtonMobile onDelete={(e) => onDelete(e, cls)} />
            )}
          </div>
        )}
      </div>

      {/* Expansion Panel */}
      {isExpanded && (
        <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800/60 p-5 animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner">
          <h4 className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></div>
            Enrolled Students ({studentCount})
          </h4>
          {enrolledStudentsInClass.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {enrolledStudentsInClass.map((student) => (
                <div
                  key={student.id}
                  className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex flex-col truncate pr-3">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {student.name}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium dark:text-slate-400 font-mono mt-0.5">
                      ID:{" "}
                      {student.id.startsWith("stu_")
                        ? student.id.split("_").pop().substring(0, 6)
                        : student.id}
                    </span>
                  </div>
                  {student.status === "Active" ? (
                    <>
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                        aria-hidden="true"
                      ></span>
                      <span className="sr-only">Active</span>
                    </>
                  ) : (
                    <>
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"
                        aria-hidden="true"
                      ></span>
                      <span className="sr-only">Inactive</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <svg
                className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-sm text-slate-500 font-medium">
                No students enrolled yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassRow;
