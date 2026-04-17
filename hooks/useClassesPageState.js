import { useState, useRef } from "react";

/**
 * Combines all state management for ClassesPage
 */
export const useClassesPageState = () => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  // Config state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [expandedClassId, setExpandedClassId] = useState(null);

  // Selection state
  const [selectedClassIds, setSelectedClassIds] = useState(new Set());

  // Filter state
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [selectedTime, setSelectedTime] = useState("all");
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  // Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);

  // Refs
  const highlightedRowRef = useRef(null);
  const teacherDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  return {
    // Modal
    isModalOpen,
    setIsModalOpen,
    editingClass,
    setEditingClass,
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    classToDelete,
    setClassToDelete,
    // Config
    isConfigOpen,
    setIsConfigOpen,
    expandedClassId,
    setExpandedClassId,
    // Selection
    selectedClassIds,
    setSelectedClassIds,
    // Filters
    selectedLevel,
    setSelectedLevel,
    selectedTeacherIds,
    setSelectedTeacherIds,
    selectedTime,
    setSelectedTime,
    isTeacherDropdownOpen,
    setIsTeacherDropdownOpen,
    // Import
    isImportModalOpen,
    setIsImportModalOpen,
    importResults,
    setImportResults,
    // Refs
    highlightedRowRef,
    teacherDropdownRef,
    fileInputRef,
  };
};
