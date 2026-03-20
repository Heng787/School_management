
/**
 * SERVICE: Core
 * DESCRIPTION: Low-level database utilities handling Supabase connectivity and LocalStorage.
 */
import { createClient } from '@supabase/supabase-js';

// --- 1. SUPABASE CLIENT INITIALIZATION ---
let _supabaseInstance = null;

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

// --- 2. LOCAL STORAGE WRAPPER (localStore) ---
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
        localStorage.setItem(`school_admin_${key}_dirty`, dirty ? 'true' : 'false');
    }
};

// --- 3. CONFIGURATION SYNC ---
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

// --- 4. COLLECTION OPERATIONS (Fetch/Push/Delete) ---
export async function fetchCollection(table, mapper) {
    const client = getSupabase();
    const local = localStore.get(table, []);
    const isDirty = localStore.isDirty(table);

    let resultData = [];

    if (!client || !navigator.onLine) {
        // If offline, return local data, but still filter against deleted_queue
        const deletedQueue = localStore.get('deleted_queue', []);
        const tableDeletedIds = deletedQueue.filter(q => q.table === table).map(q => q.id);
        return local.filter(item => !tableDeletedIds.includes(item.id));
    }

    try {
        let { data, error } = await client.from(table).select('*').order('created_at', { ascending: true });

        if (error) {
            console.error(`Supabase fetch error for ${table}:`, error);
            // If Supabase fetch fails, return local data, filtered by deleted_queue
            const deletedQueue = localStore.get('deleted_queue', []);
            const tableDeletedIds = deletedQueue.filter(q => q.table === table).map(q => q.id);
            return local.filter(item => !tableDeletedIds.includes(item.id));
        }

        if (data && data.length > 0) {
            const mappedData = data.map(mapper);

            if (isDirty) {
                const localMap = new Map(local.map((item) => [item.id, item]));
                const mergedData = mappedData.map(remoteItem => {
                    const localItem = localMap.get(remoteItem.id);
                    if (localItem) {
                        localMap.delete(remoteItem.id);
                        return localItem;
                    }
                    return remoteItem;
                });
                const newLocalItems = Array.from(localMap.values());
                resultData = [...mergedData, ...newLocalItems];
            } else {
                resultData = mappedData;
            }
        } else {
            // If no data from Supabase, but local might have items not yet pushed (dirty=true)
            // If isDirty, we should rely on local data as the source of truth for now.
            resultData = isDirty ? local : [];
        }

        // ALWAYS filter against the deleted_queue before returning and saving to local storage
        const deletedQueue = localStore.get('deleted_queue', []);
        const tableDeletedIds = deletedQueue.filter(q => q.table === table).map(q => q.id);
        const filteredData = resultData.filter(item => !tableDeletedIds.includes(item.id));

        localStore.set(table, filteredData);
        return filteredData;

    } catch (err) {
        console.error(`Collection fetch error for ${table}:`, err);
        // On any general fetch error, return local data, also filtered by deleted_queue
        const deletedQueue = localStore.get('deleted_queue', []);
        const tableDeletedIds = deletedQueue.filter(q => q.table === table).map(q => q.id);
        return local.filter(item => !tableDeletedIds.includes(item.id));
    }
}

export async function pushCollection(table, items, mapper) {
    const client = getSupabase();

    localStore.set(table, items);
    localStore.setDirty(table, true);

    if (!client || !navigator.onLine) {
        return;
    }

    try {
        const dataToUpsert = items.map(mapper);
        
        if (dataToUpsert.length === 0) {
            localStore.setDirty(table, false);
            return;
        }

        // Try bulk upsert first (fast path)
        const { error } = await client.from(table).upsert(dataToUpsert);
        
        if (error) {
            console.warn(`Bulk upsert failed for ${table} (${dataToUpsert.length} items):`, error.message);
            
            // Fallback: upsert records one-by-one so one bad record doesn't block others
            let successCount = 0;
            let failCount = 0;
            for (const record of dataToUpsert) {
                const { error: singleErr } = await client.from(table).upsert([record]);
                if (singleErr) {
                    failCount++;
                    console.error(`Failed to upsert ${table} record id=${record.id}:`, singleErr.message);
                } else {
                    successCount++;
                }
            }
            console.log(`${table} individual upsert: ${successCount} success, ${failCount} failed`);
            
            if (failCount > 0 && successCount === 0) {
                throw error; // all failed, propagate original error
            }
        }
        
        localStore.setDirty(table, false);
    } catch (err) {
        console.error(`pushCollection error for ${table}:`, err);
        throw err;
    }
}

export async function deleteRecord(table, id) {
    const client = getSupabase();
    console.log(`Deleting record ${id} from table ${table}`);
    
    const local = localStore.get(table, []).filter(item => item.id !== id);
    localStore.set(table, local);

    const deletedQueue = localStore.get('deleted_queue', []);
    if (!deletedQueue.some(q => q.table === table && q.id === id)) {
        deletedQueue.push({ table, id });
        localStore.set('deleted_queue', deletedQueue);
    }

    if (!client || !navigator.onLine) {
        return;
    }

    try {
        const { error } = await client.from(table).delete().eq('id', id);
        if (error) throw error;

        const updatedQueue = localStore.get('deleted_queue', []).filter(q => !(q.table === table && q.id === id));
        localStore.set('deleted_queue', updatedQueue);
    } catch (err) {
        console.error(`Delete failed for ${table}:${id}`, err);
        throw err;
    }
}

// --- 5. CACHE MANAGEMENT ---
export function clearLocalCache() {
    const tables = ['students', 'staff', 'classes', 'events', 'subjects', 'levels', 'time_slots', 'admin_password'];
    tables.forEach(t => {
        localStorage.removeItem(`school_admin_${t}`);
        localStorage.removeItem(`school_admin_${t}_dirty`);
    });
    window.location.reload();
}
