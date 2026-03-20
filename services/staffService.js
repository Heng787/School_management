// Staff Service for managing staff and permissions.
import { fetchCollection, pushCollection } from './core';
import { mapStaff, mapStaffPermission } from './mappers';

export const staffService = {
    getStaff: async () => fetchCollection('staff', mapStaff.fromDb),
    saveStaff: async (staff) => pushCollection('staff', staff, mapStaff.toDb),

    getStaffPermissions: async () => fetchCollection('staff_permissions', mapStaffPermission.fromDb),
    saveStaffPermissions: async (perms) => pushCollection('staff_permissions', perms, mapStaffPermission.toDb),
};
