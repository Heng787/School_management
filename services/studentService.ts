import { Student, Grade, Attendance, Enrollment } from '../types';
import { fetchCollection, pushCollection } from './core';
import { mapStudent, mapGrade, mapAttendance, mapEnrollment } from './mappers';

export const studentService = {
    getStudents: async () => fetchCollection('students', mapStudent.fromDb),
    saveStudents: async (students: Student[]) => pushCollection('students', students, mapStudent.toDb),

    getGrades: async () => fetchCollection('grades', mapGrade.fromDb),
    saveGrades: async (grades: Grade[]) => pushCollection('grades', grades, mapGrade.toDb),

    getAttendance: async () => fetchCollection('attendance', mapAttendance.fromDb),
    saveAttendance: async (attendance: Attendance[]) => pushCollection('attendance', attendance, mapAttendance.toDb),

    getEnrollments: async () => fetchCollection('enrollments', mapEnrollment.fromDb),
    saveEnrollments: async (enrollments: Enrollment[]) => pushCollection('enrollments', enrollments, mapEnrollment.toDb),
};
