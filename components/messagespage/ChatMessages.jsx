import React from "react";
import MessageBubble from "./MessageBubble";

/**
 * COMPONENT: ChatMessages
 * DESCRIPTION: Messages display area with scroll to bottom.
 */
const ChatMessages = ({
  conversationMessages,
  loading,
  isMine,
  isAdmin,
  onStatusChange,
  onDelete,
  onEdit,
  bottomRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1
      bg-slate-50 dark:bg-slate-900/60 transition-colors duration-300">

      {loading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 dark:text-slate-600">Loading messages…</p>
        </div>

      ) : conversationMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
          {/* Illustration */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
              <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            {/* Decorative dots */}
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-400/40 dark:bg-primary-600/30" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-indigo-400/30 dark:bg-indigo-600/20" />
          </div>

          <div>
            <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
              No messages yet
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
              Send a message or request below
            </p>
          </div>
        </div>

      ) : (
        <>
          {conversationMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMine={isMine(msg)}
              isAdmin={isAdmin}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export default ChatMessages;
