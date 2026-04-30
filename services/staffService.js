import { fetchCollection, pushCollection } from './core';
import { mapStaff, mapStaffPermission } from './mappers';

/**
 * Service for managing staff profiles and access permissions.
 */
export const staffService = {
  getStaff: async () => {
    return fetchCollection('staff', mapStaff.fromDb);
  },

  saveStaff: async (staff) => {
    return pushCollection('staff', staff, mapStaff.toDb);
  },

  getStaffPermissions: async () => {
    return fetchCollection('staff_permissions', mapStaffPermission.fromDb);
  },

  saveStaffPermissions: async (perms) => {
    return pushCollection('staff_permissions', perms, mapStaffPermission.toDb);
  },
};
