import React, { useEffect, useRef, useMemo } from "react";
import { useData } from "../context/DataContext";
import { UserRole } from "../types";
import { parseStudentCSV } from "../utils/csvParser";
import { parseExcelFile } from "../utils/excelParser";
import ImportResultsModal from "../components/ImportResultsModal";
import ImportPreviewModal from "../components/ImportPreviewModal";
import ConfirmModal from "../components/ConfirmModal";
import ReportCardModal from "../components/ReportCardModal";

// Import sub-components from studentspage folder
import StudentModal from "../components/studentspage/StudentModal";
import StudentHeaderActions from "../components/studentspage/StudentHeaderActions";
import StudentSearchBar from "../components/studentspage/StudentSearchBar";
import StudentTable from "../components/studentspage/StudentTable";

// Import custom hooks and utilities
import {
  useFilters,
  useStudentSelection,
  useModalState,
  useImportState,
  usePaginationState,
} from "../hooks/useStudentsPageState";
import {
  applyAllFilters,
  buildDisplayClassesMap,
} from "../utils/studentFilterUtils";
import {
  prepareStudentsForPreview,
  processFinalStudentList,
  remapRelatedData,
} from "../utils/importProcessingUtils";

const ITEMS_PER_PAGE = 20;

/**
 * PAGE: StudentsPage
 * DESCRIPTION: Main view for student management with component-based architecture.
 * REFACTORED: Uses custom hooks for cleaner state management
 */
const StudentsPage = () => {
  // --- 1. CONTEXT & DATA ---
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
    currentUser,
    levels,
    subjects,
    addLevel,
    addSubject,
    updateStudentsBatch,
    addEnrollments,
    saveGradeBatch,
  } = useData();

  // --- 2. CUSTOM HOOKS FOR STATE MANAGEMENT ---
  const filters = useFilters();
  const selection = useStudentSelection();
  const modals = useModalState();
  const importState = useImportState();
  const pagination = usePaginationState();

  // --- 3. REFS ---
  const fileInputRef = useRef(null);
  const highlightedRowRef = useRef(null);

  // --- 4. DERIVED VALUES ---
  const isAdmin = currentUser?.role === UserRole.Admin;
  const isOffice = currentUser?.role === UserRole.OfficeWorker;

  // --- 5. MEMOIZED DATA ---
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

  // --- 6. SIDE EFFECTS ---
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
              behavior: "smooth",
              block: "center",
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

  // --- 7. DELETION HANDLERS ---
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
      alert("Deletion failed. Please try again.");
    } finally {
      pagination.setIsDeletingId(null);
      modals.closeDeleteConfirm();
    }
  };

  // --- 8. CSV/EXCEL EXPORT HANDLERS ---
  const handleDownloadTemplate = () => {
    const headers = [
      "Full Name",
      "Sex",
      "Date of Birth",
      "Level",
      "Phone Number",
      "Enrollment Date",
      "Status",
    ];
    const blob = new Blob([headers.join(",")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "student_template.csv";
    link.click();
  };

  const handleExportCSV = () => {
    const csvContent = generateStudentListCSV(filteredStudents);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
    );
    link.download = `student_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // --- 9. FILE IMPORT HANDLERS ---
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".csv")) {
      const { validStudents, errors } = await parseStudentCSV(
        await file.text(),
      );
      const previewStudents = prepareStudentsForPreview(
        validStudents,
        students,
      );

      if (previewStudents.length > 0) {
        importState.setImportPreviewData({
          type: "csv",
          studentsToPreview: previewStudents,
          errors,
        });
      } else {
        importState.setImportResults({
          successCount: 0,
          errorCount: errors.length,
          errors: errors,
        });
        importState.setIsImportModalOpen(true);
      }
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      try {
        const result = await parseExcelFile(file);
        const classIDMap = {};
        let lastStuId = 0;

        // Smart class matching
        if (result.classes && result.classes.length > 0) {
          for (const impClass of result.classes) {
            const existing = classes.find(
              (c) =>
                c.name.trim().toLowerCase() ===
                  impClass.name.trim().toLowerCase() &&
                c.level.trim().toLowerCase() ===
                  impClass.level.trim().toLowerCase(),
            );
            if (existing) {
              classIDMap[impClass.id] = existing.id;
            }
          }
        }

        // Smart student matching & ID preparation
        const studentIDMap = {};
        const previewStudents = [];
        if (result.students?.length > 0) {
          for (const impStu of result.students) {
            impStu._tempId = `temp_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 5)}`;
            studentIDMap[impStu.id] = impStu._tempId;

            const existingMatches = students.filter(
              (s) =>
                s.name.trim().toLowerCase() ===
                impStu.name.trim().toLowerCase(),
            );

            if (existingMatches.length > 0) {
              impStu._possibleMatches = existingMatches;
              const defaultMatch = existingMatches.find(
                (s) => s.sex.toLowerCase() === impStu.sex.toLowerCase(),
              );
              impStu._selectedMatchId = defaultMatch ? defaultMatch.id : "NEW";
            } else {
              impStu._selectedMatchId = "NEW";
            }
            previewStudents.push(impStu);
          }
        }

        // Smart enrollment matching
        let mappedEnrollments = [];
        if (result.enrollments && result.enrollments.length > 0) {
          mappedEnrollments = result.enrollments
            .filter((enr) => classIDMap[enr.classId])
            .map((enr) => ({
              studentId: studentIDMap[enr.studentId] || enr.studentId,
              classId: classIDMap[enr.classId],
              enrollmentDate: new Date().toISOString().split("T")[0],
              status: "Enrolled",
            }))
            .filter((enr, idx, self) => {
              const alreadyInSystem = enrollments.some(
                (e) =>
                  e.studentId === enr.studentId && e.classId === enr.classId,
              );
              if (alreadyInSystem) return false;
              const repeatInImport =
                self.findIndex(
                  (s) =>
                    s.studentId === enr.studentId && s.classId === enr.classId,
                ) !== idx;
              return !repeatInImport;
            });
        }

        // Smart grade matching
        let mappedGrades = [];
        if (result.grades && result.grades.length > 0) {
          mappedGrades = result.grades
            .filter((grd) => classIDMap[grd.classId])
            .map((grd) => ({
              ...grd,
              studentId: studentIDMap[grd.studentId] || grd.studentId,
              classId: classIDMap[grd.classId],
              id: `grd_imp_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 5)}`,
            }));

          const newSubjects = new Set();
          const allSubjects = [
            ...(subjects.Kid || []),
            ...(subjects.JuniorSenior || []),
          ];
          result.grades.forEach((g) => {
            if (g.subject && !allSubjects.includes(g.subject))
              newSubjects.add(g.subject);
          });
          newSubjects.forEach((sub) => addSubject(sub, "JuniorSenior"));
        }

        if (result.classes && result.classes.length > 0) {
          const newLevels = new Set();
          result.classes.forEach((c) => {
            if (c.level && !levels.includes(c.level)) newLevels.add(c.level);
          });
          newLevels.forEach((lvl) => addLevel(lvl));
        }

        if (previewStudents.length > 0) {
          importState.setImportPreviewData({
            type: "excel",
            studentsToPreview: previewStudents,
            mappedEnrollments,
            mappedGrades,
            errors: result.errors?.map((err) => ({ message: err })) || [],
          });
        } else {
          importState.setImportResults({
            successCount: result.grades?.length || 0,
            errorCount: result.errors?.length || 0,
            errors: result.errors?.map((err) => ({ message: err })) || [],
            message: `Import complete! Added ${result.grades?.length || 0} marks.`,
          });
          importState.setIsImportModalOpen(true);
        }
      } catch (err) {
        alert("Failed to parse Excel file: " + err.message);
      }
    }

    e.target.value = "";
  };

  // --- 10. IMPORT CONFIRMATION ---
  const handleConfirmImport = async (modifiedStudents) => {
    if (!importState.importPreviewData) return;

    try {
      const { finalAdd, finalUpdate, tempIdToFinalIdMap } =
        processFinalStudentList(
          modifiedStudents,
          students,
          importState.importPreviewData.type,
        );

      if (finalAdd.length > 0) await addStudents(finalAdd);
      if (
        finalUpdate.length > 0 &&
        importState.importPreviewData.type === "excel"
      ) {
        await updateStudentsBatch(finalUpdate);
      }

      if (importState.importPreviewData.type === "excel") {
        const { remappedEnrollments, remappedGrades } = remapRelatedData(
          importState.importPreviewData.mappedEnrollments,
          importState.importPreviewData.mappedGrades,
          tempIdToFinalIdMap,
        );

        if (remappedEnrollments.length > 0)
          await addEnrollments(remappedEnrollments);
        if (remappedGrades.length > 0) await saveGradeBatch(remappedGrades);
      }

      importState.setImportResults({
        successCount:
          finalAdd.length +
          (importState.importPreviewData.type === "excel"
            ? importState.importPreviewData.mappedGrades?.length || 0
            : 0),
        errorCount: importState.importPreviewData.errors.length,
        errors: importState.importPreviewData.errors,
      });
    } catch (e) {
      console.error(e);
      alert("Failed to save imported data.");
    } finally {
      importState.setImportPreviewData(null);
      importState.setIsImportModalOpen(true);
    }
  };

  // --- 11. PAGINATION HELPERS ---
  const pageIds = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents
      .slice(startIndex, startIndex + ITEMS_PER_PAGE)
      .map((s) => s.id);
  }, [filteredStudents, pagination.currentPage]);

  // --- 12. RENDER ---
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <StudentHeaderActions
          onExport={handleExportCSV}
          onDownloadTemplate={handleDownloadTemplate}
          onImport={() => fileInputRef.current?.click()}
          onAddStudent={() => modals.openStudentModal()}
          fileInputRef={fileInputRef}
          isAdmin={isAdmin}
          isOffice={isOffice}
          selectedCount={selection.selectedStudentIds.size}
          onBulkDelete={() => modals.openBulkDeleteModal()}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 p-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl w-fit items-center shadow-sm">
        <div className="w-full sm:w-72">
          <StudentSearchBar
            searchTerm={filters.searchTerm}
            setSearchTerm={filters.setSearchTerm}
          />
        </div>
        
        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700/60 mx-1" />

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.classFilter}
              onChange={(e) => filters.setClassFilter(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <option value="All">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.level ? `/ ${c.level}` : ""}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.statusFilter}
              onChange={(e) => filters.setStatusFilter(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <StudentTable
        filteredStudents={filteredStudents}
        currentPage={pagination.currentPage}
        setCurrentPage={pagination.setCurrentPage}
        pageSize={pagination.pageSize}
        setPageSize={pagination.setPageSize}
        highlightedStudentId={highlightedStudentId}
        displayClassesMap={displayClassesMap}
        staff={staff}
        isAdmin={isAdmin}
        isOffice={isOffice}
        selectedStudentIds={selection.selectedStudentIds}
        isDeletingId={pagination.isDeletingId}
        onSelectStudent={selection.toggleSelect}
        onSelectAllOnPage={() => selection.toggleSelectAllOnPage(pageIds)}
        onEdit={modals.openStudentModal}
        onDelete={modals.openDeleteConfirm}
        onReportCard={modals.openReportModal}
        loading={loading}
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
          onConfirm={handleConfirmImport}
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
        onClose={modals.closeDeleteConfirm}
        onConfirm={() => handleDelete(modals.studentToDelete?.id)}
        title="Delete Student"
        message={`Are you sure you want to delete ${modals.studentToDelete?.name}? This action cannot be undone.`}
      />
      {modals.isBulkDeleteModalOpen && (
        <ConfirmModal
          isOpen={modals.isBulkDeleteModalOpen}
          onClose={modals.closeBulkDeleteModal}
          onConfirm={handleBulkDelete}
          title="Delete Selected Students"
          message={`Are you sure you want to permanently delete ${selection.selectedStudentIds.size} selected students? This will also remove their enrollments, attendance, and grades.`}
          confirmText={`Delete ${selection.selectedStudentIds.size} Students`}
          confirmColor="red"
        />
      )}
    </div>
  );
};

export default StudentsPage;
