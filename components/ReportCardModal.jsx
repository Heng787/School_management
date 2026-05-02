import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { configService } from '../services/configService';
import Modal from './ui/Modal';
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
    <Modal
      onClose={onClose}
      title="Report Card Preview"
      maxWidth="max-w-4xl"
      className="print:p-0 print:m-0 print:w-full print:max-w-none print:shadow-none print:border-none print:bg-white"
    >
      <div className="space-y-6">
        {/* ACTION HEADER (HIDDEN ON PRINT) */}
        <div className="flex flex-wrap items-center justify-between gap-4 -mt-2 print:hidden">
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-500 font-medium">Review and generate official document</p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="term-select" className="sr-only">Select academic term</label>
            <select
              id="term-select"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
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
          </div>
        </div>

        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={performDelete}
          title="Delete Term Data"
          message={`Permanently delete all ${termGrades.length} grade records for "${selectedTerm}"? This action cannot be undone.`}
        />

        {/* PRINTABLE CONTENT AREA (A4 WHITE PAPER STYLE) */}
        <div 
          id="report-card-printable" 
          className="bg-white text-slate-900 p-10 sm:p-16 shadow-[0_0_40px_rgba(0,0,0,0.1)] mx-auto w-full max-w-[210mm] min-h-[297mm] flex flex-col print:shadow-none print:p-0 print:m-0"
          style={{ colorScheme: 'light' }}
        >

          {/* Official Header */}
          <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-[0.15em] mb-2">SchoolAdmin Academy</h1>
            <p className="text-slate-500 font-bold tracking-[0.4em] uppercase text-[10px]">Academic Progress & Performance Certification</p>
            <div className="mt-3 flex justify-center gap-12 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Academic Session: 2025-2026</span>
              <span className="text-slate-900">Evaluation: {selectedTerm || 'Full Session'}</span>
            </div>
          </div>

          {/* Core Profile Information */}
          <div className="grid grid-cols-2 gap-12 mb-10">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Full Name</label>
                <p className="text-xl font-black text-slate-900 border-l-4 border-slate-900 pl-4 py-1">{student.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Student Identifier</label>
                  <p className="text-xs font-mono font-bold text-slate-600">{student.id}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Date of Birth</label>
                  <p className="text-xs font-bold text-slate-600">{student.dob ? new Date(student.dob).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-4 flex flex-col items-end justify-start">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Placement / Level</label>
                <p className="text-xl font-black text-slate-900">{studentClass ? `${studentClass.name} (${studentClass.level})` : 'Unassigned'}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Certification Date</label>
                <p className="text-xs font-bold text-slate-600">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Academic Records Section */}
          <div className="mb-12">
            <div className="flex items-end justify-between border-b border-slate-200 pb-3 mb-6">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em]">Academic Evaluation</h3>
              {termGrades.length > 0 && (
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Weighted GPA</span>
                  <span className="text-4xl font-black text-primary-600">{calculateGPA(termGrades)}</span>
                </div>
              )}
            </div>

            {termGrades.length > 0 ? (() => {
              const half = Math.ceil(termGrades.length / 2);
              return (
                <div className="grid grid-cols-2 gap-16">
                  <AcademicTable records={termGrades.slice(0, half)} />
                  <AcademicTable records={termGrades.slice(half)} />
                </div>
              );
            })() : (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-400 italic text-sm">No academic data available for this term.</p>
              </div>
            )}
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 gap-16 mb-10">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em] border-b border-slate-200 pb-3 mb-6">Engagement Record</h3>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance Rate</p>
                  <p className="text-4xl font-black text-slate-900">{calculateAttendanceRate(studentAttendance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verified Days</p>
                  <p className="text-xl font-bold text-slate-600">{studentAttendance.length}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.25em] border-b border-slate-200 pb-3 mb-6">Educator's Commentary</h3>
              <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex items-center justify-center">
                <p className="text-slate-300 text-[11px] font-medium leading-relaxed italic text-center">Academic and behavioral notes to be documented manually by the class educator.</p>
              </div>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="mt-auto pt-10 border-t-2 border-slate-900 grid grid-cols-2 gap-32">
            <SignatureBlock label="Class Teacher" name={teacher?.name} />
            <SignatureBlock label="School Principal" name={principalName} signatureUrl={principalSignatureUrl} />
          </div>

          {/* Footer Validation */}
          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
              Digitally verified document • No physical signature required for electronic verification
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body > :not(.modal-root) { display: none !important; }
          .modal-root { padding: 0 !important; margin: 0 !important; }
          .modal-content {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          #report-card-printable {
            visibility: visible !important;
          }
          .principal-sig-img {
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </Modal>
  );
};

export default ReportCardModal;
