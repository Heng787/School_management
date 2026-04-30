import { useState, useCallback } from 'react';
import { apiService } from '../../services/apiService';
import { performDataUpdate } from '../../utils/dataUtils';

/**
 * Hook to manage staff data and permissions.
 */
export const useStaffData = (setError) => {
    const [staff, setStaff] = useState([]);
    const [staffPermissions, setStaffPermissions] = useState([]);

    const addStaffBatch = useCallback((newData) =>
        performDataUpdate(
            (data) => apiService.saveStaff(data),
            setStaff,
            (current) => {
                const newItems = newData.map((data, idx) => {
                    if (data.id) return data;
                    const shortName = data.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'staff';
                    const suffix = Date.now().toString().slice(-3) + idx;
                    return { ...data, id: `${shortName}_${suffix}` };
                });
                return [...current, ...newItems];
            },
            (err) => setError(`Staff save failed: ${err.message || err}. Changes kept locally.`)
        ), [setError]);

    const addStaff = useCallback((data) => addStaffBatch([data]), [addStaffBatch]);

    const updateStaff = useCallback((updated) =>
        performDataUpdate(
            (data) => apiService.saveStaff(data),
            setStaff,
            (prev) => prev.map(s => s.id === updated.id ? updated : s),
            (err) => setError(`Staff update failed: ${err.message || err}. Changes kept locally.`)
        ), [setError]);

    const deleteStaff = useCallback(async (id) => {
        setStaff(prev => prev.filter(s => s.id !== id));
        try {
            await apiService.deleteRecord('staff', id);
        } catch (err) {
            setError(`Failed to delete staff: ${err.message}`);
        }
    }, [setError]);

    const addStaffPermission = useCallback((data) =>
        performDataUpdate(
            (d) => apiService.saveStaffPermissions(d),
            setStaffPermissions,
            (prev) => [...prev, { ...data, id: `perm_${Date.now()}` }],
            (err) => setError(`Permission save failed: ${err.message || err}`)
        ), [setError]);

    const updateStaffPermission = useCallback((updated) =>
        performDataUpdate(
            (d) => apiService.saveStaffPermissions(d),
            setStaffPermissions,
            (prev) => prev.map(p => p.id === updated.id ? updated : p),
            (err) => setError(`Permission update failed: ${err.message || err}`)
        ), [setError]);

    const deleteStaffPermission = useCallback(async (id) => {
        setStaffPermissions(prev => prev.filter(p => p.id !== id));
        try {
            await apiService.deleteRecord('staff_permissions', id);
        } catch (err) {
            setError(`Failed to delete permission: ${err.message}`);
        }
    }, [setError]);

    return {
        staff,
        setStaff,
        staffPermissions,
        setStaffPermissions,
        addStaff,
        addStaffBatch,
        updateStaff,
        deleteStaff,
        addStaffPermission,
        updateStaffPermission,
        deleteStaffPermission
    };
};
