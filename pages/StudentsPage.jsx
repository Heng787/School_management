import React, { useEffect, useRef, useMemo } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import ImportPreviewModal from '../components/ImportPreviewModal';
import ImportResultsModal from '../components/ImportResultsModal';
import ReportCardModal from '../components/ReportCardModal';
import StudentHeaderActions from '../components/studentspage/StudentHeaderActions';
import StudentModal from '../components/studentspage/StudentModal';
import StudentSearchBar from '../components/studentspage/StudentSearchBar';
import StudentTable from '../components/studentspage/StudentTable';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { useData } from '../context/DataContext';
import { useStudentActions } from '../hooks/useStudentActions';
import {
  useFilters,
  useStudentSelection,
  useModalState,
  useImportState,
  usePaginationState,
} from '../hooks/useStudentsPageState';

import { UserRole } from '../types';
import {
  applyAllFilters,
  buildDisplayClassesMap,
} from '../utils/studentFilterUtils';

const ITEMS_PER_PAGE = 20;

/**
 * PAGE: StudentsPage
 * DESCRIPTION: Main view for student management with component-based architecture.
 */
const StudentsPage = () => {
  // --- Context & Data ---
  const {
    students,
    staff,
    deleteStudent,
    highlightedStudentId,
    setHighlightedStudentId,
    addStudents,
    loading,
    enrollments,
    classes,
    timeSlots,
    currentUser,
    levels,
    subjects,
    addLevel,
    addSubject,
    addClasses,
    addStaffBatch,
    addTimeSlotsBatch,
    updateClassesBatch,
    updateStudentsBatch,
    addEnrollments,
    saveGradeBatch,
  } = useData();

  // --- Custom Hooks for State Management ---
  const filters = useFilters();
  const selection = useStudentSelection();
  const modals = useModalState();
  const importState = useImportState();
  const pagination = usePaginationState();

  // --- Custom Hooks for Actions ---
  const studentActions = useStudentActions({
    students,
    staff,
    classes,
    enrollments,
    subjects,
    levels,
    timeSlots,
    importState,
    addStudents,
    updateStudentsBatch,
    addEnrollments,
    saveGradeBatch,
    addStaffBatch,
    updateClassesBatch,
    addTimeSlotsBatch,
    addSubject,
    addLevel,
    addClasses,
    filteredStudents: applyAllFilters(
      students,
      currentUser,
      classes,
      enrollments,
      {
        searchTerm: filters.searchTerm,
        classFilter: filters.classFilter,
        statusFilter: filters.statusFilter,
      },
    ),
  });

  // --- Refs ---
  const fileInputRef = useRef(null);
  const highlightedRowRef = useRef(null);

  // --- Derived Values ---
  const isAdmin = currentUser?.role === UserRole.Admin;
  const isOffice = currentUser?.role === UserRole.OfficeWorker;

  // --- Memoized Data ---
  const filteredStudents = useMemo(
    () =>
      applyAllFilters(students, currentUser, classes, enrollments, {
        searchTerm: filters.searchTerm,
        classFilter: filters.classFilter,
        statusFilter: filters.statusFilter,
      }),
    [
      students,
      currentUser,
      classes,
      enrollments,
      filters.searchTerm,
      filters.classFilter,
      filters.statusFilter,
    ],
  );

  const displayClassesMap = useMemo(
    () =>
      buildDisplayClassesMap(
        filteredStudents,
        currentUser,
        classes,
        enrollments,
      ),
    [filteredStudents, currentUser, classes, enrollments],
  );

  // --- Side Effects ---
  useEffect(() => {
    pagination.resetPagination();
  }, [
    filters.searchTerm,
    filters.classFilter,
    filters.statusFilter,
    pagination.pageSize,
  ]);

  useEffect(() => {
    if (highlightedStudentId) {
      const index = filteredStudents.findIndex(
        (s) => s.id === highlightedStudentId,
      );

      if (index !== -1) {
        const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;

        if (pagination.currentPage !== targetPage) {
          pagination.setCurrentPage(targetPage);
        }

        setTimeout(
          () =>
            highlightedRowRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            }),
          100,
        );
      }

      const timer = setTimeout(() => setHighlightedStudentId(null), 3000);

      return () => clearTimeout(timer);
    }
  }, [
    highlightedStudentId,
    setHighlightedStudentId,
    filteredStudents,
    pagination.currentPage,
    pagination.setCurrentPage,
  ]);

  // --- Deletion Handlers ---
  const handleBulkDelete = async () => {
    const ids = Array.from(selection.selectedStudentIds);
    for (const id of ids) {
      await deleteStudent(id);
    }
    selection.clearSelection();
    modals.closeBulkDeleteModal();
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      pagination.setIsDeletingId(id);
      await deleteStudent(id);
    } catch (e) {
      console.error(e);
      alert('Deletion failed. Please try again.');
    } finally {
      pagination.setIsDeletingId(null);
      modals.closeDeleteConfirm();
    }
  };

  // --- Pagination Helpers ---
  const pageIds = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents
      .slice(startIndex, startIndex + ITEMS_PER_PAGE)
      .map((s) => s.id);
  }, [filteredStudents, pagination.currentPage]);

  // --- Render ---
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <LoadingOverlay
        isLoading={studentActions.isLoading}
        message={studentActions.loadingMessage}
      />

      <div id="main-content">
        <StudentHeaderActions
          isAdmin={isAdmin}
          isOffice={isOffice}
          selectedCount={selection.selectedStudentIds.size}
          fileInputRef={fileInputRef}
          onAddStudent={() => modals.openStudentModal()}
          onBulkDelete={() => modals.openBulkDeleteModal()}
          onDownloadTemplate={studentActions.handleDownloadTemplate}
          onExport={studentActions.handleExportCSV}
          onExportExcel={studentActions.handleExportExcel}
          onImport={() => fileInputRef.current?.click()}
        />

        <input
          type="file"
          ref={fileInputRef}
          accept=".csv, .xlsx, .xls"
          className="hidden"
          onChange={studentActions.handleFileChange}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 p-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl w-fit items-center shadow-sm">
        <div className="w-full sm:w-72">
          <StudentSearchBar
            searchTerm={filters.searchTerm}
            setSearchTerm={filters.setSearchTerm}
          />
        </div>

        <div
          className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700/60 mx-1"
          aria-hidden="true"
        />

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <label
              htmlFor="class-filter"
              className="sr-only"
            >
              Filter by Class
            </label>

            <select
              id="class-filter"
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              value={filters.classFilter}
              onChange={(e) => filters.setClassFilter(e.target.value)}
            >
              <option value="All">All Classes</option>
              {classes.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.name} {c.level ? `/ ${c.level}` : ''}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <label
              htmlFor="status-filter"
              className="sr-only"
            >
              Filter by Status
            </label>

            <select
              id="status-filter"
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              value={filters.statusFilter}
              onChange={(e) => filters.setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <StudentTable
        isAdmin={isAdmin}
        isOffice={isOffice}
        loading={loading}
        filteredStudents={filteredStudents}
        displayClassesMap={displayClassesMap}
        staff={staff}
        selectedStudentIds={selection.selectedStudentIds}
        highlightedStudentId={highlightedStudentId}
        currentPage={pagination.currentPage}
        pageSize={pagination.pageSize}
        isDeletingId={pagination.isDeletingId}
        onSelectStudent={selection.toggleSelect}
        onSelectAllOnPage={() => selection.toggleSelectAllOnPage(pageIds)}
        onEdit={modals.openStudentModal}
        onDelete={modals.openDeleteConfirm}
        onReportCard={modals.openReportModal}
        setCurrentPage={pagination.setCurrentPage}
        setPageSize={pagination.setPageSize}
      />

      {/* Modals */}
      {modals.isModalOpen && (
        <StudentModal
          studentData={modals.editingStudent}
          onClose={modals.closeStudentModal}
        />
      )}

      {modals.isReportModalOpen && modals.selectedReportStudent && (
        <ReportCardModal
          student={modals.selectedReportStudent}
          onClose={modals.closeReportModal}
        />
      )}

      {importState.importPreviewData && (
        <ImportPreviewModal
          students={importState.importPreviewData.studentsToPreview}
          onConfirm={studentActions.handleConfirmImport}
          onCancel={() => importState.setImportPreviewData(null)}
        />
      )}

      {importState.isImportModalOpen && (
        <ImportResultsModal
          results={importState.importResults}
          onClose={() => importState.setIsImportModalOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={modals.isConfirmDeleteOpen}
        title="Delete Student"
        message={`Are you sure you want to delete ${modals.studentToDelete?.name}? This action cannot be undone.`}
        onConfirm={() => handleDelete(modals.studentToDelete?.id)}
        onClose={modals.closeDeleteConfirm}
      />

      {modals.isBulkDeleteModalOpen && (
        <ConfirmModal
          isOpen={modals.isBulkDeleteModalOpen}
          title="Delete Selected Students"
          message={`Are you sure you want to permanently delete ${selection.selectedStudentIds.size} selected students? This will also remove their enrollments, attendance, and grades.`}
          confirmText={`Delete ${selection.selectedStudentIds.size} Students`}
          confirmColor="red"
          onConfirm={handleBulkDelete}
          onClose={modals.closeBulkDeleteModal}
        />
      )}
    </div>
  );
};

export default StudentsPage;
