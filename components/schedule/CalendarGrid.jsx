import React from "react";
import { EventType } from "../../types";
import { formatLocalDate } from "./dateUtils";

/**
 * COMPONENT: CalendarGrid
 * DESCRIPTION: Renders the calendar grid with events for desktop and mobile.
 */

// Gradient + icon config per event type
const EVENT_STYLES = {
  [EventType.Holiday]: {
    pill: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-200 dark:shadow-rose-900/40",
    dot:  "bg-rose-500",
    icon: "🎌",
  },
  [EventType.Meeting]: {
    pill: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-200 dark:shadow-blue-900/40",
    dot:  "bg-blue-500",
    icon: "📋",
  },
  [EventType.Exam]: {
    pill: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-amber-200 dark:shadow-amber-900/40",
    dot:  "bg-amber-400",
    icon: "📝",
  },
  [EventType.General]: {
    pill: "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-slate-200 dark:shadow-slate-900/40",
    dot:  "bg-slate-400",
    icon: "📌",
  },
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekendIndices = new Set([0, 6]);

const CalendarGrid = ({
  calendarGrid,
  eventsByDate,
  mobileSelectedDate,
  onSelectDate,
  onOpenModal,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Weekday Header */}
      <div className="grid grid-cols-7">
        {weekdays.map((day, i) => (
          <div
            key={day}
            className={`text-center py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 transition-colors
              ${weekendIndices.has(i)
                ? "text-rose-500/80 dark:text-rose-400/60 bg-slate-50/50 dark:bg-slate-950/40"
                : "text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/20"
              }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Cells */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
        {calendarGrid.map((day, index) => {
          const isToday = day && day.getTime() === today.getTime();
          const dateKey = day ? formatLocalDate(day) : "";
          const dayEvents = day ? eventsByDate.get(dateKey) || [] : [];
          const isSelected = mobileSelectedDate === dateKey && day;
          const colIndex = index % 7;
          const isWeekend = weekendIndices.has(colIndex);

          return (
            <div
              key={index}
              className={`relative min-h-[70px] sm:min-h-[140px] p-1 sm:p-2.5 transition-all duration-300 group
                ${!day
                  ? "bg-slate-50/10 dark:bg-slate-950/10"
                  : isWeekend
                    ? "bg-slate-50/20 dark:bg-slate-950/10 hover:bg-slate-100 dark:hover:bg-slate-800/30 cursor-pointer"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer"
                }
                ${isSelected ? "bg-primary-50/30 dark:bg-primary-900/10" : ""}
              `}
              onClick={() => day && onSelectDate(dateKey)}
            >
              {day && (
                <>
                  {/* Day Number */}
                  <div className="flex justify-end mb-2">
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 ring-4 ring-primary-500/10">
                        {day.getDate()}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all
                          ${isSelected
                            ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                            : isWeekend
                              ? "text-rose-500/80 dark:text-rose-400 group-hover:bg-rose-50 dark:group-hover:bg-rose-900/20"
                              : "text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                          }`}
                      >
                        {day.getDate()}
                      </span>
                    )}
                  </div>

                  {/* Desktop Event Pills */}
                  <div className="hidden sm:block space-y-1.5">
                    {dayEvents.slice(0, 3).map((event) => {
                      const style = EVENT_STYLES[event.type] || EVENT_STYLES[EventType.General];
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onOpenModal(event); }}
                          title={event.title}
                          className={`w-full text-left text-white text-[10px] font-bold py-1 px-2 rounded-lg truncate flex items-center gap-1.5 shadow-sm transition-all active:scale-95 border border-white/10 ${style.pill}`}
                        >
                          <span className="text-[10px] leading-none shrink-0 opacity-90">{style.icon}</span>
                          <span className="truncate tracking-tight">{event.title}</span>
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 px-2 uppercase tracking-wider">
                        + {dayEvents.length - 3} more
                      </p>
                    )}
                  </div>

                  {/* Mobile Event Dots */}
                  <div className="flex sm:hidden justify-center gap-1 mt-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const style = EVENT_STYLES[event.type] || EVENT_STYLES[EventType.General];
                      return (
                        <span
                          key={event.id}
                          className={`w-1.5 h-1.5 rounded-full ${style.dot} border border-white dark:border-slate-900`}
                        />
                      );
                    })}
                  </div>
                </>
              )}
              {isSelected && (
                <div className="absolute inset-0 border-2 border-primary-500/50 rounded-lg pointer-events-none z-10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
