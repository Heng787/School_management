import { UserRole } from "../types";

/**
 * Filters students based on user role access
 */
export const filterStudentsByRole = (
  students,
  currentUser,
  classes,
  enrollments,
) => {
  if (!currentUser) return students;

  if (currentUser.role === UserRole.Teacher) {
    const teacherClasses = classes.filter(
      (c) => c.teacherId === currentUser.id,
    );
    const teacherClassIds = new Set(teacherClasses.map((c) => c.id));
    const teacherStudentIds = new Set(
      enrollments
        .filter((e) => teacherClassIds.has(e.classId))
        .map((e) => e.studentId),
    );
    return students.filter((s) => teacherStudentIds.has(s.id));
  }

  if (
    currentUser.role === UserRole.Admin ||
    currentUser.role === UserRole.OfficeWorker
  ) {
    return students;
  }

  return [];
};

/**
 * Filters students by search term (name, ID, phone)
 */
export const filterStudentsBySearch = (students, searchTerm) => {
  if (!searchTerm.trim()) return students;

  const lowerTerm = searchTerm.toLowerCase();
  return students.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerTerm) ||
      s.id.toString().toLowerCase().includes(lowerTerm) ||
      (s.phone && s.phone.includes(lowerTerm)),
  );
};

/**
 * Filters students by status
 */
export const filterStudentsByStatus = (students, status) => {
  if (status === "All") return students;
  return students.filter((s) => s.status === status);
};

/**
 * Filters students by class enrollment
 */
export const filterStudentsByClass = (students, classId, enrollments) => {
  if (classId === "All") return students;
  const enrolledStudentIds = new Set(
    enrollments.filter((e) => e.classId === classId).map((e) => e.studentId),
  );
  return students.filter((s) => enrolledStudentIds.has(s.id));
};

/**
 * Main filter pipeline - applies all filters in order
 */
export const applyAllFilters = (
  students,
  currentUser,
  classes,
  enrollments,
  { searchTerm, classFilter, statusFilter },
) => {
  let result = filterStudentsByRole(
    students,
    currentUser,
    classes,
    enrollments,
  );
  result = filterStudentsBySearch(result, searchTerm);
  result = filterStudentsByStatus(result, statusFilter);
  result = filterStudentsByClass(result, classFilter, enrollments);
  return result;
};

/**
 * Builds a map of student ID -> their enrolled classes
 */
export const buildDisplayClassesMap = (
  students,
  currentUser,
  classes,
  enrollments,
) => {
  const map = {};

  students.forEach((student) => {
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
};
