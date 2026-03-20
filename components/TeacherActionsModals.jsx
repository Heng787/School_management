import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { AttendanceStatus } from '../types';
import { gradeId } from '../services/mappers';


export const AttendanceModal = ({ classData, students, onClose }) => {
    const { attendance, saveAttendanceBatch } = useData();
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Map of studentId -> AttendanceStatus
    const [statusMap, setStatusMap] = useState({});

    // Read existing attendance for this date AND class
    useEffect(() => {
        const existingForDate = attendance.filter(a => a.date === date && (a.classId === classData.id || !a.classId));
        const newMap = {};

        // Initialize with default 'Present' for everyone in the class
        students.forEach(s => {
            newMap[s.id] = AttendanceStatus.Present;
        });

        // Override with existing records if they exist
        students.forEach(s => {
            const existing = existingForDate.find(a => a.studentId === s.id);
            if (existing) {
                newMap[s.id] = existing.status;
            }
        });

        setStatusMap(newMap);
    }, [date, students, attendance, classData.id]);

    const handleStatusChange = (studentId, status) => {
        setStatusMap(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        const recordsToSave = students.map(s => {
            return {
                id: `att_${classData.id}_${date}_${s.id}`,
                studentId: s.id,
                date,
                status: statusMap[s.id] || AttendanceStatus.Present,
            };
        });

        await saveAttendanceBatch(recordsToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Attendance</h2>
                        <p className="text-sm text-slate-500">{classData.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        {students.map(student => (
                            <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                                <span className="font-medium text-slate-800 mb-2 sm:mb-0">{student.name}</span>
                                <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200">
                                    {(Object.values(AttendanceStatus)).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(student.id, status)}
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${statusMap[student.id] === status
                                                    ? status === AttendanceStatus.Present ? 'bg-emerald-500 text-white' :
                                                        status === AttendanceStatus.Late ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                                    : 'text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {students.length === 0 && (
                            <p className="text-center text-slate-500 py-4">No students enrolled in this class.</p>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm">
                        Save Attendance
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GradesModal = ({ classData, students, onClose }) => {
    const { grades, subjects, saveGradeBatch } = useData();
    const [term, setTerm] = useState('Midterm');

    // Map of studentId -> { subject: score }
    const [scoreMap, setScoreMap] = useState({});

    // Read existing grades for all subjects and this term
    useEffect(() => {
        const existingGrades = grades.filter(g => g.term === term && g.classId === classData.id);
        const newMap = {};

        students.forEach(s => {
            newMap[s.id] = {};
            subjects.forEach(sub => {
                const existing = existingGrades.find(g => g.studentId === s.id && g.subject === sub);
                newMap[s.id][sub] = existing ? existing.score : "";
            });
        });

        setScoreMap(newMap);
    }, [term, students, grades, subjects, classData.id]);

    const handleScoreChange = (studentId, subject, val) => {
        setScoreMap(prev => {
            const next = { ...prev };
            if (!next[studentId]) next[studentId] = {};

            if (val === "") {
                next[studentId][subject] = "";
                return next;
            }

            let strVal = val;
            let num = parseFloat(strVal);

            if (num < 0) {
                strVal = "0";
            } else if (num > 10) {
                // Auto-inject decimal for two-digit numbers (e.g. "55" -> "5.5")
                if (!strVal.includes('.') && strVal.length === 2) {
                    strVal = `${strVal[0]}.${strVal[1]}`;
                } else if (!strVal.includes('.') && strVal.length === 3 && strVal.startsWith("10")) {
                    strVal = "10";
                } else {
                    strVal = "10";
                }
            }

            next[studentId][subject] = strVal;
            return next;
        });
    };

    const handleSave = () => {
        const existingGrades = grades.filter(g => g.term === term && g.classId === classData.id);
        const recordsToSave = [];

        students.forEach(s => {
            subjects.forEach(subject => {
                const rawScore = scoreMap[s.id]?.[subject];
                if (rawScore !== undefined && rawScore !== "") {
                    const score = Number(rawScore);
                    const existing = existingGrades.find(g => g.studentId === s.id && g.subject === subject);
                    const newId = existing ? existing.id : gradeId(classData.id, s.id, subject, term);
                    recordsToSave.push({
                        id: newId,
                        studentId: s.id,
                        classId: classData.id,
                        subject: subject,
                        score: score,
                        term
                    });
                }
            });
        });

        // Close the modal immediately — then save in the background.
        // This prevents a React re-render race where saveGradeBatch() triggering
        // setGrades() would re-initialize the modal's useEffect before onClose() ran.
        onClose();

        if (recordsToSave.length > 0) {
            saveGradeBatch(recordsToSave).catch(err => {
                console.error('Grade save failed:', err);
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Grades</h2>
                        <p className="text-sm text-slate-500">{classData.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term:</label>
                            <select
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                            >
                                <option value="Midterm">Midterm</option>
                                <option value="Finals">Finals</option>
                                <option value="Q1">Quarter 1</option>
                                <option value="Q2">Quarter 2</option>
                                <option value="Q3">Quarter 3</option>
                                <option value="Q4">Quarter 4</option>
                            </select>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="overflow-auto flex-1 bg-white relative">
                    <div className="min-w-full inline-block align-middle">
                        {/* Horizontal Scroll Indicator for Mobile */}
                        <div className="sm:hidden absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-20"></div>
                        
                        <table className="min-w-full divide-y divide-slate-100 table-fixed border-separate border-spacing-0">
                            <thead className="bg-slate-50 sticky top-0 z-30 shadow-sm">
                                <tr>
                                    <th className="w-40 sm:w-64 px-4 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-100 bg-slate-50 sticky left-0 z-40">Student Name</th>
                                    {subjects.map(subject => (
                                        <th key={subject} className="px-2 sm:px-4 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[80px] sm:min-w-[120px]">
                                            {subject}
                                        </th>
                                    ))}
                                    <th className="w-20 sm:w-24 px-4 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider border-l border-slate-100 bg-slate-50">Avg</th>
                                </tr>
                            </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {students.map(student => {
                                const scores = subjects.map(sub => parseFloat(scoreMap[student.id]?.[sub])).filter(n => !isNaN(n));
                                const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0';

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap bg-white border-r border-slate-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center">
                                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs mr-2 sm:mr-3 bg-gradient-to-br from-indigo-100 to-blue-100 text-blue-700 shadow-inner shrink-0">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[80px] sm:max-w-none">{student.name}</p>
                                                    <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 hidden sm:block">ID: {student.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {subjects.map(subject => (
                                            <td key={subject} className="px-1 sm:px-2 py-2 sm:py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    placeholder="0.0"
                                                    name={`score-${student.id}-${subject}`}
                                                    autoComplete="off"
                                                    value={scoreMap[student.id]?.[subject] ?? ''}
                                                    onChange={(e) => handleScoreChange(student.id, subject, e.target.value)}
                                                    className={`w-full text-center py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-bold transition-all focus:ring-2 focus:ring-primary-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none 
                                                        ${parseFloat(scoreMap[student.id]?.[subject]) >= 9.0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                                            parseFloat(scoreMap[student.id]?.[subject]) < 5.0 ? 'text-red-600 bg-red-50 border-red-100' :
                                                                scoreMap[student.id]?.[subject] !== "" ? 'text-slate-700 bg-white border-slate-200 hover:border-slate-300' :
                                                                    'text-slate-400 bg-slate-50 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                />
                                            </td>
                                        ))}
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-bold border-l border-slate-100 bg-slate-50/30">
                                            <span className={`${parseFloat(avg) >= 9.0 ? 'text-emerald-600' : parseFloat(avg) < 5.0 && parseFloat(avg) > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                {avg}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={subjects.length + 2} className="px-6 py-12 text-center text-slate-400 bg-slate-50 italic">
                                        No students enrolled in this class.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm">
                        Save All Grades
                    </button>
                </div>
            </div>
        </div>
    );
};
