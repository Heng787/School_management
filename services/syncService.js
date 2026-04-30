import { classService } from './classService';
import { configService } from './configService';
import { getSupabase, localStore } from './core';
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

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  },

  /**
   * Performs a full synchronization cycle for all dirty tables.
   * Handles deletion queues before pushing updates to parent and then child tables.
   * @param {Object} payload - The complete current state of the local database.
   * @returns {Promise<void>}
   */
  async syncAll(payload) {
    const client = getSupabase();
    if (!client || !navigator.onLine) return;

    try {
      // --- Handle Deletions ---
      const deletedQueue = localStore.get('deleted_queue', []);
      if (deletedQueue.length > 0) {
        console.log(`Processing ${deletedQueue.length} queued deletions...`);
        await Promise.all(
          deletedQueue.map((item) =>
            client.from(item.table).delete().eq('id', item.id)
          )
        );
        localStore.set('deleted_queue', []);
      }

      const configToSync = [];
      if (payload.config) {
        for (const c of payload.config) {
          configToSync.push(c);
        }
      }

      // --- Define Table Phases ---

      // Phase 1: Parent tables (no FK dependencies)
      const parentTables = [
        {
          table: 'students',
          data: payload.students?.map(mapStudent.toDb) || [],
        },
        {
          table: 'staff',
          data: payload.staff?.map(mapStaff.toDb) || [],
        },
        {
          table: 'classes',
          data: payload.classes?.map(mapClass.toDb) || [],
        },
        {
          table: 'events',
          data: payload.events || [],
        },
        {
          table: 'config',
          data: configToSync,
        },
      ];

      // Phase 2: Child tables (depend on parent tables via FK)
      const childTables = [
        {
          table: 'staff_permissions',
          data: payload.staffPermissions?.map(mapStaffPermission.toDb) || [],
        },
        {
          table: 'enrollments',
          data: payload.enrollments?.map(mapEnrollment.toDb) || [],
        },
        {
          table: 'grades',
          data: (payload.grades || [])
            .filter((g) => !g.id.startsWith('draft_'))
            .map(mapGrade.toDb),
        },
        {
          table: 'attendance',
          data: payload.attendance?.map(mapAttendance.toDb) || [],
        },
      ];

      // --- Sync Worker ---
      const upsertIfDirty = async ({ table, data }) => {
        if (!data || data.length === 0) return;
        if (!localStore.isDirty(table)) return;

        const dirtyIds = new Set(localStore.getDirtyIds(table));
        const dataToPush = data.filter((record) => dirtyIds.has(record.id));

        if (dataToPush.length === 0) {
          localStore.setDirty(table, false);
          localStore.clearDirtyIds(table);
          return;
        }

        console.log(
          `  Syncing ${dataToPush.length} dirty records for table: ${table}`
        );

        const { error } = await client.from(table).upsert(dataToPush);

        if (error) {
          console.warn(`Bulk sync failed for ${table}: ${error.message}`);

          let ok = 0;
          let fail = 0;
          for (const record of data) {
            const { error: singleErr } = await client
              .from(table)
              .upsert([record]);

            if (singleErr) {
              fail++;
              console.error(
                `  ↳ ${table} id=${record.id}: ${singleErr.message}`
              );
            } else {
              ok++;
            }
          }
          console.log(`  ↳ ${table} result: ${ok} synced, ${fail} failed`);
        }

        localStore.setDirty(table, false);
        localStore.clearDirtyIds(table);
      };

      // --- Execute Phases ---
      for (const item of parentTables) {
        await upsertIfDirty(item);
      }

      for (const item of childTables) {
        await upsertIfDirty(item);
      }

      console.log('Sync cycle complete.');
    } catch (err) {
      console.error('Batch sync error:', err);
      throw err;
    }
  },
};
