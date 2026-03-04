import { studentService } from './studentService';
import { staffService } from './staffService';
import { classService } from './classService';
import { logService } from './logService';
import { configService } from './configService';
import { syncService } from './syncService';
import { deleteRecord, clearLocalCache } from './core';

// Re-export specific types if needed elsewhere, like TimeSlot
export type { TimeSlot } from './configService';

/**
 * apiService facade.
 * Re-exports everything from the individual service files
 * so that existing imports across the application do not break.
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
