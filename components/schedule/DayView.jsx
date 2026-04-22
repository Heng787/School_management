import React from "react";
import { EventType } from "../../types";
import { formatLocalDate } from "./dateUtils";

const EVENT_CONFIG = {
  [EventType.Holiday]: {
    bar:    "bg-gradient-to-b from-rose-400 to-pink-500",
    card:   "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40",
    title:  "text-rose-900 dark:text-rose-100",
    badge:  "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800/50",
    dot:    "bg-rose-500",
    icon:   "🎌",
  },
  [EventType.Meeting]: {
    bar:    "bg-gradient-to-b from-blue-400 to-indigo-500",
    card:   "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
    title:  "text-blue-900 dark:text-blue-100",
    badge:  "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800/50",
    dot:    "bg-blue-500",
    icon:   "📋",
  },
  [EventType.Exam]: {
    bar:    "bg-gradient-to-b from-amber-400 to-orange-500",
    card:   "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
    title:  "text-amber-900 dark:text-amber-100",
    badge:  "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800/50",
    dot:    "bg-amber-400",
    icon:   "📝",
  },
  [EventType.General]: {
    bar:    "bg-gradient-to-b from-slate-400 to-slate-500",
    card:   "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
    title:  "text-slate-800 dark:text-slate-100",
    badge:  "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-600",
    dot:    "bg-slate-400",
    icon:   "📌",
  },
};

/**
 * COMPONENT: DayView
 * Shows all events for a single selected day, with a full-day timeline feel.
 */
const DayView = ({ selectedDate, eventsByDate, onOpenModal }) => {
  const today = formatLocalDate(new Date());
  const isToday = selectedDate === today;

  const dayEvents = eventsByDate.get(selectedDate) || [];

  const displayDate = (() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  })();

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-xl shadow-slate-200/60 dark:shadow-none bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Day Header */}
      <div
        className={`px-6 py-5 border-b border-slate-200 dark:border-slate-700/60 flex items-center gap-5
          ${isToday
            ? "bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-950/30 dark:to-indigo-950/30"
            : "bg-slate-50/60 dark:bg-slate-800/30"
          }`}
      >
        {/* Date badge */}
        <div
          className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-md
            ${isToday
              ? "bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-primary-200 dark:shadow-primary-900/50"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white"
            }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider opacity-75 leading-none">
            {displayDate.toLocaleString("default", { weekday: "short" })}
          </span>
          <span className="text-3xl font-black leading-none mt-0.5">{displayDate.getDate()}</span>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            {displayDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isToday ? "✨ Today" : displayDate.toLocaleString("default", { weekday: "long" })}
            {" · "}
            <span className={dayEvents.length === 0 ? "text-slate-400" : "text-primary-600 dark:text-primary-400 font-semibold"}>
              {dayEvents.length === 0 ? "No events" : `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`}
            </span>
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="p-6">
        {dayEvents.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
              📅
            </div>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">No events scheduled for this day</p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Click "+ Add Event" to schedule something</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event) => {
              const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG[EventType.General];
              return (
                <button
                  key={event.id}
                  onClick={() => onOpenModal(event)}
                  className={`w-full text-left rounded-xl border overflow-hidden flex items-stretch hover:shadow-md active:scale-[0.99] transition-all duration-200 ${cfg.card}`}
                >
                  {/* Color bar */}
                  <span className={`w-1.5 shrink-0 ${cfg.bar}`} />
                  {/* Content */}
                  <div className="flex-1 p-4 flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm leading-tight ${cfg.title}`}>{event.title}</p>
                      {event.description && (
                        <p className="text-xs opacity-60 mt-1 line-clamp-2 text-slate-600 dark:text-slate-300">{event.description}</p>
                      )}
                      <span className={`inline-block mt-2 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {event.type}
                      </span>
                    </div>
                    <svg className="w-4 h-4 opacity-30 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
