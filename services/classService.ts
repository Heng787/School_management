import { Class } from '../types';
import { fetchCollection, pushCollection } from './core';
import { mapClass } from './mappers';

export const classService = {
    getClasses: async () => fetchCollection('classes', mapClass.fromDb),
    saveClasses: async (classes: Class[]) => pushCollection('classes', classes, mapClass.toDb),
};
