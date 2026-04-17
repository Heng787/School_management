import React from "react";

/**
 * COMPONENT: MessageInput
 * DESCRIPTION: Message input form with attachment and send button
 */
const MessageInput = ({
  text,
  setText,
  handleSend,
  sending,
  attachment,
  setAttachment,
  fileInputRef,
  announcementMode,
}) => {
  return (
    <form
      onSubmit={handleSend}
      className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
    >
      {announcementMode && (
        <div className="mb-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg flex items-center gap-2 transition-colors">
          <svg
            className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Broadcast to all staff
          </span>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-2 relative inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors">
          <svg
            className="w-4 h-4 text-slate-500 dark:text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
            {attachment.name}
          </span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="ml-1 text-slate-400 hover:text-red-500"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) setAttachment(e.target.files[0]);
            e.target.value = "";
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
          title="Attach file or image"
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
              strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none max-h-28 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
        />
        <button
          type="submit"
          disabled={(!text.trim() && !attachment) || sending}
          className="w-10 h-10 bg-primary-600 text-white rounded-2xl flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-40 shadow-lg shadow-primary-200 dark:shadow-none shrink-0"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
