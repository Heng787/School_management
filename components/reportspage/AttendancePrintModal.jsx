import React from "react";
import { X, Printer, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

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

  const [yearStr, monthStr] = exportMonth.split("-");
  const year = parseInt(yearStr);
  const monthIdx = parseInt(monthStr) - 1;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthLabel = new Date(year, monthIdx, 1).toLocaleString("default", {
    month: "long",
  });
  const teacher = staff?.find((s) => s.id === selectedClass.teacherId);

  // Always show 31 days for a consistent grid
  const allDays = Array.from({ length: 31 }, (_, i) => i + 1);

  // Build a lookup: studentId → { dateKey → abbr }
  const recMap = {};
  attendance
    .filter((a) => a.date.startsWith(`${yearStr}-${monthStr}`))
    .forEach((a) => {
      const abbr =
        { Present: "P", Absent: "A", Late: "L", Permission: "Perm" }[
          a.status
        ] ?? a.status;
      if (!recMap[a.studentId]) recMap[a.studentId] = {};
      recMap[a.studentId][a.date] = abbr;
    });

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    const headerRow1 = [
      "#",
      "Name",
      "Sex",
      "Phone",
      "P",
      "A",
      "L",
      "Perm",
      ...allDays.map(String),
    ];
    const dataRows = students.map((student, idx) => {
      const byDate = recMap[student.id] || {};
      const stats = { P: 0, A: 0, L: 0, Perm: 0 };

      Object.values(byDate).forEach((abbr) => {
        if (stats[abbr] !== undefined) stats[abbr]++;
      });

      return [
        idx + 1,
        student.name,
        student.sex === "Male"
          ? "M"
          : student.sex === "Female"
            ? "F"
            : student.sex || "",
        student.phone || "",
        stats.P,
        stats.A,
        stats.L,
        stats.Perm,
        ...allDays.map(
          (d) =>
            byDate[`${yearStr}-${monthStr}-${String(d).padStart(2, "0")}`] ||
            "",
        ),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headerRow1, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(
      wb,
      `Attendance_${selectedClass.name}_${monthLabel}_${year}.xlsx`,
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex justify-center items-start overflow-y-auto p-4 sm:p-8 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1400px] flex flex-col print:shadow-none print:rounded-none print:max-w-none print:w-full">
        {/* ── Modal Toolbar — hidden on print ── */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Print Preview</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              A4 Landscape · Edge-to-Edge · {students.length} students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Printable Area ── */}
        <div
          id="attendance-printable"
          className="p-8 print:p-0 grow font-sans text-black"
        >
          <div className="print:px-[10mm] print:py-[8mm]">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6 print:mb-4">
              <div className="space-y-3">
                <h1 className="text-2xl font-black uppercase tracking-tight">
                  Monthly Class Attendance
                </h1>
                <div className="grid grid-cols-2 gap-x-12 text-[12px] leading-relaxed">
                  <p>
                    <span className="font-bold">Teacher:</span>{" "}
                    {teacher?.name || "Unassigned"}
                  </p>
                  <p>
                    <span className="font-bold">Month:</span> {monthLabel}
                  </p>
                  <p>
                    <span className="font-bold">Year:</span> {year}
                  </p>
                  <p>
                    <span className="font-bold">Class:</span>{" "}
                    {selectedClass.name} ({selectedClass.level})
                  </p>
                  <p>
                    <span className="font-bold">Room:</span>{" "}
                    {selectedClass.room || selectedClass.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="border-2px border-black px-4 py-2 rounded-sm inline-block text-[10px] font-black uppercase tracking-tighter mb-2">
                  P=PRESENT · A=ABSENT · L=LATE · Perm=PERMISSION
                </div>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest block">
                  Official Attendance Record
                </p>
              </div>
            </div>

            {/* Attendance Grid */}
            <table
              className="w-full border-collapse"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead>
                <tr className="bg-slate-50 print:bg-transparent">
                  <th
                    style={{ width: "3%" }}
                    className="border-[1pt] border-black px-0.5 py-2 text-[9px] font-black uppercase text-center"
                  >
                    NO
                  </th>
                  <th
                    style={{ width: "18%" }}
                    className="border-[1pt] border-black px-2 py-2 text-[9px] font-black uppercase text-left"
                  >
                    NAME
                  </th>
                  <th
                    style={{ width: "4%" }}
                    className="border-[1pt] border-black px-0.5 py-2 text-[9px] font-black uppercase text-center"
                  >
                    SEX
                  </th>
                  <th
                    style={{ width: "10%" }}
                    className="border-[1pt] border-black px-2 py-2 text-[9px] font-black uppercase text-left"
                  >
                    PHONE
                  </th>
                  {/* Summary Cols - 2.5% each = 10% */}
                  <th
                    style={{ width: "2.5%" }}
                    className="border-[1pt] border-black px-0.5 py-2 text-[8px] font-black text-center"
                  >
                    P
                  </th>
                  <th
                    style={{ width: "2.5%" }}
                    className="border-[1pt] border-black px-0.5 py-2 text-[8px] font-black text-center"
                  >
                    A
                  </th>
                  <th
                    style={{ width: "2.5%" }}
                    className="border-[1pt] border-black px-0.5 py-2 text-[8px] font-black text-center"
                  >
                    L
                  </th>
                  <th
                    style={{ width: "2.5%" }}
                    className="border-[1pt] border-black px-0.5 py-2 text-[8px] font-black text-center"
                  >
                    Perm
                  </th>
                  {/* 31 Day Cols - 55% total */}
                  {allDays.map((d) => (
                    <th
                      key={d}
                      style={{ width: "1.77%" }}
                      className="border-[1pt] border-black p-0 text-[8px] font-black text-center leading-none"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-50 print:bg-transparent">
                  <th
                    className="border-[1pt] border-black py-1 text-[8px] font-bold text-center italic"
                    colSpan={4}
                  >
                    Days
                  </th>
                  <th
                    className="border-[1pt] border-black py-1 text-[8px] font-bold text-center italic"
                    colSpan={4}
                  >
                    Totals
                  </th>
                  {allDays.map((d) => {
                    const dayName =
                      d <= daysInMonth
                        ? DOW[new Date(year, monthIdx, d).getDay()]
                        : "";
                    return (
                      <th
                        key={d}
                        className="border-[1pt] border-black py-1 text-[8px] font-bold text-center italic"
                      >
                        {dayName}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const byDate = recMap[student.id] || {};
                  const stats = { P: 0, A: 0, L: 0, Perm: 0 };
                  Object.values(byDate).forEach((abbr) => {
                    if (stats[abbr] !== undefined) stats[abbr]++;
                  });
                  const sexAbbr =
                    student.sex === "Male"
                      ? "M"
                      : student.sex === "Female"
                        ? "F"
                        : student.sex || "-";

                  return (
                    <tr key={student.id} style={{ height: "28px" }}>
                      <td className="border-[1pt] border-black px-0.5 text-[9px] font-bold text-center">
                        {idx + 1}
                      </td>
                      <td className="border-[1pt] border-black px-2 text-[9px] font-bold truncate uppercase">
                        {student.name}
                      </td>
                      <td className="border-[1pt] border-black px-0.5 text-[9px] font-bold text-center">
                        {sexAbbr}
                      </td>
                      <td className="border-[1pt] border-black px-2 text-[9px] font-bold truncate">
                        {student.phone || "-"}
                      </td>
                      <td className="border-[1pt] border-black px-0.5 text-[9px] font-bold text-center">
                        {stats.P}
                      </td>
                      <td className="border-[1pt] border-black px-0.5 text-[9px] font-bold text-center">
                        {stats.A}
                      </td>
                      <td className="border-[1pt] border-black px-0.5 text-[9px] font-bold text-center">
                        {stats.L}
                      </td>
                      <td className="border-[1pt] border-black px-0.5 text-[9px] font-bold text-center">
                        {stats.Perm}
                      </td>
                      {allDays.map((d) => {
                        const dateKey = `${yearStr}-${monthStr}-${String(d).padStart(2, "0")}`;
                        const status = byDate[dateKey] || "";
                        return (
                          <td
                            key={d}
                            className={`border-[1pt] border-black text-[9px] font-black text-center ${status === "A" ? "text-red-600" : ""}`}
                          >
                            {status || (d > daysInMonth ? "/" : "")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Fill out to exactly 22 rows */}
                {Array.from({ length: Math.max(0, 22 - students.length) }).map(
                  (_, i) => (
                    <tr key={`empty-${i}`} style={{ height: "28px" }}>
                      <td className="border-[1pt] border-black text-center text-[9px] text-slate-300">
                        {students.length + i + 1}
                      </td>
                      <td className="border-[1pt] border-black">&nbsp;</td>
                      <td className="border-[1pt] border-black">&nbsp;</td>
                      <td className="border-[1pt] border-black">&nbsp;</td>
                      <td className="border-[1pt] border-black">&nbsp;</td>
                      <td className="border-[1pt] border-black">&nbsp;</td>
                      <td className="border-[1pt] border-black">&nbsp;</td>
                      <td className="border-[1pt] border-black">&nbsp;</td>
                      {allDays.map((d) => (
                        <td
                          key={d}
                          className="border-[1pt] border-black text-center text-[9px] text-slate-200"
                        >
                          {d > daysInMonth ? "/" : ""}
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {/* Footer Area */}
            <div className="mt-6 flex justify-between items-end">
              <div className="border-[1.5px] border-black p-4 w-1/2 min-h-[100px] rounded-sm">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                  Teacher's Comments:
                </p>
              </div>
              <div className="text-right text-[8px] font-bold text-slate-400 italic">
                Generated by SchoolAdmin · {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 0 !important;
          }

          body * { visibility: hidden !important; }

          #attendance-printable,
          #attendance-printable * { visibility: visible !important; }

          #attendance-printable {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
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
            border: 1pt solid black !important;
          }

          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `,
        }}
      />
    </div>
  );
};

export default AttendancePrintModal;
