import { UserRole } from '../types';

// --- Access Filtering ---

/**
 * Filters students based on user role access.
 */
export const filterStudentsByRole = (
  students,
  currentUser,
  classes,
  enrollments
) => {
  if (!currentUser) return students;

  if (currentUser.role === UserRole.Teacher) {
    const teacherClasses = classes.filter((c) => {
      return c.teacherId === currentUser.id;
    });

    const teacherClassIds = new Set(teacherClasses.map((c) => c.id));

    const teacherStudentIds = new Set(
      enrollments
        .filter((e) => teacherClassIds.has(e.classId))
        .map((e) => e.studentId)
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

// --- View Filtering ---

/**
 * Filters students by search term (name, ID, phone).
 */
export const filterStudentsBySearch = (students, searchTerm) => {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return students;

  return students.filter((s) => {
    return (
      s.name.toLowerCase().includes(term) ||
      s.id.toString().toLowerCase().includes(term) ||
      (s.phone && s.phone.includes(term))
    );
  });
};

/**
 * Filters students by status.
 */
export const filterStudentsByStatus = (students, status) => {
  if (status === 'All') return students;
  return students.filter((s) => s.status === status);
};

/**
 * Filters students by class enrollment.
 */
export const filterStudentsByClass = (students, classId, enrollments) => {
  if (classId === 'All') return students;

  const enrolledStudentIds = new Set(
    enrollments
      .filter((e) => e.classId === classId)
      .map((e) => e.studentId)
  );

  return students.filter((s) => enrolledStudentIds.has(s.id));
};

// --- Aggregate Filtering ---

/**
 * Applies search, status, and class filters in one pass.
 */
export const applyAllFilters = (
  students,
  currentUser,
  classes,
  enrollments,
  { searchTerm, classFilter, statusFilter }
) => {
  if (!currentUser) return [];

  let accessSet = null;
  if (currentUser.role === UserRole.Teacher) {
    const teacherClassIds = new Set(
      classes
        .filter((c) => c.teacherId === currentUser.id)
        .map((c) => c.id)
    );

    accessSet = new Set(
      enrollments
        .filter((e) => teacherClassIds.has(e.classId))
        .map((e) => e.studentId)
    );
  }

  let classSet = null;
  if (classFilter !== 'All') {
    classSet = new Set(
      enrollments
        .filter((e) => e.classId === classFilter)
        .map((e) => e.studentId)
    );
  }

  const lowerSearch = searchTerm.trim().toLowerCase();

  return students.filter((s) => {
    // Access constraints
    if (accessSet && !accessSet.has(s.id)) return false;

    // Attribute filters
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (classSet && !classSet.has(s.id)) return false;

    // Text search
    if (lowerSearch) {
      const matchesName = s.name.toLowerCase().includes(lowerSearch);
      const matchesId = s.id.toString().toLowerCase().includes(lowerSearch);
      const matchesPhone = s.phone && s.phone.includes(lowerSearch);

      if (!matchesName && !matchesId && !matchesPhone) return false;
    }

    return true;
  });
};

// --- Mapping Utils ---

/**
 * Builds a map of studentId → enrolled class objects for the given user's scope.
 */
export const buildDisplayClassesMap = (
  students,
  currentUser,
  classes,
  enrollments
) => {
  const map = {};

  const enrollmentMap = {};
  enrollments.forEach((e) => {
    if (!enrollmentMap[e.studentId]) enrollmentMap[e.studentId] = [];
    enrollmentMap[e.studentId].push(e.classId);
  });

  const classMap = {};
  classes.forEach((c) => {
    classMap[c.id] = c;
  });

  let teacherClassIds = null;
  if (currentUser?.role === UserRole.Teacher) {
    teacherClassIds = new Set(
      classes
        .filter((c) => c.teacherId === currentUser.id)
        .map((c) => c.id)
    );
  }

  students.forEach((student) => {
    const studentClassIds = enrollmentMap[student.id] || [];
    let displayClasses = [];

    if (teacherClassIds) {
      const teacherClassId = studentClassIds.find((id) => {
        return teacherClassIds.has(id);
      });

      if (teacherClassId && classMap[teacherClassId]) {
        displayClasses.push(classMap[teacherClassId]);
      }
    } else {
      displayClasses = studentClassIds
        .map((id) => classMap[id])
        .filter(Boolean);
    }

    map[student.id] = displayClasses;
  });

  return map;
};
