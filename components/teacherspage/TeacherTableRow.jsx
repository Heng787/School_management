import React from "react";
import { StaffRole } from "../../types";

/**
 * COMPONENT: TeacherTableRow
 * DESCRIPTION: Individual staff member table row with actions dropdown.
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
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case StaffRole.Teacher:
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300";
      case StaffRole.AssistantTeacher:
        return "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300";
      case StaffRole.OfficeWorker:
        return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
  };

  const renderContact = () => {
    if ((staff.contact || "").includes("|")) {
      const [phone, email] = staff.contact.split("|").map((s) => s.trim());
      return (
        <>
          <div className="flex items-center gap-1.5" title="Phone">
            <svg
              className="w-3.5 h-3.5 text-slate-400 shrink-0"
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
            <span className="text-xs font-medium">{phone}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Email">
            <svg
              className="w-3.5 h-3.5 text-slate-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium">{email}</span>
          </div>
        </>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        {(staff.contact || "").includes("@") ? (
          <svg
            className="w-4 h-4 text-slate-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-slate-400 shrink-0"
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
        )}
        <span>{staff.contact || "No contact"}</span>
      </div>
    );
  };

  return (
    <tr
      ref={isHighlighted ? highlightedRowRef : null}
      className={`transition-all duration-300 ${isHighlighted ? "bg-primary-50 dark:bg-primary-900/20 ring-2 ring-inset ring-primary-200 dark:ring-primary-900/40" : "hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs shadow-sm">
            {staff.name.charAt(0)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {staff.name}
              <span
                className={`w-2 h-2 rounded-full ${isOnLeave ? "bg-amber-400" : "bg-emerald-500"}`}
                title={isOnLeave ? "On Leave" : "Active"}
              />
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              {staff.id.length > 8 ? `CS-${staff.id.slice(-6)}` : staff.id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(staff.role)}`}
        >
          {staff.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">
        <div className="flex flex-col gap-1">{renderContact()}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
        {new Date(
          staff.hireDate || staff.joinedDate || new Date(),
        ).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => onEdit(staff)}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg border border-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            title="Edit Staff"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(staff)}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg border border-transparent hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Delete Staff"
            >
              <svg
                className="w-4 h-4"
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

          <details className="relative z-10 group">
            <summary className="cursor-pointer list-none ml-1">
              <div className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-all">
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </div>
            </summary>
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl overflow-hidden py-1 z-[100] origin-bottom-right ring-1 ring-slate-900/5 dark:ring-white/5">
              <button
                onClick={() => onInvite(staff)}
                className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/20 transition-all"
              >
                <div className="bg-indigo-100/50 dark:bg-indigo-900/40 p-1.5 rounded-md text-indigo-500 dark:text-indigo-400 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                Invite User
              </button>
              <div className="h-px bg-slate-100/80 dark:bg-slate-700/80 mx-3 my-0.5"></div>
              <button
                onClick={() => onPermission(staff)}
                className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-900/20 transition-all"
              >
                <div className="bg-amber-100/50 dark:bg-amber-900/40 p-1.5 rounded-md text-amber-500 dark:text-amber-400 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                Permissions
              </button>
            </div>
          </details>
        </div>
      </td>
    </tr>
  );
};

export default TeacherTableRow;
