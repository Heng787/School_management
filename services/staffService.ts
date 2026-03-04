import { Staff, StaffPermission } from '../types';
import { fetchCollection, pushCollection } from './core';
import { mapStaff, mapStaffPermission } from './mappers';

export const staffService = {
    getStaff: async () => fetchCollection('staff', mapStaff.fromDb),
    saveStaff: async (staff: Staff[]) => pushCollection('staff', staff, mapStaff.toDb),

    getStaffPermissions: async () => fetchCollection('staff_permissions', mapStaffPermission.fromDb),
    saveStaffPermissions: async (perms: StaffPermission[]) => pushCollection('staff_permissions', perms, mapStaffPermission.toDb),
};
