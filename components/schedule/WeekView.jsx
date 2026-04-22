import React from "react";
import { EventType } from "../../types";
import { formatLocalDate } from "./dateUtils";

const EVENT_STYLES = {
  [EventType.Holiday]: {
    pill: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600",
    icon: "🎌",
  },
  [EventType.Meeting]: {
    pill: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
    icon: "📋",
  },
  [EventType.Exam]: {
    pill: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600",
    icon: "📝",
  },
  [EventType.General]: {
    pill: "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700",
    icon: "📌",
  },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * COMPONENT: WeekView
 * Shows the 7 days of the active week with their events.
 */
const WeekView = ({ weekStart, eventsByDate, onOpenModal, onSelectDate }) => {
  const today = formatLocalDate(new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-xl shadow-slate-200/60 dark:shadow-none bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header row */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700/60">
        {days.map((day, i) => {
          const key = formatLocalDate(day);
          const isToday = key === today;
          const isWeekend = i === 0 || i === 6;
          return (
            <div
              key={i}
              className={`py-4 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-700/60 transition-colors
                ${isToday
                  ? "bg-primary-50 dark:bg-primary-900/20"
                  : isWeekend
                    ? "bg-rose-50/30 dark:bg-rose-950/10"
                    : "bg-slate-50/60 dark:bg-slate-800/30"
                }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest ${isWeekend ? "text-rose-400 dark:text-rose-500" : "text-slate-500 dark:text-slate-400"}`}>
                {WEEKDAYS[day.getDay()]}
              </p>
              <div className="mt-1.5 flex items-center justify-center">
                {isToday ? (
                  <span className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-600 text-white text-lg font-black shadow-lg shadow-primary-300 dark:shadow-primary-900 ring-2 ring-primary-300 dark:ring-primary-700 ring-offset-1 ring-offset-white dark:ring-offset-slate-900">
                    {day.getDate()}
                  </span>
                ) : (
                  <span className={`text-xl font-bold ${isWeekend ? "text-rose-400 dark:text-rose-500" : "text-slate-700 dark:text-slate-200"}`}>
                    {day.getDate()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Events row */}
      <div className="grid grid-cols-7 min-h-[220px] divide-x divide-slate-200 dark:divide-slate-700/50">
        {days.map((day, i) => {
          const key = formatLocalDate(day);
          const isToday = key === today;
          const isWeekend = i === 0 || i === 6;
          const dayEvents = eventsByDate.get(key) || [];

          return (
            <div
              key={i}
              onClick={() => onSelectDate(key)}
              className={`p-2 cursor-pointer transition-colors group
                ${isToday
                  ? "bg-primary-50/40 dark:bg-primary-900/10 hover:bg-primary-50/70 dark:hover:bg-primary-900/20"
                  : isWeekend
                    ? "bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40 dark:hover:bg-rose-950/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
            >
              <div className="space-y-1.5">
                {dayEvents.map((event) => {
                  const style = EVENT_STYLES[event.type] || EVENT_STYLES[EventType.General];
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onOpenModal(event); }}
                      title={event.title}
                      className={`w-full text-left text-white text-[10px] font-bold py-1.5 px-2 rounded-lg truncate flex items-center gap-1 shadow-sm active:scale-95 transition-all duration-150 ${style.pill}`}
                    >
                      <span className="text-[9px] shrink-0">{style.icon}</span>
                      <span className="truncate">{event.title}</span>
                    </button>
                  );
                })}
                {dayEvents.length === 0 && (
                  <p className="text-[11px] text-slate-300 dark:text-slate-700 text-center pt-4 group-hover:text-slate-400 dark:group-hover:text-slate-600 transition-colors">–</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
