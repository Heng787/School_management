import React from "react";
import { ADMIN_KEY } from "../../services/messageService";

/**
 * COMPONENT: ChatHeader
 * DESCRIPTION: Top header of the chat area showing contact info and quick actions.
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
  const activeName =
    activeConversation === "all"
      ? "All Staff Announcement"
      : filteredStaffConversations.find((c) => c.id === activeConversation)?.name ||
        "Administrator";

  const activeRole =
    activeConversation === "all"
      ? `${staff.length} staff members`
      : filteredStaffConversations.find((c) => c.id === activeConversation)?.role ||
        "School Admin";

  const isAllAnnouncement = activeConversation === "all";

  return (
    <div className="flex items-center gap-3 px-4 py-3
      border-b border-slate-200 dark:border-slate-800
      bg-white dark:bg-slate-900
      shadow-sm relative z-50 transition-colors"
    >
      {/* Back button (mobile) */}
      {isMultiRecipient && (
        <button
          onClick={() => setMobileShowChat(false)}
          className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800
            text-slate-500 dark:text-slate-400 transition-colors mr-0.5 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Avatar */}
      {isAllAnnouncement ? (
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
      ) : isAdmin && activeStaff ? (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
          {activeStaff.name.charAt(0).toUpperCase()}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
          A
        </div>
      )}

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 dark:text-white text-sm leading-tight truncate">
          {activeName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {!isAllAnnouncement && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500 leading-tight truncate">
            {activeRole}
          </p>
        </div>
      </div>

      {/* Staff quick actions */}
      {!isAdmin && activeConversation === ADMIN_KEY && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModal("leave")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
              bg-amber-50 dark:bg-amber-900/20
              border border-amber-200 dark:border-amber-800/40
              text-amber-700 dark:text-amber-400
              hover:bg-amber-100 dark:hover:bg-amber-900/40"
            title="Request Leave"
          >
            <span>📅</span>
            <span className="hidden sm:inline">Leave</span>
          </button>
          <button
            onClick={() => setModal("incident")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
              bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800/40
              text-red-700 dark:text-red-400
              hover:bg-red-100 dark:hover:bg-red-900/40"
            title="File Incident Report"
          >
            <span>⚠️</span>
            <span className="hidden sm:inline">Incident</span>
          </button>
        </div>
      )}

      {/* Announcement badge */}
      {isAdmin && isAllAnnouncement && (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg
          bg-blue-100 dark:bg-blue-900/40
          text-blue-600 dark:text-blue-400
          border border-blue-200 dark:border-blue-800
          tracking-wider uppercase shrink-0">
          Broadcast
        </span>
      )}
    </div>
  );
};

export default ChatHeader;
