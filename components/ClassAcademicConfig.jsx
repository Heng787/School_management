
import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export const LevelManager = () => {
    const { levels, addLevel, updateLevel, deleteLevel } = useData();
    const [newLevel, setNewLevel] = useState('');
    const [editingLevel, setEditingLevel] = useState(null);
    const [editedValue, setEditedValue] = useState('');
    const [error, setError] = useState('');
    const [deletingLevel, setDeletingLevel] = useState(null);

    const handleAddLevel = () => {
        setError('');
        if (!newLevel.trim()) {
            setError('Level name cannot be empty.');
            return;
        }
        if (levels.find(l => l.toLowerCase() === newLevel.trim().toLowerCase())) {
            setError('This level already exists.');
            return;
        }
        addLevel(newLevel.trim());
        setNewLevel('');
    };

    const handleStartEdit = (level) => {
        setEditingLevel(level);
        setEditedValue(level);
        setError('');
    };

    const handleCancelEdit = () => {
        setEditingLevel(null);
        setEditedValue('');
    };

    const handleUpdateLevel = () => {
        setError('');
        if (!editedValue.trim()) {
            setError('Level name cannot be empty.');
            return;
        }
        if (levels.find(l => l.toLowerCase() === editedValue.trim().toLowerCase()) && editedValue.trim().toLowerCase() !== editingLevel?.toLowerCase()) {
            setError('This level already exists.');
            return;
        }
        if (editingLevel) {
            updateLevel(editingLevel, editedValue.trim());
        }
        handleCancelEdit();
    };

    const handleDeleteLevel = (level) => {
        deleteLevel(level);
        setDeletingLevel(null);
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Levels</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Manage academic grades</p>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value)}
                        placeholder="e.g., K1"
                        className="flex-grow px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                    />
                    <button onClick={handleAddLevel} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shrink-0 text-xs font-bold">
                        Add
                    </button>
                </div>
                {error && <p className="text-[10px] text-rose-500 font-medium">{error}</p>}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-48 scrollbar-thin">
                {levels.length > 0 ? levels.map(level => (
                    <div key={level} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 group transition-colors">
                        {editingLevel === level ? (
                            <input
                                type="text"
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                className="flex-grow px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-emerald-500 rounded-md text-black dark:text-white"
                                autoFocus
                            />
                        ) : (
                            <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{level}</span>
                        )}
                        <div className="flex items-center gap-1">
                            {editingLevel === level ? (
                                <>
                                    <button onClick={handleUpdateLevel} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </button>
                                    <button onClick={handleCancelEdit} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleStartEdit(level)} className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    {deletingLevel === level ? (
                                        <div className="flex items-center gap-1 animate-in slide-in-from-right-1 duration-200">
                                            <button onClick={() => handleDeleteLevel(level)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button onClick={() => setDeletingLevel(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeletingLevel(level)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-6">
                        <p className="text-[10px] text-slate-400 font-medium italic">No levels defined</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const SessionManager = () => {
    const { timeSlots, addTimeSlot, updateTimeSlot, deleteTimeSlot } = useData();
    const [newTime, setNewTime] = useState('');
    const [newType, setNewType] = useState('weekday');
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editedTime, setEditedTime] = useState('');
    const [editedType, setEditedType] = useState('weekday');
    const [error, setError] = useState('');
    const [deletingSessionId, setDeletingSessionId] = useState(null);

    const handleAdd = () => {
        setError('');
        if (!newTime.trim()) {
            setError('Time slot name cannot be empty.');
            return;
        }
        addTimeSlot({ time: newTime.trim(), type: newType });
        setNewTime('');
    };

    const handleStartEdit = (slot) => {
        setEditingSessionId(slot.id);
        setEditedTime(slot.time);
        setEditedType(slot.type);
        setError('');
    };

    const handleCancelEdit = () => {
        setEditingSessionId(null);
        setEditedTime('');
        setEditedType('weekday');
    };

    const handleUpdate = () => {
        setError('');
        if (!editedTime.trim()) {
            setError('Time slot name cannot be empty.');
            return;
        }
        if (editingSessionId) {
            updateTimeSlot(editingSessionId, { time: editedTime.trim(), type: editedType });
        }
        handleCancelEdit();
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Sessions</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Define school time slots</p>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        placeholder="e.g., 8:00-10:00 AM"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                    />
                    <div className="flex gap-2">
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            className="flex-grow px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-black dark:text-white transition-all"
                        >
                            <option value="weekday">Weekday</option>
                            <option value="weekend">Weekend</option>
                        </select>
                        <button onClick={handleAdd} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shrink-0 text-xs font-bold">
                            Add Session
                        </button>
                    </div>
                </div>
                {error && <p className="text-[10px] text-rose-500 font-medium">{error}</p>}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-48 scrollbar-thin">
                {timeSlots.length > 0 ? timeSlots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 group transition-colors">
                        {editingSessionId === slot.id ? (
                            <div className="flex flex-col gap-1 w-full mr-2">
                                <input
                                    type="text"
                                    value={editedTime}
                                    onChange={(e) => setEditedTime(e.target.value)}
                                    className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-950 border border-indigo-500 rounded-md text-black dark:text-white"
                                    autoFocus
                                />
                                <select
                                    value={editedType}
                                    onChange={(e) => setEditedType(e.target.value)}
                                    className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-950 border border-indigo-500 rounded-md text-black dark:text-white"
                                >
                                    <option value="weekday">Weekday</option>
                                    <option value="weekend">Weekend</option>
                                </select>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{slot.time}</span>
                                <span className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">{slot.type}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {editingSessionId === slot.id ? (
                                <>
                                    <button onClick={handleUpdate} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </button>
                                    <button onClick={handleCancelEdit} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleStartEdit(slot)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    {deletingSessionId === slot.id ? (
                                        <div className="flex items-center gap-1 animate-in slide-in-from-right-1 duration-200">
                                            <button onClick={() => { deleteTimeSlot(slot.id); setDeletingSessionId(null); }} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button onClick={() => setDeletingSessionId(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeletingSessionId(slot.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-6">
                        <p className="text-[10px] text-slate-400 font-medium italic">No sessions defined</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const SubjectManager = () => {
    const { subjects, addSubject, updateSubject, deleteSubject } = useData();
    const [newSubject, setNewSubject] = useState('');
    const [editingSubject, setEditingSubject] = useState(null);
    const [editedValue, setEditedValue] = useState('');
    const [error, setError] = useState('');
    const [deletingSubject, setDeletingSubject] = useState(null);

    const handleAddSubject = () => {
        setError('');
        if (!newSubject.trim()) {
            setError('Subject name cannot be empty.');
            return;
        }
        if (subjects.find(s => s.toLowerCase() === newSubject.trim().toLowerCase())) {
            setError('This subject already exists.');
            return;
        }
        addSubject(newSubject.trim());
        setNewSubject('');
    };

    const handleStartEdit = (subject) => {
        setEditingSubject(subject);
        setEditedValue(subject);
        setError('');
    };

    const handleCancelEdit = () => {
        setEditingSubject(null);
        setEditedValue('');
    };

    const handleUpdateSubject = () => {
        setError('');
        if (!editedValue.trim()) {
            setError('Subject name cannot be empty.');
            return;
        }
        if (subjects.find(s => s.toLowerCase() === editedValue.trim().toLowerCase()) && editedValue.trim().toLowerCase() !== editingSubject?.toLowerCase()) {
            setError('This subject already exists.');
            return;
        }
        if (editingSubject) {
            updateSubject(editingSubject, editedValue.trim());
        }
        handleCancelEdit();
    };

    const handleDeleteSubject = (subject) => {
        deleteSubject(subject);
        setDeletingSubject(null);
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Subjects</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Academic courses</p>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="e.g. History"
                        className="flex-grow px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                    />
                    <button onClick={handleAddSubject} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shrink-0 text-xs font-bold">
                        Add
                    </button>
                </div>
                {error && <p className="text-[10px] text-rose-500 font-medium">{error}</p>}
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-48 scrollbar-thin">
                {subjects.length > 0 ? subjects.map(subject => (
                    <div key={subject} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 group transition-colors">
                        {editingSubject === subject ? (
                            <input
                                type="text"
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                className="flex-grow px-2 py-1 text-xs bg-white dark:bg-slate-950 border border-blue-500 rounded-md text-black dark:text-white"
                                autoFocus
                            />
                        ) : (
                            <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{subject}</span>
                        )}
                        <div className="flex items-center gap-1">
                            {editingSubject === subject ? (
                                <>
                                    <button onClick={handleUpdateSubject} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </button>
                                    <button onClick={handleCancelEdit} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handleStartEdit(subject)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    {deletingSubject === subject ? (
                                        <div className="flex items-center gap-1 animate-in slide-in-from-right-1 duration-200">
                                            <button onClick={() => handleDeleteSubject(subject)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-md">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                            <button onClick={() => setDeletingSubject(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded-md">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeletingSubject(subject)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-6">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">No subjects defined</p>
                    </div>
                )}
            </div>
        </div>
    );
};
