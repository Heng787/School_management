import { useState } from 'react';

/**
 * Combines all state management for ReportsPage.
 */
export const useReportsPageState = () => {
  // --- Marks Entry State ---

  const [selectedMarksClassId, setSelectedMarksClassId] = useState(
    () => sessionStorage.getItem('reports_marks_class') || ''
  );

  const [selectedTerm, setSelectedTerm] = useState(
    () => sessionStorage.getItem('reports_marks_term') || 'Midterm'
  );

  const [localGrades, setLocalGrades] = useState({});
  const [modifiedStudents, setModifiedStudents] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- Export Center State ---

  const [exportMode, setExportMode] = useState('class');

  const [selectedExportClassId, setSelectedExportClassId] = useState(
    () => sessionStorage.getItem('reports_export_class') || ''
  );

  const [selectedLevel, setSelectedLevel] = useState('');

  // --- Attendance Report State ---

  const [selectedAttendanceClassId, setSelectedAttendanceClassId] = useState(
    () => sessionStorage.getItem('reports_attendance_class') || ''
  );

  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [flaggedIds, setFlaggedIds] = useState(new Set());

  const [timeRange, setTimeRange] = useState(
    () => sessionStorage.getItem('reports_attendance_time') || 'today'
  );

  // --- Main Page State ---

  const [activeTab, setActiveTab] = useState('marks');

  return {
    // Marks
    selectedMarksClassId,
    setSelectedMarksClassId,
    selectedTerm,
    setSelectedTerm,
    localGrades,
    setLocalGrades,
    modifiedStudents,
    setModifiedStudents,
    isSaving,
    setIsSaving,
    saveSuccess,
    setSaveSuccess,

    // Export
    exportMode,
    setExportMode,
    selectedExportClassId,
    setSelectedExportClassId,
    selectedLevel,
    setSelectedLevel,

    // Attendance
    selectedAttendanceClassId,
    setSelectedAttendanceClassId,
    expandedStudentId,
    setExpandedStudentId,
    flaggedIds,
    setFlaggedIds,
    timeRange,
    setTimeRange,

    // Main
    activeTab,
    setActiveTab,
  };
};
