
import React from 'react';
import { Student, Grade, Attendance } from '../types';
import { useData } from '../context/DataContext';

interface ReportCardModalProps {
    student: Student;
    onClose: () => void;
}

const ReportCardModal: React.FC<ReportCardModalProps> = ({ student, onClose }) => {
    const { classes, grades, attendance, enrollments } = useData();

    const studentEnrollment = enrollments.find(e => e.studentId === student.id);
    const studentClassObj = studentEnrollment ? classes.find(c => c.id === studentEnrollment.classId) : null;
    const displayLevel = studentClassObj ? `${studentClassObj.name} (${studentClassObj.level})` : 'Unassigned';

    const studentGrades = grades.filter(g => g.studentId === student.id);
    const studentAttendance = attendance.filter(a => a.studentId === student.id);

    const calculateGPA = (records: Grade[]) => {
        if (records.length === 0) return 'N/A';
        const sum = records.reduce((acc, curr) => acc + curr.score, 0);
        return (sum / records.length).toFixed(2);
    };

    const calculateAttendanceRate = (records: Attendance[]) => {
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
                    <h2 className="text-xl font-bold text-slate-800">Report Card Preview</h2>
                    <div className="flex space-x-3">
                        <button 
                            onClick={handlePrint}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Report
                        </button>
                        <button 
                            onClick={onClose}
                            className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-10 flex-grow print:p-0">
                    {/* School Header */}
                    <div className="text-center mb-10 border-b-2 border-slate-900 pb-8">
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-2">SchoolAdmin Academy</h1>
                        <p className="text-slate-500 font-medium tracking-widest uppercase text-sm">Official Academic Progress Report</p>
                        <div className="mt-4 flex justify-center space-x-8 text-xs font-bold text-slate-400 uppercase">
                            <span>Academic Year: 2025-2026</span>
                            <span>Term: Final Semester</span>
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

                    {/* Academic Performance */}
                    <div className="mb-12">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Academic Performance</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b-2 border-slate-900">
                                    <th className="py-3 text-xs font-black text-slate-900 uppercase">Subject</th>
                                    <th className="py-3 text-right text-xs font-black text-slate-900 uppercase">Score (0-10)</th>
                                    <th className="py-3 text-right text-xs font-black text-slate-900 uppercase">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {studentGrades.length > 0 ? (
                                    studentGrades.map((grade, idx) => (
                                        <tr key={idx}>
                                            <td className="py-4 font-bold text-slate-700">{grade.subject}</td>
                                            <td className="py-4 text-right font-mono font-bold text-slate-900">{grade.score.toFixed(1)}</td>
                                            <td className="py-4 text-right font-bold text-slate-700">
                                                {grade.score >= 9 ? 'A+' : grade.score >= 8 ? 'A' : grade.score >= 7 ? 'B' : grade.score >= 6 ? 'C' : 'D'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-slate-400 italic">No grade records available for this term.</td>
                                    </tr>
                                )}
                            </tbody>
                            {studentGrades.length > 0 && (
                                <tfoot>
                                    <tr className="border-t-2 border-slate-900">
                                        <td className="py-4 font-black text-slate-900 uppercase">Semester GPA</td>
                                        <td colSpan={2} className="py-4 text-right text-2xl font-black text-primary-600">{calculateGPA(studentGrades)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
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
                    <div className="mt-20 grid grid-cols-2 gap-20">
                        <div className="text-center">
                            <div className="border-t border-slate-900 pt-2">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Class Teacher</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-slate-900 pt-2">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Principal's Signature</p>
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
                    body { margin: 0; padding: 0; }
                    .fixed { position: static !important; display: block !important; background: white !important; padding: 0 !important; }
                    .bg-white { box-shadow: none !important; border-radius: 0 !important; }
                    .print\\:hidden { display: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:rounded-none { border-radius: 0 !important; }
                    .print\\:max-w-none { max-width: none !important; }
                    .print\\:w-full { width: 100% !important; }
                }
            `}} />
        </div>
    );
};

export default ReportCardModal;
