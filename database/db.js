/**
 * database/db.js
 * Centralized database interface for the frontend.
 * Provides a clean API for interacting with data while handling sync automatically.
 */

import { fetchCollection, pushCollection, deleteRecord, localStore } from '../services/core';
import { TABLES } from './schema.js';
import * as mappers from '../services/mappers';

/**
 * Standard CRUD builder for tables
 */
const createRepo = (table, mapper) => ({
    list: () => fetchCollection(table, mapper),
    save: (items) => pushCollection(table, Array.isArray(items) ? items : [items], mapper),
    remove: (id) => deleteRecord(table, id),
    getLocal: () => localStore.get(table, []),
    setLocal: (items) => localStore.set(table, items)
});

export const db = {
    students: createRepo(TABLES.STUDENTS, mappers.mapStudent),
    staff: createRepo(TABLES.STAFF, mappers.mapStaff),
    classes: createRepo(TABLES.CLASSES, mappers.mapClass),
    enrollments: createRepo(TABLES.ENROLLMENTS, mappers.mapEnrollment),
    grades: createRepo(TABLES.GRADES, mappers.mapGrade),
    attendance: createRepo(TABLES.ATTENDANCE, mappers.mapAttendance),
    events: createRepo(TABLES.EVENTS, mappers.mapEvent),
    messages: createRepo(TABLES.MESSAGES, mappers.mapMessage),
    
    // Config and special operations
    config: {
        get: (key, defaultValue) => localStore.get(key, defaultValue),
        set: (key, value) => localStore.set(key, value),
        isDirty: (key) => localStore.isDirty(key)
    },

    /**
     * Clear all local caches for all tables
     */
    clearCache: () => {
        Object.values(TABLES).forEach(table => {
            localStorage.removeItem(`school_admin_${table}`);
            localStorage.removeItem(`school_admin_${table}_dirty`);
        });
        window.location.reload();
    }
};

export default db;
