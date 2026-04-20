import React, { useEffect } from "react";
import { useData } from "../context/DataContext";
import { UserRole } from "../types";
import ClassModal from "../components/ClassModal";
import {
  LevelManager,
  SessionManager,
  SubjectManager,
} from "../components/ClassAcademicConfig";
import ImportResultsModal from "../components/ImportResultsModal";
import ImportPreviewModal from "../components/ImportPreviewModal";
import ConfirmModal from "../components/ConfirmModal";
import { useClassesPageState } from "../hooks/useClassesPageState";
import { useClassFiltering } from "../hooks/useClassFiltering";
import { parseClassCSV } from "../utils/csvParser";
import { parseExcelFile } from "../utils/excelParser";
import {
  generateSingleClassCSV,
  generateBulkClassCSV,
} from "../utils/reportGenerator";
import {
  downloadFile,
  downloadTemplate,
  triggerFileInput,
  exportClassesToCSV,
} from "../services/fileService";
import { importFileService } from "../services/importFileService";
import {
  ClassesPageHeader,
  ClassesPageFilters,
  ClassesList,
} from "../components/charts/classespage";

/**
 * PAGE: ClassesPage
 * DESCRIPTION: Handles class management, scheduling, and enrollment.
 * LOCATION: /classes
 */
const ClassesPage = () => {
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

  const state = useClassesPageState();
  const [importPreviewData, setImportPreviewData] = React.useState(null);

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

  // Side Effects
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        state.teacherDropdownRef.current &&
        !state.teacherDropdownRef.current.contains(event.target)
      ) {
        state.setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedClassId) {
      state.highlightedRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const timer = setTimeout(() => setHighlightedClassId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedClassId, setHighlightedClassId]);

  // Modal Handlers
  const handleOpenModal = (e, classData = null) => {
    if (e) e.stopPropagation();
    state.setEditingClass(classData);
    state.setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    state.setIsModalOpen(false);
    state.setEditingClass(null);
  };

  // Selection Handlers
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

  // Export Handler
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

  // Delete Handlers
  const handleDeleteSelected = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${state.selectedClassIds.size} selected class${
          state.selectedClassIds.size > 1 ? "es" : ""
        }? This action cannot be undone.`,
      )
    ) {
      return;
    }
    for (const id of state.selectedClassIds) {
      deleteClass(id);
    }
    state.setSelectedClassIds(new Set());
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
        console.error("Failed to delete class:", error);
      }
    }
  };

  const handleDeleteClassRow = (e, cls) => {
    e.stopPropagation();
    state.setClassToDelete(cls);
    state.setIsConfirmDeleteOpen(true);
  };

  // File Import Handler
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let results;
      if (file.name.endsWith(".csv")) {
        results = await importFileService.processCSVFile(
          file,
          staff,
          classes,
          addClasses,
          parseClassCSV,
        );
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
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
      alert("Failed to import file: " + err.message);
    }

    if (event.target) event.target.value = "";
  };

  const handleConfirmImport = async (modifiedStudents) => {
    if (!importPreviewData) return;

    try {
      const finalAdd = [];
      const finalUpdate = [];
      const tempIdToFinalIdMap = {};

      let lastStuId = students
        .map((s) => parseInt(s.id.substring(1), 10))
        .filter((id) => !isNaN(id))
        .reduce((max, curr) => Math.max(max, curr), 0);

      const COPY_IF_MISSING = ["phone", "dob", "level"];

      modifiedStudents.forEach(impStu => {
        let finalId;
        if (impStu._selectedMatchId === 'NEW') {
          finalId = `s${++lastStuId}`;
          finalAdd.push({ ...impStu, id: finalId, sex: impStu.sex });
        } else {
          finalId = impStu._selectedMatchId;
          const existing = students.find(s => s.id === finalId) || impStu;
          
          const updates = Object.fromEntries(
            COPY_IF_MISSING.filter((k) => !existing[k] && impStu[k]).map(
              (k) => [k, impStu[k]],
            ),
          );
          if (impStu.status && existing.status !== impStu.status) updates.status = impStu.status;
          
          if (Object.keys(updates).length > 0) {
            finalUpdate.push({ ...existing, ...updates });
          }
        }
        tempIdToFinalIdMap[impStu._tempId] = finalId;
      });

      if (finalAdd.length > 0) await addStudents(finalAdd);
      if (finalUpdate.length > 0) await updateStudentsBatch(finalUpdate);

      const finalEnrollments = (importPreviewData.mappedEnrollments || []).map(e => ({
        ...e,
        studentId: tempIdToFinalIdMap[e.studentId] || e.studentId
      }));

      // No grade handling for Classes import
      if (finalEnrollments.length > 0) await addEnrollments(finalEnrollments);

      state.setImportResults({
        successCount: finalAdd.length + (importPreviewData.addedStaffCount || 0) + (importPreviewData.addedClassesCount || 0),
        errorCount: importPreviewData.errors.length,
        errors: importPreviewData.errors,
      });

    } catch (e) {
      console.error(e);
      alert("Failed to save imported data.");
    } finally {
      setImportPreviewData(null);
      state.setIsImportModalOpen(true);
    }
  };

  // Utility Functions
  const getTeacherName = (teacherId, cls) => {
    const staffMember = staff.find((t) => t.id === teacherId);
    if (!staffMember || staffMember.name.length < 5) {
      return cls?.teacherName || "Unassigned";
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

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6">
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

      {/* Modals */}
      {state.isModalOpen && (
        <ClassModal classData={state.editingClass} onClose={handleCloseModal} />
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
    </div>
  );
};

export default ClassesPage;
