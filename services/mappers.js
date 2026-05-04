/**
 * Utility for mapping data between database and application formats.
 * Built with safety checks for mixed camelCase/snake_case local data.
 */

// --- Student Mappers ---

export const mapStudent = {
  toDb: (s) => ({
    id: s.id,
    name: s.name,
    sex: s.sex || null,
    dob: s.dob || null,
    phone: s.phone || null,
    enrollment_date: s.enrollmentDate || null,
    status: s.status,
  }),
  fromDb: (d) => ({
    id: d.id,
    name: d.name,
    sex: d.sex,
    dob: d.dob,
    phone: d.phone,
    enrollmentDate: d.enrollmentDate || d.enrollment_date,
    status: d.status,
  }),
};

// --- Grade Mappers ---

export const mapGrade = {
  toDb: (g) => ({
    id: g.id,
    student_id: g.studentId,
    subject: g.subject,
    score: g.score,
    term: g.term || null,
  }),
  fromDb: (d) => {
    // Decode classId from composite ID if missing
    let classId = d.classId;
    if (!classId) {
      const parts = (d.id || '').split('~');
      if (parts.length >= 3 && parts[0] === 'grade') {
        classId = parts[1];
      }
    }

    return {
      id: d.id,
      studentId: d.studentId || d.student_id,
      classId,
      subject: d.subject,
      score: d.score,
      term: d.term || null,
    };
  },
};

// --- Attendance Mappers ---

export const mapAttendance = {
  toDb: (a) => ({
    id: a.id,
    student_id: a.studentId,
    date: a.date,
    status: a.status,
  }),
  fromDb: (d) => {
    // ID format: att_{classId}_{date}_{studentId}
    let classId = d.classId;
    if (!classId && d.id && d.id.startsWith('att_')) {
      const parts = d.id.split('_');
      if (parts.length >= 5) {
        classId = parts.slice(1, -2).join('_');
      }
    }

    return {
      id: d.id,
      studentId: d.studentId || d.student_id,
      date: d.date,
      status: d.status,
      classId,
    };
  },
};

// --- Enrollment Mappers ---

export const mapEnrollment = {
  toDb: (e) => ({
    id: e.id,
    student_id: e.studentId,
    class_id: e.classId,
    academic_year: e.academicYear,
  }),
  fromDb: (d) => ({
    id: d.id,
    studentId: d.studentId || d.student_id,
    classId: d.classId || d.class_id,
    academicYear: d.academicYear || d.academic_year,
  }),
};

// --- Staff Mappers ---

export const mapStaff = {
  toDb: (s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    subject: s.subject || null,
    contact: s.contact || null,
    hire_date: s.hireDate || null,
    password: s.password || null,
  }),
  fromDb: (d) => ({
    id: d.id,
    name: d.name,
    role: d.role,
    subject: d.subject,
    contact: d.contact,
    hireDate: d.hireDate || d.hire_date,
    password: d.password || null,
  }),
};

export const mapStaffPermission = {
  toDb: (p) => ({
    id: p.id,
    staff_id: p.staffId,
    type: p.type,
    reason: p.reason,
  }),
  fromDb: (d) => ({
    id: d.id,
    staffId: d.staffId || d.staff_id,
    type: d.type,
    reason: d.reason,
  }),
};

// --- Class Mappers ---

export const mapClass = {
  toDb: (c) => ({
    id: c.id,
    name: c.name,
    teacher_id: c.teacherId || null,
    schedule: c.schedule,
    level: c.level,
  }),
  fromDb: (d) => ({
    id: d.id,
    name: d.name,
    teacherId: d.teacherId || d.teacher_id,
    schedule: d.schedule,
    level: d.level,
  }),
};
// --- Helper for ID generation ---

/**
 * Generates a stable composite ID for a grade record.
 * Format: grade~{classId}~{studentId}~{subject}~{term}
 */
export const gradeId = (classId, studentId, subject, term) => 
  `grade~${classId}~${studentId}~${subject}~${term}`;
