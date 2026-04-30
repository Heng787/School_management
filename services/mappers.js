/**
 * Utility for mapping data between database and application formats.
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
    enrollmentDate: d.enrollment_date,
    status: d.status,
  }),
};

// --- Grade Mappers ---

export const gradeId = (classId, studentId, subject, term) => {
  return `grade~${classId}~${studentId}~${subject.replace(/\s+/g, '_')}~${(term || '').replace(/\s+/g, '_')}`;
};

export const mapGrade = {
  toDb: (g) => ({
    id: g.id,
    student_id: g.studentId,
    subject: g.subject,
    score: g.score,
    term: g.term || null,
  }),
  fromDb: (d) => {
    // Decode classId from composite ID: grade~{classId}~{studentId}~{subject}~{term}
    let classId = null;
    const parts = (d.id || '').split('~');
    if (parts.length >= 3 && parts[0] === 'grade') {
      classId = parts[1];
    }

    return {
      id: d.id,
      studentId: d.student_id,
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
    let classId = null;
    if (d.id && d.id.startsWith('att_')) {
      const suffix = `_${d.date}_${d.student_id}`;
      if (d.id.endsWith(suffix)) {
        classId = d.id.substring(4, d.id.length - suffix.length);
      } else {
        const parts = d.id.split('_');
        if (parts.length >= 5) {
          classId = parts.slice(1, -2).join('_');
        }
      }
    }

    return {
      id: d.id,
      studentId: d.student_id,
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
    studentId: d.student_id,
    classId: d.class_id,
    academicYear: d.academic_year,
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
    hireDate: d.hire_date,
    password: d.password,
  }),
};

export const mapStaffPermission = {
  toDb: (p) => ({
    id: p.id,
    staff_id: p.staffId,
    type: p.type,
    start_date: p.startDate,
    end_date: p.endDate,
    reason: p.reason,
    created_at: p.createdAt,
  }),
  fromDb: (d) => ({
    id: d.id,
    staffId: d.staff_id,
    type: d.type,
    startDate: d.start_date,
    endDate: d.end_date,
    reason: d.reason,
    createdAt: d.created_at,
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
    teacherId: d.teacher_id,
    schedule: d.schedule,
    level: d.level,
  }),
};

// --- Event Mappers ---

export const mapEvent = {
  toDb: (e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    type: e.type,
    description: e.description || null,
  }),
  fromDb: (d) => ({
    id: d.id,
    title: d.title,
    date: d.date,
    type: d.type,
    description: d.description,
  }),
};

// --- Message Mappers ---

export const mapMessage = {
  toDb: (m) => ({
    id: m.id,
    sender_id: m.senderId,
    recipient_id: m.recipientId,
    text: m.text,
    timestamp: m.timestamp,
    read: m.read,
  }),
  fromDb: (d) => ({
    id: d.id,
    senderId: d.sender_id,
    recipientId: d.recipient_id,
    text: d.text,
    timestamp: d.timestamp,
    read: d.read,
  }),
};
