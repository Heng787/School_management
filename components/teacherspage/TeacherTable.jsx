import React, { useRef } from "react";
import TeacherTableRow from "./TeacherTableRow";

const ITEMS_PER_PAGE = 20;

/**
 * COMPONENT: TeacherTable
 * DESCRIPTION: Staff table with pagination controls.
 */
const TeacherTable = ({
  staff,
  filteredStaff,
  currentPage,
  setCurrentPage,
  highlightedStaffId,
  staffPermissions,
  isAdmin,
  onEdit,
  onDelete,
  onInvite,
  onPermission,
}) => {
  const highlightedRowRef = useRef(null);

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const todayDate = new Date().toISOString().split("T")[0];

  const colHeader = "px-5 py-3.5 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap";

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-sm bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Header */}
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60">
              <th className={colHeader}>Name</th>
              <th className={colHeader}>Role</th>
              <th className={colHeader}>Date of Birth</th>
              <th className={colHeader}>Contact</th>
              <th className={colHeader}>Joined</th>
              <th className={`${colHeader} text-right`}>Actions</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedStaff.map((s) => {
              const isHighlighted = s.id === highlightedStaffId;
              const isOnLeave = staffPermissions?.some(
                (p) =>
                  p.staffId === s.id &&
                  p.startDate <= todayDate &&
                  p.endDate >= todayDate,
              );
              return (
                <TeacherTableRow
                  key={s.id}
                  staff={s}
                  isHighlighted={isHighlighted}
                  isOnLeave={isOnLeave}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onInvite={onInvite}
                  onPermission={onPermission}
                  highlightedRowRef={isHighlighted ? highlightedRowRef : null}
                />
              );
            })}

            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-600">
                    <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium">No staff members found</p>
                    <p className="text-xs">Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredStaff.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{startIndex + 1}</span>
            {" "}to{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredStaff.length)}
            </span>
            {" "}of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredStaff.length}</span>
            {" "}results
          </p>

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

            <span className="px-3.5 py-1.5 text-xs font-semibold rounded-lg
              bg-white dark:bg-slate-700
              border border-slate-200 dark:border-slate-600
              text-slate-700 dark:text-slate-200
              shadow-sm">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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
      )}
    </div>
  );
};

export default TeacherTable;
