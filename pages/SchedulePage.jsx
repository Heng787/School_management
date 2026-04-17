import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { EventType } from '../types';
import { EventModal, CalendarGrid, MobileEventsList, useCalendarState, formatLocalDate } from '../components/schedule';

/**
 * PAGE: SchedulePage
 * DESCRIPTION: Main view for viewing and managing the school schedule calendar.
 */
const SchedulePage = () => {
  // --- STATE & DATA ---
  const { events, addEvent } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
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
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight transition-colors">School Schedule</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-sm font-medium mr-4 shadow-inner transition-colors">
            <button className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-md shadow-sm transition-colors">Month</button>
            <button className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors">Week</button>
            <button className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors">Day</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors" aria-label="Previous month">
              <svg className="w-6 h-6 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 w-48 text-center transition-colors">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors" aria-label="Next month">
              <svg className="w-6 h-6 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 dark:shadow-none font-bold"
          >
            Add New Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        calendarGrid={calendarGrid}
        eventsByDate={eventsByDate}
        mobileSelectedDate={mobileSelectedDate}
        onSelectDate={setMobileSelectedDate}
        onOpenModal={handleOpenModal}
      />

      {/* Mobile Events List */}
      <MobileEventsList
        mobileSelectedDate={mobileSelectedDate}
        dayEvents={mobileSelectedDateEvents}
        onOpenModal={handleOpenModal}
        onAddEvent={handleOpenModal}
      />

      {/* Event Modal */}
      {isModalOpen && <EventModal eventData={editingEvent} selectedDate={selectedDateFilter} onClose={handleCloseModal} />}
    </div>
  );
};

export default SchedulePage;
