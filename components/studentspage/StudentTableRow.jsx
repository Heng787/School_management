import React from "react";
import { StudentStatus, UserRole } from "../../types";

/**
 * COMPONENT: StudentTableRow
 * DESCRIPTION: Individual student table row with avatar, dynamic gender badge, and action buttons.
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
  // Avatar colour derived from name
  const avatarPalette = [
    ["bg-blue-100 dark:bg-blue-900/40",   "text-blue-700 dark:text-blue-300"],
    ["bg-indigo-100 dark:bg-indigo-900/40","text-indigo-700 dark:text-indigo-300"],
    ["bg-emerald-100 dark:bg-emerald-900/40","text-emerald-700 dark:text-emerald-300"],
    ["bg-orange-100 dark:bg-orange-900/40","text-orange-700 dark:text-orange-300"],
    ["bg-pink-100 dark:bg-pink-900/40",   "text-pink-700 dark:text-pink-300"],
    ["bg-violet-100 dark:bg-violet-900/40","text-violet-700 dark:text-violet-300"],
  ];
  const [avatarBg, avatarText] = avatarPalette[(student.name || "A").charCodeAt(0) % avatarPalette.length];

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case StudentStatus.Active:
        return {
          cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
          dot: "bg-emerald-500",
        };
      case StudentStatus.Suspended:
        return {
          cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50",
          dot: "bg-amber-500",
        };
      case StudentStatus.Dropout:
        return {
          cls: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
          dot: "bg-slate-400",
        };
      default:
        return {
          cls: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
          dot: "bg-slate-400",
        };
    }
  };

  const statusBadge = getStatusBadge(student.status);

  // Gender display
  const isFemale = (student.sex || "").toLowerCase().startsWith("f");
  const genderColor = isFemale
    ? "text-pink-500 dark:text-pink-400"
    : "text-blue-500 dark:text-blue-400";
  const genderLabel = isFemale ? "Female" : "Male";
  const genderIcon = isFemale ? (
    <svg className={`w-3.5 h-3.5 ${genderColor}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
    </svg>
  ) : (
    <svg className={`w-3.5 h-3.5 ${genderColor}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
    </svg>
  );

  const rowBg = isHighlighted
    ? "bg-primary-50 dark:bg-primary-900/15"
    : isSelected
      ? "bg-primary-50/50 dark:bg-primary-900/10"
      : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40";

  return (
    <tr
      ref={ref}
      className={`transition-colors duration-150 ${rowBg}`}
      style={isHighlighted ? { boxShadow: "inset 3px 0 0 #0ea5e9" } : {}}
    >
      {/* Checkbox */}
      <td className="px-4 py-3.5 text-center">
        <input
          type="checkbox"
          className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4"
          checked={isSelected}
          onChange={() => onSelect(student.id)}
        />
      </td>

      {/* Name + Avatar */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 select-none ${avatarBg} ${avatarText}`}>
            {(student.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
              {student.id?.length > 8 ? `ST-${student.id.slice(-6)}` : student.id}
            </p>
          </div>
        </div>
      </td>

      {/* Gender */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${genderColor}`}>
          {isFemale ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/><line x1="12" y1="12" x2="12" y2="20"/><line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="14" r="4"/><line x1="21" y1="3" x2="15" y2="9"/><polyline points="15 3 21 3 21 9"/>
            </svg>
          )}
          {genderLabel}
        </span>
      </td>

      {/* DOB */}
      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {student.dob
          ? new Date(student.dob).toLocaleDateString()
          : <span className="text-xs text-slate-300 dark:text-slate-700 italic">N/A</span>}
      </td>

      {/* Contact */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        {student.phone ? (
          <a
            href={`tel:${student.phone}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {student.phone}
          </a>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-700 italic">No contact</span>
        )}
      </td>

      {/* Class */}
      <td className="px-5 py-3.5">
        {displayClasses.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 items-center">
            {displayClasses.slice(0, 2).map((c) => (
              <span
                key={c.id}
                title={`Teacher: ${c.teacherId ? staff.find((s) => s.id === c.teacherId)?.name || "No Teacher" : "No Teacher"}`}
                className="inline-flex flex-col px-2.5 py-1 rounded-lg text-[10px] font-bold leading-tight cursor-default
                  bg-blue-50 dark:bg-blue-900/25
                  text-blue-700 dark:text-blue-300
                  border border-blue-100 dark:border-blue-800/50"
              >
                <span>{c.name}</span>
                {c.level && <span className="text-blue-400 dark:text-blue-500 uppercase tracking-wider font-semibold">{c.level}</span>}
              </span>
            ))}
            {displayClasses.length > 2 && (
              <details className="group cursor-pointer relative z-40">
                <summary className="text-[10px] font-bold text-slate-500 dark:text-slate-400 outline-none select-none
                  flex items-center gap-1 px-2 py-1 rounded-lg
                  bg-slate-100 dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  +{displayClasses.length - 2}
                  <svg className="w-3 h-3 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2.5 min-w-[150px] z-50">
                  {displayClasses.slice(2).map((sc) => (
                    <div key={sc.id} className="flex flex-col pl-2 border-l-2 border-primary-300 dark:border-primary-700">
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">{sc.name}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{sc.level}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-600 italic">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Not enrolled
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusBadge.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
          {student.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {(isAdmin || isOffice) && (
            <>
              <ActionBtn
                onClick={() => onEdit(student)}
                title="Edit Student"
                color="blue"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </ActionBtn>
              {isAdmin && (
                <ActionBtn
                  onClick={() => onDelete(student)}
                  title="Delete Student"
                  color="red"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </ActionBtn>
              )}
            </>
          )}

          {/* Report Card — styled pill */}
          <button
            type="button"
            onClick={() => onReportCard(student)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all
              text-emerald-700 dark:text-emerald-400
              bg-emerald-50 dark:bg-emerald-900/20
              border border-emerald-200 dark:border-emerald-800/50
              hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Report Card
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Helper ─────────────────────────────────────────────────────────────────────
const actionColors = {
  blue: "text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  red:  "text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
};

const ActionBtn = ({ onClick, title, color, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-1.5 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${actionColors[color] || actionColors.blue}`}
  >
    {children}
  </button>
);

export default StudentTableRow;
