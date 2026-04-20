import React from "react";
import { EventType } from "../../types";
import { formatLocalDate } from "./dateUtils";

/**
 * COMPONENT: CalendarGrid
 * DESCRIPTION: Renders the calendar grid with events for desktop and mobile.
 */
const CalendarGrid = ({
  calendarGrid,
  eventsByDate,
  mobileSelectedDate,
  onSelectDate,
  onOpenModal,
}) => {
  const eventTypeClasses = {
    [EventType.Holiday]: "bg-red-500 hover:bg-red-600",
    [EventType.Meeting]: "bg-blue-500 hover:bg-blue-600",
    [EventType.Exam]: "bg-yellow-500 hover:bg-yellow-600",
    [EventType.General]: "bg-gray-500 hover:bg-gray-600",
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div>
        <div className="grid grid-cols-7 gap-px rounded-t-lg overflow-hidden border-b border-slate-200 dark:border-slate-800">
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-center font-bold text-slate-900 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 py-2 sm:py-3 uppercase tracking-wider text-[10px] sm:text-[11px] transition-colors"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {calendarGrid.map((day, index) => {
            const isToday = day && day.getTime() === today.getTime();
            const dateKey = day ? formatLocalDate(day) : "";
            const dayEvents = day ? eventsByDate.get(dateKey) || [] : [];
            const isSelected = mobileSelectedDate === dateKey && day;

            return (
              <div
                key={index}
                className={`relative min-h-[60px] sm:min-h-[120px] bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-800 p-1 sm:p-2 transition-colors 
                                        ${day ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 group" : "bg-slate-50/20 dark:bg-slate-950/20"}
                                        ${isSelected ? "ring-2 ring-inset ring-primary-500 bg-primary-50 dark:bg-primary-900/20" : ""}
                                    `}
                onClick={() => {
                  if (day) {
                    onSelectDate(dateKey);
                  }
                }}
              >
                {day && (
                  <>
                    <span
                      className={`absolute top-1 sm:top-1.5 right-1 sm:right-1.5 text-[10px] sm:text-sm font-semibold transition-colors 
                                                ${isToday ? "bg-primary-600 text-white rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center shadow-md dark:shadow-none" : "text-slate-700 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400"}
                                                ${isSelected && !isToday ? "!text-primary-600 dark:!text-primary-400 font-bold" : ""}
                                            `}
                    >
                      {day.getDate()}
                    </span>

                    {/* Desktop View: Buttons */}
                    <div className="hidden sm:block mt-8 space-y-1">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal(event);
                          }}
                          className={`w-full text-left text-white text-[11px] font-bold py-1 px-1.5 rounded truncate transition-colors shadow-sm hover:shadow active:scale-95 dark:shadow-none ${eventTypeClasses[event.type]}`}
                          title={event.title}
                        >
                          {event.title}
                        </button>
                      ))}
                    </div>

                    {/* Mobile View: Dots */}
                    <div className="flex sm:hidden justify-center items-center gap-0.5 mt-8 px-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`w-1.5 h-1.5 rounded-full ${eventTypeClasses[event.type]} ring-1 ring-white`}
                        ></div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 transition-colors">
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
