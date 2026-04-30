import React from 'react';
import { X, Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const MarksPrintModal = ({
  isOpen,
  onClose,
  selectedClass,
  selectedTerm,
  students,
  subjects,
  localGrades,
  staff,
}) => {
  if (!isOpen || !selectedClass) return null;

  const teacher = staff?.find(s => s.id === selectedClass.teacherId);

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    // Build header rows
    const headerRow = ['#', 'Name', 'Sex', ...subjects.map(s => s.toUpperCase()), 'Final AVG'];

    const dataRows = students.map((student, idx) => {
      const grades = localGrades[student.id] || {};
      const scores = subjects.map(sub => Number(grades[sub] || 0));
      const avg = scores.length
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : '0.0';
      return [
        idx + 1,
        student.name,
        student.sex?.charAt(0).toUpperCase() || 'M',
        ...subjects.map(sub => grades[sub] || ''),
        avg,
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

    // Column widths
    ws['!cols'] = [
      { wch: 4 },   // #
      { wch: 26 },  // Name
      { wch: 5 },   // Sex
      ...subjects.map(() => ({ wch: 10 })),
      { wch: 10 },  // AVG
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${selectedTerm} Scores`);
    XLSX.writeFile(wb, `Marks_${selectedClass.name}_${selectedTerm}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-start overflow-y-auto p-4 sm:p-8 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1200px] flex flex-col print:shadow-none print:rounded-none print:max-w-none print:w-full">

        {/* ── Modal Toolbar — hidden on print ── */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Score Sheet Preview</h2>
            <p className="text-xs text-slate-500 mt-0.5">A4 Landscape · {students.length} students · {subjects.length} subjects · {selectedTerm}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Export score sheet to Excel"
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Open in Excel
            </button>
            <button
              aria-label="Print score sheet"
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
        <div id="marks-printable" className="p-8 print:p-0 flex-grow font-serif text-black overflow-x-auto bg-white">

          {/* Header Block */}
          <div className="relative mb-4" style={{ minHeight: '80px' }}>
            {/* Left metadata */}
            <div className="absolute left-0 top-0 text-[10px] space-y-0.5 leading-tight font-bold text-blue-900">
              <p>Level: {selectedClass.level}</p>
              <p>Time: {selectedClass.schedule}</p>
              <p>Room: {selectedClass.name}</p>
              <p>Teacher: {teacher?.name || '________________'}</p>
            </div>
            {/* Center title */}
            <div className="text-center">
              <h1 className="text-base font-black text-blue-900 uppercase tracking-wide">Promotion Daily Score Sheet</h1>
              <h2 className="text-[11px] font-black text-blue-900 mt-0.5 uppercase">{selectedTerm} — {new Date().getFullYear()}</h2>
            </div>
          </div>

          {/* Score Table */}
          <table className="w-full border-collapse border border-black" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '28px' }} />   {/* No */}
              <col style={{ width: '140px' }} />  {/* Name */}
              <col style={{ width: '28px' }} />   {/* Sex */}
              {subjects.map(sub => <col key={sub} />)}  {/* Subject cols fill remainder */}
              <col style={{ width: '52px' }} />   {/* AVG */}
            </colgroup>
            <thead>
              <tr className="bg-white">
                <th className="border border-black px-0.5 py-1 text-[9px] font-black uppercase text-center">No</th>
                <th className="border border-black px-1 py-1 text-[9px] font-black uppercase text-left">Name</th>
                <th className="border border-black px-0.5 py-1 text-[9px] font-black uppercase text-center">Sex</th>
                {subjects.map(sub => (
                  <th key={sub} className="border border-black px-0.5 py-1">
                    <div className="flex flex-col items-center">
                      <span className="font-black text-blue-900 text-[8px] uppercase leading-none mb-0.5">{sub}</span>
                      <span className="text-[7px] font-bold text-red-600 leading-none">10 pts</span>
                    </div>
                  </th>
                ))}
                <th className="border border-black px-0.5 py-1 text-[9px] font-black text-blue-900 uppercase text-center">AVG</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const grades = localGrades[student.id] || {};
                const scores = subjects.map(sub => Number(grades[sub] || 0));
                const avg = scores.length
                  ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                  : '0.0';
                return (
                  <tr key={student.id} style={{ backgroundColor: idx % 2 === 1 ? '#ffffcc' : '#ffffff', height: '22px' }}>
                    <td className="border border-black px-0.5 text-center text-[9px] font-bold">{idx + 1}</td>
                    <td className="border border-black px-1 text-[9px] font-bold truncate">{student.name}</td>
                    <td className="border border-black px-0.5 text-center text-[9px] font-bold uppercase">{student.sex?.charAt(0) || 'M'}</td>
                    {subjects.map(sub => (
                      <td key={sub} className="border border-black text-center text-[9px] font-black">
                        {grades[sub] || ''}
                      </td>
                    ))}
                    <td className="border border-black text-center text-[9px] font-black text-blue-900">{avg}</td>
                  </tr>
                );
              })}

              {/* Blank rows to fill to 25 rows minimum */}
              {Array.from({ length: Math.max(0, 25 - students.length) }).map((_, i) => {
                const idx = students.length + i;
                return (
                  <tr key={`empty-${i}`} style={{ backgroundColor: idx % 2 === 1 ? '#ffffcc' : '#ffffff', height: '22px' }}>
                    <td className="border border-black text-center text-[9px] text-slate-300 italic">{idx + 1}</td>
                    <td className="border border-black px-1">&nbsp;</td>
                    <td className="border border-black">&nbsp;</td>
                    {subjects.map(sub => <td key={sub} className="border border-black">&nbsp;</td>)}
                    <td className="border border-black">&nbsp;</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-3 flex justify-between items-center text-[7px] font-bold text-slate-500">
            <p>Official Promotion Record · {new Date().toLocaleDateString()}</p>
            <p>Page 1 of 1</p>
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

          #marks-printable,
          #marks-printable * { visibility: visible !important; }

          #marks-printable {
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

          #marks-printable table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }

          #marks-printable td,
          #marks-printable th {
            border: 0.5pt solid #000 !important;
          }

          #marks-printable tr { page-break-inside: avoid !important; }

          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}} />
    </div>
  );
};

export default MarksPrintModal;
