import { useMemo } from "react";
import { formatLocalDate } from "./dateUtils";

/**
 * HOOK: useCalendarState
 * DESCRIPTION: Manages calendar grid generation and event grouping by date.
 */
export function useCalendarState(currentDate, events) {
  return useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...

    const grid = [];

    // Add padding for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push(new Date(year, month, i));
    }

    // Group events by date for quick lookup
    const groupedEvents = new Map();
    events.forEach((event) => {
      const dateKey = event.date; // Assumes YYYY-MM-DD format
      if (!groupedEvents.has(dateKey)) {
        groupedEvents.set(dateKey, []);
      }
      groupedEvents.get(dateKey)?.push(event);
    });

    return { calendarGrid: grid, eventsByDate: groupedEvents };
  }, [currentDate, events]);
}
