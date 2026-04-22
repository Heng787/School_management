import React, { useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const AttendancePrintModal = ({ 
  isOpen, 
  onClose, 
  selectedClass, 
  exportMonth, 
  students, 
  attendance, 
  staff 
}) => {
  if (!isOpen || !selectedClass || !exportMonth) return null;

  const [yearStr, monthStr] = exportMonth.split('-');
  const year = parseInt(yearStr);
  const monthIdx = parseInt(monthStr) - 1;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthLabel = new Date(year, monthIdx, 1).toLocaleString('default', { month: 'long' });

  // Filter attendance for this class and month
  const recMap = {};
  attendance
    .filter(a => a.date.startsWith(`${yearStr}-${monthStr}`))
    .forEach(a => {
      if (!recMap[a.studentId]) recMap[a.studentId] = {};
      const abbr = { Present: 'P', Absent: 'A', Late: 'L', Permission: 'Perm' }[a.status] ?? a.status;
      recMap[a.studentId][a.date] = abbr;
    });

  const teacher = staff?.find(s => s.id === selectedClass.teacherId);
  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-start overflow-y-auto p-4 sm:p-8 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1100px] flex flex-col print:shadow-none print:rounded-none print:max-w-none print:w-full">
        
        {/* Modal Controls - Hidden on Print */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Print Preview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Optimized for A4 Landscape</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-primary-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-all font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="attendance-printable" className="p-10 print:p-0 flex-grow font-sans text-slate-900 overflow-x-auto">
          {/* Header Block */}
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h1 className="text-lg font-black uppercase leading-tight">Monthly Class Attendance</h1>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                <p><span className="font-bold">Teacher:</span> {teacher?.name || 'Unassigned'}</p>
                <p><span className="font-bold">Month:</span> {monthLabel}</p>
                <p><span className="font-bold">Year:</span> {year}</p>
                <p><span className="font-bold">Class:</span> {selectedClass.name} ({selectedClass.level})</p>
                <p><span className="font-bold">Room:</span> {selectedClass.name}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-tight mb-2">SchoolAdmin</h2>
              <div className="bg-slate-50 border border-slate-200 p-2 rounded text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                Enter: P=Present | A=Absent | L=Late | Perm=Permission
              </div>
            </div>
          </div>

          {/* Grid Table */}
          <table className="w-full border-collapse border border-slate-900 border-2">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-900 border-2 px-1 py-1 text-[10px] font-black uppercase w-8">ID</th>
                <th className="border border-slate-900 border-2 px-2 py-1 text-[10px] font-black uppercase text-left min-w-[120px]">Name</th>
                {dayNums.map(d => (
                  <th key={d} className="border border-slate-900 border-2 px-0 py-1 text-[9px] font-black text-center w-6 min-w-[24px]">
                    {d}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50">
                <th className="border border-slate-900 border-2 px-1 py-0.5 text-[8px] font-bold uppercase" colSpan={2}>Days</th>
                {dayNums.map(d => (
                  <th key={d} className="border border-slate-900 border-2 px-0 py-0.5 text-[8px] font-bold text-center italic">
                    {DOW[new Date(year, monthIdx, d).getDay()]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const statusByDate = recMap[student.id] || {};
                return (
                  <tr key={student.id} className="h-7">
                    <td className="border border-slate-900 border-2 px-1 py-0.5 text-[10px] font-bold text-center">{idx + 1}</td>
                    <td className="border border-slate-900 border-2 px-2 py-0.5 text-[10px] font-bold truncate">{student.name}</td>
                    {dayNums.map(d => {
                      const dateKey = `${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`;
                      const status = statusByDate[dateKey] || '';
                      return (
                        <td key={d} className={`border border-slate-900 border-2 px-0 py-0.5 text-[10px] font-black text-center ${status === 'A' ? 'text-red-600 bg-red-50/20' : ''}`}>
                          {status}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Fill remaining space to 30 rows if needed */}
              {Array.from({ length: Math.max(0, 25 - students.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7">
                  <td className="border border-slate-900 border-2 text-center text-[10px] text-slate-100 italic">{students.length + i + 1}</td>
                  <td className="border border-slate-900 border-2 px-2 py-0.5">&nbsp;</td>
                  {dayNums.map(d => (
                    <td key={d} className="border border-slate-900 border-2 px-0 py-0.5">&nbsp;</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Watermark */}
          <div className="mt-4 flex justify-between items-center text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            <p>Generated by SchoolAdmin {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            <p>Attendance Record - Official Document</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body * {
            visibility: hidden !important;
          }

          #attendance-printable,
          #attendance-printable * {
            visibility: visible !important;
          }

          #attendance-printable {
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

          /* Force high contrast borders for printing */
          .border-2 {
            border-width: 1.5pt !important;
          }
          
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }

          td, th {
            border: 1pt solid #000 !important;
          }
          
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}} />
    </div>
  );
};

export default AttendancePrintModal;
