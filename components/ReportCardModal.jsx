
import React, { useState, useEffect, useMemo } from 'react';
// Report Card Modal for displaying and printing student academic progress.
import { useData } from '../context/DataContext';
import { configService } from '../services/configService';

const ReportCardModal = ({ student, onClose }) => {
    const { classes, grades, attendance, enrollments, staff, currentUser, deleteGrade } = useData();

    const studentEnrollment = enrollments.find(e => e.studentId === student.id);
    const studentClassObj = studentEnrollment ? classes.find(c => c.id === studentEnrollment.classId) : null;
    const displayLevel = studentClassObj ? `${studentClassObj.name} (${studentClassObj.level})` : 'Unassigned';

    // Resolve teacher name from the class's teacherId
    const classTeacher = studentClassObj ? staff.find(s => s.id === studentClassObj.teacherId) : null;
    const teacherName = classTeacher?.name || null;

    // Load principal name from config (set by admin in Settings)
    const [principalName, setPrincipalName] = useState('Administrator');
    const [principalSignatureUrl, setPrincipalSignatureUrl] = useState(null);

    useEffect(() => {
        configService.getPrincipalName().then((name) => {
            if (name) setPrincipalName(name);
        });
        configService.getPrincipalSignatureUrl().then((url) => {
            if (url) setPrincipalSignatureUrl(url);
        });
    }, []);

    // Collect all grades for this student
    const allStudentGrades = grades.filter(g => g.studentId === student.id);
    const studentAttendance = attendance.filter(a => a.studentId === student.id);

    // Detect distinct terms from grade records
    const availableTerms = useMemo(() => {
        const terms = [...new Set(allStudentGrades.map(g => g.term).filter(Boolean))];
        return terms.length > 0 ? terms : ['Midterm'];
    }, [allStudentGrades]);

    const [selectedTerm, setSelectedTerm] = useState('');

    // When grades load, auto-select the first available term
    useEffect(() => {
        if (!selectedTerm && availableTerms.length > 0) {
            setSelectedTerm(availableTerms[0]);
        }
    }, [availableTerms]);

    // Filter grades by selected term
    const studentGrades = selectedTerm
        ? allStudentGrades.filter(g => g.term === selectedTerm)
        : allStudentGrades;

    const handleDeleteTerm = async () => {
        if (!selectedTerm) return;
        const toDelete = allStudentGrades.filter(g => g.term === selectedTerm);
        if (toDelete.length === 0) return;
        const confirmed = window.confirm(
            `Delete all ${toDelete.length} grade records for term "${selectedTerm}"? This cannot be undone.`
        );
        if (!confirmed) return;
        for (const g of toDelete) {
            await deleteGrade(g.id);
        }
        // Move to next available term
        const remaining = availableTerms.filter(t => t !== selectedTerm);
        setSelectedTerm(remaining[0] || '');
    };

    const calculateGPA = (records) => {
        if (records.length === 0) return 'N/A';
        const sum = records.reduce((acc, curr) => acc + curr.score, 0);
        return (sum / records.length).toFixed(2);
    };

    const calculateAttendanceRate = (records) => {
        if (records.length === 0) return 'N/A';
        const presentCount = records.filter(a => a.status === 'Present').length;
        return ((presentCount / records.length) * 100).toFixed(1) + '%';
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-start overflow-y-auto p-4 sm:p-8 print:p-0 print:bg-white print:block">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl min-h-[800px] flex flex-col print:shadow-none print:rounded-none print:max-w-none print:w-full">
                {/* Header - Hidden on Print */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 print:hidden">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Report Card Preview</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{student.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Term selector */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Term:</label>
                            <select
                                value={selectedTerm}
                                onChange={(e) => setSelectedTerm(e.target.value)}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                            >
                                {availableTerms.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                                {availableTerms.length === 0 && (
                                    <option value="">No terms</option>
                                )}
                            </select>
                        </div>
                        {/* Delete term button */}
                        {selectedTerm && studentGrades.length > 0 && (
                            <button
                                onClick={handleDeleteTerm}
                                title={`Delete all grades for ${selectedTerm}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Term
                            </button>
                        )}
                        <button
                            onClick={handlePrint}
                            className="bg-primary-600 text-white px-5 py-1.5 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-slate-100 text-slate-600 px-5 py-1.5 rounded-lg font-bold hover:bg-slate-200 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div id="report-card-printable" className="p-10 flex-grow print:p-0">
                    {/* School Header */}
                    <div className="text-center mb-10 border-b-2 border-slate-900 pb-8">
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-2">SchoolAdmin Academy</h1>
                        <p className="text-slate-500 font-medium tracking-widest uppercase text-sm">Official Academic Progress Report</p>
                        <div className="mt-4 flex justify-center space-x-8 text-xs font-bold text-slate-400 uppercase">
                            <span>Academic Year: 2025-2026</span>
                            <span>Term: {selectedTerm || 'All Terms'}</span>
                        </div>
                    </div>

                    {/* Student Info Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Student Name</label>
                                <p className="text-xl font-bold text-slate-900">{student.name}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Student ID</label>
                                <p className="text-lg font-mono font-bold text-slate-600">{student.id}</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Class / Grade</label>
                                <p className="text-xl font-bold text-slate-900">{displayLevel}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date of Issue</label>
                                <p className="text-lg font-bold text-slate-600">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Academic Performance — two-column layout */}
                    <div className="mb-8">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Academic Performance</h3>

                        {studentGrades.length > 0 ? (() => {
                            const getGrade = (s) => s >= 9 ? 'A+' : s >= 8 ? 'A' : s >= 7 ? 'B' : s >= 6 ? 'C' : 'D';
                            const half = Math.ceil(studentGrades.length / 2);
                            const left = studentGrades.slice(0, half);
                            const right = studentGrades.slice(half);

                            const SubjectTable = ({ grades }) => (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900 text-left">
                                            <th className="py-1.5 text-[10px] font-black text-slate-900 uppercase">Subject</th>
                                            <th className="py-1.5 text-right text-[10px] font-black text-slate-900 uppercase w-10">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {grades.map((grade, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2 text-xs font-bold text-slate-700">{grade.subject}</td>
                                                <td className="py-2 text-right text-xs font-black text-slate-900">{getGrade(grade.score)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            );

                            return (
                                <div className="grid grid-cols-2 gap-6">
                                    <SubjectTable grades={left} />
                                    <SubjectTable grades={right} />
                                </div>
                            );
                        })() : (
                            <p className="py-6 text-center text-slate-400 italic text-sm">No grade records available for this term.</p>
                        )}

                        {studentGrades.length > 0 && (
                            <div className="border-t-2 border-slate-900 mt-3 pt-3 flex justify-between items-center">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Semester GPA</span>
                                <span className="text-2xl font-black text-primary-600">{calculateGPA(studentGrades)}</span>
                            </div>
                        )}
                    </div>

                    {/* Attendance & Summary */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Attendance Record</h3>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Attendance Rate</p>
                                    <p className="text-3xl font-black text-slate-900">{calculateAttendanceRate(studentAttendance)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Total Days</p>
                                    <p className="text-lg font-bold text-slate-600">{studentAttendance.length}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Teacher's Remarks</h3>
                            <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl p-4">
                                <p className="text-slate-400 text-xs italic">Space for manual remarks...</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="signature-row mt-12 grid grid-cols-2 gap-20">
                        <div className="text-center">
                            <div className="border-t border-slate-900 pt-2">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Class Teacher</p>
                                {teacherName && (
                                    <p className="text-sm font-bold text-slate-700 mt-1">{teacherName}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                            {/* Signature image floats above the line */}
                            {principalSignatureUrl && (
                                <div className="flex justify-center mb-2">
                                    <img
                                        src={principalSignatureUrl}
                                        alt="Principal signature"
                                        className="h-14 object-contain principal-sig-img"
                                        style={{ mixBlendMode: 'multiply' }}
                                    />
                                </div>
                            )}
                            <div className="border-t border-slate-900 pt-2">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Principal's Signature</p>
                                <p className="text-sm font-bold text-slate-700 mt-1">{principalName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Watermark / Footer Info */}
                    <div className="mt-16 text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">This is a computer-generated document. No signature is required for verification.</p>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm 15mm 12mm 15mm;
                    }

                    /* Hide absolutely everything by default */
                    body * {
                        visibility: hidden !important;
                    }

                    /* Then only show the report content */
                    #report-card-printable,
                    #report-card-printable * {
                        visibility: visible !important;
                    }

                    /* Let content flow naturally on the page — no fixed/clipping */
                    #report-card-printable {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        overflow: visible !important;
                    }

                    /* Prevent page break inside signature row */
                    #report-card-printable .signature-row {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .principal-sig-img {
                        display: block !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        mix-blend-mode: multiply !important;
                    }
                }
            `}} />
        </div>
    );
};

export default ReportCardModal;
