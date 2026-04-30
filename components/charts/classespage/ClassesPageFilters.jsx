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
    "block w-full pl-3 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 font-semibold dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm cursor-pointer";

  return (
    <div className="relative z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 space-y-4 transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/50 pb-3">
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
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
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
        <div className="relative">
          <label htmlFor="level-filter" className="sr-only">Filter by Academic Level</label>
          <select
            id="level-filter"
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
        </div>

        {(isAdmin || isOffice) && (
          <div className="relative w-full" ref={teacherDropdownRef}>
            <button
              id="teacher-filter-button"
              onClick={() => onTeacherDropdownToggle(!isTeacherDropdownOpen)}
              aria-haspopup="dialog"
              aria-expanded={isTeacherDropdownOpen}
              aria-label="Filter by Teachers"
              className={`${selectClasses} h-11 text-left flex justify-between items-center ${
                isTeacherDropdownOpen ? "ring-2 ring-emerald-500/50 border-emerald-500 bg-white dark:bg-slate-900" : "bg-white dark:bg-slate-900"
              }`}
            >
              <span className="truncate pr-2">
                {selectedTeacherIds.length === 0
                  ? "All Teachers"
                  : `${selectedTeacherIds.length} teachers selected`}
              </span>
              <svg
                className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200 ${
                  isTeacherDropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isTeacherDropdownOpen && (
              <div 
                role="dialog"
                aria-label="Teacher selection"
                className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top"
              >
                <ul className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                  {availableTeachers.map((teacher) => (
                    <li key={teacher.id}>
                      <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="peer appearance-none h-4 w-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 checked:bg-emerald-500 checked:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all cursor-pointer"
                            checked={selectedTeacherIds.includes(teacher.id)}
                            onChange={() => onTeacherSelect(teacher.id)}
                            aria-label={`Select ${teacher.name}`}
                          />
                          <svg
                            className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                          {teacher.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <label htmlFor="time-filter" className="sr-only">Filter by Session Time</label>
          <select
            id="time-filter"
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
    </div>
  );
};

export default ClassesPageFilters;
