import { fetchCollection, pushCollection } from './core';

/**
 * Service for managing audit logs and system events.
 */
export const logService = {
  getEvents: async () => {
    return fetchCollection('events', (d) => d);
  },

  saveEvents: async (events) => {
    return pushCollection('events', events, (d) => d);
  },
};
