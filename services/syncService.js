import { getSupabase, localStore } from "./core";
import {
  mapStudent,
  mapStaff,
  mapStaffPermission,
  mapClass,
  mapEnrollment,
  mapGrade,
  mapAttendance,
} from "./mappers";
import { studentService } from "./studentService";
import { staffService } from "./staffService";
import { classService } from "./classService";
import { logService } from "./logService";
import { configService } from "./configService";

/**
 * SERVICE: SyncService
 * DESCRIPTION: High-level synchronization logic that coordinates whole-database updates.
 * IMPORTANT: Only syncs tables that have been locally modified (dirty) to prevent
 * one browser session from overwriting changes made in another browser session.
 */
export const syncService = {
  // --- 1. BULK DATA IMPORT ---
  async importAllData(data) {
    const tasks = [];
    if (
      data.students &&
      Array.isArray(data.students) &&
      data.students.length > 0
    )
      tasks.push(studentService.saveStudents(data.students));
    if (data.staff && Array.isArray(data.staff) && data.staff.length > 0)
      tasks.push(staffService.saveStaff(data.staff));
    if (data.classes && Array.isArray(data.classes) && data.classes.length > 0)
      tasks.push(classService.saveClasses(data.classes));
    if (data.events && Array.isArray(data.events) && data.events.length > 0)
      tasks.push(logService.saveEvents(data.events));
    if (data.subjects && Array.isArray(data.subjects))
      tasks.push(configService.saveSubjects(data.subjects));
    if (data.levels && Array.isArray(data.levels))
      tasks.push(configService.saveLevels(data.levels));
    if (data.timeSlots && Array.isArray(data.timeSlots))
      tasks.push(configService.saveTimeSlots(data.timeSlots));
    if (data.adminPassword)
      tasks.push(configService.saveAdminPassword(data.adminPassword));

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  },

  // --- 2. MAIN SYNC ENGINE ---
  async syncAll(payload) {
    const client = getSupabase();
    if (!client || !navigator.onLine) return;

    try {
      // 1. Process deletions first (always)
      const deletedQueue = localStore.get("deleted_queue", []);
      if (deletedQueue.length > 0) {
        console.log(`Processing ${deletedQueue.length} queued deletions...`);
        await Promise.all(
          deletedQueue.map((item) =>
            client.from(item.table).delete().eq("id", item.id),
          ),
        );
        localStore.set("deleted_queue", []);
      }

      // 2. Only upsert tables that have been locally modified (dirty)
      const configToSync = [];
      if (payload.config) {
        for (const c of payload.config) {
          configToSync.push(c);
        }
      }

      // Phase 1: Parent tables (no FK dependencies)
      const parentTables = [
        {
          table: "students",
          data: payload.students?.map(mapStudent.toDb) || [],
        },
        { table: "staff", data: payload.staff?.map(mapStaff.toDb) || [] },
        { table: "classes", data: payload.classes?.map(mapClass.toDb) || [] },
        { table: "events", data: payload.events || [] },
        { table: "config", data: configToSync },
      ];

      // Phase 2: Child tables (depend on parent tables via FK)
      const childTables = [
        {
          table: "staff_permissions",
          data: payload.staffPermissions?.map(mapStaffPermission.toDb) || [],
        },
        {
          table: "enrollments",
          data: payload.enrollments?.map(mapEnrollment.toDb) || [],
        },
        { table: "grades", data: payload.grades?.map(mapGrade.toDb) || [] },
        {
          table: "attendance",
          data: payload.attendance?.map(mapAttendance.toDb) || [],
        },
      ];

      // Helper: only upsert if dirty (locally modified) with per-record fallback
      const upsertIfDirty = async ({ table, data }) => {
        if (!data || data.length === 0) return;

        // CRITICAL: Skip tables that haven't been locally modified.
        // This prevents Browser A from re-pushing stale data and overwriting
        // changes that Browser B has already synced to Supabase.
        if (!localStore.isDirty(table)) {
          return;
        }

        console.log(`  Syncing dirty table: ${table} (${data.length} records)`);
        const { error } = await client.from(table).upsert(data);
        if (error) {
          console.warn(`Bulk sync failed for ${table}: ${error.message}`);

          let ok = 0,
            fail = 0;
          for (const record of data) {
            const { error: singleErr } = await client
              .from(table)
              .upsert([record]);
            if (singleErr) {
              fail++;
              console.error(
                `  ↳ ${table} id=${record.id}: ${singleErr.message}`,
              );
            } else {
              ok++;
            }
          }
          console.log(`  ↳ ${table} result: ${ok} synced, ${fail} failed`);
        }

        localStore.setDirty(table, false);
      };

      // Execute Phase 1 (parents first)
      for (const item of parentTables) {
        await upsertIfDirty(item);
      }

      // Execute Phase 2 (children after parents)
      for (const item of childTables) {
        await upsertIfDirty(item);
      }

      console.log("Sync cycle complete.");
    } catch (err) {
      console.error("Batch sync error:", err);
      throw err;
    }
  },
};
