import React from "react";
import { EventType } from "../../types";
import { formatLocalDate } from "./dateUtils";

const EVENT_COLORS = {
  [EventType.Holiday]: "bg-red-500 text-white",
  [EventType.Meeting]: "bg-blue-500 text-white",
  [EventType.Exam]:    "bg-yellow-500 text-white",
  [EventType.General]: "bg-slate-400 text-white",
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      {/* Header row */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
        {days.map((day, i) => {
          const key = formatLocalDate(day);
          const isToday = key === today;
          return (
            <div
              key={i}
              className={`py-3 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-800 ${isToday ? "bg-primary-50 dark:bg-primary-900/20" : ""}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-500">
                {WEEKDAYS[day.getDay()]}
              </p>
              <p
                className={`mt-1 text-xl font-bold ${
                  isToday
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Events row */}
      <div className="grid grid-cols-7 min-h-[200px]">
        {days.map((day, i) => {
          const key = formatLocalDate(day);
          const isToday = key === today;
          const dayEvents = eventsByDate.get(key) || [];

          return (
            <div
              key={i}
              onClick={() => onSelectDate(key)}
              className={`p-2 border-r last:border-r-0 border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                isToday ? "bg-primary-50/50 dark:bg-primary-900/10" : ""
              }`}
            >
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenModal(event);
                    }}
                    title={event.title}
                    className={`w-full text-left text-[11px] font-bold py-1 px-1.5 rounded truncate active:scale-95 transition-all shadow-sm ${EVENT_COLORS[event.type]}`}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length === 0 && (
                  <p className="text-[11px] text-slate-300 dark:text-slate-700 text-center pt-4">
                    –
                  </p>
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
