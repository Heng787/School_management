import React, { useState } from "react";
import { StudentStatus, UserRole } from "../../types";
import { motion, AnimatePresence } from "framer-motion";

/**
 * COMPONENT: StudentTableRow
 * DESCRIPTION: Individual student table row with avatar, dynamic gender badge, and action buttons.
 */
const StudentTableRow = ({
  student,
  index = 0,
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
  const [showEnrollDate, setShowEnrollDate] = useState(false);

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
          cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
          dot: "bg-emerald-500",
        };
      case StudentStatus.Suspended:
        return {
          cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50",
          dot: "bg-amber-500",
        };
      case StudentStatus.Dropout:
        return {
          cls: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
          dot: "bg-slate-500",
        };
      default:
        return {
          cls: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
          dot: "bg-slate-500",
        };
    }
  };

  const statusBadge = getStatusBadge(student.status);

  // Gender display logic
  const studentSex = (student.sex || student.gender || "").trim().toLowerCase();
  const isGirl = ["female", "f", "girl"].includes(studentSex);

  const genderConfig = isGirl
    ? {
        label: "Female",
        cls: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-800/50",
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="8" r="4"/><line x1="12" y1="12" x2="12" y2="20"/><line x1="9" y1="17" x2="15" y2="17"/>
          </svg>
        )
      }
    : {
        label: "Male",
        cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50",
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <circle cx="10" cy="14" r="4"/><line x1="21" y1="3" x2="15" y2="9"/><polyline points="15 3 21 3 21 9"/>
          </svg>
        )
      };

  const rowBg = isHighlighted
    ? "bg-primary-50 dark:bg-primary-900/15"
    : isSelected
      ? "bg-primary-50/50 dark:bg-primary-900/10"
      : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40";

  return (
    <>
      <tr
        ref={ref}
        onClick={() => setShowEnrollDate(!showEnrollDate)}
        className={`transition-all duration-300 row-entrance cursor-pointer group/row border-b border-slate-100 dark:border-slate-800/50 ${rowBg} ${showEnrollDate ? 'bg-primary-50/40 dark:bg-primary-900/20 shadow-sm' : ''}`}
        style={{
          ...(isHighlighted ? { boxShadow: "inset 4px 0 0 #0ea5e9" } : {}),
          animationDelay: `${index * 0.03}s`
        }}
      >
      {/* Checkbox */}
      <td className="px-4 py-3.5 text-center">
        <input
          type="checkbox"
          aria-label={`Select student ${student.name}`}
          className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4 transition-transform active:scale-90"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(student.id);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* Name + Avatar */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-4">
          <div 
            role="img"
            aria-label={`Avatar for ${student.name}`}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm select-none transition-transform group-hover/row:scale-110 ${avatarBg} ${avatarText}`}
          >
            {(student.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 select-none">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover/row:text-primary-600 transition-colors">
              {student.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 tracking-wider">
                {student.id?.length > 8 ? `ST-${student.id.slice(-6).toUpperCase()}` : student.id}
              </p>
              <AnimatePresence>
                {showEnrollDate && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" 
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </td>

      {/* Gender */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${genderConfig.cls}`}>
          {genderConfig.icon}
          {genderConfig.label}
        </span>
      </td>

      {/* DOB */}
      <td className="px-5 py-3.5 whitespace-nowrap text-sm font-bold text-slate-600 dark:text-slate-400">
        {student.dob
          ? new Date(student.dob).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : <span className="text-xs text-slate-300 dark:text-slate-700 italic">N/A</span>}
      </td>

      {/* Contact */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        {student.phone ? (
          <a
            href={`tel:${student.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
          <div className="flex flex-wrap gap-2 items-center">
            {displayClasses.slice(0, 2).map((c) => (
              <span
                key={c.id}
                title={`Teacher: ${c.teacherId ? staff.find((s) => s.id === c.teacherId)?.name || "No Teacher" : "No Teacher"}`}
                className="inline-flex flex-col px-3 py-1.5 rounded-xl text-[10px] font-black leading-tight cursor-default bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-primary-300"
              >
                <span className="text-slate-800 dark:text-slate-200">{c.name}</span>
                {c.level && <span className="text-primary-500 dark:text-primary-400 uppercase tracking-widest text-[9px] mt-0.5">{c.level}</span>}
              </span>
            ))}
            {displayClasses.length > 2 && (
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 dark:border-slate-700">
                +{displayClasses.length - 2}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-700 italic">Unassigned</span>
        )}
      </td>

      {/* Status */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} aria-hidden="true" />
          {student.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          <div className={`transition-transform duration-300 ${showEnrollDate ? 'rotate-180' : 'rotate-0'} mr-2`}>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </div>
          {(isAdmin || isOffice) && (
            <>
              <ActionBtn
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(student);
                }}
                title="Edit Student"
                ariaLabel={`Edit student ${student.name}`}
                color="blue"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </ActionBtn>
              {isAdmin && (
                <ActionBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(student);
                  }}
                  title="Archive Student"
                  ariaLabel={`Archive student ${student.name}`}
                  color="amber"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  )}
                </ActionBtn>
              )}
            </>
          )}

          {/* Report Card — styled pill */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReportCard(student);
            }}
            aria-label={`View report card for ${student.name}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all
              text-emerald-700 dark:text-emerald-400
              bg-emerald-50 dark:bg-emerald-900/20
              border border-emerald-200 dark:border-emerald-800/50
              hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            REPORTS
          </button>
        </div>
      </td>
    </tr>

      {/* Dropdown Expansion Row */}
      <AnimatePresence>
        {showEnrollDate && (
          <tr className="bg-slate-50/80 dark:bg-slate-900/40 shadow-inner border-b border-slate-200 dark:border-slate-800">
            <td colSpan={8} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="px-20 py-8 flex flex-wrap gap-16 items-center">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.3em]">Institutional Record</p>
                    <div className="flex items-center gap-10">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">System Reference ID</span>
                        <div className="flex items-center gap-3">
                          <code className="text-xs font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            {student.id}
                          </code>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(student.id); }}
                            className="p-1.5 text-slate-400 hover:text-primary-500 transition-colors"
                            title="Copy ID"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Original Enrollment Date</span>
                        <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 font-black">
                          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm">
                            {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString(undefined, { dateStyle: 'full' }) : 'No Date Recorded'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-6">
                     <div className="text-right space-y-2">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Profile Status</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          <span className="text-[10px] font-black uppercase tracking-widest">Verified Student</span>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

// ── Helper ─────────────────────────────────────────────────────────────────────
const actionColors = {
  blue: "text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  amber: "text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
  red:  "text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
};

const ActionBtn = ({ onClick, title, ariaLabel, color, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={ariaLabel || title}
    disabled={disabled}
    className={`p-1.5 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${actionColors[color] || actionColors.blue}`}
  >
    {children}
  </button>
);

export default StudentTableRow;
