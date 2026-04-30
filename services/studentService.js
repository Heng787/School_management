import { fetchCollection, pushCollection } from './core';
import {
  mapStudent,
  mapGrade,
  mapAttendance,
  mapEnrollment,
} from './mappers';

/**
 * Service for managing student profiles, grades, attendance, and enrollments.
 */
export const studentService = {
  // --- Student Management ---

  getStudents: async () => {
    return fetchCollection('students', mapStudent.fromDb);
  },

  saveStudents: async (students) => {
    return pushCollection('students', students, mapStudent.toDb);
  },

  // --- Academic Data ---

  getGrades: async () => {
    return fetchCollection('grades', mapGrade.fromDb);
  },

  saveGrades: async (grades) => {
    return pushCollection('grades', grades, mapGrade.toDb);
  },

  getAttendance: async () => {
    return fetchCollection('attendance', mapAttendance.fromDb);
  },

  saveAttendance: async (attendance) => {
    return pushCollection('attendance', attendance, mapAttendance.toDb);
  },

  // --- Enrollment ---

  getEnrollments: async () => {
    const enr = await fetchCollection('enrollments', mapEnrollment.fromDb);
    const uniqueEnr = [];
    const seenEnr = new Set();

    enr.forEach((item) => {
      const key = `${item.studentId}_${item.classId}`;
      if (!seenEnr.has(key)) {
        seenEnr.add(key);
        uniqueEnr.push(item);
      }
    });

    return uniqueEnr;
  },

  saveEnrollments: async (enrollments) => {
    return pushCollection('enrollments', enrollments, mapEnrollment.toDb);
  },
};
