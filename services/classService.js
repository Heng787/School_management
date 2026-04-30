import { fetchCollection, pushCollection } from './core';
import { mapClass } from './mappers';

/**
 * Service for managing class records and metadata.
 */
export const classService = {
  getClasses: async () => {
    return fetchCollection('classes', mapClass.fromDb);
  },

  saveClasses: async (classes) => {
    return pushCollection('classes', classes, mapClass.toDb);
  },
};
