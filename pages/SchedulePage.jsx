import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { EventType } from '../types';
import { EventModal, CalendarGrid, WeekView, DayView, MobileEventsList, useCalendarState, formatLocalDate } from '../components/schedule';

// Legend items shown under the header
const LEGEND = [
  { type: EventType.Holiday, label: 'Holiday',  color: 'bg-gradient-to-r from-rose-400 to-pink-500',   icon: '🎌' },
  { type: EventType.Meeting, label: 'Meeting',  color: 'bg-gradient-to-r from-blue-400 to-indigo-500', icon: '📋' },
  { type: EventType.Exam,    label: 'Exam',     color: 'bg-gradient-to-r from-amber-400 to-orange-500',icon: '📝' },
  { type: EventType.General, label: 'General',  color: 'bg-gradient-to-r from-slate-400 to-slate-500', icon: '📌' },
];

/**
 * PAGE: SchedulePage
 * DESCRIPTION: Main view for viewing and managing the school schedule calendar.
 */
const SchedulePage = () => {
  // --- STATE & DATA ---
  const { events, addEvent } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);
  const [mobileSelectedDate, setMobileSelectedDate] = useState(formatLocalDate(new Date()));

  // Auto-populate mock demo data if empty
  useEffect(() => {
    if (events.length === 0) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');

      addEvent({ title: 'K1 Midterm Exam', date: `${year}-${month}-23`, type: EventType.Exam, description: 'Midterm examinations for K1.' });
      addEvent({ title: 'Staff Meeting', date: `${year}-${month}-27`, type: EventType.Meeting, description: 'Monthly all-staff planning meeting.' });
      addEvent({ title: 'Public Holiday', date: `${year}-${month}-30`, type: EventType.Holiday, description: 'School closed for public holiday.' });
    }
  }, [events.length, addEvent, currentDate]);

  // --- MEMOIZED DATA ---
  const { calendarGrid, eventsByDate } = useCalendarState(currentDate, events);

  // --- ACTION HANDLERS ---
  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else if (view === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else if (view === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const headerDateText = React.useMemo(() => {
    if (view === 'month') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (view === 'day') {
      return currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (view === 'week') {
      const d = new Date(currentDate);
      const day = d.getDay();
      const start = new Date(d);
      start.setDate(d.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const startMonth = start.toLocaleString('default', { month: 'short' });
      const endMonth = end.toLocaleString('default', { month: 'short' });
      const year = end.getFullYear();
      if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${year}`;
      } else {
        return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
      }
    }
  }, [currentDate, view]);

  const weekStart = React.useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  }, [currentDate]);

  const handleOpenModal = (event = null, dateString = null) => {
    setEditingEvent(event);
    setSelectedDateFilter(dateString);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setSelectedDateFilter(null);
  };

  // Get events for mobile selected date
  const mobileSelectedDateEvents = eventsByDate.get(mobileSelectedDate) || [];

  // --- RENDER ---
  return (
    <div className="container mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">
            School Schedule
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Manage events, holidays, and academic dates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-sm font-semibold shadow-inner border border-slate-200 dark:border-slate-700 gap-0.5 transition-colors">
            {[['month', 'Month'], ['week', 'Week'], ['day', 'Day']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setView(val)}
                className={`px-4 py-1.5 rounded-lg transition-all duration-200 ${
                  view === val
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 active:scale-95"
              aria-label="Previous"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 w-52 text-center transition-colors select-none">
              {headerDateText}
            </h2>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 active:scale-95"
              aria-label="Next"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Add Event Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white px-5 py-2 rounded-xl shadow-lg shadow-primary-200 dark:shadow-primary-900/40 font-bold text-sm transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        </div>
      </div>

      {/* ── Legend Bar ── */}
      <div className="hidden md:flex items-center gap-4 mb-5 flex-wrap">
        {LEGEND.map(({ label, color, icon }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${color} shadow-sm`} />
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide">{icon} {label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-[9px] font-black flex items-center justify-center shadow ring-2 ring-primary-300 dark:ring-primary-700 ring-offset-1 ring-offset-white dark:ring-offset-slate-950">
            {new Date().getDate()}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Today</span>
        </div>
      </div>

      {/* ── Desktop Calendar Views ── */}
      <div className="hidden md:block">
        {view === 'month' && (
          <CalendarGrid
            calendarGrid={calendarGrid}
            eventsByDate={eventsByDate}
            mobileSelectedDate={mobileSelectedDate}
            onSelectDate={setMobileSelectedDate}
            onOpenModal={handleOpenModal}
          />
        )}
        {view === 'week' && (
          <WeekView
            weekStart={weekStart}
            eventsByDate={eventsByDate}
            onOpenModal={handleOpenModal}
            onSelectDate={(date) => {
              setMobileSelectedDate(date);
              setCurrentDate(new Date(date + 'T00:00:00'));
            }}
          />
        )}
        {view === 'day' && (
          <DayView
            selectedDate={formatLocalDate(currentDate)}
            eventsByDate={eventsByDate}
            onOpenModal={handleOpenModal}
          />
        )}
      </div>

      {/* ── Mobile Calendar Grid (Always Month) ── */}
      <div className="md:hidden">
        <CalendarGrid
          calendarGrid={calendarGrid}
          eventsByDate={eventsByDate}
          mobileSelectedDate={mobileSelectedDate}
          onSelectDate={setMobileSelectedDate}
          onOpenModal={handleOpenModal}
        />
      </div>

      {/* ── Mobile Events List ── */}
      <MobileEventsList
        mobileSelectedDate={mobileSelectedDate}
        dayEvents={mobileSelectedDateEvents}
        onOpenModal={handleOpenModal}
        onAddEvent={handleOpenModal}
      />

      {/* ── Event Modal ── */}
      {isModalOpen && <EventModal eventData={editingEvent} selectedDate={selectedDateFilter} onClose={handleCloseModal} />}
    </div>
  );
};

export default SchedulePage;
