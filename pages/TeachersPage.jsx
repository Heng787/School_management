import React, { useState, useMemo, useEffect, useRef } from "react";
import { useData } from "../context/DataContext";
import { StaffRole, UserRole } from "../types";
import { generateStaffCSV } from "../utils/reportGenerator";
import { parseStaffCSV } from "../utils/csvParser";
import { parseExcelFile } from "../utils/excelParser";
import ImportResultsModal from "../components/ImportResultsModal";
import StaffPermissionModal from "../components/StaffPermissionModal";
import InviteStaffModal from "../components/InviteStaffModal";
import AllStaffPermissionModal from "../components/AllStaffPermissionModal";
import ConfirmModal from "../components/ConfirmModal";

// Import sub-components from teacherspage folder
import TeacherModal from "../components/teacherspage/TeacherModal";
import TeacherStatsGrid from "../components/teacherspage/TeacherStatsGrid";
import TeacherHeaderActions from "../components/teacherspage/TeacherHeaderActions";
import TeacherFiltersSection from "../components/teacherspage/TeacherFiltersSection";
import TeacherTable from "../components/teacherspage/TeacherTable";

/**
 * PAGE: TeachersPage
 * DESCRIPTION: Main staff management page with component-based architecture.
 */
const TeachersPage = () => {
  // --- 1. STATE & DATA ---
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isAllPermissionModalOpen, setIsAllPermissionModalOpen] =
    useState(false);

  // --- 2. MEMOIZED DATA ---
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.contact || "").toLowerCase().includes(searchQuery.toLowerCase());

      const isTeaching =
        s.role === StaffRole.Teacher || s.role === StaffRole.AssistantTeacher;
      const matchesTab =
        activeTab === "all" ||
        s.role === activeTab ||
        (activeTab === "teaching" && isTeaching) ||
        (activeTab === "support" && !isTeaching);
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

  // --- 3. SIDE EFFECTS ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // --- 4. ACTION HANDLERS ---
  const handleOpenModal = (staffMember = null) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleDownloadReport = () => {
    const csvData = generateStaffCSV(staff);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "staff_list.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = ["Name", "Role", "Contact", "Hire Date"];
    const csvContent = headers.join(",");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "staff_import_template.csv";
    link.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let validStaff = [];
    let errors = [];

    if (file.name.endsWith(".csv")) {
      const result = parseStaffCSV(await file.text());
      validStaff = result.validStaff;
      errors = result.errors;
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
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
            contact: "",
            hireDate: new Date().toISOString().split("T")[0],
            status: "Active",
          });
        });
      } catch (err) {
        console.error("Excel parse error:", err);
        alert("Failed to parse Excel file: " + err.message);
        return;
      }
    } else {
      alert("Please upload a CSV or Excel file.");
      return;
    }

    // Duplicate Checking
    const existingNames = new Set(staff.map((s) => s.name.toLowerCase()));
    const existingFullIDs = new Set(
      staff.map((s) => `${s.name.toLowerCase()}|${s.contact.toLowerCase()}`),
    );

    const internalNewIdentifiers = new Set();
    const nonDuplicateStaff = [];
    const duplicateErrors = [];

    validStaff.forEach((s, idx) => {
      const id = `${s.name.toLowerCase()}|${s.contact.toLowerCase()}`;
      const alreadyExists =
        existingFullIDs.has(id) ||
        (s.contact === "" && existingNames.has(s.name.toLowerCase()));

      if (alreadyExists || internalNewIdentifiers.has(id)) {
        duplicateErrors.push({
          row: idx + 2,
          message: `Staff member '${s.name}' ${s.contact ? `with contact '${s.contact}'` : ""} already exists and was skipped.`,
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
    e.target.value = "";
  };

  // --- 5. RENDER ---
  return (
    <div className="container mx-auto">
      {/* Header with Actions */}
      <TeacherHeaderActions
        onDownloadReport={handleDownloadReport}
        onDownloadTemplate={handleDownloadTemplate}
        onImportClick={() => fileInputRef.current?.click()}
        onAddStaff={() => handleOpenModal()}
        fileInputRef={fileInputRef}
      />

      {/* Hidden file input for imports */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, .xlsx, .xls"
        className="hidden"
      />

      {/* Quick Stats */}
      <div className="mb-6">
        <TeacherStatsGrid stats={stats} />
      </div>

      {/* Filters and Search */}
      <TeacherFiltersSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onPermissionHistoryClick={() => setIsAllPermissionModalOpen(true)}
      />

      {/* Staff Table */}
      <TeacherTable
        staff={staff}
        filteredStaff={filteredStaff}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        highlightedStaffId={highlightedStaffId}
        staffPermissions={staffPermissions}
        isAdmin={isAdmin}
        onEdit={handleOpenModal}
        onDelete={(staffMember) => {
          setStaffToDelete(staffMember);
          setIsConfirmDeleteOpen(true);
        }}
        onInvite={(staffMember) => setInviteStaff(staffMember)}
        onPermission={(staffMember) => setPermissionStaff(staffMember)}
      />

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
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          deleteStaff(staffToDelete?.id);
          setStaffToDelete(null);
        }}
        title="Remove Staff"
        message={`Are you sure you want to remove ${staffToDelete?.name} from the system? This will also remove their access to the system.`}
      />
    </div>
  );
};

export default TeachersPage;
