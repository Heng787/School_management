import { TABLES } from '../database/schema';

// --- Internal State ---

export const getAuthToken = () => {
  return localStorage.getItem('school_admin_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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

export const pushConfig = async (key, value) => {
  localStore.set(key, value);
  const token = getAuthToken();

  if (!token || !navigator.onLine) return;

  try {
    const res = await fetch('/api/sync/config', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify([{ key, value }])
    });
    
    if (!res.ok) {
      throw new Error(`Failed to sync config ${key}`);
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

export async function fetchCollection(table, mapper) {
  const local = localStore.get(table, []);
  const isDirty = localStore.isDirty(table);
  const token = getAuthToken();

  if (!token || !navigator.onLine) return getFilteredLocal(table);

  try {
    const res = await fetch(`/api/sync/${table}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const { data } = await res.json();

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
    
    // Sort local copy by created_at to maintain UI consistency
    filteredData.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    
    localStore.set(table, filteredData);
    return filteredData;
  } catch (err) {
    console.error(`Collection fetch error for ${table}:`, err);
    return getFilteredLocal(table);
  }
}

export async function pushCollection(table, items, mapper) {
  const oldItems = localStore.get(table, []);
  const token = getAuthToken();

  // Identify changed or new items to prevent overwriting other admins' concurrent work during sync
  const oldMap = new Map(oldItems.map((i) => [i.id, JSON.stringify(i)]));
  items.forEach((item) => {
    if (oldMap.get(item.id) !== JSON.stringify(item)) {
      localStore.trackDirtyId(table, item.id);
    }
  });

  localStore.set(table, items);
  localStore.setDirty(table, true);

  if (!token || !navigator.onLine) return;

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

    const res = await fetch(`/api/sync/${table}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToUpsert)
    });

    if (!res.ok) {
      console.warn(`Bulk upsert failed for ${table}`);
      // Per-record fallback so one bad record doesn't block others
      let ok = 0;
      let fail = 0;
      for (const record of dataToUpsert) {
        const individualRes = await fetch(`/api/sync/${table}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify([record])
        });
        if (!individualRes.ok) {
          fail++;
          console.error(`Failed ${table} id=${record.id}`);
        } else {
          ok++;
        }
      }
      console.log(`${table}: ${ok} synced, ${fail} failed`);
      if (fail > 0 && ok === 0) throw new Error('All upserts failed');
    }

    localStore.setDirty(table, false);
    localStore.clearDirtyIds(table);
  } catch (err) {
    console.error(`pushCollection error for ${table}:`, err);
    throw err;
  }
}

export async function deleteRecord(table, id) {
  localStore.set(
    table,
    localStore.get(table, []).filter((item) => item.id !== id)
  );

  const queue = localStore.get('deleted_queue', []);
  if (!queue.some((q) => q.table === table && q.id === id)) {
    queue.push({ table, id });
    localStore.set('deleted_queue', queue);
  }

  const token = getAuthToken();
  if (!token || !navigator.onLine) return;

  try {
    const res = await fetch(`/api/sync/${table}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!res.ok) throw new Error('Delete failed on server');
    
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
