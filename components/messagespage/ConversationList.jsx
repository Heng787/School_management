import React from "react";
import { ADMIN_KEY } from "../../services/messageService";

/**
 * COMPONENT: ConversationList
 * DESCRIPTION: Left sidebar showing conversation contacts and threads.
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

  // Derive a deterministic avatar colour from a name
  const avatarPalette = [
    ["bg-blue-100 dark:bg-blue-900/40", "text-blue-700 dark:text-blue-300"],
    ["bg-indigo-100 dark:bg-indigo-900/40", "text-indigo-700 dark:text-indigo-300"],
    ["bg-emerald-100 dark:bg-emerald-900/40", "text-emerald-700 dark:text-emerald-300"],
    ["bg-orange-100 dark:bg-orange-900/40", "text-orange-700 dark:text-orange-300"],
    ["bg-pink-100 dark:bg-pink-900/40", "text-pink-700 dark:text-pink-300"],
    ["bg-cyan-100 dark:bg-cyan-900/40", "text-cyan-700 dark:text-cyan-300"],
  ];
  const getAvatar = (name) => avatarPalette[name.charCodeAt(0) % avatarPalette.length];

  return (
    <div
      className={`w-full md:w-72 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900 transition-colors duration-300
        ${mobileShowChat ? "hidden md:flex" : "flex"}`}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
              Messages
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
              {totalUnread > 0
                ? <span className="text-primary-500 font-semibold">{totalUnread} unread</span>
                : "✨ All caught up"}
            </p>
          </div>
          {/* Unread badge */}
          {totalUnread > 0 && (
            <span className="min-w-[22px] h-[22px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-sm">
              {totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={isAdmin ? "Search staff…" : "Search contacts…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl
              bg-slate-100 dark:bg-slate-800
              border border-transparent
              text-slate-700 dark:text-slate-200
              placeholder:text-slate-500 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-700
              transition-all"
          />
        </div>
      </div>

      {/* ── Conversation items ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Announce to All / Broadcast Channel */}
        {(isAdmin || true) && (
          <ConvItem
            isActive={activeConversation === "all"}
            onClick={() => {
              setActiveConversation("all");
              setAnnouncementMode(true);
              setMobileShowChat(true);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Announce to All</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">
                {isAdmin ? "Broadcast to all staff" : "General announcements"}
              </p>
            </div>
          </ConvItem>
        )}

        {/* Per-staff conversations */}
        {staffConversations.map((conv) => {
          const isActive = activeConversation === conv.id;
          const isAdminConv = conv.id === ADMIN_KEY;
          const [avatarBg, avatarText] = isAdminConv
            ? ["bg-gradient-to-br from-indigo-500 to-purple-600", "text-white"]
            : getAvatar(conv.name);

          return (
            <ConvItem
              key={conv.id}
              isActive={isActive}
              onClick={() => {
                setActiveConversation(conv.id);
                setAnnouncementMode(false);
                setMobileShowChat(true);
              }}
            >
              {/* Avatar Container */}
              <div className="relative shrink-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${avatarBg} ${avatarText}`}>
                  {conv.name.charAt(0).toUpperCase()}
                </div>
                {/* Status Dot */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm
                  ${conv.status === 'online' ? 'bg-emerald-500' : conv.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'}`} />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-100'}`}>
                    {conv.name}
                  </p>
                  {conv.lastMsg && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">
                      {new Date(conv.lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                    {conv.role}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-600">•</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-600">
                    {conv.room}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                  {conv.lastMsg ? (
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-slate-700 dark:text-slate-300 font-bold' : 'text-slate-500 dark:text-slate-500 font-medium'}`}>
                      {conv.lastMsg.type === "leave_request"
                        ? "📅 Leave request"
                        : conv.lastMsg.type === "incident"
                          ? "⚠️ Incident report"
                          : conv.lastMsg.content}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-300 dark:text-slate-700 italic">No messages yet</p>
                  )}
                  {conv.unread > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-pulse shadow-lg shadow-primary-500/20">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </ConvItem>
          );
        })}

        {staffConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm text-slate-500 dark:text-slate-600">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Shared conversation item wrapper ─────────────────────────────────────────
const ConvItem = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 relative
      ${isActive
        ? "bg-primary-50 dark:bg-primary-900/20"
        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
  >
    {/* Active indicator */}
    {isActive && (
      <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary-500" />
    )}
    {children}
  </button>
);

export default ConversationList;
