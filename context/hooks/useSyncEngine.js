import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../../services/apiService';
import { localStore } from '../../services/core';

/**
 * Hook to manage synchronization engine and background refresh.
 * BACKEND SYNC REMOVED as per user request.
 */
export const useSyncEngine = (loading, setError, dataState, dataSetters) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const isSyncingRef = useRef(false);

    const triggerSync = useCallback(async () => {
        // Remote sync disabled
        return;
    }, []);

    // --- Periodic Remote Refresh (DISABLED) ---
    useEffect(() => {
        if (loading) return;
        
        const handleStorageChange = (e) => {
            if (e.key && e.key.startsWith('school_admin_')) {
                // We can still trigger local state updates if storage changes in another tab
                // but we don't need background refresh from a server anymore.
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loading]);

    return {
        isSyncing: false,
        lastSyncedAt: null,
        setLastSyncedAt: () => {},
        triggerSync
    };
};
