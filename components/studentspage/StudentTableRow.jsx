import React from "react";
import { StudentStatus, UserRole } from "../../types";

/**
 * COMPONENT: StudentTableRow
 * DESCRIPTION: Individual student table row with display and action buttons.
 */
const StudentTableRow = ({
  student,
  isHighlighted,
  isSelected,
  isDeleting,
  displayClasses,
  staff,
  isAdmin,
  isOffice,
  onSelect,
  onEdit,
  onDelete,
  onReportCard,
  ref,
}) => {
  /**
   * Returns Tailwind classes for student status badges based on their status.
   */
  const getStatusStyle = (status) => {
    switch (status) {
      case StudentStatus.Active:
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800";
      case StudentStatus.Suspended:
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800";
      case StudentStatus.Dropout:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      default:
        return "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <tr
      ref={ref}
      className={`transition-all duration-300 ${isHighlighted ? "bg-primary-50 dark:bg-primary-900/20 ring-2 ring-inset ring-primary-200 dark:ring-primary-900/40" : isSelected ? "bg-primary-50/40 dark:bg-primary-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
    >
      <td className="px-4 py-4 text-center">
        <input
          type="checkbox"
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4"
          checked={isSelected}
          onChange={() => onSelect(student.id)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 dark:text-slate-200">
        {student.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {student.sex}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {student.phone ? (
          <a
            href={`tel:${student.phone}`}
            className="flex items-center gap-1.5 text-primary-600 hover:text-primary-800 font-medium transition-colors"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {student.phone}
          </a>
        ) : (
          <span className="text-slate-300 dark:text-slate-600 italic">No contact</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        {displayClasses.length > 0 ? (
          <div className="flex flex-wrap gap-2 items-center">
            {displayClasses.slice(0, 3).map((c) => {
              const teacherName = c.teacherId
                ? staff.find((s) => s.id === c.teacherId)?.name || "No Teacher"
                : "No Teacher";
              return (
                <div
                  key={c.id}
                  className="flex flex-col bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/60 dark:border-blue-800 rounded-md px-2.5 py-1.5 shadow-sm hover:shadow transition-all"
                  title={`Teacher: ${teacherName}`}
                >
                  <span className="font-bold text-blue-900 dark:text-blue-200 text-xs leading-none mb-1">
                    {c.name}
                  </span>
                  <span className="text-[9px] text-blue-600/70 dark:text-blue-400 font-bold uppercase tracking-wider leading-none">
                    {c.level}
                  </span>
                </div>
              );
            })}
            {displayClasses.length > 3 && (
              <details className="mt-1 group cursor-pointer relative z-40">
                <summary className="text-[10px] font-bold text-slate-500 dark:text-slate-400 outline-none select-none flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 w-fit bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md transition-colors shadow-sm">
                  <span>+{displayClasses.length - 3} More</span>
                  <svg
                    className="w-3 h-3 group-open:rotate-180 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 flex flex-col gap-3 min-w-[140px] z-50">
                  {displayClasses.slice(3).map((studentClass) => (
                    <div
                      key={studentClass.id}
                      className="flex flex-col pl-2 border-l-2 border-primary-300 dark:border-primary-700"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                        {studentClass.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        <span>{studentClass.level}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="truncate max-w-[80px]">
                          {studentClass.teacherId
                            ? staff.find((s) => s.id === studentClass.teacherId)
                                ?.name || "No Teacher"
                            : "No Teacher"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 opacity-90">
            <span className="font-bold text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Not Enrolled
            </span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2.5 py-1 text-[10px] leading-tight font-bold rounded-full border ${getStatusStyle(student.status)}`}
        >
          {student.status.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
        <div className="flex items-center justify-end gap-3">
          {(isAdmin || isOffice) && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(student)}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                title="Edit Student"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onDelete(student)}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800 disabled:opacity-50"
                  title="Delete Student"
                  disabled={isDeleting}
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => onReportCard(student)}
            className="px-3 py-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-all text-sm font-bold"
          >
            Report Card
          </button>
        </div>
      </td>
    </tr>
  );
};

export default StudentTableRow;
