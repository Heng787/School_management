import React, { useRef } from "react";
import StudentTableRow from "./StudentTableRow";

/**
 * COMPONENT: StudentTable
 * DESCRIPTION: Main table wrapper displaying students with pagination controls.
 */
const StudentTable = ({
  filteredStudents,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  highlightedStudentId,
  displayClassesMap,
  staff,
  isAdmin,
  isOffice,
  selectedStudentIds,
  isDeletingId,
  onSelectStudent,
  onSelectAllOnPage,
  onEdit,
  onDelete,
  onReportCard,
  loading,
}) => {
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const highlightedRowRef = useRef(null);

  const colHeader = "px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap";

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-sm bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Header */}
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60">
              <th className="px-4 py-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4"
                  checked={
                    paginatedStudents.length > 0 &&
                    paginatedStudents.every((s) => selectedStudentIds.has(s.id))
                  }
                  onChange={onSelectAllOnPage}
                />
              </th>
              <th className={colHeader}>Name</th>
              <th className={colHeader}>Gender</th>
              <th className={colHeader}>DOB</th>
              <th className={colHeader}>Contact</th>
              <th className={colHeader}>Class</th>
              <th className={colHeader}>Status</th>
              <th className={`${colHeader} text-right`}>Actions</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedStudents.map((student) => {
              const isHighlighted = student.id === highlightedStudentId;
              const isDeleting = isDeletingId === student.id;
              const isSelected = selectedStudentIds.has(student.id);
              const displayClasses = displayClassesMap[student.id] || [];

              return (
                <StudentTableRow
                  key={student.id}
                  ref={isHighlighted ? highlightedRowRef : null}
                  student={student}
                  isHighlighted={isHighlighted}
                  isSelected={isSelected}
                  isDeleting={isDeleting}
                  displayClasses={displayClasses}
                  staff={staff}
                  isAdmin={isAdmin}
                  isOffice={isOffice}
                  onSelect={onSelectStudent}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReportCard={onReportCard}
                />
              );
            })}

            {filteredStudents.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-600">
                    <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium">No students found</p>
                    <p className="text-xs">Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {filteredStudents.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{startIndex + 1}</span>
            {" "}–{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(startIndex + pageSize, filteredStudents.length)}
            </span>
            {" "}of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredStudents.length}</span>
          </p>

          <div className="flex items-center gap-2">
            {/* Page size */}
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="text-xs text-slate-600 dark:text-slate-300 rounded-lg px-2.5 py-1.5 cursor-pointer
                bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>

            {/* Prev / Next */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400
                  border border-slate-200 dark:border-slate-700
                  hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>

              <span className="px-3 py-1.5 text-xs font-semibold rounded-lg
                bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600
                text-slate-700 dark:text-slate-200 shadow-sm">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400
                  border border-slate-200 dark:border-slate-700
                  hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200
                  disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
