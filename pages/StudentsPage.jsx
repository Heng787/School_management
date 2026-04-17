import React, { useState, useEffect, useRef, useMemo } from "react";
import { useData } from "../context/DataContext";
import { StudentStatus, UserRole } from "../types";
import { parseStudentCSV } from "../utils/csvParser";
import { parseExcelFile } from "../utils/excelParser";
import { generateStudentListCSV } from "../utils/reportGenerator";
import ImportResultsModal from "../components/ImportResultsModal";
import ConfirmModal from "../components/ConfirmModal";
import ReportCardModal from "../components/ReportCardModal";

// Import sub-components from studentspage folder
import StudentModal from "../components/studentspage/StudentModal";
import StudentHeaderActions from "../components/studentspage/StudentHeaderActions";
import StudentSearchBar from "../components/studentspage/StudentSearchBar";
import StudentTable from "../components/studentspage/StudentTable";

const ITEMS_PER_PAGE = 20;

/**
 * PAGE: StudentsPage
 * DESCRIPTION: Main view for student management with component-based architecture.
 */
const StudentsPage = () => {
  // --- 1. STATE & REFS ---
  const {
    students,
    staff,
    deleteStudent,
    highlightedStudentId,
    setHighlightedStudentId,
    addStudents,
    loading,
    enrollments,
    classes,
    currentUser,
    levels,
    subjects,
    addLevel,
    addSubject,
    updateStudentsBatch,
    addEnrollments,
    saveGradeBatch,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedReportStudent, setSelectedReportStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);
  const highlightedRowRef = useRef(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const isAdmin = currentUser?.role === UserRole.Admin;
  const isOffice = currentUser?.role === UserRole.OfficeWorker;

  // --- 2. MEMOIZED DATA ---
  const filteredStudents = useMemo(() => {
    let result = students;

    if (currentUser?.role === UserRole.Teacher) {
      const teacherClasses = classes.filter(
        (c) => c.teacherId === currentUser.id,
      );
      const teacherClassIds = new Set(teacherClasses.map((c) => c.id));
      const teacherStudentIds = new Set(
        enrollments
          .filter((e) => teacherClassIds.has(e.classId))
          .map((e) => e.studentId),
      );
      result = result.filter((s) => teacherStudentIds.has(s.id));
    } else if (!currentUser || isAdmin || isOffice) {
      // Keep all students
    } else {
      result = [];
    }

    if (searchTerm.trim()) {
      const lowerterm = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerterm) ||
          s.id.toString().toLowerCase().includes(lowerterm) ||
          (s.phone && s.phone.includes(lowerterm)),
      );
    }

    return result;
  }, [
    students,
    currentUser,
    classes,
    enrollments,
    isAdmin,
    isOffice,
    searchTerm,
  ]);

  // Build display classes map for each student
  const displayClassesMap = useMemo(() => {
    const map = {};
    filteredStudents.forEach((student) => {
      const studentEnrollments = enrollments.filter(
        (e) => e.studentId === student.id,
      );
      let displayClasses = [];

      if (currentUser?.role === UserRole.Teacher) {
        const teacherClassEnrollment = studentEnrollments.find((e) => {
          const cls = classes.find((c) => c.id === e.classId);
          return cls && cls.teacherId === currentUser.id;
        });
        if (teacherClassEnrollment) {
          const cls = classes.find(
            (c) => c.id === teacherClassEnrollment.classId,
          );
          if (cls) displayClasses.push(cls);
        }
      } else {
        displayClasses = studentEnrollments
          .map((e) => classes.find((c) => c.id === e.classId))
          .filter(Boolean);
      }
      map[student.id] = displayClasses;
    });
    return map;
  }, [filteredStudents, enrollments, classes, currentUser]);

  // --- 3. SIDE EFFECTS ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (highlightedStudentId) {
      const index = filteredStudents.findIndex(
        (s) => s.id === highlightedStudentId,
      );
      if (index !== -1) {
        const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;
        if (currentPage !== targetPage) setCurrentPage(targetPage);
        setTimeout(
          () =>
            highlightedRowRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            }),
          100,
        );
      }
      const timer = setTimeout(() => setHighlightedStudentId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [
    highlightedStudentId,
    setHighlightedStudentId,
    filteredStudents,
    currentPage,
  ]);

  // --- 4. ACTION HANDLERS ---
  const handleOpenModal = (student = null) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedStudentIds);
    for (const id of ids) {
      await deleteStudent(id);
    }
    setSelectedStudentIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const toggleSelectAllOnPage = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageIds = filteredStudents
      .slice(startIndex, startIndex + ITEMS_PER_PAGE)
      .map((s) => s.id);
    const allSelected = pageIds.every((id) => selectedStudentIds.has(id));
    const next = new Set(selectedStudentIds);
    if (allSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => next.add(id));
    }
    setSelectedStudentIds(next);
  };

  const handleDeleteRequest = (student) => {
    setStudentToDelete(student);
    setIsConfirmDeleteOpen(true);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      setIsDeletingId(id);
      await deleteStudent(id);
    } catch (e) {
      console.error(e);
      alert("Deletion failed. Please try again.");
    } finally {
      setIsDeletingId(null);
      setStudentToDelete(null);
    }
  };

  // --- 5. DATA IMPORT / EXPORT HANDLERS ---
  const handleDownloadTemplate = () => {
    const headers = [
      "Full Name",
      "Sex",
      "Date of Birth",
      "Level",
      "Phone Number",
      "Enrollment Date",
      "Status",
    ];
    const blob = new Blob([headers.join(",")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "student_template.csv";
    link.click();
  };

  const handleExportCSV = () => {
    const csvContent = generateStudentListCSV(filteredStudents);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
    );
    link.download = `student_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith(".csv")) {
      const { validStudents, errors } = parseStudentCSV(await file.text());
      const existingIdentifiers = new Set(
        students.map((s) => `${s.name.toLowerCase()}|${s.sex.toLowerCase()}`),
      );
      const nonDuplicateStudents = validStudents.filter(
        (s) =>
          !existingIdentifiers.has(
            `${s.name.toLowerCase()}|${s.sex.toLowerCase()}`,
          ),
      );
      if (nonDuplicateStudents.length > 0) {
        await addStudents(nonDuplicateStudents);
      }
      setImportResults({
        successCount: nonDuplicateStudents.length,
        errorCount: errors.length,
        errors: errors,
      });
      setIsImportModalOpen(true);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      try {
        const result = await parseExcelFile(file);
        const classIDMap = {};
        const studentsToAdd = [];
        const studentsToUpdate = [];
        let lastStuId = students
          .map((s) => parseInt(s.id.substring(1), 10))
          .filter((id) => !isNaN(id))
          .reduce((max, curr) => Math.max(max, curr), 0);

        // Smart class matching
        if (result.classes && result.classes.length > 0) {
          for (const impClass of result.classes) {
            const existing = classes.find(
              (c) =>
                c.name.trim().toLowerCase() ===
                  impClass.name.trim().toLowerCase() &&
                c.level.trim().toLowerCase() ===
                  impClass.level.trim().toLowerCase(),
            );
            if (existing) {
              classIDMap[impClass.id] = existing.id;
            }
          }
        }

        // Smart student matching & ID preparation
        const COPY_IF_MISSING = ["phone", "dob", "level"];

        const studentIDMap = {};
        if (result.students?.length > 0) {
          for (const impStu of result.students) {
            const existing = students.find(
              (s) =>
                s.name.trim().toLowerCase() ===
                  impStu.name.trim().toLowerCase() &&
                s.sex.toLowerCase() === impStu.sex.toLowerCase(),
            );

            if (existing) {
              studentIDMap[impStu.id] = existing.id;

              const updates = Object.fromEntries(
                COPY_IF_MISSING.filter((k) => !existing[k] && impStu[k]).map(
                  (k) => [k, impStu[k]],
                ),
              );
              if (impStu.status && existing.status !== impStu.status)
                updates.status = impStu.status;

              if (Object.keys(updates).length > 0)
                studentsToUpdate.push({ ...existing, ...updates });
            } else {
              const finalStuId = `s${++lastStuId}`;
              studentsToAdd.push({ ...impStu, id: finalStuId });
              studentIDMap[impStu.id] = finalStuId;
            }
          }

          if (studentsToAdd.length > 0) await addStudents(studentsToAdd);
          if (studentsToUpdate.length > 0)
            await updateStudentsBatch(studentsToUpdate);
        }

        // Smart enrollment matching
        if (result.enrollments && result.enrollments.length > 0) {
          const mappedEnrollments = result.enrollments
            .filter((enr) => classIDMap[enr.classId])
            .map((enr) => ({
              studentId: studentIDMap[enr.studentId] || enr.studentId,
              classId: classIDMap[enr.classId],
              enrollmentDate: new Date().toISOString().split("T")[0],
              status: "Enrolled",
            }))
            .filter((enr, idx, self) => {
              const alreadyInSystem = enrollments.some(
                (e) =>
                  e.studentId === enr.studentId && e.classId === enr.classId,
              );
              if (alreadyInSystem) return false;
              const repeatInImport =
                self.findIndex(
                  (s) =>
                    s.studentId === enr.studentId && s.classId === enr.classId,
                ) !== idx;
              return !repeatInImport;
            });

          if (mappedEnrollments.length > 0)
            await addEnrollments(mappedEnrollments);
        }

        // Smart grade matching
        if (result.grades && result.grades.length > 0) {
          const mappedGrades = result.grades
            .filter((grd) => classIDMap[grd.classId])
            .map((grd) => ({
              ...grd,
              studentId: studentIDMap[grd.studentId] || grd.studentId,
              classId: classIDMap[grd.classId],
              id: `grd_imp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            }));
          if (mappedGrades.length > 0) await saveGradeBatch(mappedGrades);

          const newSubjects = new Set();
          result.grades.forEach((g) => {
            if (g.subject && !subjects.includes(g.subject))
              newSubjects.add(g.subject);
          });
          newSubjects.forEach((sub) => addSubject(sub));
        }

        if (result.classes && result.classes.length > 0) {
          const newLevels = new Set();
          result.classes.forEach((c) => {
            if (c.level && !levels.includes(c.level)) newLevels.add(c.level);
          });
          newLevels.forEach((lvl) => addLevel(lvl));
        }

        setImportResults({
          successCount: studentsToAdd.length + (result.grades?.length || 0),
          errorCount: result.errors?.length || 0,
          errors: result.errors?.map((err) => ({ message: err })) || [],
          message: `Import complete! Added ${studentsToAdd.length} new students and ${result.grades?.length || 0} marks.`,
        });
        setIsImportModalOpen(true);
      } catch (err) {
        alert("Failed to parse Excel file: " + err.message);
      }
    }

    e.target.value = "";
  };

  // --- 6. RENDER ---
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <StudentHeaderActions
          onExport={handleExportCSV}
          onDownloadTemplate={handleDownloadTemplate}
          onImport={() => fileInputRef.current?.click()}
          onAddStudent={() => handleOpenModal()}
          fileInputRef={fileInputRef}
          isAdmin={isAdmin}
          isOffice={isOffice}
          selectedCount={selectedStudentIds.size}
          onBulkDelete={() => setIsBulkDeleteModalOpen(true)}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />
      </div>

      <StudentSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <StudentTable
        filteredStudents={filteredStudents}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        highlightedStudentId={highlightedStudentId}
        displayClassesMap={displayClassesMap}
        staff={staff}
        isAdmin={isAdmin}
        isOffice={isOffice}
        selectedStudentIds={selectedStudentIds}
        isDeletingId={isDeletingId}
        onSelectStudent={toggleSelect}
        onSelectAllOnPage={toggleSelectAllOnPage}
        onEdit={handleOpenModal}
        onDelete={handleDeleteRequest}
        onReportCard={(student) => {
          setSelectedReportStudent(student);
          setIsReportModalOpen(true);
        }}
        loading={loading}
      />

      {/* Modals */}
      {isModalOpen && (
        <StudentModal
          studentData={editingStudent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isReportModalOpen && selectedReportStudent && (
        <ReportCardModal
          student={selectedReportStudent}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
      {isImportModalOpen && (
        <ImportResultsModal
          results={importResults}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => handleDelete(studentToDelete?.id)}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
      />
      {isBulkDeleteModalOpen && (
        <ConfirmModal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          onConfirm={handleBulkDelete}
          title="Delete Selected Students"
          message={`Are you sure you want to permanently delete ${selectedStudentIds.size} selected students? This will also remove their enrollments, attendance, and grades.`}
          confirmText={`Delete ${selectedStudentIds.size} Students`}
          confirmColor="red"
        />
      )}
    </div>
  );
};

export default StudentsPage;
