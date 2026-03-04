import { Student, Staff, Class, Grade, Attendance, Enrollment, StaffPermission, DailyLog, IncidentReport, RoomStatus } from '../types';

export const mapStudent = {
    toDb: (s: Student) => ({
        id: s.id,
        name: s.name,
        sex: s.sex || null,
        dob: s.dob || null,
        phone: s.phone || null,
        enrollment_date: s.enrollmentDate || null,
        status: s.status,
        tuition: s.tuition || { total: 0, paid: 0 }
    }),
    fromDb: (d: any): Student => ({
        id: d.id,
        name: d.name,
        sex: d.sex,
        dob: d.dob,
        phone: d.phone,
        enrollmentDate: d.enrollment_date,
        status: d.status,
        tuition: d.tuition || { total: 0, paid: 0 }
    })
};

export const mapGrade = {
    toDb: (g: Grade) => ({
        id: g.id,
        student_id: g.studentId,
        subject: g.subject,
        score: g.score,
        term: g.term
    }),
    fromDb: (d: any): Grade => ({
        id: d.id,
        studentId: d.student_id,
        subject: d.subject,
        score: d.score,
        term: d.term
    })
};

export const mapAttendance = {
    toDb: (a: Attendance) => ({
        id: a.id,
        student_id: a.studentId,
        date: a.date,
        status: a.status
    }),
    fromDb: (d: any): Attendance => ({
        id: d.id,
        studentId: d.student_id,
        date: d.date,
        status: d.status
    })
};

export const mapEnrollment = {
    toDb: (e: Enrollment) => ({
        id: e.id,
        student_id: e.studentId,
        class_id: e.classId,
        academic_year: e.academicYear
    }),
    fromDb: (d: any): Enrollment => ({
        id: d.id,
        studentId: d.student_id,
        classId: d.class_id,
        academicYear: d.academic_year
    })
};

export const mapStaff = {
    toDb: (s: Staff) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        subject: s.subject || null,
        contact: s.contact || null,
        hire_date: s.hireDate || null,
        password: s.password || null
    }),
    fromDb: (d: any): Staff => ({
        id: d.id,
        name: d.name,
        role: d.role,
        subject: d.subject,
        contact: d.contact,
        hireDate: d.hire_date,
        password: d.password
    })
};

export const mapStaffPermission = {
    toDb: (p: StaffPermission) => ({
        id: p.id,
        staff_id: p.staffId,
        type: p.type,
        start_date: p.startDate,
        end_date: p.endDate,
        reason: p.reason,
        created_at: p.createdAt
    }),
    fromDb: (d: any): StaffPermission => ({
        id: d.id,
        staffId: d.staff_id,
        type: d.type,
        startDate: d.start_date,
        endDate: d.end_date,
        reason: d.reason,
        createdAt: d.created_at
    })
};

export const mapClass = {
    toDb: (c: Class) => ({
        id: c.id,
        name: c.name,
        teacher_id: c.teacherId || null,
        schedule: c.schedule,
        level: c.level
    }),
    fromDb: (d: any): Class => ({
        id: d.id,
        name: d.name,
        teacherId: d.teacher_id,
        schedule: d.schedule,
        level: d.level
    })
};

export const mapDailyLog = {
    toDb: (l: DailyLog) => ({
        id: l.id,
        staff_id: l.staffId,
        type: l.type,
        person_name: l.personName,
        purpose: l.purpose,
        timestamp: l.timestamp
    }),
    fromDb: (d: any): DailyLog => ({
        id: d.id,
        staffId: d.staff_id,
        type: d.type,
        personName: d.person_name,
        purpose: d.purpose,
        timestamp: d.timestamp
    })
};

export const mapIncidentReport = {
    toDb: (r: IncidentReport) => ({
        id: r.id,
        staff_id: r.staffId,
        title: r.title,
        description: r.description,
        severity: r.severity,
        timestamp: r.timestamp
    }),
    fromDb: (d: any): IncidentReport => ({
        id: d.id,
        staffId: d.staff_id,
        title: d.title,
        description: d.description,
        severity: d.severity,
        timestamp: d.timestamp
    })
};

export const mapRoomStatus = {
    toDb: (s: RoomStatus) => ({
        id: s.id,
        room_name: s.roomName,
        status: s.status,
        last_updated_by: s.lastUpdatedBy,
        timestamp: s.timestamp
    }),
    fromDb: (d: any): RoomStatus => ({
        id: d.id,
        roomName: d.room_name,
        status: d.status,
        lastUpdatedBy: d.last_updated_by,
        timestamp: d.timestamp
    })
};
