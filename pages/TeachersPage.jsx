import React, { useState, useMemo, useEffect, useRef } from 'react';

import AllStaffPermissionModal from '../components/AllStaffPermissionModal';
import ConfirmModal from '../components/ConfirmModal';
import ImportResultsModal from '../components/ImportResultsModal';
import InviteStaffModal from '../components/InviteStaffModal';
import StaffPermissionModal from '../components/StaffPermissionModal';
import TeacherFiltersSection from '../components/teacherspage/TeacherFiltersSection';
import TeacherHeaderActions from '../components/teacherspage/TeacherHeaderActions';
import TeacherModal from '../components/teacherspage/TeacherModal';
import TeacherStatsGrid from '../components/teacherspage/TeacherStatsGrid';
import TeacherTable from '../components/teacherspage/TeacherTable';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { useData } from '../context/DataContext';
import { useTeacherActions } from '../hooks/useTeacherActions';

import { StaffRole, UserRole } from '../types';

/**
 * PAGE: TeachersPage
 * DESCRIPTION: Main staff management page with component-based architecture.
 */
const TeachersPage = () => {
  // --- Accessibility & Title ---
  useEffect(() => {
    document.title = 'Staff Management | SchoolAdmin Dashboard';
  }, []);

  // --- State & Data ---
  const {
    staff,
    deleteStaff,
    highlightedStaffId,
    setHighlightedStaffId,
    addStaffBatch,
    staffPermissions,
    currentUser,
  } = useData();

  const isAdmin = currentUser?.role === UserRole.Admin;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [permissionStaff, setPermissionStaff] = useState(null);
  const [inviteStaff, setInviteStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isAllPermissionModalOpen, setIsAllPermissionModalOpen] = useState(false);

  // --- Custom Hooks for Actions ---
  const teacherActions = useTeacherActions({
    staff,
    addStaffBatch,
    setImportResults,
    setIsImportModalOpen,
  });

  const fileInputRef = useRef(null);

  // --- Memoized Data ---
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.contact || '').toLowerCase().includes(searchQuery.toLowerCase());

      const isTeaching =
        s.role === StaffRole.Teacher || s.role === StaffRole.AssistantTeacher;
      const matchesTab =
        activeTab === 'all' ||
        s.role === activeTab ||
        (activeTab === 'teaching' && isTeaching) ||
        (activeTab === 'support' && !isTeaching);
      return matchesSearch && matchesTab;
    });
  }, [staff, searchQuery, activeTab]);

  const stats = useMemo(() => {
    const teaching = staff.filter(
      (s) =>
        s.role === StaffRole.Teacher || s.role === StaffRole.AssistantTeacher,
    ).length;
    const support = staff.length - teaching;
    return { total: staff.length, teaching, support };
  }, [staff]);

  // --- Side Effects ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // --- Action Handlers ---
  const handleOpenModal = (staffMember = null) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  // --- Render ---
  return (
    <div className="container mx-auto">
      {/* Skip to Main Content */}
      <a
        href="#main-staff-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:m-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Skip to Staff Content
      </a>

      <LoadingOverlay
        isLoading={teacherActions.isLoading}
        message={teacherActions.loadingMessage}
      />

      {/* Header with Actions */}
      <TeacherHeaderActions
        fileInputRef={fileInputRef}
        onAddStaff={() => handleOpenModal()}
        onDownloadReport={teacherActions.handleDownloadReport}
        onDownloadTemplate={teacherActions.handleDownloadTemplate}
        onImportClick={() => fileInputRef.current?.click()}
      />

      {/* Hidden file input for imports */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv, .xlsx, .xls"
        className="hidden"
        onChange={teacherActions.handleFileChange}
      />

      {/* Quick Stats */}
      <div className="mb-6">
        <TeacherStatsGrid stats={stats} />
      </div>

      {/* Filters and Search */}
      <TeacherFiltersSection
        activeTab={activeTab}
        searchQuery={searchQuery}
        setActiveTab={setActiveTab}
        setSearchQuery={setSearchQuery}
        onPermissionHistoryClick={() => setIsAllPermissionModalOpen(true)}
      />

      <main
        id="main-staff-content"
        className="outline-none"
        tabIndex="-1"
      >
        {/* Staff Table */}
        <TeacherTable
          isAdmin={isAdmin}
          staff={staff}
          filteredStaff={filteredStaff}
          currentPage={currentPage}
          staffPermissions={staffPermissions}
          highlightedStaffId={highlightedStaffId}
          onDelete={(staffMember) => {
            setStaffToDelete(staffMember);
            setIsConfirmDeleteOpen(true);
          }}
          onEdit={handleOpenModal}
          onInvite={(staffMember) => setInviteStaff(staffMember)}
          onPermission={(staffMember) => setPermissionStaff(staffMember)}
          setCurrentPage={setCurrentPage}
        />
      </main>

      {/* Modals */}
      {isModalOpen && (
        <TeacherModal
          staffData={editingStaff}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {permissionStaff && (
        <StaffPermissionModal
          staff={permissionStaff}
          onClose={() => setPermissionStaff(null)}
        />
      )}

      {inviteStaff && (
        <InviteStaffModal
          staff={inviteStaff}
          onClose={() => setInviteStaff(null)}
        />
      )}

      {isImportModalOpen && (
        <ImportResultsModal
          results={importResults}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}

      {isAllPermissionModalOpen && (
        <AllStaffPermissionModal
          onClose={() => setIsAllPermissionModalOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Remove Staff"
        message={`Are you sure you want to remove ${staffToDelete?.name} from the system? This will also remove their access to the system.`}
        onConfirm={() => {
          deleteStaff(staffToDelete?.id);
          setStaffToDelete(null);
          setIsConfirmDeleteOpen(false);
        }}
        onClose={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

export default TeachersPage;
