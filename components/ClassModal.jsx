import React, { useState, useEffect, useRef, useMemo } from 'react';

import { useData } from '../context/DataContext';

import { useFocusTrap } from '../hooks/useFocusTrap';
import { StaffRole } from '../types';

// ─── STYLES ───────────────────────────────────────────────────────────────────
const inputCls = 'mt-1 w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';
const selectCls = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat";
const labelCls = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1';

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

/**
 * Enhanced Autosuggest component with dropdown results
 */
const Autosuggest = ({ label, value, onChange, suggestions, onSelect, placeholder, renderItem, id }) => {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setIsOpen(e.target.value.length > 0);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      onSelect(suggestions[activeIndex]);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className={labelCls}>{label}</label>
      <div 
        role="combobox" 
        aria-haspopup="listbox" 
        aria-expanded={isOpen} 
        aria-owns={`${id}-listbox`}
      >
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={inputCls}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
        />
      </div>
      {isOpen && (
        <ul 
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-[60] w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {suggestions.length > 0 ? (
            suggestions.map((item, idx) => (
              <li
                key={item.id}
                id={`${id}-option-${idx}`}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseDown={() => { onSelect(item); setIsOpen(false); }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`px-4 py-2.5 cursor-pointer text-sm border-b border-slate-50 dark:border-slate-800 last:border-0 flex items-center justify-between transition-colors ${
                  idx === activeIndex 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {renderItem ? renderItem(item) : item.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-slate-500 dark:text-slate-500 italic text-sm text-center">No matching results</li>
          )}
        </ul>
      )}
    </div>
  );
};

/**
 * Individual student row for the class enrollment table
 */
const StudentRow = ({ student, onRemove }) => (
  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <td className="px-4 py-3 text-xs font-mono text-slate-500">{student.id}</td>
    <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">{student.name}</td>
    <td className="px-4 py-3 text-xs text-slate-500">{student.sex}</td>
    <td className="px-4 py-3 text-xs text-slate-500">{student.phone || 'No phone'}</td>
    <td className="px-4 py-3 text-right">
      <button
        type="button"
        onClick={() => onRemove(student.id)}
        aria-label={`Remove ${student.name} from class`}
        className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
      >
        Remove
      </button>
    </td>
  </tr>
);

// ─── UTILS & HOOKS ────────────────────────────────────────────────────────────

const normalizeRoomName = (name) => (name && /^\d+$/.test(name) ? `Room ${name}` : name);

/**
 * Hook to manage room selection options
 */
const useRoomOptions = (classData) => useMemo(() => {
  const baseRooms = Array.from({ length: 20 }, (_, i) => `Room ${i + 1}`);
  const options = [...baseRooms, 'Library', 'Conference'];
  const currentRoom = normalizeRoomName(classData?.name);
  if (currentRoom && !options.includes(currentRoom)) options.push(currentRoom);
  return options;
}, [classData]);

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

const ClassModal = ({ classData, onClose }) => {
  const modalRef = useFocusTrap(true);
  const isMounted = useRef(true);

  // --- 0. ACCESSIBILITY & TITLE ---
  useEffect(() => {
    document.title = 'Class Management | SchoolAdmin Dashboard';
    return () => { isMounted.current = false; };
  }, []);

  const { staff, students, timeSlots, levels, addClass, updateClass, enrollments, updateClassEnrollments } = useData();

  // --- STATE ---
  const [formData, setFormData] = useState({
    name: '',
    teacherId: '',
    schedule: '',
    level: levels[0] || 'K1',
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherSuggestions, setTeacherSuggestions] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [scheduleType, setScheduleType] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // --- DRAGGING STATE ---
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = (e) => {
    if (e.target.closest('button, select, input')) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      
      // Clamp to viewport boundaries to prevent modal from going off-screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // We assume the modal is centered initially, so pos is an offset from center.
      // For safety, we keep at least 50px visible on all sides.
      const margin = 100;
      const clampedX = Math.max(-viewportWidth / 2 + margin, Math.min(viewportWidth / 2 - margin, newX));
      const clampedY = Math.max(-viewportHeight / 2 + margin, Math.min(viewportHeight / 2 - margin, newY));

      setPos({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const availableTeachers = useMemo(() => staff.filter(s => s.role === StaffRole.Teacher), [staff]);
  const roomOptions = useRoomOptions(classData);
  const availableTimes = useMemo(() => timeSlots.filter(s => s.type === scheduleType).map(s => s.time), [scheduleType, timeSlots]);

  // --- INITIALIZATION (EDIT MODE) ---
  useEffect(() => {
    if (!classData) return;
    
    // Set basic info
    setFormData({
      name: normalizeRoomName(classData.name),
      teacherId: classData.teacherId,
      schedule: classData.schedule,
      level: classData.level,
    });

    // Resolve teacher name
    const teacher = staff.find(t => t.id === classData.teacherId);
    if (teacher) setTeacherSearch(teacher.name);

    // Resolve enrolled students
    const enrolledIds = enrollments.filter(e => e.classId === classData.id).map(e => e.studentId);
    setSelectedStudents(students.filter(s => enrolledIds.includes(s.id)));

    // Parse schedule
    if (classData.schedule) {
      const lower = classData.schedule.toLowerCase();
      const type = lower.includes('weekday') ? 'weekday' : lower.includes('weekend') ? 'weekend' : '';
      setScheduleType(type);
      
      const timeMatch = timeSlots.find(s => s.time && lower.includes(s.time.toLowerCase().replace(/\s/g, '')))?.time;
      setSelectedTime(timeMatch ?? classData.schedule.split(' ').slice(1).join(' '));
    }
  }, [classData, staff, students, timeSlots, enrollments]);

  // Sync schedule string whenever type or time changes
  useEffect(() => {
    if (scheduleType && selectedTime) {
      const label = scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1);
      setFormData(prev => ({ ...prev, schedule: `${label} ${selectedTime}` }));
    }
  }, [scheduleType, selectedTime]);

  // --- HANDLERS ---
  const handleTeacherSearch = (query) => {
    const trimmed = query.trimStart(); // Allow trailing spaces during typing
    setTeacherSearch(trimmed);
    setFormData(prev => ({ ...prev, teacherId: '' }));
    setTeacherSuggestions(trimmed.trim() ? availableTeachers.filter(t => t.name.toLowerCase().includes(trimmed.trim().toLowerCase())) : []);
  };

  const handleStudentSearch = (query) => {
    const trimmed = query.trimStart();
    setStudentSearch(trimmed);
    const selectedIds = new Set(selectedStudents.map(s => s.id));
    setStudentSuggestions(trimmed.trim() ? students.filter(s => !selectedIds.has(s.id) && s.name.toLowerCase().includes(trimmed.trim().toLowerCase())) : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.teacherId || !formData.schedule) {
      return setError('Please complete all required fields (Name, Teacher, and Schedule).');
    }

    setIsSaving(true);
    const studentIds = selectedStudents.map(s => s.id);
    
    try {
      if (classData) {
        await updateClass({ ...classData, ...formData });
        await updateClassEnrollments(classData.id, studentIds);
      } else {
        const id = `class_${Date.now()}`;
        await addClass({ ...formData, id });
        await updateClassEnrollments(id, studentIds);
      }
      if (isMounted.current) onClose();
    } catch (err) {
      if (isMounted.current) setError('Failed to save class. Please try again.');
    } finally {
      if (isMounted.current) setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-md z-50 flex justify-center items-center p-2 sm:p-4">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-modal-title"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 ${isDragging ? 'select-none' : ''}`}
      >
        {/* Header (Draggable) */}
        <div 
          onMouseDown={handleDragStart}
          className="cursor-grab active:cursor-grabbing p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/30"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 id="class-modal-title" className="text-xl font-bold text-slate-800 dark:text-white pointer-events-none">
                {classData ? 'Update Class' : 'Create New Class'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Configure room, teacher, and student enrollment</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="room-name" className={labelCls}>Class Name / Room</label>
              <select id="room-name" name="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className={selectCls} required>
                <option value="" disabled>Select a room</option>
                {roomOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="level-select" className={labelCls}>Academic Level</label>
              <select id="level-select" name="level" value={formData.level} onChange={(e) => setFormData(p => ({ ...p, level: e.target.value }))} className={selectCls}>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <Autosuggest
            id="teacher-autosuggest"
            label="Class Teacher"
            value={teacherSearch}
            onChange={handleTeacherSearch}
            suggestions={teacherSuggestions}
            onSelect={(t) => { setTeacherSearch(t.name); setFormData(p => ({ ...p, teacherId: t.id })); }}
            placeholder="Search by name..."
          />

          {/* Schedule Section */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className={labelCls}>Class Schedule</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-2" role="group" aria-label="Schedule type">
                {['weekday', 'weekend'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setScheduleType(type); setSelectedTime(''); }}
                    aria-pressed={scheduleType === type}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border capitalize ${scheduleType === type ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="relative">
                <label htmlFor="time-slot-select" className="sr-only">Time Slot</label>
                <select 
                  id="time-slot-select"
                  value={selectedTime} 
                  onChange={(e) => setSelectedTime(e.target.value)} 
                  disabled={!scheduleType}
                  className={selectCls}
                >
                  <option value="" disabled>Select time slot</option>
                  {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Enrollment Section */}
          <div className="space-y-4">
            <Autosuggest
              id="student-enroll-autosuggest"
              label="Add Students"
              value={studentSearch}
              onChange={handleStudentSearch}
              suggestions={studentSuggestions}
              onSelect={(s) => { setSelectedStudents(p => [...p, s]); setStudentSearch(''); }}
              placeholder="Search students to enroll..."
              renderItem={(s) => (
                <>
                  <span className="font-bold">{s.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{s.level}</span>
                </>
              )}
            />

            <div className="space-y-2">
              <h4 className={labelCls}>Enrolled Students ({selectedStudents.length})</h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
                <div className="max-h-52 overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                      <tr>
                        {['ID', 'Name', 'Sex', 'Phone', ''].map(h => (
                          <th key={h} scope="col" className="px-4 py-2.5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedStudents.length > 0 ? (
                        selectedStudents.map(s => (
                          <StudentRow key={s.id} student={s} onRemove={(id) => setSelectedStudents(p => p.filter(x => x.id !== id))} />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-sm text-slate-500 italic">No students enrolled yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-rose-500 animate-in fade-in slide-in-from-left-2" role="alert">{error}</p>}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 shrink-0 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isSaving ? 'Processing...' : (classData ? 'Update Class' : 'Create Class')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;
