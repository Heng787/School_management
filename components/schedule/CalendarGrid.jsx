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
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-xl shadow-slate-200/60 dark:shadow-none bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Weekday Header */}
      <div className="grid grid-cols-7">
        {weekdays.map((day, i) => (
          <div
            key={day}
            className={`text-center py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b border-slate-200 dark:border-slate-700/60 transition-colors
              ${weekendIndices.has(i)
                ? "text-rose-400 dark:text-rose-500/70 bg-rose-50/40 dark:bg-rose-950/20"
                : "text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/40"
              }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Cells */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-700/50">
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
              className={`relative min-h-[64px] sm:min-h-[128px] p-1 sm:p-2 transition-all duration-200 group
                ${!day
                  ? isWeekend
                    ? "bg-slate-50/60 dark:bg-slate-950/40"
                    : "bg-slate-50/20 dark:bg-slate-950/20"
                  : isWeekend
                    ? "bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 cursor-pointer"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                }
                ${isSelected ? "ring-2 ring-inset ring-primary-500/70 bg-primary-50/60 dark:bg-primary-900/20" : ""}
                ${isToday ? "bg-primary-50/40 dark:bg-primary-950/20" : ""}
              `}
              onClick={() => day && onSelectDate(dateKey)}
            >
              {day && (
                <>
                  {/* Day Number */}
                  <div className="flex justify-end mb-1">
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary-600 text-white text-[10px] sm:text-sm font-black shadow-lg shadow-primary-300 dark:shadow-primary-900 ring-2 ring-primary-300 dark:ring-primary-700 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 transition-all">
                        {day.getDate()}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-sm font-bold transition-all
                          ${isSelected
                            ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                            : isWeekend
                              ? "text-rose-400 dark:text-rose-500 group-hover:bg-rose-100 dark:group-hover:bg-rose-950/40"
                              : "text-slate-600 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                          }`}
                      >
                        {day.getDate()}
                      </span>
                    )}
                  </div>

                  {/* Desktop Event Pills */}
                  <div className="hidden sm:block space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const style = EVENT_STYLES[event.type] || EVENT_STYLES[EventType.General];
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onOpenModal(event); }}
                          title={event.title}
                          className={`w-full text-left text-white text-[10px] sm:text-[11px] font-bold py-0.5 sm:py-1 px-1.5 rounded-md truncate flex items-center gap-1 shadow-sm transition-all duration-150 active:scale-95 ${style.pill}`}
                        >
                          <span className="text-[9px] leading-none shrink-0">{style.icon}</span>
                          <span className="truncate">{event.title}</span>
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1.5">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>

                  {/* Mobile Event Dots */}
                  <div className="flex sm:hidden justify-center gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((event) => {
                      const style = EVENT_STYLES[event.type] || EVENT_STYLES[EventType.General];
                      return (
                        <span
                          key={event.id}
                          className={`w-1.5 h-1.5 rounded-full ${style.dot} ring-1 ring-white dark:ring-slate-900`}
                        />
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] font-bold text-slate-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
