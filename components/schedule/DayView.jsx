import React from "react";
import { EventType } from "../../types";
import { formatLocalDate } from "./dateUtils";

const EVENT_COLORS = {
  [EventType.Holiday]: "border-red-400    bg-red-50    dark:bg-red-900/20   text-red-900    dark:text-red-200",
  [EventType.Meeting]: "border-blue-400   bg-blue-50   dark:bg-blue-900/20  text-blue-900   dark:text-blue-200",
  [EventType.Exam]:    "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200",
  [EventType.General]: "border-slate-400  bg-slate-50  dark:bg-slate-800    text-slate-800  dark:text-slate-200",
};

const EVENT_DOT = {
  [EventType.Holiday]: "bg-red-500",
  [EventType.Meeting]: "bg-blue-500",
  [EventType.Exam]:    "bg-yellow-500",
  [EventType.General]: "bg-slate-400",
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
    // Parse as local date to avoid UTC shift
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  })();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      {/* Day Header */}
      <div
        className={`px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 ${
          isToday ? "bg-primary-50 dark:bg-primary-900/20" : "bg-slate-50/50 dark:bg-slate-800/30"
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-sm ${
            isToday
              ? "bg-primary-600 text-white"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            {displayDate.toLocaleString("default", { weekday: "short" })}
          </span>
          <span className="text-2xl font-black leading-none">{displayDate.getDate()}</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            {displayDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isToday ? "Today" : displayDate.toLocaleString("default", { weekday: "long" })}
            {" · "}
            {dayEvents.length === 0
              ? "No events"
              : `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="p-6">
        {dayEvents.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-600">
              No events scheduled for this day
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onOpenModal(event)}
                className={`w-full text-left p-4 rounded-xl border-l-4 flex items-start gap-3 hover:brightness-95 active:scale-[0.99] transition-all ${EVENT_COLORS[event.type]}`}
              >
                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${EVENT_DOT[event.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight">{event.title}</p>
                  {event.description && (
                    <p className="text-xs opacity-70 mt-1 line-clamp-2">{event.description}</p>
                  )}
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider opacity-50">
                    {event.type}
                  </span>
                </div>
                <svg className="w-4 h-4 opacity-30 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
