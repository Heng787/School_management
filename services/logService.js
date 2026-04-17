// Log Service for managing events and audit logs.
import { fetchCollection, pushCollection, getSupabase } from './core';

export const logService = {

    getEvents: async () => fetchCollection('events', (d) => d),
    saveEvents: async (events) => pushCollection('events', events, (d) => d),
};
