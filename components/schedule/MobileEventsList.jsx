import React from "react";
import { EventType } from "../../types";

const EVENT_CONFIG = {
  [EventType.Holiday]: {
    card:  "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40",
    bar:   "bg-gradient-to-b from-rose-400 to-pink-500",
    title: "text-rose-900 dark:text-rose-100",
    badge: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300",
    icon:  "🎌",
  },
  [EventType.Meeting]: {
    card:  "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
    bar:   "bg-gradient-to-b from-blue-400 to-indigo-500",
    title: "text-blue-900 dark:text-blue-100",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300",
    icon:  "📋",
  },
  [EventType.Exam]: {
    card:  "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
    bar:   "bg-gradient-to-b from-amber-400 to-orange-500",
    title: "text-amber-900 dark:text-amber-100",
    badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    icon:  "📝",
  },
  [EventType.General]: {
    card:  "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
    bar:   "bg-gradient-to-b from-slate-400 to-slate-500",
    title: "text-slate-800 dark:text-slate-100",
    badge: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300",
    icon:  "📌",
  },
};

/**
 * COMPONENT: MobileEventsList
 * DESCRIPTION: Displays events for a selected date on mobile view.
 */
const MobileEventsList = ({ mobileSelectedDate, dayEvents, onOpenModal, onAddEvent }) => {
  const displayDate = new Date(mobileSelectedDate + "T00:00:00");
  const dateLabel = displayDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const isToday = mobileSelectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="sm:hidden mt-5 space-y-4">
      {/* Section header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight transition-colors">
            {isToday ? "✨ Today" : displayDate.toLocaleString("default", { weekday: "long" })}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{dateLabel}</p>
        </div>
        <button
          onClick={() => onAddEvent(null, mobileSelectedDate)}
          className="text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-indigo-500 px-3 py-1.5 rounded-lg shadow-sm shadow-primary-200 dark:shadow-none active:scale-95 transition-all"
        >
          + Add
        </button>
      </div>

      {/* Event list */}
      {dayEvents.length > 0 ? (
        <div className="space-y-3">
          {dayEvents.map((event) => {
            const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG[EventType.General];
            return (
              <div
                key={event.id}
                onClick={() => onOpenModal(event)}
                className={`flex items-stretch rounded-xl border overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-sm ${cfg.card}`}
              >
                <span className={`w-1.5 shrink-0 ${cfg.bar}`} />
                <div className="flex-1 p-3.5 flex items-center gap-3">
                  <span className="text-xl shrink-0">{cfg.icon}</span>
                  <div className="flex-grow min-w-0">
                    <p className={`font-bold text-sm line-clamp-1 ${cfg.title}`}>{event.title}</p>
                    <p className="text-xs line-clamp-1 mt-0.5 opacity-60 text-slate-600 dark:text-slate-300">{event.description}</p>
                    <span className={`inline-block mt-1.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                      {event.type}
                    </span>
                  </div>
                  <svg className="w-4 h-4 opacity-30 ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/50 transition-colors bg-slate-50/60 dark:bg-slate-900/50">
          <div className="text-2xl mb-2">📅</div>
          <p className="text-sm text-slate-500 dark:text-slate-500 font-semibold">No events for this day</p>
        </div>
      )}
    </div>
  );
};

export default MobileEventsList;
