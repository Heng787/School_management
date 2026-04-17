import React from "react";
import MessageBubble from "./MessageBubble";

/**
 * COMPONENT: ChatMessages
 * DESCRIPTION: Messages display area with scroll to bottom
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
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/40 dark:bg-slate-900/50 transition-colors duration-300">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : conversationMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center gap-3 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors">
            <svg
              className="w-7 h-7 text-slate-300 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-400 dark:text-slate-500 text-sm transition-colors">
              No messages yet
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1 transition-colors">
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
