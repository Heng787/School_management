import React from "react";
import { StaffRole } from "../../types";

/**
 * COMPONENT: TeacherTableRow
 * DESCRIPTION: Individual staff member table row with actions.
 */
const TeacherTableRow = ({
  staff,
  isHighlighted,
  isOnLeave,
  isAdmin,
  onEdit,
  onDelete,
  onInvite,
  onPermission,
  highlightedRowRef,
}) => {
  // Role badge – uses Tailwind classes for light/dark compatibility
  const getRoleBadge = (role) => {
    switch (role) {
      case StaffRole.Teacher:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50";
      case StaffRole.AssistantTeacher:
        return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50";
      case StaffRole.OfficeWorker:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50";
      case StaffRole.Guard:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50";
      case StaffRole.Cleaner:
        return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50";
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
    // [lightBg, lightText, darkBg, darkText]
    ["bg-blue-100",   "text-blue-700",   "dark:bg-blue-900/30",   "dark:text-blue-300"],
    ["bg-indigo-100", "text-indigo-700", "dark:bg-indigo-900/30", "dark:text-indigo-300"],
    ["bg-emerald-100","text-emerald-700","dark:bg-emerald-900/30","dark:text-emerald-300"],
    ["bg-orange-100", "text-orange-700", "dark:bg-orange-900/30", "dark:text-orange-300"],
    ["bg-pink-100",   "text-pink-700",   "dark:bg-pink-900/30",   "dark:text-pink-300"],
    ["bg-cyan-100",   "text-cyan-700",   "dark:bg-cyan-900/30",   "dark:text-cyan-300"],
  ];
  const [lb, lt, db, dt] = avatarVariants[staff.name.charCodeAt(0) % avatarVariants.length];

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
    : "hover:bg-slate-50 dark:hover:bg-slate-800/40";

  return (
    <tr
      ref={highlightedRowRef}
      className={`transition-colors duration-150 ${rowHighlight}`}
      style={isHighlighted ? { boxShadow: "inset 3px 0 0 #0ea5e9" } : {}}
    >
      {/* Name */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 select-none ${lb} ${lt} ${db} ${dt}`}>
            {staff.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {staff.name}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnLeave ? "bg-amber-400" : "bg-emerald-500"}`}
                title={isOnLeave ? "On Leave" : "Active"}
              />
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-600 font-mono mt-0.5">
              {staff.id.length > 8 ? `CS-${staff.id.slice(-6)}` : staff.id}
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleBadge(staff.role)}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getRoleDot(staff.role)}`} />
          {staff.role}
        </span>
      </td>

      {/* DOB */}
      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {staff.dob
          ? new Date(staff.dob).toLocaleDateString()
          : <span className="text-slate-300 dark:text-slate-700 italic text-xs">N/A</span>
        }
      </td>

      {/* Contact */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex flex-col gap-1">{renderContact()}</div>
      </td>

      {/* Joined */}
      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {new Date(staff.hireDate || staff.joinedDate || new Date()).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <ActionBtn onClick={() => onEdit(staff)} title="Edit" color="blue">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </ActionBtn>

          {isAdmin && (
            <ActionBtn onClick={() => onDelete(staff)} title="Delete" color="red">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </ActionBtn>
          )}

          <ActionBtn onClick={() => onInvite(staff)} title="Invite User" color="indigo">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </ActionBtn>

          <ActionBtn onClick={() => onPermission(staff)} title="Permissions" color="amber">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </ActionBtn>
        </div>
      </td>
    </tr>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const actionColors = {
  blue:   "text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  red:    "text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
  indigo: "text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
  amber:  "text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
};

const ActionBtn = ({ onClick, title, color, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg transition-all duration-150 ${actionColors[color] || actionColors.blue}`}
  >
    {children}
  </button>
);

const ContactLine = ({ icon, value, empty }) => {
  if (empty) {
    return <span className="text-xs text-slate-300 dark:text-slate-700 italic">No contact</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      {icon === "email" ? (
        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )}
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{value}</span>
    </div>
  );
};

export default TeacherTableRow;
