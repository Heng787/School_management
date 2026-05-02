/**
 * database/schema.js
 * Single source of truth for the database structure and table names.
 */

export const TABLES = {
    STUDENTS: 'students',
    STAFF: 'staff',
    STAFF_PERMISSIONS: 'staff_permissions',
    CLASSES: 'classes',
    ENROLLMENTS: 'enrollments',
    GRADES: 'grades',
    ATTENDANCE: 'attendance',
    EVENTS: 'events',
    MESSAGES: 'messages',
    CONFIG: 'config',
    SUBJECTS: 'subjects',
    LEVELS: 'levels',
    TIME_SLOTS: 'time_slots',
    ADMIN_PASSWORD: 'admin_password'
};

/**
 * Expected schema for each table (for consistency and validation)
 */
export const SCHEMA = {
    [TABLES.STUDENTS]: {
        id: 'string (uuid/custom)',
        name: 'string',
        sex: 'string',
        dob: 'string (date)',
        phone: 'string',
        enrollmentDate: 'string (date)',
        status: 'string (StudentStatus)',
        created_at: 'timestamp'
    },
    [TABLES.STAFF]: {
        id: 'string (uuid/custom)',
        name: 'string',
        role: 'string (StaffRole)',
        phone: 'string',
        email: 'string',
        created_at: 'timestamp'
    },
    [TABLES.CLASSES]: {
        id: 'string (uuid/custom)',
        name: 'string',
        level: 'string',
        teacherId: 'string (ref:staff)',
        room: 'string',
        created_at: 'timestamp'
    },
    [TABLES.GRADES]: {
        id: 'string',
        studentId: 'string (ref:students)',
        classId: 'string (ref:classes)',
        subject: 'string',
        score: 'number',
        term: 'string',
        date: 'string (date)',
        created_at: 'timestamp'
    },
    [TABLES.ENROLLMENTS]: {
        id: 'string (uuid)',
        studentId: 'string (ref:students)',
        classId: 'string (ref:classes)',
        academic_year: 'string',
        created_at: 'timestamp'
    },
    [TABLES.ATTENDANCE]: {
        id: 'string',
        studentId: 'string (ref:students)',
        date: 'string (date)',
        status: 'string (AttendanceStatus)',
        created_at: 'timestamp'
    },
    [TABLES.EVENTS]: {
        id: 'string (uuid)',
        title: 'string',
        date: 'string (date)',
        type: 'string',
        description: 'string',
        created_at: 'timestamp'
    },
    [TABLES.MESSAGES]: {
        id: 'string (uuid)',
        senderId: 'string (ref:staff)',
        recipientId: 'string (ref:staff)',
        text: 'string',
        timestamp: 'timestamp',
        read: 'boolean',
        created_at: 'timestamp'
    }
};
