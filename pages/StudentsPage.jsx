import React, { useState, useEffect, useRef, useMemo } from "react";
import { useData } from "../context/DataContext";
import { StudentStatus, UserRole } from "../types";
import { parseStudentCSV } from "../utils/csvParser";
import { parseExcelFile } from "../utils/excelParser";
import ImportResultsModal from "../components/ImportResultsModal";
import ImportPreviewModal from "../components/ImportPreviewModal";
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
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pageSize, setPageSize] = useState(10);
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

    if (statusFilter !== "All") {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (classFilter !== "All") {
      const enrolledStudentIds = new Set(
        enrollments.filter((e) => e.classId === classFilter).map((e) => e.studentId)
      );
      result = result.filter((s) => enrolledStudentIds.has(s.id));
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
    statusFilter,
    classFilter,
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
  }, [searchTerm, classFilter, statusFilter, pageSize]);

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
      const { validStudents, errors } = await parseStudentCSV(await file.text());
      const previewStudents = [];
      validStudents.forEach((impStu) => {
        const existingMatches = students.filter((s) => s.name.trim().toLowerCase() === impStu.name.trim().toLowerCase());
        impStu._tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        if (existingMatches.length > 0) {
          impStu._possibleMatches = existingMatches;
          let defaultMatch;
          if (impStu._genderInferred) {
             defaultMatch = existingMatches[0];
          } else {
             defaultMatch = existingMatches.find((s) => s.sex.toLowerCase() === impStu.sex.toLowerCase());
          }
          impStu._selectedMatchId = defaultMatch ? defaultMatch.id : 'NEW';
        } else {
          impStu._selectedMatchId = 'NEW';
        }
        previewStudents.push(impStu);
      });

      if (previewStudents.length > 0) {
        setImportPreviewData({
          type: "csv",
          studentsToPreview: previewStudents,
          errors
        });
      } else {
        setImportResults({
          successCount: 0,
          errorCount: errors.length,
          errors: errors,
        });
        setIsImportModalOpen(true);
      }
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
        const studentIDMap = {};
        const previewStudents = [];
        if (result.students?.length > 0) {
          for (const impStu of result.students) {
            const existingMatches = students.filter(
              (s) => s.name.trim().toLowerCase() === impStu.name.trim().toLowerCase()
            );

            impStu._tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            studentIDMap[impStu.id] = impStu._tempId;

            if (existingMatches.length > 0) {
              impStu._possibleMatches = existingMatches;
              let defaultMatch;
              if (impStu._genderInferred) {
                defaultMatch = existingMatches[0];
              } else {
                defaultMatch = existingMatches.find(s => s.sex.toLowerCase() === impStu.sex.toLowerCase());
              }
              impStu._selectedMatchId = defaultMatch ? defaultMatch.id : 'NEW';
            } else {
              impStu._selectedMatchId = 'NEW';
            }
            previewStudents.push(impStu);
          }
        } // end of students loop

        // Smart enrollment matching
        let mappedEnrollments = [];
        if (result.enrollments && result.enrollments.length > 0) {
          mappedEnrollments = result.enrollments
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
        }

        // Smart grade matching
        let mappedGrades = [];
        if (result.grades && result.grades.length > 0) {
          mappedGrades = result.grades
            .filter((grd) => classIDMap[grd.classId])
            .map((grd) => ({
              ...grd,
              studentId: studentIDMap[grd.studentId] || grd.studentId,
              classId: classIDMap[grd.classId],
              id: `grd_imp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            }));

          const newSubjects = new Set();
          const allSubjects = [
            ...(subjects.Kid || []),
            ...(subjects.JuniorSenior || []),
          ];
          result.grades.forEach((g) => {
            if (g.subject && !allSubjects.includes(g.subject))
              newSubjects.add(g.subject);
          });
          newSubjects.forEach((sub) => addSubject(sub, "JuniorSenior"));
        }

        if (result.classes && result.classes.length > 0) {
          const newLevels = new Set();
          result.classes.forEach((c) => {
            if (c.level && !levels.includes(c.level)) newLevels.add(c.level);
          });
          newLevels.forEach((lvl) => addLevel(lvl));
        }

        if (previewStudents.length > 0) {
          setImportPreviewData({
            type: "excel",
            studentsToPreview: previewStudents,
            mappedEnrollments,
            mappedGrades,
            errors: result.errors?.map((err) => ({ message: err })) || [],
          });
        } else {
          setImportResults({
            successCount: (result.grades?.length || 0),
            errorCount: result.errors?.length || 0,
            errors: result.errors?.map((err) => ({ message: err })) || [],
            message: `Import complete! Added ${result.grades?.length || 0} marks.`,
          });
          setIsImportModalOpen(true);
        }
      } catch (err) {
        alert("Failed to parse Excel file: " + err.message);
      }
    }

    e.target.value = "";
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
          
          if (importPreviewData.type === "excel") {
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
        }
        tempIdToFinalIdMap[impStu._tempId] = finalId;
      });

      if (finalAdd.length > 0) await addStudents(finalAdd);
      if (finalUpdate.length > 0 && importPreviewData.type === "excel") await updateStudentsBatch(finalUpdate);

      if (importPreviewData.type === "excel") {
        const finalEnrollments = (importPreviewData.mappedEnrollments || []).map(e => ({
          ...e,
          studentId: tempIdToFinalIdMap[e.studentId] || e.studentId
        }));
        const finalGrades = (importPreviewData.mappedGrades || []).map(g => ({
          ...g,
          studentId: tempIdToFinalIdMap[g.studentId] || g.studentId
        }));

        if (finalEnrollments.length > 0) await addEnrollments(finalEnrollments);
        if (finalGrades.length > 0) await saveGradeBatch(finalGrades);
      }

      setImportResults({
        successCount: finalAdd.length + (importPreviewData.type === "excel" ? (importPreviewData.mappedGrades?.length || 0) : 0),
        errorCount: importPreviewData.errors.length,
        errors: importPreviewData.errors,
      });

    } catch (e) {
      console.error(e);
      alert("Failed to save imported data.");
    } finally {
      setImportPreviewData(null);
      setIsImportModalOpen(true);
    }
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

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <StudentSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
            <option value="All">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.level ? `/ ${c.level}` : ""}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <StudentTable
        filteredStudents={filteredStudents}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
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
      {importPreviewData && (
        <ImportPreviewModal
          students={importPreviewData.studentsToPreview}
          onConfirm={handleConfirmImport}
          onCancel={() => setImportPreviewData(null)}
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
