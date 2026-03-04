
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Class, StaffRole, Staff, Student } from '../types';

interface ClassModalProps {
    classData: Class | null;
    onClose: () => void;
}

const ClassModal: React.FC<ClassModalProps> = ({ classData, onClose }) => {
    const { staff, students, timeSlots, levels, addClass, updateClass, enrollments, updateClassEnrollments } = useData();
    const [formData, setFormData] = useState({
        name: '',
        teacherId: '',
        schedule: '',
        level: levels[0] || 'K1',
    });
    const [error, setError] = useState('');

    // --- State for Autosuggest ---
    const [teacherSearch, setTeacherSearch] = useState('');
    const [teacherSuggestions, setTeacherSuggestions] = useState<Staff[]>([]);
    const [isTeacherSuggestionsOpen, setIsTeacherSuggestionsOpen] = useState(false);

    const [studentSearch, setStudentSearch] = useState('');
    const [studentSuggestions, setStudentSuggestions] = useState<Student[]>([]);
    const [isStudentSuggestionsOpen, setIsStudentSuggestionsOpen] = useState(false);
    
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

    // --- State for dynamic Schedule UI ---
    const [scheduleType, setScheduleType] = useState<'weekday' | 'weekend' | ''>('');
    const [selectedTime, setSelectedTime] = useState('');

    const teacherRef = useRef<HTMLDivElement>(null);
    const studentRef = useRef<HTMLDivElement>(null);
    
    const availableTeachers = staff.filter(s => s.role === StaffRole.Teacher);

    // Room options generation
    const roomOptions = useMemo(() => {
        const rooms = Array.from({ length: 15 }, (_, i) => `Room ${i + 1}`);
        return [...rooms, 'Library', 'Conference'];
    }, []);

    // --- Effects ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (teacherRef.current && !teacherRef.current.contains(event.target as Node)) {
                setIsTeacherSuggestionsOpen(false);
            }
            if (studentRef.current && !studentRef.current.contains(event.target as Node)) {
                setIsStudentSuggestionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Effect to pre-fill form when editing a class
    useEffect(() => {
        if (classData) {
            setFormData({
                name: classData.name,
                teacherId: classData.teacherId,
                schedule: classData.schedule,
                level: classData.level,
            });
            const teacher = staff.find(t => t.id === classData.teacherId);
            if (teacher) setTeacherSearch(teacher.name);

            const classEnrollments = enrollments.filter(e => e.classId === classData.id);
            const studentIds = classEnrollments.map(e => e.studentId);
            const sStudents = students.filter(s => studentIds.includes(s.id));
            setSelectedStudents(sStudents);

            // Pre-fill schedule selector UI from strings
            if (classData.schedule) {
                const scheduleLower = classData.schedule.toLowerCase();
                
                // Identify type
                if (scheduleLower.includes('weekday')) setScheduleType('weekday');
                else if (scheduleLower.includes('weekend')) setScheduleType('weekend');

                // Try to find matching time slot string
                const timePart = timeSlots.find(s => scheduleLower.includes(s.time.toLowerCase().replace(/\s/g, '')))?.time;
                if (timePart) setSelectedTime(timePart);
                else {
                    // Fallback for custom strings
                    const parts = classData.schedule.split(' ');
                    if (parts.length > 1) setSelectedTime(parts.slice(1).join(' '));
                }
            }
        }
    }, [classData, staff, students, timeSlots]);
    
    // Update formData.schedule whenever UI selections change
    useEffect(() => {
        if (scheduleType && selectedTime) {
            const scheduleLabel = scheduleType === 'weekday' ? 'Weekday' : 'Weekend';
            setFormData(prev => ({ ...prev, schedule: `${scheduleLabel} ${selectedTime}` }));
        }
    }, [scheduleType, selectedTime]);


    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'level') {
            setFormData(prev => ({ ...prev, [name]: value }));
            setStudentSearch('');
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTeacherSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setTeacherSearch(query);
        setFormData(prev => ({ ...prev, teacherId: '' }));
        if (query.length > 0) {
            setTeacherSuggestions(availableTeachers.filter(t => t.name.toLowerCase().includes(query.toLowerCase())));
            setIsTeacherSuggestionsOpen(true);
        } else {
            setIsTeacherSuggestionsOpen(false);
        }
    };

    const selectTeacher = (teacher: Staff) => {
        setTeacherSearch(teacher.name);
        setFormData(prev => ({ ...prev, teacherId: teacher.id }));
        setIsTeacherSuggestionsOpen(false);
    };

    const handleStudentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setStudentSearch(query);
        if (query.length > 0) {
            const alreadySelectedIds = new Set(selectedStudents.map(s => s.id));
            setStudentSuggestions(
                students.filter(s =>
                    !alreadySelectedIds.has(s.id) &&
                    s.name.toLowerCase().includes(query.toLowerCase())
                )
            );
            setIsStudentSuggestionsOpen(true);
        } else {
            setIsStudentSuggestionsOpen(false);
        }
    };

    const selectStudent = (student: Student) => {
        setSelectedStudents(prev => [...prev, student]);
        setStudentSearch('');
        setIsStudentSuggestionsOpen(false);
    };

    const removeStudent = (studentId: string) => {
        setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.teacherId || !formData.schedule) {
            setError('Please complete Class Name, Teacher, and Schedule fields.');
            return;
        }

        const studentIds = selectedStudents.map(s => s.id);

        if (classData) {
            await updateClass({ ...classData, ...formData });
            await updateClassEnrollments(classData.id, studentIds);
        } else {
            const newClassId = `class_${Date.now()}`;
            await addClass({ ...formData, id: newClassId } as Class);
            await updateClassEnrollments(newClassId, studentIds);
        }
        onClose();
    };

    // --- Schedule UI Logic ---
    const handleScheduleTypeChange = (type: 'weekday' | 'weekend') => {
        if (scheduleType !== type) {
            setScheduleType(type);
            setSelectedTime(''); // Reset time when type changes
        } else {
            setScheduleType(''); // Allow deselecting
            setSelectedTime('');
        }
    };
    
    const availableTimes = useMemo(() => {
        return timeSlots.filter(slot => slot.type === scheduleType).map(s => s.time);
    }, [scheduleType, timeSlots]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{classData ? 'Edit Class' : 'Add New Class'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-primary-900">Class Name / Room</label>
                        <select 
                            name="name" 
                            id="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-black" 
                            required
                        >
                            <option value="" disabled>Select a room/location</option>
                            {roomOptions.map(room => (
                                <option key={room} value={room}>{room}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="level" className="block text-sm font-medium text-primary-900">Level</label>
                            <select name="level" id="level" value={formData.level} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white border border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-black">
                                {levels.map((level: string) => (<option key={level} value={level}>{level}</option>))}
                            </select>
                        </div>
                        <div ref={teacherRef} className="relative">
                            <label htmlFor="teacherId" className="block text-sm font-medium text-primary-900">Teacher</label>
                            <input type="text" name="teacherId" id="teacherId" value={teacherSearch} onChange={handleTeacherSearchChange} className="mt-1 w-full px-3 py-2 bg-white border border-gray-400 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Type to search..." autoComplete="off" required={!formData.teacherId} />
                            {isTeacherSuggestionsOpen && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {teacherSuggestions.length > 0 ? (
                                        teacherSuggestions.map(teacher => (
                                            <li key={teacher.id} onClick={() => selectTeacher(teacher)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black">{teacher.name}</li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-gray-500 italic">No teachers found</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="block text-sm font-medium text-primary-900">Schedule</p>
                        <div className="p-3 bg-gray-50 rounded-md border space-y-3">
                            <div>
                                <h4 className="text-sm font-medium text-primary-900 mb-2">Days</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleScheduleTypeChange('weekday')}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${scheduleType === 'weekday' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        Weekday
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleScheduleTypeChange('weekend')}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${scheduleType === 'weekend' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        Weekend
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="timeSlot" className="text-sm font-medium text-primary-900 mb-2 block">Time Slot</label>
                                <select id="timeSlot" name="timeSlot" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} disabled={!scheduleType}
                                    className="block w-full pl-3 pr-10 py-2 text-base bg-white border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-black disabled:bg-gray-100 disabled:cursor-not-allowed">
                                    <option value="" disabled>Select a time slot</option>
                                    {availableTimes.map(time => (<option key={time} value={time}>{time}</option>))}
                                </select>
                            </div>
                        </div>
                        <input type="hidden" name="schedule" value={formData.schedule} required />
                    </div>


                    <div ref={studentRef} className="relative">
                        <label htmlFor="studentSearch" className="block text-sm font-medium text-primary-900">Add Students</label>
                        <input type="text" name="studentSearch" id="studentSearch" value={studentSearch} onChange={handleStudentSearchChange} className="mt-1 w-full px-3 py-2 bg-white border border-gray-400 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Type student name to add..." autoComplete="off" />
                        {isStudentSuggestionsOpen && (
                             <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                {studentSuggestions.length > 0 ? (
                                    studentSuggestions.map(student => (
                                        <li key={student.id} onClick={() => selectStudent(student)} className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black flex justify-between items-center">
                                            <span>{student.name}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">{student.level}</span>
                                        </li>
                                    ))
                                 ) : (
                                    <li className="px-4 py-2 text-gray-500 italic">No matching students found</li>
                                )}
                            </ul>
                        )}
                         <p className="mt-1 text-xs text-gray-500">Search for any student to add to this class.</p>
                    </div>
                     
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-primary-900 mb-2">
                            Students in Class ({selectedStudents.length})
                        </h4>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="max-h-60 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sex</th>
                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                            <th scope="col" className="relative px-4 py-2">
                                                <span className="sr-only">Remove</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedStudents.length > 0 ? selectedStudents.map(student => (
                                            <tr key={student.id}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{student.id}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{student.sex}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStudent(student.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4 text-sm text-gray-500">No students added yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    
                    <div className="flex justify-end pt-4 space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">{classData ? 'Update Class' : 'Create Class'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassModal;
