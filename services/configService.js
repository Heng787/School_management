import { localStore, pushConfig, getAuthToken } from './core';

/**
 * Service for managing application configuration and settings.
 * Simplified for pure local storage.
 */

export const configService = {
  // --- Subject Config ---

  getSubjects: async () => {
    return localStore.get('subjects', []);
  },

  saveSubjects: async (subs) => pushConfig('subjects', subs),

  // --- Grade Level Config ---

  getLevels: async () => {
    return localStore.get('levels', [
      'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10',
    ]);
  },

  saveLevels: async (lvls) => pushConfig('levels', lvls),

  // --- Schedule Config ---

  getTimeSlots: async () => {
    return localStore.get('time_slots', [
      { id: '1', time: '8:00-10:00 AM', type: 'weekday' },
      { id: '2', time: '1:00-3:00 PM', type: 'weekday' },
      { id: '3', time: '3:00-5:00 PM', type: 'weekday' },
      { id: '4', time: '12:30-3:00 PM', type: 'weekend' },
      { id: '5', time: '3:00-5:30 PM', type: 'weekend' },
    ]);
  },

  saveTimeSlots: async (slots) => pushConfig('time_slots', slots),

  // --- Auth Config ---

  getAdminPassword: async () => {
    return localStore.get('admin_password', 'admin123');
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
    return localStore.get('principal_name', 'Administrator');
  },

  savePrincipalName: async (name) => pushConfig('principal_name', name),
};
