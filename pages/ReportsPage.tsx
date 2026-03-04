
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Student, Class, Page } from '../types';
import { generateStudentProgressCSV, ExportColumnConfig } from '../utils/reportGenerator';

// --- Sub-components ---

const MarksEntry: React.FC = () => {
    const { students, classes, subjects, loading, grades, addGrade, updateGrade, enrollments } = useData();
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [localGrades, setLocalGrades] = useState<Record<string, Record<string, number | string>>>({});
    const [modifiedStudents, setModifiedStudents] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);
    
    const classStudents = useMemo(() => {
        if (!selectedClass) return [];
        const classEnrollments = enrollments.filter(e => e.classId === selectedClass.id);
        const studentIds = classEnrollments.map(e => e.studentId);
        return students.filter(s => studentIds.includes(s.id));
    }, [students, selectedClass, enrollments]);

    // Track unsaved changes to warn before close/navigate
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (modifiedStudents.size > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [modifiedStudents]);

    // Initialize local grades when class or students change
    useEffect(() => {
        const initialGrades: Record<string, Record<string, number | string>> = {};
        classStudents.forEach(student => {
            initialGrades[student.id] = {};
            subjects.forEach(subject => {
                const existingGrade = grades.find(g => g.studentId === student.id && g.subject === subject);
                initialGrades[student.id][subject] = existingGrade ? existingGrade.score : '';
            });
        });
        setLocalGrades(initialGrades);
        setModifiedStudents(new Set());
        setSaveSuccess(false);
    }, [classStudents, subjects, grades]);

    /**
     * Handles changes to individual student marks.
     * Clamps values between 0 and 10.
     */
    const handleGradeChange = (studentId: string, subject: string, value: string) => {
        setSaveSuccess(false);
        let numValue: string | number = '';
        
        if (value !== '') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
                // Clamp between 0 and 10
                numValue = Math.min(10, Math.max(0, parsed));
            } else {
                numValue = '';
            }
        }

        setLocalGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subject]: numValue
            }
        }));
        
        setModifiedStudents(prev => {
            const next = new Set(prev);
            next.add(studentId);
            return next;
        });
    };

    /**
     * Saves all modified marks for the current class to the database.
     * Iterates through modified students and updates or adds grade records.
     */
    const handleSaveAll = async () => {
        if (modifiedStudents.size === 0) return;
        
        setIsSaving(true);
        try {
            const term = "Term 1"; // Default term for now
            const savePromises = [];
            
            for (const studentId of Array.from(modifiedStudents)) {
                for (const subject of subjects) {
                    const score = Number(localGrades[studentId]?.[subject] || 0);
                    const existingGrade = grades.find(g => g.studentId === studentId && g.subject === subject);
                    
                    if (existingGrade) {
                        savePromises.push(updateGrade({ ...existingGrade, score }));
                    } else {
                        savePromises.push(addGrade({ studentId, subject, score, term }));
                    }
                }
            }
            
            if (savePromises.length > 0) {
                await Promise.all(savePromises);
            }
            
            setSaveSuccess(true);
            setModifiedStudents(new Set());
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Failed to save grades. Please ensure you are not in private/incognito mode.');
        } finally {
            setIsSaving(false);
        }
    };

    if (subjects.length === 0) {
        return (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center">
                <p className="text-amber-800 font-medium">No subjects defined in the system.</p>
                <p className="text-amber-600 text-sm mt-1">Please go to Settings &gt; Subjects to add subjects first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Class (Marks out of 10.0)</label>
                    <select 
                        value={selectedClassId} 
                        onChange={(e) => {
                            if (modifiedStudents.size > 0 && !window.confirm('You have unsaved marks. Switch class and lose changes?')) return;
                            setSelectedClassId(e.target.value);
                        }}
                        className="w-full md:w-96 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    >
                        <option value="">Choose a class...</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.level}) | {c.schedule}
                            </option>
                        ))}
                    </select>
                </div>
                {classStudents.length > 0 && (
                    <div className="flex items-center space-x-4">
                        {modifiedStudents.size > 0 && (
                            <span className="text-xs font-bold text-amber-600 animate-pulse flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                UNSAVED CHANGES
                            </span>
                        )}
                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving || modifiedStudents.size === 0}
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                                saveSuccess ? 'bg-emerald-500' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'
                            }`}
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : saveSuccess ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            )}
                            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save All Marks'}</span>
                        </button>
                    </div>
                )}
            </div>

            {selectedClassId && classStudents.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                    <p className="text-slate-500">This class has no students enrolled yet.</p>
                </div>
            ) : selectedClassId ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-slate-100 table-fixed">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="w-64 px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-r border-slate-100">Student Name</th>
                                    {subjects.map(subject => (
                                        <th key={subject} className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
                                            {subject}
                                        </th>
                                    ))}
                                    <th className="w-24 px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-l border-slate-100">Avg / 10</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {classStudents.map(student => {
                                    const scores = subjects.map(sub => Number(localGrades[student.id]?.[sub] || 0));
                                    const avg = scores.length > 0 ? (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1) : '0.0';
                                    const isModified = modifiedStudents.has(student.id);

                                    return (
                                        <tr key={student.id} className={`transition-colors ${isModified ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap bg-white sticky left-0 z-10 border-r border-slate-100">
                                                <div className="flex items-center">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs mr-3 ${isModified ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'}`}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 flex items-center">
                                                            {student.name}
                                                            {isModified && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved changes"></span>}
                                                        </p>
                                                        <p className="text-[10px] font-medium text-slate-400">ID: {student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {subjects.map(subject => (
                                                <td key={subject} className="px-2 py-3">
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        placeholder="0.0"
                                                        value={localGrades[student.id]?.[subject] ?? ''}
                                                        onChange={(e) => handleGradeChange(student.id, subject, e.target.value)}
                                                        className={`w-full text-center py-2 rounded-lg border text-sm font-bold transition-all focus:ring-2 focus:ring-primary-400 outline-none ${
                                                            Number(localGrades[student.id]?.[subject]) >= 9.0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                                            Number(localGrades[student.id]?.[subject]) < 5.0 ? 'text-red-600 bg-red-50 border-red-100' :
                                                            'text-slate-700 bg-white border-slate-200'
                                                        }`}
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 whitespace-nowrap text-center bg-slate-50/30 border-l border-slate-100">
                                                <span className={`text-sm font-black ${Number(avg) >= 9.0 ? 'text-emerald-600' : Number(avg) < 5.0 ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {avg}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="p-20 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-200 opacity-60">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <p className="text-slate-500 font-medium">Select a class from the menu above to begin recording marks (0.0 - 10.0).</p>
                </div>
            )}
        </div>
    );
};

const ExportCenter: React.FC = () => {
    const { students, grades, attendance } = useData();
    const [config, setConfig] = useState<ExportColumnConfig[]>([
        { key: 'id', label: 'Student ID', enabled: true },
        { key: 'name', label: 'Student Name', enabled: true },
        { key: 'dob', label: 'Date of Birth', enabled: true },
        { key: 'age', label: 'Age', enabled: true },
        { key: 'enrollmentDate', label: 'Joined On', enabled: true },
        { key: 'phone', label: 'Contact Phone', enabled: true },
        { key: 'avgScore', label: 'Avg GPA', enabled: true },
        { key: 'attendanceRate', label: 'Attendance %', enabled: true },
    ]);

    /**
     * Toggles the inclusion of a specific column in the export configuration.
     */
    const handleToggleColumn = (key: string) => {
        setConfig(prev => prev.map(c => c.key === key ? { ...c, enabled: !c.enabled } : c));
    };

    /**
     * Updates the display label for a specific export column.
     */
    const handleLabelChange = (key: string, newLabel: string) => {
        setConfig(prev => prev.map(c => c.key === key ? { ...c, label: newLabel } : c));
    };

    /** Selects all available columns for export. */
    const handleSelectAll = () => setConfig(prev => prev.map(c => ({ ...c, enabled: true })));
    /** Deselects all columns for export. */
    const handleClearAll = () => setConfig(prev => prev.map(c => ({ ...c, enabled: false })));

    /**
     * Generates and downloads the student progress report as a CSV file.
     */
    const handleDownloadReport = () => {
        const csvData = generateStudentProgressCSV(students, grades, attendance, config);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `student_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Choose Columns</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Customize your CSV export format.</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleClearAll} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Clear</button>
                        <button onClick={handleSelectAll} className="px-3 py-1.5 text-xs font-bold text-primary-600 hover:text-primary-800">Select All</button>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.map((item) => (
                        <div key={item.key} className={`flex items-start p-3 rounded-xl border transition-all ${item.enabled ? 'bg-primary-50 border-primary-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <input type="checkbox" checked={item.enabled} onChange={() => handleToggleColumn(item.key)} className="mt-1 h-5 w-5 text-primary-600 rounded cursor-pointer" />
                            <div className="ml-3 flex-1">
                                <p className={`text-sm font-bold ${item.enabled ? 'text-primary-900' : 'text-slate-700'}`}>{item.label}</p>
                                {item.enabled && (
                                    <input type="text" value={item.label} onChange={(e) => handleLabelChange(item.key, e.target.value)} className="w-full mt-2 px-2 py-1 text-xs border border-primary-200 rounded-md bg-white text-slate-900 focus:ring-1 focus:ring-primary-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Export File</h3>
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            <span>Enabled Columns</span>
                            <span>{config.filter(c => c.enabled).length} / {config.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(config.filter(c => c.enabled).length / config.length) * 100}%` }}></div>
                        </div>
                    </div>
                    <button 
                        onClick={handleDownloadReport}
                        disabled={config.filter(c => c.enabled).length === 0}
                        className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-200 hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex flex-col items-center justify-center space-y-1"
                    >
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span>Download CSV</span>
                        </div>
                        <span className="text-[10px] opacity-80 uppercase tracking-widest">Final Student Progress Report</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'marks' | 'export'>('marks');

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Records</h1>
                    <p className="text-slate-500 mt-1">Record marks (out of 10.0), track GPA, and export student performance data.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button 
                        onClick={() => setActiveTab('marks')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'marks' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Marks Entry
                    </button>
                    <button 
                        onClick={() => setActiveTab('export')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'export' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Export Data
                    </button>
                </div>
            </div>

            {activeTab === 'marks' ? <MarksEntry /> : <ExportCenter />}
        </div>
    );
};

export default ReportsPage;
