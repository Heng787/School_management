import React, { useRef } from "react";
import StudentTableRow from "./StudentTableRow";

const ITEMS_PER_PAGE = 20;

/**
 * COMPONENT: StudentTable
 * DESCRIPTION: Main table wrapper displaying students with pagination controls.
 */
const StudentTable = ({
  filteredStudents,
  currentPage,
  setCurrentPage,
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
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const highlightedRowRef = useRef(null);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-4 w-10 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer w-4 h-4"
                  checked={
                    paginatedStudents.length > 0 &&
                    paginatedStudents.every((s) => selectedStudentIds.has(s.id))
                  }
                  onChange={onSelectAllOnPage}
                />
              </th>
              <th className="px-4 py-4 w-16 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
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
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredStudents.length > 0 && (
        <div className="bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
