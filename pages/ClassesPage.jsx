import React, { useEffect, useState } from 'react';

import ClassModal from '../components/ClassModal';
import {
  LevelManager,
  SessionManager,
  SubjectManager,
} from '../components/ClassAcademicConfig';
import ConfirmModal from '../components/ConfirmModal';
import ImportPreviewModal from '../components/ImportPreviewModal';
import ImportResultsModal from '../components/ImportResultsModal';
import {
  ClassesPageHeader,
  ClassesPageFilters,
  ClassesList,
} from '../components/charts/classespage';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { useData } from '../context/DataContext';
import { useClassFiltering } from '../hooks/useClassFiltering';
import { useClassesPageState } from '../hooks/useClassesPageState';
import { importFileService } from '../services/importFileService';

import {
  downloadTemplate,
  triggerFileInput,
  exportClassesToCSV,
} from '../services/fileService';
import { UserRole } from '../types';
import { parseClassCSV } from '../utils/csvParser';
import { parseExcelFile } from '../utils/excelParser';
import {
  processFinalStudentList,
  remapRelatedData,
} from '../utils/importProcessingUtils';
import {
  generateSingleClassCSV,
  generateBulkClassCSV,
} from '../utils/reportGenerator';

/**
 * PAGE: ClassesPage
 * DESCRIPTION: Handles class management, scheduling, and enrollment.
 */
const ClassesPage = () => {
  // --- Context & Data ---
  const {
    classes,
    staff,
    students,
    timeSlots,
    levels,
    deleteClass,
    addClasses,
    addStudents,
    addEnrollments,
    saveGradeBatch,
    highlightedClassId,
    setHighlightedClassId,
    enrollments,
    currentUser,
    addStaffBatch,
    updateClassesBatch,
    updateStudentsBatch,
    addTimeSlotsBatch,
  } = useData();

  const isAdmin = currentUser?.role === UserRole.Admin;
  const isOffice = currentUser?.role === UserRole.OfficeWorker;

  // --- Local UI State ---
  const state = useClassesPageState();
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const {
    filteredClasses,
    availableTeachers,
    allSessionLabels,
    classesByTimeSlot,
  } = useClassFiltering(
    classes,
    state.selectedLevel,
    state.selectedTeacherIds,
    state.selectedTime,
    currentUser,
    staff,
    timeSlots,
  );

  // --- Side Effects ---
  useEffect(() => {
    document.title = 'Class Management | SchoolAdmin Dashboard';
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        state.teacherDropdownRef.current &&
        !state.teacherDropdownRef.current.contains(event.target)
      ) {
        state.setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedClassId) {
      state.highlightedRowRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      const timer = setTimeout(() => setHighlightedClassId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedClassId, setHighlightedClassId]);

  // --- Modal Handlers ---
  const handleOpenModal = (e, classData = null) => {
    if (e) e.stopPropagation();
    state.setEditingClass(classData);
    state.setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    state.setIsModalOpen(false);
    state.setEditingClass(null);
  };

  // --- Selection Handlers ---
  const handleToggleSelect = (classId) => {
    state.setSelectedClassIds((prev) => {
      const next = new Set(prev);
      next.has(classId) ? next.delete(classId) : next.add(classId);
      return next;
    });
  };

  const handleSelectAllInView = () => {
    state.setSelectedClassIds(
      state.selectedClassIds.size >= filteredClasses.length
        ? new Set()
        : new Set(filteredClasses.map((c) => c.id)),
    );
  };

  // --- Export Handler ---
  const handleExportSelected = () => {
    const selectedList = filteredClasses.filter((c) =>
      state.selectedClassIds.has(c.id),
    );
    exportClassesToCSV(
      selectedList,
      staff,
      students,
      enrollments,
      generateSingleClassCSV,
      generateBulkClassCSV,
    );
  };

  // --- Delete Handlers ---
  const handleDeleteSelected = () => {
    if (state.selectedClassIds.size === 0) return;
    state.setIsBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    const idsToDelete = Array.from(state.selectedClassIds);
    if (idsToDelete.length === 0) return;

    setIsLoading(true);
    setLoadingMessage(`Deleting ${idsToDelete.length} classes...`);

    try {
      // Execute deletions in parallel for efficiency
      const results = await Promise.allSettled(
        idsToDelete.map((id) => deleteClass(id)),
      );

      const failedCount = results.filter((r) => r.status === 'rejected').length;

      if (failedCount > 0) {
        alert(
          `Deleted ${idsToDelete.length - failedCount} classes. ${failedCount} failed.`,
        );
        // Update selection to only include failed items so the user can retry
        const failedIds = idsToDelete.filter(
          (id, idx) => results[idx].status === 'rejected',
        );
        state.setSelectedClassIds(new Set(failedIds));
      } else {
        state.setSelectedClassIds(new Set());
      }
      state.setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('An unexpected error occurred during bulk delete.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (state.classToDelete) {
      try {
        await deleteClass(state.classToDelete.id);
        state.setSelectedClassIds((prev) => {
          const next = new Set(prev);
          next.delete(state.classToDelete.id);
          return next;
        });
        state.setClassToDelete(null);
        state.setIsConfirmDeleteOpen(false);
      } catch (error) {
        console.error('Failed to delete class:', error);
      }
    }
  };

  const handleDeleteClassRow = (e, cls) => {
    e.stopPropagation();
    state.setClassToDelete(cls);
    state.setIsConfirmDeleteOpen(true);
  };

  // --- File Import Handler ---
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage(`Reading ${file.name}...`);

    try {
      let results;
      if (file.name.endsWith('.csv')) {
        results = await importFileService.processCSVFile(
          file,
          staff,
          classes,
          addClasses,
          parseClassCSV,
        );
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        results = await importFileService.processExcelFile(
          file,
          staff,
          classes,
          enrollments,
          timeSlots,
          {
            addClasses,
            addStudents,
            addEnrollments,
            saveGradeBatch: null, // Classes import: skip grades/subjects
            addStaffBatch,
            updateClassesBatch,
            updateStudentsBatch,
            addTimeSlotsBatch,
            parseExcelFile,
            students,
          },
        );
      }

      if (results?.requiresPreview) {
        setImportPreviewData(results.previewData);
      } else if (results) {
        state.setImportResults(results);
        state.setIsImportModalOpen(true);
      }
    } catch (err) {
      alert('Failed to import file: ' + err.message);
    } finally {
      setIsLoading(false);
    }

    if (event.target) event.target.value = '';
  };

  const handleConfirmImport = async (modifiedStudents) => {
    if (!importPreviewData) return;

    setIsLoading(true);
    setLoadingMessage('Importing data...');

    try {
      const { finalAdd, finalUpdate, tempIdToFinalIdMap } =
        processFinalStudentList(modifiedStudents, students, 'excel');

      if (finalAdd.length > 0) await addStudents(finalAdd);
      if (finalUpdate.length > 0) await updateStudentsBatch(finalUpdate);

      const { remappedEnrollments } = remapRelatedData(
        importPreviewData.mappedEnrollments,
        [],
        tempIdToFinalIdMap,
      );

      // No grade handling for Classes import
      if (remappedEnrollments.length > 0)
        await addEnrollments(remappedEnrollments);

      state.setImportResults({
        successCount:
          finalAdd.length +
          finalUpdate.length +
          (importPreviewData.addedStaffCount || 0) +
          (importPreviewData.addedClassesCount || 0),
        errorCount: importPreviewData.errors.length,
        errors: importPreviewData.errors,
      });

      setSuccessMessage(
        `Successfully imported ${finalAdd.length} new students, updated ${finalUpdate.length}, and added related class data.`,
      );
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) {
      console.error(e);
      alert('Failed to save imported data.');
    } finally {
      setImportPreviewData(null);
      state.setIsImportModalOpen(true);
      setIsLoading(false);
    }
  };

  // --- Utility Functions ---
  const getTeacherName = (teacherId, cls) => {
    const staffMember = staff.find((t) => t.id === teacherId);
    if (!staffMember || staffMember.name.length < 5) {
      return cls?.teacherName || 'Unassigned';
    }
    return staffMember.name;
  };

  const handleTeacherSelect = (teacherId) => {
    state.setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId],
    );
  };

  // --- Render ---
  return (
    <div className="container mx-auto">
      {/* Skip to Main Content */}
      <a
        href="#main-classes-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:m-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Skip to Classes Content
      </a>

      <div className="max-w-7xl mx-auto pb-10 space-y-6">
        <LoadingOverlay isLoading={isLoading} message={loadingMessage} />

        {successMessage && (
          <div className="fixed top-24 right-6 z-[60] bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right-4 duration-300 flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-full">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="font-bold text-sm">{successMessage}</span>
          </div>
        )}

        {/* Header */}
        <ClassesPageHeader
          selectedClassIds={state.selectedClassIds}
          isAdmin={isAdmin}
          isConfigOpen={state.isConfigOpen}
          onDeleteSelected={handleDeleteSelected}
          onExportSelected={handleExportSelected}
          onDownloadTemplate={() => downloadTemplate()}
          onImportClick={() => triggerFileInput(state.fileInputRef)}
          onToggleConfig={() => state.setIsConfigOpen(!state.isConfigOpen)}
          onAddClass={(e) => handleOpenModal(e)}
          fileInputRef={state.fileInputRef}
          onFileChange={handleFileChange}
        />

        {/* Academic Configuration */}
        {state.isConfigOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <LevelManager />
            <SessionManager />
            <SubjectManager />
          </div>
        )}

        {/* Filters */}
        <ClassesPageFilters
          isAdmin={isAdmin}
          isOffice={isOffice}
          filteredClasses={filteredClasses}
          selectedClassIds={state.selectedClassIds}
          onSelectAll={handleSelectAllInView}
          selectedLevel={state.selectedLevel}
          onLevelChange={state.setSelectedLevel}
          levels={levels}
          selectedTeacherIds={state.selectedTeacherIds}
          availableTeachers={availableTeachers}
          isTeacherDropdownOpen={state.isTeacherDropdownOpen}
          onTeacherDropdownToggle={state.setIsTeacherDropdownOpen}
          teacherDropdownRef={state.teacherDropdownRef}
          onTeacherSelect={handleTeacherSelect}
          selectedTime={state.selectedTime}
          onTimeChange={state.setSelectedTime}
          allSessionLabels={allSessionLabels}
        />

        <main id="main-classes-content" className="outline-none" tabIndex="-1">
          {/* Class List */}
          <ClassesList
            allSessionLabels={allSessionLabels}
            classesByTimeSlot={classesByTimeSlot}
            enrollments={enrollments}
            students={students}
            highlightedClassId={highlightedClassId}
            highlightedRowRef={state.highlightedRowRef}
            isAdmin={isAdmin}
            isOffice={isOffice}
            selectedClassIds={state.selectedClassIds}
            expandedClassId={state.expandedClassId}
            getTeacherName={getTeacherName}
            onToggleExpand={state.setExpandedClassId}
            onToggleSelect={handleToggleSelect}
            onEdit={handleOpenModal}
            onDelete={handleDeleteClassRow}
          />
        </main>

        {/* Modals */}
        {state.isModalOpen && (
          <ClassModal
            classData={state.editingClass}
            onClose={handleCloseModal}
          />
        )}
        {importPreviewData && (
          <ImportPreviewModal
            students={importPreviewData.studentsToPreview}
            onConfirm={handleConfirmImport}
            onCancel={() => setImportPreviewData(null)}
          />
        )}
        {state.isImportModalOpen && (
          <ImportResultsModal
            results={state.importResults}
            onClose={() => state.setIsImportModalOpen(false)}
          />
        )}
        <ConfirmModal
          isOpen={state.isConfirmDeleteOpen}
          onClose={() => state.setIsConfirmDeleteOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Class"
          message={`Are you sure you want to delete class ${state.classToDelete?.name}? All enrollments and marks for this class will be affected.`}
        />
        <ConfirmModal
          isOpen={state.isBulkDeleteConfirmOpen}
          onClose={() => state.setIsBulkDeleteConfirmOpen(false)}
          onConfirm={confirmBulkDelete}
          title="Delete Multiple Classes"
          message={`Are you sure you want to delete ${state.selectedClassIds.size} selected classes? This action cannot be undone and will affect all related enrollment data.`}
        />
      </div>
    </div>
  );
};

export default ClassesPage;
