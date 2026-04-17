import React from "react";
import { ADMIN_KEY } from "../../services/messageService";

/**
 * COMPONENT: ChatHeader
 * DESCRIPTION: Top header of the chat area showing contact info and quick actions
 */
const ChatHeader = ({
  isMultiRecipient,
  activeConversation,
  isAdmin,
  activeStaff,
  filteredStaffConversations,
  currentUser,
  setMobileShowChat,
  setModal,
  staff,
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm relative z-50 transition-colors">
      {/* Back button (mobile only) */}
      {isMultiRecipient && (
        <button
          onClick={() => setMobileShowChat(false)}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors mr-1 shrink-0"
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
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Contact avatar */}
      {activeConversation === "all" ? (
        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 transition-colors">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6"
            />
          </svg>
        </div>
      ) : isAdmin && activeStaff ? (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {activeStaff.name.charAt(0).toUpperCase()}
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          A
        </div>
      )}

      {/* Contact name */}
      <div className="flex-1 min-w-0 transition-colors">
        <p className="font-bold text-slate-800 dark:text-white text-sm leading-tight transition-colors">
          {activeConversation === "all"
            ? "All Staff Announcement"
            : (isAdmin || currentUser?.role) &&
                filteredStaffConversations.find(
                  (c) => c.id === activeConversation,
                )?.name
              ? filteredStaffConversations.find(
                  (c) => c.id === activeConversation,
                ).name
              : "Administrator"}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight transition-colors">
          {activeConversation === "all"
            ? `${staff.length} staff members`
            : (isAdmin || currentUser?.role) &&
                filteredStaffConversations.find(
                  (c) => c.id === activeConversation,
                )?.role
              ? filteredStaffConversations.find(
                  (c) => c.id === activeConversation,
                ).role
              : "● School Admin"}
        </p>
      </div>

      {/* Staff quick-action buttons — compact pills in header */}
      {!isAdmin && activeConversation === ADMIN_KEY && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModal("leave")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            title="Request Leave"
          >
            <span>📅</span>
            <span className="hidden sm:inline">Leave</span>
          </button>
          <button
            onClick={() => setModal("incident")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            title="File Incident Report"
          >
            <span>⚠️</span>
            <span className="hidden sm:inline">Incident</span>
          </button>
        </div>
      )}

      {/* Admin: announcement mode badge */}
      {isAdmin && activeConversation === "all" && (
        <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors">
          BROADCAST
        </span>
      )}
    </div>
  );
};

export default ChatHeader;
