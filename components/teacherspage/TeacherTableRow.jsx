import React, { useState } from "react";
import { StaffRole, UserRole } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Clock, ChevronRight, GraduationCap } from "lucide-react";

/**
 * COMPONENT: TeacherTableRow
 * DESCRIPTION: Individual staff member table row with actions and expandable class info.
 */
const TeacherTableRow = ({
  staff,
  isHighlighted,
  isOnLeave,
  isAdmin,
  isRestricted,
  onEdit,
  onDelete,
  onInvite,
  onPermission,
  highlightedRowRef,
  classes = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Role badge – uses Tailwind classes for light/dark compatibility
  const getRoleBadge = (role) => {
    switch (role) {
      case StaffRole.Teacher:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50";
      case StaffRole.AssistantTeacher:
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50";
      case StaffRole.OfficeWorker:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50";
      case StaffRole.Guard:
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50";
      case StaffRole.Cleaner:
        return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    }
  };

  // Dot accent per role
  const getRoleDot = (role) => {
    switch (role) {
      case StaffRole.Teacher:        return "bg-blue-500";
      case StaffRole.AssistantTeacher: return "bg-indigo-500";
      case StaffRole.OfficeWorker:   return "bg-orange-500";
      case StaffRole.Guard:          return "bg-yellow-500";
      case StaffRole.Cleaner:        return "bg-cyan-500";
      default:                        return "bg-slate-400";
    }
  };

  // Avatar colour – darker in light mode, lighter in dark mode
  const avatarVariants = [
    ["bg-blue-100",   "text-blue-700",   "dark:bg-blue-900/30",   "dark:text-blue-300"],
    ["bg-indigo-100", "text-indigo-700", "dark:bg-indigo-900/30", "dark:text-indigo-300"],
    ["bg-emerald-100","text-emerald-700","dark:bg-emerald-900/30","dark:text-emerald-300"],
    ["bg-orange-100", "text-orange-700", "dark:bg-orange-900/30", "dark:text-orange-300"],
    ["bg-pink-100",   "text-pink-700",   "dark:bg-pink-900/30",   "dark:text-pink-300"],
    ["bg-cyan-100",   "text-cyan-700",   "dark:bg-cyan-900/30",   "dark:text-cyan-300"],
  ];
  const [lb, lt, db, dt] = avatarVariants[staff.name.charCodeAt(0) % avatarVariants.length];

  const assignedClasses = classes.filter(c => c.teacherId === staff.id && !c.isArchived);

  const renderContact = () => {
    if ((staff.contact || "").includes("|")) {
      const [phone, email] = staff.contact.split("|").map((s) => s.trim());
      return (
        <>
          <ContactLine icon="phone" value={phone} />
          <ContactLine icon="email" value={email} />
        </>
      );
    }
    const icon = (staff.contact || "").includes("@") ? "email" : "phone";
    return <ContactLine icon={icon} value={staff.contact || ""} empty={!staff.contact} />;
  };

  const rowHighlight = isHighlighted
    ? "bg-primary-50 dark:bg-primary-900/15"
    : isExpanded
      ? "bg-slate-50 dark:bg-slate-800/60"
      : "hover:bg-slate-50 dark:hover:bg-slate-800/40";

  return (
    <React.Fragment>
      <tr
        ref={highlightedRowRef}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`transition-all duration-300 cursor-pointer ${rowHighlight} ${isExpanded ? 'shadow-inner' : ''}`}
        style={isHighlighted ? { boxShadow: "inset 3px 0 0 #0ea5e9" } : {}}
      >
        {/* Name */}
        <td className="px-5 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div 
              role="img"
              aria-label={`${staff.name}'s avatar`}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 select-none shadow-sm transition-transform group-hover:scale-105 ${lb} ${lt} ${db} ${dt}`}
            >
              {staff.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold transition-colors ${isExpanded ? 'text-primary-600 dark:text-primary-400' : 'text-slate-800 dark:text-slate-100'}`}>
                  {staff.name}
                </span>
                {isExpanded ? (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"
                  />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnLeave ? "bg-amber-600 dark:bg-amber-400" : "bg-emerald-600 dark:bg-emerald-500"}`}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-600 font-mono mt-0.5">
                {staff.id.length > 8 ? `CS-${staff.id.slice(-6)}` : staff.id}
              </div>
            </div>
          </div>
        </td>

        {/* Role */}
        <td className="px-5 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight ${getRoleBadge(staff.role)}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getRoleDot(staff.role)}`} />
            {staff.role}
          </span>
        </td>

        {/* DOB */}
        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
          {staff.dob
            ? new Date(staff.dob).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : <span className="text-slate-300 dark:text-slate-700 italic text-xs">N/A</span>
          }
        </td>

        {/* Contact */}
        <td className="px-5 py-4 whitespace-nowrap">
          <div className="flex flex-col gap-1.5">{renderContact()}</div>
        </td>

        {/* Joined */}
        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
          {new Date(staff.hireDate || staff.joinedDate || new Date()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>

        {/* Actions */}
        <td className="px-5 py-4 whitespace-nowrap">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <ActionBtn onClick={() => onEdit(staff)} title={`Edit ${staff.name}`} color="blue">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </ActionBtn>

            {isAdmin && (
              <ActionBtn onClick={() => onDelete(staff)} title={`Archive ${staff.name}`} color="amber">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </ActionBtn>
            )}

            <ActionBtn onClick={() => onInvite(staff)} title={`Invite ${staff.name}`} color="indigo">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </ActionBtn>

            <ActionBtn onClick={() => onPermission(staff)} title={isRestricted ? "Permission History" : "Manage Permissions"} color="amber">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </ActionBtn>
          </div>
        </td>
      </tr>

      {/* Expanded Class Info */}
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={6} className="p-0 border-none">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/30"
              >
                <div className="px-5 py-6 flex flex-col gap-5">
                  {/* Section Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200/60 dark:border-slate-700/60 text-primary-600 dark:text-primary-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h4 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Assigned Classes ({assignedClasses.length})
                      </h4>
                    </div>
                  </div>

                  {assignedClasses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assignedClasses.map((cls) => (
                        <div
                          key={cls.id}
                          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {cls.name}
                              </h5>
                              <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-tighter">
                                {cls.level}
                              </span>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="font-medium truncate">{cls.schedule}</span>
                            </div>
                            {cls.time && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-medium">{cls.time}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Class ID: {cls.id.split('_').pop().substring(0, 6)}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-500 transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700/50">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No classes assigned to this teacher yet.</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Assign them to a class in the Classes management page.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const actionColors = {
  blue:   "text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  red:    "text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
  indigo: "text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
  amber:  "text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
};

const ActionBtn = ({ onClick, title, ariaLabel, color, children }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(e); }}
    title={title}
    aria-label={ariaLabel || title}
    className={`p-1.5 rounded-lg transition-all duration-150 ${actionColors[color] || actionColors.blue}`}
  >
    {children}
  </button>
);

const ContactLine = ({ icon, value, empty }) => {
  if (empty) {
    return (
      <span className="text-xs text-slate-300 dark:text-slate-700 italic">
        <span className="sr-only">No contact info available</span>
        No contact
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {icon === "email" ? (
        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )}
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
        <span className="sr-only">{icon === "email" ? "Email:" : "Phone:"}</span>
        {value}
      </span>
    </div>
  );
};

export default TeacherTableRow;
