import React from "react";
import { EventType } from "../../types";

/**
 * COMPONENT: MobileEventsList
 * DESCRIPTION: Displays events for a selected date on mobile view.
 */
const MobileEventsList = ({
  mobileSelectedDate,
  dayEvents,
  onOpenModal,
  onAddEvent,
}) => {
  const eventTypeClasses = {
    [EventType.Holiday]: "bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800/50 text-red-900 dark:text-red-200",
    [EventType.Meeting]: "bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800/50 text-blue-900 dark:text-blue-200",
    [EventType.Exam]: "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800/50 text-yellow-900 dark:text-yellow-200",
    [EventType.General]: "bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-200",
  };

  return (
    <div className="sm:hidden mt-6 space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-slate-800 dark:text-white transition-colors">
          Events for{" "}
          {new Date(mobileSelectedDate).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={() => onAddEvent(null, mobileSelectedDate)}
          className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
        >
          + Add
        </button>
      </div>
      {dayEvents.length > 0 ? (
        <div className="space-y-3">
          {dayEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onOpenModal(event)}
              className={`flex items-center justify-between p-4 rounded-xl border-l-4 cursor-pointer active:scale-95 transition-transform ${eventTypeClasses[event.type]}`}
            >
              <div className="flex-grow min-w-0">
                <p className="font-bold text-sm line-clamp-1">{event.title}</p>
                <p className="text-xs line-clamp-1 mt-0.5 opacity-75">
                  {event.description}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">
                  {event.type}
                </p>
              </div>
              <svg
                className="w-5 h-5 opacity-40 ml-2 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            No events scheduled for this day
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileEventsList;
