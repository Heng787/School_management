import { studentService } from './studentService';
import { staffService } from './staffService';
import { classService } from './classService';
import { logService } from './logService';
import { configService } from './configService';
import { syncService } from './syncService';
import { deleteRecord, clearLocalCache } from './core';

/**
 * Unified API service combining all domain services.
 * 
 * @namespace apiService
 * @property {Function} deleteRecord - Deletes a record from the specified table.
 * @property {Function} clearLocalCache - Clears the local database cache.
 */
export const apiService = {
  ...studentService,
  ...staffService,
  ...classService,
  ...logService,
  ...configService,
  ...syncService,
  deleteRecord,
  clearLocalCache,
};
