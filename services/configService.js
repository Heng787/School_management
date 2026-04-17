import { getSupabase, localStore, pushConfig } from './core';

export const configService = {
    getSubjects: async () => {
        const client = getSupabase();
        const local = localStore.get('subjects', []);
        if (!client || !navigator.onLine) return local;
        try {
            const { data, error } = await client.from('config').select('value').eq('key', 'subjects').maybeSingle();
            if (error) throw error;
            if (data) {
                localStore.set('subjects', data.value);
                return data.value;
            }
            return local;
        } catch (err) { return local; }
    },
    saveSubjects: async (subs) => pushConfig('subjects', subs),

    getLevels: async () => {
        const client = getSupabase();
        const local = localStore.get('levels', ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10']);
        if (!client || !navigator.onLine) return local;
        try {
            const { data, error } = await client.from('config').select('value').eq('key', 'levels').maybeSingle();
            if (error) throw error;
            if (data) {
                localStore.set('levels', data.value);
                return data.value;
            }
            return local;
        } catch (err) { return local; }
    },
    saveLevels: async (lvls) => pushConfig('levels', lvls),

    getTimeSlots: async () => {
        const client = getSupabase();
        const local = localStore.get('time_slots', [
            { id: '1', time: '8:00-10:00 AM', type: 'weekday' },
            { id: '2', time: '1:00-3:00 PM', type: 'weekday' },
            { id: '3', time: '3:00-5:00 PM', type: 'weekday' },
            { id: '4', time: '12:30-3:00 PM', type: 'weekend' },
            { id: '5', time: '3:00-5:30 PM', type: 'weekend' }
        ]);
        if (!client || !navigator.onLine) return local;
        try {
            const { data, error } = await client.from('config').select('value').eq('key', 'time_slots').maybeSingle();
            if (error) throw error;
            if (data) {
                localStore.set('time_slots', data.value);
                return data.value;
            }
            return local;
        } catch (err) { return local; }
    },
    saveTimeSlots: async (slots) => pushConfig('time_slots', slots),

    getAdminPassword: async () => {
        const client = getSupabase();
        const local = localStore.get('admin_password', 'admin123');
        if (!client || !navigator.onLine) return local;
        try {
            const { data, error } = await client.from('config').select('value').eq('key', 'admin_password').maybeSingle();
            if (error) throw error;
            return data ? data.value : local;
        } catch (err) { return local; }
    },
    saveAdminPassword: async (pwd) => pushConfig('admin_password', pwd),

    getPrincipalSignatureUrl: async () => {
        const client = getSupabase();
        const local = localStore.get('principal_signature_url', null);
        if (!client || !navigator.onLine) return local;
        try {
            const { data, error } = await client.from('config').select('value').eq('key', 'principal_signature_url').maybeSingle();
            if (error) throw error;
            if (data) {
                localStore.set('principal_signature_url', data.value);
                return data.value;
            }
            return local;
        } catch (err) { return local; }
    },
    savePrincipalSignatureUrl: async (url) => pushConfig('principal_signature_url', url),
};
