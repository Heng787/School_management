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
          <p className="text-xs text-slate-500 dark:text-slate-600">Loading messages…</p>
        </div>

      ) : conversationMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800/50 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm mb-4">
            <svg className="w-8 h-8 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest">
            No messages yet
          </p>
          <p className="text-[11px] text-slate-300 dark:text-slate-700 mt-1">
            Start the conversation below
          </p>
        </div>

      ) : (
        <div className="flex flex-col gap-1">
          {conversationMessages.reduce((acc, msg, idx) => {
            const date = new Date(msg.createdAt).toLocaleDateString();
            const prevDate = idx > 0 ? new Date(conversationMessages[idx - 1].createdAt).toLocaleDateString() : null;

            if (date !== prevDate) {
              acc.push(
                <div key={`date-${date}`} className="flex items-center justify-center my-6">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">
                    {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
              );
            }

            acc.push(
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={isMine(msg)}
                isAdmin={isAdmin}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            );
            return acc;
          }, [])}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
