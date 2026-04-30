import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { configService } from '../services/configService';
import { useFocusTrap } from '../hooks/useFocusTrap';
import ConfirmModal from './ConfirmModal';

// ─── REUSABLE SUB-COMPONENTS ──────────────────────────────────────────────────

/**
 * Clean table for displaying academic subjects and grades
 */
const AcademicTable = ({ records }) => {
  const getLetterGrade = (score) => {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B';
    if (score >= 6) return 'C';
    return 'D';
  };

  return (
    <table className="w-full">
      <caption className="sr-only">Academic grades for {records.length} subjects</caption>
      <thead>
        <tr className="border-b-2 border-slate-900 text-left">
          <th scope="col" className="py-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">Subject</th>
          <th scope="col" className="py-2 text-right text-[10px] font-black text-slate-900 uppercase tracking-widest w-16">Grade</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {records.map((grade, idx) => (
          <tr key={idx} className="group">
            <td className="py-2.5 text-xs font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{grade.subject}</td>
            <td className="py-2.5 text-right text-xs font-black text-slate-900">{getLetterGrade(grade.score)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * Signature block for teacher or principal
 */
const SignatureBlock = ({ label, name, signatureUrl }) => (
  <div className="text-center flex flex-col items-center">
    <div className="h-16 flex items-end justify-center mb-1">
      {signatureUrl && (
        <img
          src={signatureUrl}
          alt={`${label} signature`}
          className="h-14 object-contain mix-blend-multiply principal-sig-img"
        />
      )}
    </div>
    <div className="w-full border-t border-slate-900 pt-2">
      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-sm font-bold text-slate-700 mt-1.5">{name || '—'}</p>
    </div>
  </div>
);

// ─── UTILS ────────────────────────────────────────────────────────────────────

const calculateGPA = (records) => {
  if (!records?.length) return '0.00';
  const sum = records.reduce((acc, curr) => acc + curr.score, 0);
  return (sum / records.length).toFixed(2);
};

const calculateAttendanceRate = (records) => {
  if (!records?.length) return '0.0%';
  const presentCount = records.filter(a => a.status === 'Present').length;
  return ((presentCount / records.length) * 100).toFixed(1) + '%';
};

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

const ReportCardModal = ({ student, onClose }) => {
  const { classes, grades, draftGrades, attendance, enrollments, staff, deleteGrade } = useData();
  const containerRef = useFocusTrap(true);
  
  // Merge permanent grades with local drafts for the preview
  const combinedGrades = useMemo(() => {
    const merged = new Map(grades.map(g => [g.id, g]));
    if (draftGrades) draftGrades.forEach(g => merged.set(g.id, g));
    return Array.from(merged.values());
  }, [grades, draftGrades]);

  // --- CONFIG STATE ---
  const [principalName, setPrincipalName] = useState('Administrator');
  const [principalSignatureUrl, setPrincipalSignatureUrl] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('');

  // --- DATA RESOLUTION ---
  const studentEnrollment = useMemo(() => enrollments.find(e => e.studentId === student.id), [enrollments, student.id]);
  const studentClass = useMemo(() => studentEnrollment ? classes.find(c => c.id === studentEnrollment.classId) : null, [classes, studentEnrollment]);
  const teacher = useMemo(() => studentClass ? staff.find(s => s.id === studentClass.teacherId) : null, [staff, studentClass]);
  
  const allStudentGrades = useMemo(() => combinedGrades.filter(g => g.studentId === student.id), [combinedGrades, student.id]);
  const studentAttendance = useMemo(() => attendance.filter(a => a.studentId === student.id), [attendance, student.id]);

  const availableTerms = useMemo(() => {
    const terms = [...new Set(allStudentGrades.map(g => g.term).filter(Boolean))];
    return terms.length > 0 ? terms : ['Midterm'];
  }, [allStudentGrades]);

  const termGrades = useMemo(() => 
    selectedTerm ? allStudentGrades.filter(g => g.term === selectedTerm) : allStudentGrades
  , [allStudentGrades, selectedTerm]);

  // --- EFFECTS ---
  useEffect(() => {
    configService.getPrincipalName().then(name => name && setPrincipalName(name));
    configService.getPrincipalSignatureUrl().then(url => url && setPrincipalSignatureUrl(url));
  }, []);

  useEffect(() => {
    if (!selectedTerm && availableTerms.length > 0) {
      setSelectedTerm(availableTerms[0]);
    }
  }, [availableTerms, selectedTerm]);

  // --- HANDLERS ---
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const handleDeleteTerm = () => {
    if (!selectedTerm || termGrades.length === 0) return;
    setIsConfirmDeleteOpen(true);
  };

  const performDelete = async () => {
    for (const g of termGrades) await deleteGrade(g.id);
    const remaining = availableTerms.filter(t => t !== selectedTerm);
    setSelectedTerm(remaining[0] || '');
    setIsConfirmDeleteOpen(false);
  };

  const handlePrint = () => window.print();

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex justify-center items-start overflow-y-auto p-0 sm:p-6 print:p-0 print:bg-white print:block"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-card-preview-title"
    >
      <div 
        ref={containerRef}
        className="bg-white border border-slate-200 sm:rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col my-0 sm:my-8 print:my-0 print:shadow-none print:rounded-none print:max-w-none print:w-full animate-in fade-in zoom-in-95 duration-300"
      >
        
        {/* ACTION HEADER (HIDDEN ON PRINT) */}
        <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 border-b border-slate-100 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sm:rounded-t-2xl print:hidden">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white shadow-sm rounded-xl border border-slate-200">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 id="report-card-preview-title" className="text-lg font-bold text-slate-800">Report Card Preview</h2>
              <p className="text-xs text-slate-500 font-medium">Review and generate official document</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              aria-label="Select academic term"
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
            >
              {availableTerms.map(t => <option key={t} value={t}>{t}</option>)}
              {availableTerms.length === 0 && <option value="">No terms found</option>}
            </select>

            {selectedTerm && termGrades.length > 0 && (
              <button 
                onClick={handleDeleteTerm} 
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors" 
                aria-label="Delete Term Data"
                title="Delete Term Data"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            <div className="h-8 w-px bg-slate-200 mx-1" />

            <button onClick={handlePrint} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button 
              onClick={onClose} 
              aria-label="Close preview"
              className="p-2 text-slate-500 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={performDelete}
          title="Delete Term Data"
          message={`Permanently delete all ${termGrades.length} grade records for "${selectedTerm}"? This action cannot be undone.`}
        />

        {/* PRINTABLE CONTENT AREA */}
        <div id="report-card-printable" className="p-6 sm:p-8 flex-grow print:p-0 flex flex-col">
          
          {/* Official Header */}
          <div className="text-center mb-4 border-b-2 border-slate-900 pb-3">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-[0.1em] mb-1">SchoolAdmin Academy</h1>
            <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-[8px]">Academic Progress & Performance Certification</p>
            <div className="mt-1 flex justify-center gap-10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
              <span>Academic Session: 2025-2026</span>
              <span className="text-slate-900">Evaluation: {selectedTerm || 'Full Session'}</span>
            </div>
          </div>

          {/* Core Profile Information */}
          <div className="grid grid-cols-2 gap-10 mb-4">
            <div className="space-y-2">
              <div className="group">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0 block">Full Name</label>
                <p className="text-base font-black text-slate-900 border-l-4 border-slate-900 pl-3">{student.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0 block">Student Identifier</label>
                  <p className="text-[9px] font-mono font-bold text-slate-600">{student.id}</p>
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0 block">Date of Birth</label>
                  <p className="text-[9px] font-bold text-slate-600">{student.dob ? new Date(student.dob).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2 flex flex-col items-end">
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0 block">Placement / Level</label>
                <p className="text-base font-black text-slate-900">{studentClass ? `${studentClass.name} (${studentClass.level})` : 'Unassigned'}</p>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0 block">Certification Date</label>
                <p className="text-[9px] font-bold text-slate-600">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Academic Records Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between border-b border-slate-200 pb-2 mb-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Academic Evaluation</h3>
              {termGrades.length > 0 && (
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Weighted GPA</span>
                  <span className="text-xl font-black text-primary-600">{calculateGPA(termGrades)}</span>
                </div>
              )}
            </div>

            {termGrades.length > 0 ? (() => {
              const half = Math.ceil(termGrades.length / 2);
              return (
                <div className="grid grid-cols-2 gap-10">
                  <AcademicTable records={termGrades.slice(0, half)} />
                  <AcademicTable records={termGrades.slice(half)} />
                </div>
              );
            })() : (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-500 italic text-xs">No academic data available for this term.</p>
              </div>
            )}
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 gap-12 mb-6">
            <div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-200 pb-2 mb-4">Engagement Record</h3>
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Attendance Rate</p>
                  <p className="text-3xl font-black text-slate-900">{calculateAttendanceRate(studentAttendance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Total Verified Days</p>
                  <p className="text-lg font-bold text-slate-600">{studentAttendance.length}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-200 pb-2 mb-4">Educator's Commentary</h3>
              <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl p-4">
                <p className="text-slate-300 text-[10px] font-medium leading-relaxed italic">Academic and behavioral notes to be documented manually by the class educator.</p>
              </div>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="mt-8 pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-24">
            <SignatureBlock label="Class Teacher" name={teacher?.name} />
            <SignatureBlock label="School Principal" name={principalName} signatureUrl={principalSignatureUrl} />
          </div>

          {/* Footer Validation */}
          <div className="mt-16 text-center">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
              Digitally verified document • No physical signature required for electronic verification
            </p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body * { visibility: hidden !important; }
          #report-card-printable, #report-card-printable * { visibility: visible !important; }
          #report-card-printable {
            position: absolute !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important; margin: 0 !important;
            box-shadow: none !important; border-radius: 0 !important;
            overflow: visible !important;
          }
          .principal-sig-img {
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
};

export default ReportCardModal;
