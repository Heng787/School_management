import { localStore, pushConfig, getAuthToken } from './core';

/**
 * Service for managing application configuration and settings.
 * All remote reads go through the backend proxy API.
 */

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchConfig = async (key) => {
  try {
    const res = await fetch(`/api/sync/config/${key}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data?.value ?? null;
  } catch {
    return null;
  }
};

export const configService = {
  // --- Subject Config ---

  getSubjects: async () => {
    const local = localStore.get('subjects', []);
    if (!navigator.onLine || !getAuthToken()) return local;

    const value = await fetchConfig('subjects');
    if (value != null) {
      localStore.set('subjects', value);
      return value;
    }
    return local;
  },

  saveSubjects: async (subs) => pushConfig('subjects', subs),

  // --- Grade Level Config ---

  getLevels: async () => {
    const local = localStore.get('levels', [
      'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10',
    ]);
    if (!navigator.onLine || !getAuthToken()) return local;

    const value = await fetchConfig('levels');
    if (value != null) {
      localStore.set('levels', value);
      return value;
    }
    return local;
  },

  saveLevels: async (lvls) => pushConfig('levels', lvls),

  // --- Schedule Config ---

  getTimeSlots: async () => {
    const local = localStore.get('time_slots', [
      { id: '1', time: '8:00-10:00 AM', type: 'weekday' },
      { id: '2', time: '1:00-3:00 PM', type: 'weekday' },
      { id: '3', time: '3:00-5:00 PM', type: 'weekday' },
      { id: '4', time: '12:30-3:00 PM', type: 'weekend' },
      { id: '5', time: '3:00-5:30 PM', type: 'weekend' },
    ]);
    if (!navigator.onLine || !getAuthToken()) return local;

    const value = await fetchConfig('time_slots');
    if (value != null) {
      localStore.set('time_slots', value);
      return value;
    }
    return local;
  },

  saveTimeSlots: async (slots) => pushConfig('time_slots', slots),

  // --- Auth Config ---

  getAdminPassword: async () => {
    const local = localStore.get('admin_password', 'admin123');
    if (!navigator.onLine || !getAuthToken()) return local;

    const value = await fetchConfig('admin_password');
    return value != null ? value : local;
  },

  saveAdminPassword: async (pwd) => pushConfig('admin_password', pwd),

  // --- Profile Config ---

  getPrincipalSignatureUrl: async () => {
    return localStore.get('principal_signature_url', null);
  },

  savePrincipalSignatureUrl: async (url) => {
    localStore.set('principal_signature_url', url);
  },

  getPrincipalName: async () => {
    const local = localStore.get('principal_name', 'Administrator');
    if (!navigator.onLine || !getAuthToken()) return local;

    const value = await fetchConfig('principal_name');
    if (value != null) {
      localStore.set('principal_name', value);
      return value;
    }
    return local;
  },

  savePrincipalName: async (name) => pushConfig('principal_name', name),
};
