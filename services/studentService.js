// Student Service for managing students, grades, attendance, and enrollments.
import { fetchCollection, pushCollection } from './core';
import { mapStudent, mapGrade, mapAttendance, mapEnrollment } from './mappers';

export const studentService = {
    getStudents: async () => fetchCollection('students', mapStudent.fromDb),
    saveStudents: async (students) => pushCollection('students', students, mapStudent.toDb),

    getGrades: async () => fetchCollection('grades', mapGrade.fromDb),
    saveGrades: async (grades) => pushCollection('grades', grades, mapGrade.toDb),

    getAttendance: async () => fetchCollection('attendance', mapAttendance.fromDb),
    saveAttendance: async (attendance) => pushCollection('attendance', attendance, mapAttendance.toDb),

    getEnrollments: async () => fetchCollection('enrollments', mapEnrollment.fromDb),
    saveEnrollments: async (enrollments) => pushCollection('enrollments', enrollments, mapEnrollment.toDb),
};
