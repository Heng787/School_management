import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (_supabaseInstance) return _supabaseInstance;

    const url = (process.env.SUPABASE_URL || '').trim() || 'https://okhkcrolpvnxokujcans.supabase.co';
    const key = (process.env.SUPABASE_ANON_KEY || '').trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raGtjcm9scHZueG9rdWpjYW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTA3ODUsImV4cCI6MjA4NjUyNjc4NX0.Gnhxf9oXQ3kqzm2ksaRZCLH5dqrHo4IVQ1tvO8BE7QU';

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

export const localStore = {
    get: <T>(key: string, defaultValue: T): T => {
        const item = localStorage.getItem(`school_admin_${key}`);
        return item ? JSON.parse(item) : defaultValue;
    },
    set: (key: string, value: any): void => {
        localStorage.setItem(`school_admin_${key}`, JSON.stringify(value));
    },
    isDirty: (key: string): boolean => {
        return localStorage.getItem(`school_admin_${key}_dirty`) === 'true';
    },
    setDirty: (key: string, dirty: boolean): void => {
        localStorage.setItem(`school_admin_${key}_dirty`, dirty ? 'true' : 'false');
    }
};

export const pushConfig = async (key: string, value: any): Promise<void> => {
    const client = getSupabase();
    localStore.set(key, value);

    if (!client || !navigator.onLine) return;

    try {
        const { error } = await client.from('config').upsert({ key, value });
        if (error) {
            console.error(`Failed to sync config ${key}:`, error);
            throw error;
        }
        console.log(`Successfully synced config ${key} to Supabase.`);
    } catch (err) {
        console.error(`Config sync error for ${key}:`, err);
        throw err;
    }
};

export async function fetchCollection<T>(table: string, mapper: (d: any) => T): Promise<T[]> {
    const client = getSupabase();
    const local = localStore.get<T[]>(table, []);
    const isDirty = localStore.isDirty(table);

    if (!client || !navigator.onLine) {
        return local;
    }

    try {
        let { data, error } = await client.from(table).select('*').order('created_at', { ascending: true });

        if (error) {
            return local;
        }

        if (data && data.length > 0) {
            const mappedData = data.map(mapper);

            if (isDirty) {
                const localMap = new Map(local.map((item: any) => [item.id, item]));
                const mergedData = mappedData.map(remoteItem => {
                    const localItem = localMap.get((remoteItem as any).id);
                    if (localItem) {
                        localMap.delete((remoteItem as any).id);
                        return localItem;
                    }
                    return remoteItem;
                });

                const newLocalItems = Array.from(localMap.values());
                const finalData = [...mergedData, ...newLocalItems];

                const deletedQueue = localStore.get<{ table: string, id: string }[]>('deleted_queue', []);
                const tableDeletedIds = deletedQueue.filter(q => q.table === table).map(q => q.id);
                const filteredData = finalData.filter(item => !tableDeletedIds.includes((item as any).id));

                localStore.set(table, filteredData);
                return filteredData;
            } else {
                const deletedQueue = localStore.get<{ table: string, id: string }[]>('deleted_queue', []);
                const tableDeletedIds = deletedQueue.filter(q => q.table === table).map(q => q.id);
                const filteredData = mappedData.filter(item => !tableDeletedIds.includes((item as any).id));

                localStore.set(table, filteredData);
                return filteredData;
            }
        } else {
            return local;
        }
    } catch (err) {
        return local;
    }
}

export async function pushCollection<T>(table: string, items: T[], mapper: (d: T) => any) {
    const client = getSupabase();

    localStore.set(table, items);
    localStore.setDirty(table, true);

    if (!client || !navigator.onLine) {
        return;
    }

    try {
        const dataToUpsert = items.map(mapper);
        const { error } = await client.from(table).upsert(dataToUpsert);
        if (error) throw error;
        localStore.setDirty(table, false);
    } catch (err) {
        throw err;
    }
}

export async function deleteRecord(table: string, id: string): Promise<void> {
    const client = getSupabase();
    const local = localStore.get<any[]>(table, []).filter(item => item.id !== id);
    localStore.set(table, local);

    const deletedQueue = localStore.get<{ table: string, id: string }[]>('deleted_queue', []);
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

        const updatedQueue = localStore.get<{ table: string, id: string }[]>('deleted_queue', []).filter(q => !(q.table === table && q.id === id));
        localStore.set('deleted_queue', updatedQueue);
    } catch (err) {
        throw err;
    }
}

export function clearLocalCache() {
    const tables = ['students', 'staff', 'classes', 'events', 'subjects', 'levels', 'time_slots', 'admin_password'];
    tables.forEach(t => {
        localStorage.removeItem(`school_admin_${t}`);
        localStorage.removeItem(`school_admin_${t}_dirty`);
    });
    window.location.reload();
}
