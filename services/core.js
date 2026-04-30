import { createClient } from '@supabase/supabase-js';

import { TABLES } from '../database/schema';

// --- Internal State ---
let _supabaseInstance = null;

/**
 * Retrieves the initialized Supabase client instance.
 * Initializes the client if it doesn't exist using environment variables.
 * @returns {Object|null} The Supabase client instance or null if config is missing.
 */
export const getSupabase = () => {
  if (_supabaseInstance) return _supabaseInstance;

  const url = (process.env.SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_ANON_KEY || '').trim();

  if (!url || !key) {
    console.error('Supabase URL or Anon Key is missing. Sync will not work.');
    return null;
  }

  try {
    _supabaseInstance = createClient(url, key);
    return _supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

/**
 * Unified LocalStorage interface for the application.
 * Handles prefixing and dirty state tracking for the sync engine.
 */
export const localStore = {
  get: (key, defaultValue) => {
    const item = localStorage.getItem(`school_admin_${key}`);
    try {
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: (key, value) => {
    localStorage.setItem(`school_admin_${key}`, JSON.stringify(value));
  },

  isDirty: (key) => {
    return localStorage.getItem(`school_admin_${key}_dirty`) === 'true';
  },

  setDirty: (key, dirty) => {
    localStorage.setItem(
      `school_admin_${key}_dirty`,
      dirty ? 'true' : 'false'
    );
  },

  trackDirtyId: (table, id) => {
    const ids = new Set(localStore.get(`${table}_dirty_ids`, []));
    ids.add(id);
    localStore.set(`${table}_dirty_ids`, Array.from(ids));
  },

  getDirtyIds: (table) => {
    return localStore.get(`${table}_dirty_ids`, []);
  },

  clearDirtyIds: (table) => {
    localStorage.removeItem(`school_admin_${table}_dirty_ids`);
  },
};

// --- Config Helpers ---

/**
 * Synchronizes a single configuration key-value pair to Supabase.
 * @param {string} key - The unique configuration key.
 * @param {any} value - The value to store.
 * @returns {Promise<void>}
 */
export const pushConfig = async (key, value) => {
  const client = getSupabase();
  localStore.set(key, value);

  if (!client || !navigator.onLine) return;

  try {
    const { error } = await client.from('config').upsert({ key, value });
    if (error) {
      console.error(`Failed to sync config ${key}:`, error);
      throw error;
    }
  } catch (err) {
    console.error(`Config sync error for ${key}:`, err);
    throw err;
  }
};

// --- Internal Utilities ---

const getFilteredLocal = (table) => {
  const local = localStore.get(table, []);
  const deletedIds = new Set(
    localStore
      .get('deleted_queue', [])
      .filter((q) => q.table === table)
      .map((q) => q.id)
  );
  return local.filter((item) => !deletedIds.has(item.id));
};

// --- CRUD Operations ---

/**
 * Fetches a collection of records from local storage or cloud.
 * Implements merge logic if local changes exist.
 * @param {string} table - The Supabase table name.
 * @param {Object|Function} mapper - Mapper for data transformation.
 * @returns {Promise<Array<Object>>} The list of records.
 */
export async function fetchCollection(table, mapper) {
  const client = getSupabase();
  const local = localStore.get(table, []);
  const isDirty = localStore.isDirty(table);

  if (!client || !navigator.onLine) return getFilteredLocal(table);

  try {
    const { data, error } = await client
      .from(table)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Supabase fetch error for ${table}:`, error);
      return getFilteredLocal(table);
    }

    let resultData = [];
    if (data && data.length > 0) {
      const fromMapper = mapper.fromDb || mapper;
      const mappedData = data.map(fromMapper);

      if (isDirty) {
        const localMap = new Map(local.map((item) => [item.id, item]));
        const merged = mappedData.map((remote) => {
          const localItem = localMap.get(remote.id);
          if (localItem) {
            localMap.delete(remote.id);
            return localItem;
          }
          return remote;
        });
        resultData = [...merged, ...Array.from(localMap.values())];
      } else {
        resultData = mappedData;
      }
    } else {
      // No remote data: use local if dirty (un-pushed changes exist)
      resultData = isDirty ? local : [];
    }

    const deletedIds = new Set(
      localStore
        .get('deleted_queue', [])
        .filter((q) => q.table === table)
        .map((q) => q.id)
    );
    const filteredData = resultData.filter((item) => !deletedIds.has(item.id));
    localStore.set(table, filteredData);
    return filteredData;
  } catch (err) {
    console.error(`Collection fetch error for ${table}:`, err);
    return getFilteredLocal(table);
  }
}

/**
 * Pushes a collection of records to Supabase.
 * Marks the table as dirty locally first.
 * @param {string} table - The target Supabase table.
 * @param {Array<Object>} items - The records to upsert.
 * @param {Object|Function} mapper - Mapper for data transformation.
 * @returns {Promise<void>}
 */
export async function pushCollection(table, items, mapper) {
  const client = getSupabase();
  const oldItems = localStore.get(table, []);

  // Identify changed or new items to prevent overwriting other admins' concurrent work during sync
  const oldMap = new Map(oldItems.map((i) => [i.id, JSON.stringify(i)]));
  items.forEach((item) => {
    if (oldMap.get(item.id) !== JSON.stringify(item)) {
      localStore.trackDirtyId(table, item.id);
    }
  });

  localStore.set(table, items);
  localStore.setDirty(table, true);

  if (!client || !navigator.onLine) return;

  try {
    const toMapper = mapper.toDb || mapper;
    const dirtyIds = new Set(localStore.getDirtyIds(table));
    const dataToUpsert = items
      .filter((i) => dirtyIds.has(i.id))
      .map(toMapper);

    if (dataToUpsert.length === 0) {
      localStore.setDirty(table, false);
      localStore.clearDirtyIds(table);
      return;
    }

    const { error } = await client.from(table).upsert(dataToUpsert);

    if (error) {
      console.warn(`Bulk upsert failed for ${table}:`, error.message);
      // Per-record fallback so one bad record doesn't block others
      let ok = 0;
      let fail = 0;
      for (const record of dataToUpsert) {
        const { error: e } = await client.from(table).upsert([record]);
        if (e) {
          fail++;
          console.error(`Failed ${table} id=${record.id}:`, e.message);
        } else {
          ok++;
        }
      }
      console.log(`${table}: ${ok} synced, ${fail} failed`);
      if (fail > 0 && ok === 0) throw error;
    }

    localStore.setDirty(table, false);
    localStore.clearDirtyIds(table);
  } catch (err) {
    console.error(`pushCollection error for ${table}:`, err);
    throw err;
  }
}

/**
 * Deletes a record from local storage and queues it for remote deletion.
 * @param {string} table - The target Supabase table.
 * @param {string|number} id - The unique identifier of the record.
 * @returns {Promise<void>}
 */
export async function deleteRecord(table, id) {
  const client = getSupabase();
  localStore.set(
    table,
    localStore.get(table, []).filter((item) => item.id !== id)
  );

  const queue = localStore.get('deleted_queue', []);
  if (!queue.some((q) => q.table === table && q.id === id)) {
    queue.push({ table, id });
    localStore.set('deleted_queue', queue);
  }

  if (!client || !navigator.onLine) return;

  try {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) throw error;
    localStore.set(
      'deleted_queue',
      localStore
        .get('deleted_queue', [])
        .filter((q) => !(q.table === table && q.id === id))
    );
  } catch (err) {
    console.error(`Delete failed for ${table}:${id}`, err);
    throw err;
  }
}

// --- Cache Management ---

/**
 * Clears all application-related data from LocalStorage.
 * Triggers a page reload to reset state.
 */
export function clearLocalCache() {
  const tables = Object.values(TABLES);
  tables.forEach((t) => {
    localStorage.removeItem(`school_admin_${t}`);
    localStorage.removeItem(`school_admin_${t}_dirty`);
  });
  window.location.reload();
}
