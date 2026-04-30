import { useState } from 'react';
import * as XLSX from 'xlsx';
import { parseStudentCSV } from '../utils/csvParser';
import { parseExcelFile } from '../utils/excelParser';
import { importFileService } from '../services/importFileService';
import { generateStudentListCSV } from '../utils/reportGenerator';
import {
  prepareStudentsForPreview,
  processFinalStudentList,
  remapRelatedData,
} from '../utils/importProcessingUtils';

/**
 * Custom hook to handle student-related actions like Import and Export.
 */
export const useStudentActions = (dependencies) => {
  const {
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
    filteredStudents,
  } = dependencies;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // --- Template Management ---

  const handleDownloadTemplate = () => {
    const headers = [
      'Full Name',
      'Sex',
      'Date of Birth',
      'Level',
      'Phone Number',
      'Enrollment Date',
      'Status',
    ];
    const blob = new Blob([headers.join(',')], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student_template.csv';
    link.click();
  };

  // --- Export Actions ---

  const handleExportCSV = () => {
    const csvContent = generateStudentListCSV(filteredStudents);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    );
    link.download = `student_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
    const data = filteredStudents.map((s) => ({
      Name: s.name,
      Sex: s.sex,
      DOB: s.dob,
      Phone: s.phone || 'N/A',
      Enrollment: s.enrollmentDate,
      Status: s.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(
      workbook,
      `students_export_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // --- Import Lifecycle ---

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage(`Reading ${file.name}...`);

    try {
      if (file.name.endsWith('.csv')) {
        const { validStudents, errors } = await parseStudentCSV(
          await file.text()
        );
        const previewStudents = prepareStudentsForPreview(
          validStudents,
          students
        );

        if (previewStudents.length > 0) {
          importState.setImportPreviewData({
            type: 'csv',
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
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const results = await importFileService.processExcelFile(
          file,
          staff,
          classes,
          enrollments,
          timeSlots,
          {
            addClasses,
            addStudents,
            addEnrollments,
            saveGradeBatch,
            addStaffBatch,
            updateClassesBatch,
            updateStudentsBatch,
            addTimeSlotsBatch,
            parseExcelFile,
            students,
            onProgress: setLoadingMessage,
          }
        );

        if (results?.requiresPreview) {
          const { studentsToPreview, mappedGrades } = results.previewData;

          // Process missing subjects from the import
          if (mappedGrades?.length > 0) {
            const newSubjects = new Set();
            const allSubjects = [
              ...(subjects.Kid || []),
              ...(subjects.JuniorSenior || []),
            ];

            mappedGrades.forEach((g) => {
              if (g.subject && !allSubjects.includes(g.subject)) {
                newSubjects.add(g.subject);
              }
            });

            newSubjects.forEach((sub) => addSubject(sub, 'JuniorSenior'));
          }

          // Process missing levels from the import
          if (studentsToPreview?.length > 0) {
            const newLevels = new Set();

            studentsToPreview.forEach((s) => {
              if (s.level && !levels.includes(s.level)) {
                newLevels.add(s.level);
              }
            });

            newLevels.forEach((lvl) => addLevel(lvl));
          }

          importState.setImportPreviewData(results.previewData);
        } else if (results) {
          const globalErrors =
            results.errors?.filter((e) => e.sheet === 'Global') || [];

          if (globalErrors.length > 0) {
            console.warn('Import Warnings:', globalErrors);
            alert(globalErrors.map((e) => e.message).join('\n'));
          }

          importState.setImportResults(results);
          importState.setIsImportModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Import process error:', err);
      alert('Failed to import file: ' + err.message);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleConfirmImport = async (modifiedStudents) => {
    if (!importState.importPreviewData) return;

    setIsLoading(true);
    setLoadingMessage('Importing students...');

    try {
      const { finalAdd, finalUpdate, tempIdToFinalIdMap } =
        processFinalStudentList(
          modifiedStudents,
          students,
          importState.importPreviewData.type
        );

      if (finalAdd.length > 0) {
        await addStudents(finalAdd);
      }

      if (
        finalUpdate.length > 0 &&
        importState.importPreviewData.type === 'excel'
      ) {
        await updateStudentsBatch(finalUpdate);
      }

      if (importState.importPreviewData.type === 'excel') {
        const { remappedEnrollments, remappedGrades } = remapRelatedData(
          importState.importPreviewData.mappedEnrollments,
          importState.importPreviewData.mappedGrades,
          tempIdToFinalIdMap
        );

        if (remappedEnrollments.length > 0) {
          await addEnrollments(remappedEnrollments);
        }

        if (remappedGrades.length > 0) {
          await saveGradeBatch(remappedGrades);
        }
      }

      const studentErrors = (importState.importPreviewData.errors || []).filter(
        (e) => e.sheet !== 'Global'
      );
      const warnings = (importState.importPreviewData.errors || []).filter(
        (e) => e.sheet === 'Global'
      );

      importState.setImportResults({
        successCount:
          finalAdd.length +
          (importState.importPreviewData.type === 'excel'
            ? importState.importPreviewData.mappedGrades?.length || 0
            : 0),
        errorCount: studentErrors.length,
        errors: studentErrors,
        warnings,
      });
    } catch (e) {
      console.error(e);
      alert('Failed to save imported data.');
    } finally {
      importState.setImportPreviewData(null);
      importState.setIsImportModalOpen(true);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loadingMessage,
    handleDownloadTemplate,
    handleExportCSV,
    handleExportExcel,
    handleFileChange,
    handleConfirmImport,
  };
};
