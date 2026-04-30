import React from 'react';
import { X, Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const AttendancePrintModal = ({
  isOpen,
  onClose,
  selectedClass,
  exportMonth,
  students,
  attendance,
  staff,
}) => {
  if (!isOpen || !selectedClass || !exportMonth) return null;

  const [yearStr, monthStr] = exportMonth.split('-');
  const year = parseInt(yearStr);
  const monthIdx = parseInt(monthStr) - 1;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthLabel = new Date(year, monthIdx, 1).toLocaleString('default', { month: 'long' });
  const teacher = staff?.find(s => s.id === selectedClass.teacherId);

  // Build a quick lookup: studentId → { dateKey → abbr }
  const recMap = {};
  attendance
    .filter(a => a.date.startsWith(`${yearStr}-${monthStr}`))
    .forEach(a => {
      const abbr = { Present: 'P', Absent: 'A', Late: 'L', Permission: 'Perm' }[a.status] ?? a.status;
      if (!recMap[a.studentId]) recMap[a.studentId] = {};
      recMap[a.studentId][a.date] = abbr;
    });

  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    const headerRow1 = ['#', 'Name', ...dayNums.map(String)];
    const headerRow2 = ['', 'Days', ...dayNums.map(d => DOW[new Date(year, monthIdx, d).getDay()])];

    const dataRows = students.map((student, idx) => {
      const byDate = recMap[student.id] || {};
      return [
        idx + 1,
        student.name,
        ...dayNums.map(d => byDate[`${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`] || ''),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...dataRows]);

    // Column widths: narrow day cols, wider name col
    ws['!cols'] = [
      { wch: 4 },
      { wch: 24 },
      ...dayNums.map(() => ({ wch: 4 })),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Attendance_${selectedClass.name}_${monthLabel}_${year}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-start overflow-y-auto p-4 sm:p-8 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1150px] flex flex-col print:shadow-none print:rounded-none print:max-w-none print:w-full">

        {/* ── Modal Toolbar — hidden on print ── */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Print Preview</h2>
            <p className="text-xs text-slate-500 mt-0.5">A4 Landscape · {students.length} students · {daysInMonth} days</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Export attendance to Excel"
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Open in Excel
            </button>
            <button
              aria-label="Print attendance report"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              aria-label="Close print preview"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Printable Area ── */}
        <div id="attendance-printable" className="p-8 print:p-0 flex-grow font-sans text-slate-900 overflow-x-auto">

          {/* Header */}
          <div className="flex justify-between items-start mb-4 print:mb-3">
            <div className="space-y-1">
              <h1 className="text-base font-black uppercase leading-tight tracking-wide">Monthly Class Attendance</h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-0.5 text-[10px]">
                <p><span className="font-bold">Teacher:</span> {teacher?.name || 'Unassigned'}</p>
                <p><span className="font-bold">Month:</span> {monthLabel}</p>
                <p><span className="font-bold">Year:</span> {year}</p>
                <p><span className="font-bold">Class:</span> {selectedClass.name} ({selectedClass.level})</p>
                <p><span className="font-bold">Room:</span> {selectedClass.name}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">SchoolAdmin</p>
              <div className="border border-slate-300 px-2 py-1 rounded text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                P=Present · A=Absent · L=Late · Perm=Permission
              </div>
            </div>
          </div>

          {/* Attendance Grid */}
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              {/* ID */}
              <col style={{ width: '28px' }} />
              {/* Name */}
              <col style={{ width: '130px' }} />
              {/* Day columns — fill remaining space equally */}
              {dayNums.map(d => <col key={d} />)}
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th className="border border-slate-900 px-0.5 py-1 text-[9px] font-black uppercase text-center">ID</th>
                <th className="border border-slate-900 px-1 py-1 text-[9px] font-black uppercase text-left">Name</th>
                {dayNums.map(d => (
                  <th key={d} className="border border-slate-900 py-1 text-[8px] font-black text-center leading-none">
                    {d}
                  </th>
                ))}
              </tr>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th className="border border-slate-900 py-0.5 text-[7px] font-bold text-center italic" colSpan={2}>Days</th>
                {dayNums.map(d => (
                  <th key={d} className="border border-slate-900 py-0.5 text-[7px] font-bold text-center italic">
                    {DOW[new Date(year, monthIdx, d).getDay()]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const byDate = recMap[student.id] || {};
                return (
                  <tr key={student.id} style={{ height: '20px' }}>
                    <td className="border border-slate-900 px-0.5 text-[9px] font-bold text-center">{idx + 1}</td>
                    <td className="border border-slate-900 px-1 text-[9px] font-bold truncate">{student.name}</td>
                    {dayNums.map(d => {
                      const dateKey = `${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`;
                      const status = byDate[dateKey] || '';
                      const isAbsent = status === 'A';
                      return (
                        <td
                          key={d}
                          className="border border-slate-900 text-[8px] font-black text-center"
                          style={isAbsent ? { color: '#dc2626', backgroundColor: '#fff1f2' } : {}}
                        >
                          {status}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Blank rows to fill out to 30 rows minimum */}
              {Array.from({ length: Math.max(0, 30 - students.length) }).map((_, i) => (
                <tr key={`empty-${i}`} style={{ height: '20px' }}>
                  <td className="border border-slate-900 text-center text-[9px] text-slate-300">{students.length + i + 1}</td>
                  <td className="border border-slate-900 px-1">&nbsp;</td>
                  {dayNums.map(d => <td key={d} className="border border-slate-900">&nbsp;</td>)}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-3 flex justify-between items-center text-[7px] font-bold text-slate-300 uppercase tracking-widest">
            <p>Generated by SchoolAdmin · {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            <p>Attendance Record — Official Document</p>
          </div>
        </div>
      </div>

      {/* ── A4 Landscape print styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm 8mm;
          }

          body * { visibility: hidden !important; }

          #attendance-printable,
          #attendance-printable * { visibility: visible !important; }

          #attendance-printable {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }

          #attendance-printable table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }

          #attendance-printable td,
          #attendance-printable th {
            border: 0.5pt solid #000 !important;
          }

          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}} />
    </div>
  );
};

export default AttendancePrintModal;
