import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { EventType } from '../types';

// Helper to format Date to YYYY-MM-DD using local time to avoid timezone offsets
const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- 1. MODAL COMPONENT ---
/**
 * COMPONENT: EventModal
 * DESCRIPTION: Inlined modal for adding or editing events.
 */
const EventModal = ({ eventData, selectedDate, onClose }) => {
    // --- 1.1. MODAL STATE & DATA ---
    const { addEvent, updateEvent, deleteEvent } = useData();
    const [formData, setFormData] = useState({
        title: '',
        date: selectedDate || formatLocalDate(new Date()),
        type: EventType.General,
        description: '',
    });
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (eventData) {
            setFormData({
                title: eventData.title,
                date: eventData.date,
                type: eventData.type,
                description: eventData.description,
            });
        }
    }, [eventData]);

    // --- 1.2. MODAL ACTION HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!formData.title || !formData.date || !formData.description) {
            setError('Please fill in all fields.');
            return;
        }

        if (eventData) {
            updateEvent({ ...eventData, ...formData });
        } else {
            addEvent(formData);
        }
        onClose();
    };

    const handleDelete = () => {
        if (eventData) {
            deleteEvent(eventData.id);
            onClose();
        }
    };

    const labelClasses = "block text-sm font-semibold text-primary-900 mb-1";
    const inputClasses = "w-full px-3 py-2 bg-white border border-gray-400 rounded-md text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";

    // --- 1.3. MODAL RENDER LOGIC ---
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-lg max-h-[95vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{eventData ? 'Edit Event' : 'Add New Event'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className={labelClasses}>Event Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className={labelClasses}>Date</label>
                            <input
                                type="date"
                                name="date"
                                id="date"
                                value={formData.date}
                                onChange={handleChange}
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="type" className={labelClasses}>Event Type</label>
                            <select name="type" id="type" value={formData.type} onChange={handleChange} className={inputClasses}>
                                {Object.values(EventType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className={labelClasses}>Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className={inputClasses} required />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-bold transition-all order-2 sm:order-1">Close</button>
                            {!isDeleting && (
                                <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg shadow-primary-100 transition-all order-1 sm:order-2">
                                    {eventData ? 'Save Changes' : 'Add Event'}
                                </button>
                            )}
                        </div>
                        <div className="flex justify-start sm:justify-end">
                            {eventData && (
                                isDeleting ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100 w-full sm:w-auto">
                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest whitespace-nowrap">Confirm Delete?</span>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setIsDeleting(false)} className="px-3 py-1 bg-white text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold">No</button>
                                            <button type="button" onClick={handleDelete} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-bold shadow-sm">Yes, Delete</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setIsDeleting(true)} className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 font-bold transition-all text-sm">
                                        Delete Event
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- 2. MAIN PAGE COMPONENT ---
/**
 * PAGE: SchedulePage
 * DESCRIPTION: Main view for viewing and managing the school schedule calendar.
 */
const SchedulePage = () => {
    // --- 2.1. STATE & DATA ---
    const { events, addEvent } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDateFilter, setSelectedDateFilter] = useState(null);

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

    const eventTypeClasses = {
        [EventType.Holiday]: 'bg-red-500 hover:bg-red-600',
        [EventType.Meeting]: 'bg-blue-500 hover:bg-blue-600',
        [EventType.Exam]: 'bg-yellow-500 hover:bg-yellow-600',
        [EventType.General]: 'bg-gray-500 hover:bg-gray-600',
    };

    // --- 2.2. ACTION HANDLERS ---
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

    // --- 2.3. MEMOIZED CALENDAR DATA ---
    const { calendarGrid, eventsByDate } = useMemo(() => {
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
        events.forEach(event => {
            const dateKey = event.date; // Assumes YYYY-MM-DD format
            if (!groupedEvents.has(dateKey)) {
                groupedEvents.set(dateKey, []);
            }
            groupedEvents.get(dateKey)?.push(event);
        });

        return { calendarGrid: grid, eventsByDate: groupedEvents };

    }, [currentDate, events]);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- 2.4. RENDER LOGIC ---
    return (
        <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">School Schedule</h1>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="hidden md:flex bg-slate-100 p-1 rounded-lg text-sm font-medium mr-4 shadow-inner">
                        <button className="px-3 py-1.5 bg-white text-slate-800 rounded-md shadow-sm">Month</button>
                        <button className="px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">Week</button>
                        <button className="px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">Day</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200" aria-label="Previous month">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <h2 className="text-xl font-semibold text-gray-700 w-40 text-center">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200" aria-label="Next month">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 font-bold"
                    >
                        Add New Event
                    </button>
                </div>
            </div>

            <div className="bg-white p-2 sm:p-4 rounded-xl shadow-sm border border-slate-200 overflow-x-auto scrollbar-hide">
                <div className="min-w-[800px] md:min-w-0">
                    <div className="grid grid-cols-7 gap-px rounded-t-lg overflow-hidden border-b border-slate-100">
                        {weekdays.map(day => (
                            <div key={day} className="text-center font-bold text-slate-700 bg-slate-50/50 py-3 uppercase tracking-wider text-[11px]">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-px">
                        {calendarGrid.map((day, index) => {
                            const isToday = day && day.getTime() === today.getTime();
                            const dateKey = day ? formatLocalDate(day) : '';
                            const dayEvents = day ? (eventsByDate.get(dateKey) || []) : [];

                            return (
                                <div 
                                    key={index} 
                                    className={`relative min-h-[90px] sm:min-h-[120px] bg-white border-r border-b border-slate-100 p-1.5 sm:p-2 ${day ? 'cursor-pointer hover:bg-slate-50 transition-colors group' : 'bg-slate-50/20'}`}
                                    onClick={() => day && handleOpenModal(null, dateKey)}
                                >
                                    {day && (
                                        <>
                                            <span className={`absolute top-1.5 right-1.5 text-xs sm:text-sm font-semibold transition-colors ${isToday ? 'bg-primary-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-md' : 'text-slate-400 group-hover:text-primary-600'}`}>
                                                {day.getDate()}
                                            </span>
                                            <div className="mt-7 sm:mt-8 space-y-1">
                                                {dayEvents.map(event => (
                                                    <button
                                                        key={event.id}
                                                        onClick={(e) => { e.stopPropagation(); handleOpenModal(event); }}
                                                        className={`w-full text-left text-white text-[10px] sm:text-[11px] font-bold py-1 px-1.5 rounded truncate transition-colors shadow-sm hover:shadow active:scale-95 ${eventTypeClasses[event.type]}`}
                                                        title={event.title}
                                                    >
                                                        {event.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {isModalOpen && <EventModal eventData={editingEvent} selectedDate={selectedDateFilter} onClose={handleCloseModal} />}
        </div>
    );
};

export default SchedulePage;