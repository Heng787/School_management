
/**
 * types.js
 * Global constants and shared definitions.
 */

export const UserRole = {
    Admin: 'Admin',
    Teacher: 'Teacher',
    OfficeWorker: 'Office Worker',
};

export const StaffRole = {
    Teacher: 'Teacher',
    AssistantTeacher: 'Assistant Teacher',
    OfficeWorker: 'Office Worker',
    Guard: 'Guard',
    Cleaner: 'Cleaner',
};

export const Page = {
    Dashboard: 'Dashboard',
    Students: 'Students',
    Staff: 'Staff',
    Classes: 'Classes',
    Reports: 'Reports',
    Schedule: 'Schedule',
    Settings: 'Settings',
    Messages: 'Messages',
};

export const StudentStatus = {
    Active: 'Active',
    Suspended: 'Suspended',
    Dropout: 'Dropout',
};

export const AttendanceStatus = {
    Present: 'Present',
    Absent: 'Absent',
    Late: 'Late',
    Permission: 'Permission',
};

export const LeaveType = {
    Annual: 'Annual Leave',
    Personal: 'Personal Leave',
    NonPersonal: 'Non-Personal Leave'
};

export const EventType = {
    Holiday: 'Holiday',
    Meeting: 'Meeting',
    Exam: 'Exam',
    General: 'General',
};

export const MessageType = {
    Text: 'text',
    LeaveRequest: 'leave_request',
    SickReport: 'sick_report',
    Incident: 'incident',
    Announcement: 'announcement'
};

export const MessageStatus = {
    Pending: 'pending',
    Approved: 'approved',
    Rejected: 'rejected'
};
