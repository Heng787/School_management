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
 */
export const localStore = {
  get: (key, defaultValue) => {
    const item = localStorage.getItem(`school_admin_${key}`);
    try {
      if (!item) return defaultValue;
      const parsed = JSON.parse(item);
      return parsed ?? defaultValue;
    } catch (err) {
      console.error(`LocalStore get error for ${key}:`, err);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(`school_admin_${key}`, JSON.stringify(value));
    } catch (err) {
      console.error(`LocalStore set error for ${key}:`, err);
    }
  },

  isDirty: (key) => false,
  setDirty: (key, dirty) => {},
  trackDirtyId: (table, id) => {},
  getDirtyIds: (table) => [],
  clearDirtyIds: (table) => {},
};

// --- Config Helpers ---

export const pushConfig = async (key, value) => {
  localStore.set(key, value);
};

// --- CRUD Operations (Local Only with Mapping) ---

export async function fetchCollection(table, mapper) {
  try {
    const local = localStore.get(table, []);
    
    if (!Array.isArray(local)) return [];

    // Filter out nulls/corrupted entries and apply mapper safely
    if (mapper && typeof mapper === 'function') {
      return local
        .filter(item => item !== null && typeof item === 'object')
        .map(item => {
          try {
            return mapper(item);
          } catch (e) {
            console.warn(`Mapper failed for item in ${table}:`, e);
            return item; // Fallback to raw item if mapper crashes
          }
        });
    }
    return local;
  } catch (err) {
    console.error(`fetchCollection failed for ${table}:`, err);
    return [];
  }
}

export async function pushCollection(table, items, mapper) {
  if (!Array.isArray(items)) return;
  localStore.set(table, items);
}

export async function deleteRecord(table, id) {
  try {
    const currentLocal = localStore.get(table, []);
    if (!Array.isArray(currentLocal)) return;
    
    localStore.set(
      table,
      currentLocal.filter((item) => item && item.id !== id)
    );
  } catch (err) {
    console.error(`deleteRecord failed for ${table}:`, err);
    throw new Error(`Failed to delete from ${table}`);
  }
}

// --- Cache Management ---

export function clearLocalCache() {
  const tables = Object.values(TABLES);
  tables.forEach((t) => {
    localStorage.removeItem(`school_admin_${t}`);
    localStorage.removeItem(`school_admin_${t}_dirty`);
  });
  window.location.reload();
}
