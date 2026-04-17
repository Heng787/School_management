import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { EventType } from "../../types";

/**
 * COMPONENT: EventModal
 * DESCRIPTION: Modal for adding or editing events.
 */
const EventModal = ({ eventData, selectedDate, onClose }) => {
  // --- STATE & DATA ---
  const { addEvent, updateEvent, deleteEvent } = useData();
  const [formData, setFormData] = useState({
    title: "",
    date: selectedDate || new Date().toISOString().split("T")[0],
    type: EventType.General,
    description: "",
  });
  const [error, setError] = useState("");
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

  // --- ACTION HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!formData.title || !formData.date || !formData.description) {
      setError("Please fill in all fields.");
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

  const labelClasses = "block text-sm font-semibold text-primary-900 dark:text-slate-200 mb-1 transition-colors";
  const inputClasses =
    "w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-400 dark:border-slate-800 rounded-md text-black dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";

  // --- RENDER ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-4 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-5 sm:p-8 w-full max-w-lg max-h-[95vh] overflow-y-auto transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 transition-colors">
          {eventData ? "Edit Event" : "Add New Event"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className={labelClasses}>
              Event Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className={labelClasses}>
                Date
              </label>
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
              <label htmlFor="type" className={labelClasses}>
                Event Type
              </label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleChange}
                className={inputClasses}
              >
                {Object.values(EventType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className={labelClasses}>
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={inputClasses}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 transition-colors">{error}</p>}

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-all order-2 sm:order-1"
              >
                Close
              </button>
              {!isDeleting && (
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-lg shadow-primary-100 dark:shadow-none transition-all order-1 sm:order-2"
                >
                  {eventData ? "Save Changes" : "Add Event"}
                </button>
              )}
            </div>
            <div className="flex justify-start sm:justify-end">
              {eventData &&
                (isDeleting ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30 w-full sm:w-auto transition-colors">
                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest whitespace-nowrap">
                      Confirm Delete?
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDeleting(false)}
                        className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-bold shadow-sm"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 font-bold transition-all text-sm"
                  >
                    Delete Event
                  </button>
                ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
