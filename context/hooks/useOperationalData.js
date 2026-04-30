import { useState, useCallback } from 'react';
import { apiService } from '../../services/apiService';
import { localStore } from '../../services/core';
import { performDataUpdate } from '../../utils/dataUtils';

/**
 * Hook to manage operational data (events, tasks, activity logs).
 */
export const useOperationalData = (setError) => {
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState(() => localStore.get('tasks', []));
    const [activityLogs, setActivityLogs] = useState(() => localStore.get('activity_logs', []));

    const addEvent = useCallback((data) =>
        performDataUpdate(
            (d) => apiService.saveEvents(d),
            setEvents,
            (prev) => [...prev, { ...data, id: `evt_${Date.now()}` }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            (err) => setError(`Event save failed: ${err.message}`)
        ), [setError]);

    const updateEvent = useCallback((updated) =>
        performDataUpdate(
            (d) => apiService.saveEvents(d),
            setEvents,
            (prev) => prev.map(e => e.id === updated.id ? updated : e).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            (err) => setError(`Event update failed: ${err.message}`)
        ), [setError]);

    const deleteEvent = useCallback(async (id) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        try {
            await apiService.deleteRecord('events', id);
        } catch (err) {
            setError(`Failed to delete event: ${err.message}`);
        }
    }, [setError]);

    const updateTask = useCallback((id, updates) => {
        setTasks(prev => {
            const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
            localStore.set('tasks', next);
            return next;
        });
    }, []);

    const addTask = useCallback((task) => {
        setTasks(prev => {
            const next = [...prev, { ...task, id: Date.now() }];
            localStore.set('tasks', next);
            return next;
        });
    }, []);

    const addActivityLog = useCallback((log) => {
        setActivityLogs(prev => {
            const next = [...prev, { ...log, id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
            localStore.set('activity_logs', next);
            return next;
        });
    }, []);

    const clearActivityLogs = useCallback(() => {
        setActivityLogs([]);
        localStore.set('activity_logs', []);
    }, []);

    return {
        events, setEvents,
        tasks, setTasks,
        activityLogs, setActivityLogs,
        addEvent, updateEvent, deleteEvent,
        updateTask, addTask, addActivityLog, clearActivityLogs
    };
};
