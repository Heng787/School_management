// Class Service for managing classes.
import { fetchCollection, pushCollection } from './core';
import { mapClass } from './mappers';

export const classService = {
    getClasses: async () => fetchCollection('classes', mapClass.fromDb),
    saveClasses: async (classes) => pushCollection('classes', classes, mapClass.toDb),
};
