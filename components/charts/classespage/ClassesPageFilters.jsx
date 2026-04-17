import React from "react";
import { SelectAllCheckbox } from ".";

const ClassesPageFilters = ({
  isAdmin,
  isOffice,
  filteredClasses,
  selectedClassIds,
  onSelectAll,
  selectedLevel,
  onLevelChange,
  levels,
  selectedTeacherIds,
  availableTeachers,
  isTeacherDropdownOpen,
  onTeacherDropdownToggle,
  teacherDropdownRef,
  onTeacherSelect,
  selectedTime,
  onTimeChange,
  allSessionLabels,
}) => {
  const selectClasses =
    "block w-full pl-3 pr-10 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-800 pb-3">
        {isAdmin || isOffice ? (
          <SelectAllCheckbox
            checked={
              filteredClasses.length > 0 &&
              selectedClassIds.size === filteredClasses.length
            }
            onChange={onSelectAll}
          />
        ) : (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              My Schedule
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Showing:
          </span>
          <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-2.5 py-1 rounded-full">
            {filteredClasses.length} Classes
          </span>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 ${isAdmin || isOffice ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}
      >
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className={`${selectClasses} h-11`}
        >
          <option value="all">All Levels</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        {(isAdmin || isOffice) && (
          <div className="relative w-full" ref={teacherDropdownRef}>
            <button
              onClick={() => onTeacherDropdownToggle(!isTeacherDropdownOpen)}
              className={`${selectClasses} h-11 text-left flex justify-between items-center bg-white dark:bg-slate-900`}
            >
              <span className="truncate pr-2">
                {selectedTeacherIds.length === 0
                  ? "All Teachers"
                  : `${selectedTeacherIds.length} teachers selected`}
              </span>
              <svg
                className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200"
                style={{
                  transform: isTeacherDropdownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isTeacherDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                <div className="max-h-60 overflow-auto">
                  {availableTeachers.map((teacher) => (
                    <li key={teacher.id}>
                      <label className="flex items-center gap-3 p-2.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedTeacherIds.includes(teacher.id)}
                          onChange={() => onTeacherSelect(teacher.id)}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {teacher.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <select
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
          className={selectClasses}
        >
          <option value="all">All Times</option>
          {allSessionLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ClassesPageFilters;
