import { useState, useCallback } from "react";

/**
 * Custom hook for managing filter state (search, class, status)
 */
export const useFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setClassFilter("All");
    setStatusFilter("All");
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    classFilter,
    setClassFilter,
    statusFilter,
    setStatusFilter,
    resetFilters,
  };
};

/**
 * Custom hook for managing student selection (checkboxes)
 */
export const useStudentSelection = () => {
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  const toggleSelect = useCallback((id) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllOnPage = useCallback((pageIds) => {
    setSelectedStudentIds((prev) => {
      const allSelected = pageIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStudentIds(new Set());
  }, []);

  return {
    selectedStudentIds,
    toggleSelect,
    toggleSelectAllOnPage,
    clearSelection,
  };
};

/**
 * Custom hook for managing modal states
 */
export const useModalState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState(null);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const openStudentModal = useCallback((student = null) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  }, []);

  const closeStudentModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingStudent(null);
  }, []);

  const openReportModal = useCallback((student) => {
    setSelectedReportStudent(student);
    setIsReportModalOpen(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setIsReportModalOpen(false);
    setSelectedReportStudent(null);
  }, []);

  const openDeleteConfirm = useCallback((student) => {
    setStudentToDelete(student);
    setIsConfirmDeleteOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setIsConfirmDeleteOpen(false);
    setStudentToDelete(null);
  }, []);

  const openBulkDeleteModal = useCallback(() => {
    setIsBulkDeleteModalOpen(true);
  }, []);

  const closeBulkDeleteModal = useCallback(() => {
    setIsBulkDeleteModalOpen(false);
  }, []);

  return {
    // Student modal
    isModalOpen,
    editingStudent,
    openStudentModal,
    closeStudentModal,
    // Report modal
    isReportModalOpen,
    selectedReportStudent,
    openReportModal,
    closeReportModal,
    // Delete confirm modal
    isConfirmDeleteOpen,
    studentToDelete,
    openDeleteConfirm,
    closeDeleteConfirm,
    // Bulk delete modal
    isBulkDeleteModalOpen,
    openBulkDeleteModal,
    closeBulkDeleteModal,
  };
};

/**
 * Custom hook for managing import workflow state
 */
export const useImportState = () => {
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const resetImport = useCallback(() => {
    setImportPreviewData(null);
    setIsImportModalOpen(false);
    setImportResults(null);
  }, []);

  return {
    importPreviewData,
    setImportPreviewData,
    isImportModalOpen,
    setIsImportModalOpen,
    importResults,
    setImportResults,
    resetImport,
  };
};

/**
 * Custom hook for managing pagination and deletion state
 */
export const usePaginationState = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    isDeletingId,
    setIsDeletingId,
    resetPagination,
  };
};
