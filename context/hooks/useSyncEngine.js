import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../../services/apiService';
import { localStore } from '../../services/core';

/**
 * Hook to manage synchronization engine and background refresh.
 */
export const useSyncEngine = (loading, setError, dataState, dataSetters) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const isSyncingRef = useRef(false);

    const triggerSync = useCallback(async () => {
        if (!navigator.onLine || isSyncingRef.current || loading) return;

        isSyncingRef.current = true;
        setIsSyncing(true);

        try {
            await apiService.syncAll({
                students: dataState.students,
                staff: dataState.staff,
                staffPermissions: dataState.staffPermissions,
                classes: dataState.classes,
                events: dataState.events,
                grades: dataState.grades,
                attendance: dataState.attendance,
                enrollments: dataState.enrollments,
                config: [
                    { key: 'subjects', value: dataState.subjects },
                    { key: 'levels', value: dataState.levels },
                    { key: 'time_slots', value: dataState.timeSlots },
                    { key: 'admin_password', value: dataState.adminPassword }
                ]
            });

            setLastSyncedAt(new Date());
            setError(null);
        } catch (err) {
            console.error('Sync failed:', err);
            setError('Sync failed. Some data may not be backed up.');
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
        }
    }, [loading, setError, dataState]);

    // --- Sync on Online ---
    useEffect(() => {
        const handleOnline = () => triggerSync();
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [triggerSync]);

    // --- Sync on Data Change (Debounced) ---
    useEffect(() => {
        const timer = setTimeout(() => {
            triggerSync();
        }, 1000); // 1 second debounce
        return () => clearTimeout(timer);
    }, [
        dataState.students, dataState.staff, dataState.staffPermissions, 
        dataState.classes, dataState.events, dataState.grades, 
        dataState.attendance, dataState.enrollments, dataState.subjects, 
        dataState.levels, dataState.timeSlots, triggerSync
    ]);

    // --- Periodic Remote Refresh ---
    useEffect(() => {
        if (loading) return;

        const refreshFromRemote = async () => {
            if (!navigator.onLine || isSyncingRef.current) return;
            
            try {
                const tablesToRefresh = [
                    { table: 'enrollments', setter: dataSetters.setEnrollments, fetcher: apiService.getEnrollments },
                    { table: 'classes', setter: dataSetters.setClasses, fetcher: apiService.getClasses },
                    { table: 'students', setter: dataSetters.setStudents, fetcher: apiService.getStudents },
                    { table: 'grades', setter: dataSetters.setGrades, fetcher: apiService.getGrades },
                    { table: 'attendance', setter: dataSetters.setAttendance, fetcher: apiService.getAttendance },
                ];

                for (const { table, setter, fetcher } of tablesToRefresh) {
                    if (!localStore.isDirty(table)) {
                        const freshData = await fetcher();
                        setter(prev => {
                            if (JSON.stringify(prev) !== JSON.stringify(freshData)) {
                                console.log(`[Sync] Background update: ${table} (${freshData.length} records)`);
                                return freshData;
                            }
                            return prev;
                        });
                    }
                }
            } catch (err) {
                console.debug('Remote refresh skipped:', err.message);
            }
        };

        const intervalId = setInterval(refreshFromRemote, 30000); // every 30 seconds (reduced frequency)
        
        const handleStorageChange = (e) => {
            if (e.key && e.key.startsWith('school_admin_')) {
                refreshFromRemote();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loading, dataSetters]);

    return {
        isSyncing,
        lastSyncedAt,
        setLastSyncedAt,
        triggerSync
    };
};
