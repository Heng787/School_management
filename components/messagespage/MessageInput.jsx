import React, { useState, useCallback } from "react";

/**
 * COMPONENT: MessageInput
 * DESCRIPTION: Message input form with drag-and-drop file support and multiple attachments.
 */
const MessageInput = ({
  text,
  setText,
  handleSend,
  sending,
  attachments = [],
  setAttachments,
  fileInputRef,
  announcementMode,
  isAdmin,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const canSend = (text.trim() || attachments.length > 0) && !sending;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
    }
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
    }
  }, [setAttachments]);

  if (announcementMode && !isAdmin) {
    return (
      <div className="px-4 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition-colors flex items-center justify-center">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Only administrators can send announcements
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`px-4 py-3 border-t border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900 transition-all duration-200 relative ${isDragging ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 border-2 border-dashed border-primary-500 m-2 rounded-2xl flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-bold text-primary-600">Drop files to attach</p>
          </div>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 max-h-40 overflow-y-auto p-1">
          {attachments.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
              bg-slate-100 dark:bg-slate-800
              border border-slate-200 dark:border-slate-700 hover:border-primary-300 transition-all">
              <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 shadow-xs text-primary-500">
                {file.type.startsWith('image/') ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-rose-500 hover:text-white transition-all ml-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <div className="flex items-end gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach files"
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all
              text-slate-500 dark:text-slate-500
              hover:text-primary-600 dark:hover:text-primary-400
              hover:bg-primary-50 dark:hover:bg-primary-900/20 active:scale-95"
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
              placeholder={isDragging ? "Drop here!" : "Type a message…"}
              rows={1}
              className={`w-full px-4 py-2.5 pr-4 rounded-2xl text-sm resize-none max-h-32
                bg-slate-100 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-800 dark:text-slate-200
                placeholder:text-slate-500 dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-primary-500
                focus:bg-white dark:focus:bg-slate-700
                transition-all ${isDragging ? 'ring-2 ring-primary-500 border-transparent' : ''}`}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!canSend}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95
              ${canSend
                ? "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20"
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
