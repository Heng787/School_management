import { useState } from 'react';
import { StaffRole } from '../types';
import { generateStaffCSV } from '../utils/reportGenerator';
import { parseStaffCSV } from '../utils/csvParser';
import { parseExcelFile } from '../utils/excelParser';

/**
 * Custom hook to handle teacher-related actions like Import and Export.
 */
export const useTeacherActions = (dependencies) => {
  const { staff, addStaffBatch, setImportResults, setIsImportModalOpen } =
    dependencies;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // --- Export Actions ---

  const handleDownloadReport = () => {
    const csvData = generateStaffCSV(staff);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'staff_list.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Template Actions ---

  const handleDownloadTemplate = () => {
    const headers = ['Name', 'Role', 'Contact', 'Hire Date'];
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'staff_import_template.csv';
    link.click();
  };

  // --- Import Lifecycle ---

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage(`Reading ${file.name}...`);

    let validStaff = [];
    let errors = [];

    try {
      if (file.name.endsWith('.csv')) {
        const result = parseStaffCSV(await file.text());
        validStaff = result.validStaff;
        errors = result.errors;
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          const excelResult = await parseExcelFile(file);
          const teacherNames = new Set();

          if (excelResult.classes && excelResult.classes.length > 0) {
            excelResult.classes.forEach((c) => {
              if (c.teacherName && c.teacherName.trim()) {
                teacherNames.add(c.teacherName.trim());
              }
            });
          }

          teacherNames.forEach((name) => {
            validStaff.push({
              name: name,
              role: StaffRole.Teacher,
              contact: '',
              hireDate: new Date().toISOString().split('T')[0],
              status: 'Active',
            });
          });
        } catch (err) {
          console.error('Excel parse error:', err);
          alert('Failed to parse Excel file: ' + err.message);
          return;
        }
      } else {
        alert('Please upload a CSV or Excel file.');
        return;
      }

      // --- Duplicate Checking ---

      const existingNames = new Set(staff.map((s) => s.name.toLowerCase()));
      const existingFullIDs = new Set(
        staff.map((s) => `${s.name.toLowerCase()}|${s.contact.toLowerCase()}`)
      );

      const internalNewIdentifiers = new Set();
      const nonDuplicateStaff = [];
      const duplicateErrors = [];

      validStaff.forEach((s, idx) => {
        const id = `${s.name.toLowerCase()}|${s.contact.toLowerCase()}`;
        const alreadyExists =
          existingFullIDs.has(id) ||
          (s.contact === '' && existingNames.has(s.name.toLowerCase()));

        if (alreadyExists || internalNewIdentifiers.has(id)) {
          duplicateErrors.push({
            row: idx + 2,
            message: `Staff member '${s.name}' ${s.contact ? `with contact '${s.contact}'` : ''} already exists and was skipped.`,
          });
        } else {
          internalNewIdentifiers.add(id);
          nonDuplicateStaff.push(s);
        }
      });

      if (nonDuplicateStaff.length > 0) {
        await addStaffBatch(nonDuplicateStaff);
      }

      setImportResults({
        successCount: nonDuplicateStaff.length,
        errorCount: errors.length + duplicateErrors.length,
        errors: [...errors, ...duplicateErrors],
      });
      setIsImportModalOpen(true);
    } catch (err) {
      console.error('Import error:', err);
      alert('Failed to process file: ' + err.message);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  return {
    isLoading,
    loadingMessage,
    handleDownloadReport,
    handleDownloadTemplate,
    handleFileChange,
  };
};
