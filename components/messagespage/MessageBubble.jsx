import React, { useState } from "react";
import { formatTime } from "./messageHelpers";
import LeaveCard from "./LeaveCard";
import IncidentCard from "./IncidentCard";

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const MessageAvatar = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-black shrink-0 mt-1 shadow-sm">
    {name.charAt(0).toUpperCase()}
  </div>
);

const FileAttachment = ({ file, isMine }) => (
  <a
    href={file.fileUrl}
    target="_blank"
    rel="noreferrer"
    className={`flex items-center gap-3 mb-2 px-4 py-3 rounded-2xl transition-all shadow-sm border ${
      isMine 
        ? "bg-white/10 hover:bg-white/20 border-white/10" 
        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800"
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isMine ? "bg-white text-primary-600" : "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </div>
    <div className="min-w-0">
      <p className={`text-sm font-black truncate ${isMine ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>{file.fileName || "Document"}</p>
      <p className={`text-[9px] font-black uppercase tracking-widest ${isMine ? "text-white/60" : "text-slate-500"}`}>Download</p>
    </div>
  </a>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const MessageBubble = ({ msg, isMine, isAdmin, onStatusChange, onDelete, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);

  const isCard = ["leave_request", "incident"].includes(msg.type);
  const isAnnouncement = msg.type === "announcement";

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== msg.content) onEdit(msg.id, editText.trim());
    setIsEditing(false);
  };

  const bubbleClasses = `rounded-2xl px-4 py-3 shadow-sm transition-all duration-300 ${
    isMine 
      ? "bg-primary-600 text-white rounded-tr-sm" 
      : isAnnouncement 
        ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-100 rounded-tl-sm" 
        : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm"
  }`;

  return (
    <div 
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isMine && <MessageAvatar name={msg.senderName} />}

      <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%] ${!isMine && "ml-3"}`}>
        {!isMine && (
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">{msg.senderName}</span>
        )}

        {isCard ? (
          msg.type === "leave_request" ? <LeaveCard msg={msg} isMine={isMine} /> : <IncidentCard msg={msg} isMine={isMine} />
        ) : isEditing ? (
          <div className="flex flex-col gap-2 w-full min-w-[280px]">
            <textarea
              autoFocus value={editText} onChange={e => setEditText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-primary-500 rounded-2xl text-sm font-medium bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none shadow-xl"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-600">Cancel</button>
              <button onClick={handleSaveEdit} className="px-5 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Changes</button>
            </div>
          </div>
        ) : (
          <div className={bubbleClasses}>
            {isAnnouncement && (
              <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-blue-200/50 dark:border-blue-800/30">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Official Announcement</span>
              </div>
            )}

            {msg.metadata?.imageUrl && (
              <a href={msg.metadata.imageUrl} target="_blank" rel="noreferrer" className="block mb-3 overflow-hidden rounded-xl border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                <img src={msg.metadata.imageUrl} alt="attachment" className="max-w-full sm:max-w-[300px] object-cover" />
              </a>
            )}

            {msg.metadata?.fileUrl && !msg.metadata?.imageUrl && <FileAttachment file={msg.metadata} isMine={isMine} />}

            {msg.content && <p className="text-[13px] sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
            
            {msg.metadata?.edited && <span className="text-[9px] font-bold opacity-40 mt-1 block uppercase tracking-tighter">Edited</span>}
          </div>
        )}

        {/* ADMIN CONTROLS FOR REQUESTS */}
        {isAdmin && !isMine && msg.type === "leave_request" && msg.metadata?.status === "pending" && (
          <div className="flex gap-2 mt-2 ml-1">
            <button onClick={() => onStatusChange(msg.id, "approved")} className="px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Approve</button>
            <button onClick={() => onStatusChange(msg.id, "rejected")} className="px-4 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all">Reject</button>
          </div>
        )}

        {/* METADATA & ACTIONS */}
        <div className={`flex items-center gap-3 mt-1.5 px-1 transition-all duration-300 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter opacity-80">{formatTime(msg.createdAt)}</span>
          {isMine && <span className={`text-[10px] font-black ${msg.isRead ? "text-primary-500" : "text-slate-300"}`}>{msg.isRead ? "✓✓" : "✓"}</span>}
          
          {isMine && !isCard && !isEditing && isHovered && (
            <div className="flex gap-2 animate-in fade-in zoom-in-95">
              <button onClick={() => setIsEditing(true)} className="p-1 text-slate-500 hover:text-blue-500 transition-colors" title="Edit">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => onDelete(msg.id)} className="p-1 text-slate-500 hover:text-rose-500 transition-colors" title="Delete">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
