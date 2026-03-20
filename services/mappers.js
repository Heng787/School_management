// Mappers for converting between database schema and application state.

export const mapStudent = {
    toDb: (s) => ({
        id: s.id,
        name: s.name,
        sex: s.sex || null,
        dob: s.dob || null,
        phone: s.phone || null,
        enrollment_date: s.enrollmentDate || null,
        status: s.status,
        tuition: s.tuition || { total: 0, paid: 0 }
    }),
    fromDb: (d)=> ({
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
    toDb: (g) => ({
        id: g.id,
        student_id: g.studentId,
        subject: g.subject,
        score: g.score,
        term: g.term
    }),
    fromDb: (d)=> ({
        id: d.id,
        studentId: d.student_id,
        subject: d.subject,
        score: d.score,
        term: d.term
    })
};

export const mapAttendance = {
    toDb: (a) => ({
        id: a.id,
        student_id: a.studentId,
        date: a.date,
        status: a.status
    }),
    fromDb: (d) => {
        let classId = null;
        // Check if ID is in the new format: att_classId_date_studentId
        // classId itself looks like 'class_1772611464540'
        const parts = d.id ? d.id.split('_') : [];
        if (parts.length >= 5 && parts[0] === 'att' && parts[1] === 'class') {
            classId = parts[1] + '_' + parts[2];
        }
        return {
            id: d.id,
            studentId: d.student_id,
            date: d.date,
            status: d.status,
            classId: classId
        };
    }
};

export const mapEnrollment = {
    toDb: (e) => ({
        id: e.id,
        student_id: e.studentId,
        class_id: e.classId,
        academic_year: e.academicYear
    }),
    fromDb: (d)=> ({
        id: d.id,
        studentId: d.student_id,
        classId: d.class_id,
        academicYear: d.academic_year
    })
};

export const mapStaff = {
    toDb: (s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        subject: s.subject || null,
        contact: s.contact || null,
        hire_date: s.hireDate || null,
        password: s.password || null
    }),
    fromDb: (d)=> ({
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
    toDb: (p) => ({
        id: p.id,
        staff_id: p.staffId,
        type: p.type,
        start_date: p.startDate,
        end_date: p.endDate,
        reason: p.reason,
        created_at: p.createdAt
    }),
    fromDb: (d)=> ({
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
    toDb: (c) => ({
        id: c.id,
        name: c.name,
        teacher_id: c.teacherId || null,
        schedule: c.schedule,
        level: c.level
    }),
    fromDb: (d)=> ({
        id: d.id,
        name: d.name,
        teacherId: d.teacher_id,
        schedule: d.schedule,
        level: d.level
    })
};

export const mapDailyLog = {
    toDb: (l) => ({
        id: l.id,
        staff_id: l.staffId,
        type: l.type,
        person_name: l.personName,
        purpose: l.purpose,
        timestamp: l.timestamp
    }),
    fromDb: (d)=> ({
        id: d.id,
        staffId: d.staff_id,
        type: d.type,
        personName: d.person_name,
        purpose: d.purpose,
        timestamp: d.timestamp
    })
};

export const mapIncidentReport = {
    toDb: (r) => ({
        id: r.id,
        staff_id: r.staffId,
        title: r.title,
        description: r.description,
        severity: r.severity,
        timestamp: r.timestamp
    }),
    fromDb: (d)=> ({
        id: d.id,
        staffId: d.staff_id,
        title: d.title,
        description: d.description,
        severity: d.severity,
        timestamp: d.timestamp
    })
};

export const mapRoomStatus = {
    toDb: (s) => ({
        id: s.id,
        room_name: s.roomName,
        status: s.status,
        last_updated_by: s.lastUpdatedBy,
        timestamp: s.timestamp
    }),
    fromDb: (d)=> ({
        id: d.id,
        roomName: d.room_name,
        status: d.status,
        lastUpdatedBy: d.last_updated_by,
        timestamp: d.timestamp
    })
};
