import { classService } from './classService';
import { configService } from './configService';
import { localStore, getAuthToken, deleteRecord } from './core';
import { logService } from './logService';
import {
  mapStudent,
  mapStaff,
  mapStaffPermission,
  mapClass,
  mapEnrollment,
  mapGrade,
  mapAttendance,
} from './mappers';
import { staffService } from './staffService';
import { studentService } from './studentService';

/**
 * Centralized synchronization service for batch operations.
 * BACKEND SYNC REMOVED as per user request.
 */
export const syncService = {
  /**
   * Imports a large payload of diverse data types into the system.
   * Typically used during database restoration or bulk initialization.
   * @param {Object} data - The multi-domain data object.
   * @returns {Promise<void>}
   */
  async importAllData(data) {
    const tasks = [];

    if (
      data.students &&
      Array.isArray(data.students) &&
      data.students.length > 0
    ) {
      tasks.push(studentService.saveStudents(data.students));
    }

    if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
      tasks.push(staffService.saveStaff(data.staff));
    }

    if (data.classes && Array.isArray(data.classes) && data.classes.length > 0) {
      tasks.push(classService.saveClasses(data.classes));
    }

    if (data.enrollments && Array.isArray(data.enrollments) && data.enrollments.length > 0) {
      tasks.push(studentService.saveEnrollments(data.enrollments));
    }

    if (data.grades && Array.isArray(data.grades) && data.grades.length > 0) {
      tasks.push(studentService.saveGrades(data.grades));
    }

    if (data.attendance && Array.isArray(data.attendance) && data.attendance.length > 0) {
      tasks.push(studentService.saveAttendance(data.attendance));
    }

    if (data.events && Array.isArray(data.events) && data.events.length > 0) {
      tasks.push(logService.saveEvents(data.events));
    }

    if (data.subjects && Array.isArray(data.subjects)) {
      tasks.push(configService.saveSubjects(data.subjects));
    }

    if (data.levels && Array.isArray(data.levels)) {
      tasks.push(configService.saveLevels(data.levels));
    }

    if (data.timeSlots && Array.isArray(data.timeSlots)) {
      tasks.push(configService.saveTimeSlots(data.timeSlots));
    }

    if (data.adminPassword) {
      tasks.push(configService.saveAdminPassword(data.adminPassword));
    }

    if (data.staffPermissions && Array.isArray(data.staffPermissions)) {
      tasks.push(staffService.saveStaffPermissions(data.staffPermissions));
    }

    if (data.tasks && Array.isArray(data.tasks)) {
      localStore.set('tasks', data.tasks);
    }

    if (data.activityLogs && Array.isArray(data.activityLogs)) {
      localStore.set('activity_logs', data.activityLogs);
    }

    if (data.draftGrades && Array.isArray(data.draftGrades)) {
      localStore.set('draft_grades', data.draftGrades);
    }

    if (data.draftAttendance && Array.isArray(data.draftAttendance)) {
      localStore.set('draft_attendance', data.draftAttendance);
    }

    if (data.messages && Array.isArray(data.messages)) {
      localStore.set('messages_local', data.messages);
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  },

  /**
   * Performs a full synchronization cycle.
   * REMOTE SYNC DISABLED.
   * @param {Object} payload - The complete current state of the local database.
   * @returns {Promise<void>}
   */
  async syncAll(payload) {
    // No-op: Remote sync is disabled
    return Promise.resolve();
  },
};
