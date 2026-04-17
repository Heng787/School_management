import React from "react";
import { ADMIN_KEY } from "../../services/messageService";

/**
 * COMPONENT: ConversationList
 * DESCRIPTION: Left sidebar showing conversation contacts and threads
 */
const ConversationList = ({
  isMultiRecipient,
  mobileShowChat,
  isAdmin,
  staff,
  staffConversations,
  activeConversation,
  setActiveConversation,
  setAnnouncementMode,
  setMobileShowChat,
  searchQuery,
  setSearchQuery,
  totalUnread,
}) => {
  if (!isMultiRecipient) return null;

  return (
    <div
      className={`w-full md:w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${mobileShowChat ? "hidden md:flex" : "flex"}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10 space-y-3 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white transition-colors">Messages</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">
            {totalUnread > 0 ? `${totalUnread} unread` : "✨ All caught up"}
          </p>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder={isAdmin ? "Search staff..." : "Search contacts..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-200 shadow-sm"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {/* Announce to all */}
        {isAdmin && (
          <button
            onClick={() => {
              setActiveConversation("all");
              setAnnouncementMode(true);
              setMobileShowChat(true);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 transition-colors ${activeConversation === "all" ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500" : "hover:bg-white dark:hover:bg-slate-900/50"}`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 transition-colors">
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
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
            <div className="text-left min-w-0 transition-colors">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Announce to All
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                Broadcast to all staff
              </p>
            </div>
          </button>
        )}

        {/* Individual conversations */}
        {staffConversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => {
              setActiveConversation(conv.id);
              setAnnouncementMode(false);
              setMobileShowChat(true);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 transition-colors ${activeConversation === conv.id ? "bg-primary-50 dark:bg-primary-900/20 border-l-2 border-l-primary-500" : "hover:bg-white dark:hover:bg-slate-900/50"}`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm ${conv.id === ADMIN_KEY ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-gradient-to-br from-slate-600 to-slate-900"}`}
            >
              {conv.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {conv.name}
                </p>
                {conv.unread > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {conv.unread}
                  </span>
                )}
              </div>
              {conv.lastMsg ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  {conv.lastMsg.type === "leave_request"
                    ? "📅 Leave request"
                    : conv.lastMsg.type === "incident"
                      ? "⚠️ Incident report"
                      : conv.lastMsg.content.slice(0, 30) +
                        (conv.lastMsg.content.length > 30 ? "…" : "")}
                </p>
              ) : (
                <p className="text-xs text-slate-400/80 dark:text-slate-500/80 italic truncate mt-0.5">
                  No messages yet
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
