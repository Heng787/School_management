import React from "react";

/**
 * COMPONENT: MessageInput
 * DESCRIPTION: Message input form with attachment and send button.
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
  const canSend = (text.trim() || attachment) && !sending;

  return (
    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800
      bg-white dark:bg-slate-900 transition-colors">


      {/* Attachment preview */}
      {attachment && (
        <div className="mb-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
          bg-slate-100 dark:bg-slate-800
          border border-slate-200 dark:border-slate-700">
          <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
            {attachment.name}
          </span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="ml-1 text-slate-500 hover:text-red-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSend}>
        <div className="flex items-end gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) setAttachment(e.target.files[0]);
              e.target.value = "";
            }}
            className="hidden"
          />

          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
              text-slate-500 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
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
              className="w-full px-4 py-2.5 pr-4 rounded-2xl text-sm resize-none max-h-32
                bg-slate-100 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-800 dark:text-slate-200
                placeholder:text-slate-500 dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-primary-500
                focus:bg-white dark:focus:bg-slate-700
                transition-all"
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!canSend}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all
              ${canSend
                ? "bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-900/20"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed"}`}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
