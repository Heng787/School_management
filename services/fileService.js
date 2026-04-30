/**
 * Utility functions for file operations (download, export, etc.).
 */

// --- Base Utilities ---

export const downloadFile = (
  content,
  filename,
  type = 'text/csv;charset=utf-8;'
) => {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const triggerFileInput = (fileInputRef) => {
  fileInputRef.current?.click();
};

// --- Template Downloads ---

export const downloadTemplate = () => {
  const headers = ['Class Name', 'Level', 'Teacher', 'Schedule'];
  const csvContent = headers.join(',');
  downloadFile(csvContent, 'class_import_template.csv');
};

// --- Roster Exports ---

export const exportClassesToCSV = (
  selectedList,
  staff,
  students,
  enrollments,
  generateSingleClassCSV,
  generateBulkClassCSV
) => {
  if (selectedList.length === 0) return;

  let csvContent = '';
  let filename = 'exported_classes.csv';

  if (selectedList.length === 1) {
    csvContent = generateSingleClassCSV(
      selectedList[0],
      staff,
      students,
      enrollments
    );
    filename = `${selectedList[0].name.replace(/\s+/g, '_')}_roster.csv`;
  } else {
    csvContent = generateBulkClassCSV(
      selectedList,
      staff,
      students,
      enrollments
    );
    filename = `bulk_class_export_${new Date().toISOString().split('T')[0]}.csv`;
  }

  downloadFile(csvContent, filename);
};
