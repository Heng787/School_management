import React, { useState } from "react";
import { formatTime } from "./messageHelpers";
import LeaveCard from "./LeaveCard";
import IncidentCard from "./IncidentCard";

/**
 * COMPONENT: MessageBubble
 * DESCRIPTION: Individual message bubble with support for different message types
 */
const MessageBubble = ({
  msg,
  isMine,
  isAdmin,
  onStatusChange,
  onDelete,
  onEdit,
}) => {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);
  const isCard = msg.type === "leave_request" || msg.type === "incident";
  const isPending = msg.metadata?.status === "pending";
  const isEdited = msg.metadata?.edited;

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== msg.content)
      onEdit(msg.id, editText.trim());
    setEditing(false);
  };

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isMine && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">
          {msg.senderName.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[80%]`}
      >
        {!isMine && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-1 ml-1 transition-colors">
            {msg.senderName}
          </span>
        )}

        {/* Card or plain bubble */}
        {isCard ? (
          msg.type === "leave_request" ? (
            <LeaveCard msg={msg} isMine={isMine} />
          ) : (
            <IncidentCard msg={msg} isMine={isMine} />
          )
        ) : editing ? (
          // Inline edit mode
          <div className="flex flex-col gap-2 w-[75vw] sm:w-[320px] md:w-[400px] max-w-full">
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === "Escape") setEditing(false);
              }}
              rows={4}
              className="w-full px-3 py-2.5 border-2 border-primary-400 rounded-xl text-sm resize-none focus:outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-sm leading-relaxed transition-colors"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-xs font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm transition-colors duration-300 ${
              isMine
                ? "bg-primary-600 text-white rounded-tr-sm"
                : msg.type === "announcement"
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 rounded-tl-sm"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm"
            }`}
          >
            {msg.type === "announcement" && (
              <div className="flex items-center gap-1 mb-1">
                <svg
                  className="w-3 h-3 text-blue-500 dark:text-blue-400"
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
                <span className="text-[10px] font-bold uppercase text-blue-500 dark:text-blue-400 tracking-wider">
                  Announcement
                </span>
              </div>
            )}
            {/* Image attachment */}
            {msg.metadata?.imageUrl && (
              <a
                href={msg.metadata.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="block mb-2"
              >
                <img
                  src={msg.metadata.imageUrl}
                  alt="attachment"
                  className="max-w-[220px] rounded-xl border border-white/20 dark:border-slate-700/50 object-cover transition-colors"
                />
              </a>
            )}
            {/* File attachment */}
            {msg.metadata?.fileUrl && !msg.metadata?.imageUrl && (
              <a
                href={msg.metadata.fileUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-3 mb-2 px-4 py-3 rounded-xl transition-all shadow-sm ${isMine ? "bg-primary-500/30 hover:bg-primary-500/50" : "bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700"}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors ${isMine ? "bg-primary-400 text-white" : "bg-white dark:bg-slate-800 text-rose-500 dark:text-rose-400 border border-slate-200 dark:border-slate-700"}`}
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
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 7v4h4"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold truncate transition-colors ${isMine ? "text-white" : "text-slate-700 dark:text-slate-200"}`}
                  >
                    {msg.metadata.fileName || "Document File"}
                  </p>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isMine ? "text-primary-100" : "text-slate-400 dark:text-slate-500"}`}
                  >
                    Download
                  </p>
                </div>
                <div
                  className={`ml-auto pl-2 ${isMine ? "text-primary-100" : "text-slate-400"}`}
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
              </a>
            )}
            {msg.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap transition-colors">
                {msg.content}
              </p>
            )}
            {isEdited && (
              <span className="text-[10px] opacity-60 mt-0.5 block">
                edited
              </span>
            )}
          </div>
        )}

        {/* Admin approve/reject for pending requests */}
        {isAdmin &&
          !isMine &&
          isCard &&
          msg.type === "leave_request" &&
          isPending && (
            <div className="flex gap-2 mt-1.5 ml-1">
              <button
                onClick={() => onStatusChange(msg.id, "approved")}
                className="px-3 py-1 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onStatusChange(msg.id, "rejected")}
                className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                ✗ Reject
              </button>
            </div>
          )}

        {/* Time + actions row */}
        <div
          className={`flex items-center gap-2 mt-1 transition-colors ${isMine ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {formatTime(msg.createdAt)}
          </span>
          {isMine && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {msg.isRead ? "✓✓" : "✓"}
            </span>
          )}
          {/* Edit button — own plain-text messages only */}
          {isMine && !isCard && !editing && (
            <button
              onClick={() => {
                setEditText(msg.content);
                setEditing(true);
              }}
              className={`transition-all text-slate-400 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 ${hover ? "opacity-100" : "opacity-0"}`}
              title="Edit"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {/* Delete / unsend button */}
          {isMine && !editing && (
            <button
              onClick={() => onDelete(msg.id)}
              className={`transition-all text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 ${hover ? "opacity-100" : "opacity-0"}`}
              title="Unsend"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
