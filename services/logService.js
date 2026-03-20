// Log Service for managing various logs, incident reports, and room statuses.
import { fetchCollection, pushCollection, getSupabase } from './core';
import { mapDailyLog, mapIncidentReport, mapRoomStatus } from './mappers';

export const logService = {
    getDailyLogs: async () => fetchCollection('daily_logs', mapDailyLog.fromDb),
    saveDailyLogs: async (logs) => pushCollection('daily_logs', logs, mapDailyLog.toDb),

    getIncidentReports: async () => fetchCollection('incident_reports', mapIncidentReport.fromDb),
    saveIncidentReports: async (reports) => pushCollection('incident_reports', reports, mapIncidentReport.toDb),

    getRoomStatuses: async () => fetchCollection('room_statuses', mapRoomStatus.fromDb),
    saveRoomStatuses: async (statuses) => pushCollection('room_statuses', statuses, mapRoomStatus.toDb),

    getEvents: async () => fetchCollection('events', (d) => d),
    saveEvents: async (events) => pushCollection('events', events, (d) => d),

    getAuditLogs: async ()=> {
        const client = getSupabase();
        if (!client || !navigator.onLine) return [];
        try {
            const { data, error } = await client.from('audit_log').select('*').order('timestamp', { ascending: false }).limit(100);
            if (error) throw error;
            return (data || []).map((d) => ({
                id: d.id,
                tableName: d.table_name,
                recordId: d.record_id,
                action: d.action,
                oldData: d.old_data,
                newData: d.new_data,
                timestamp: d.timestamp
            }));
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            return [];
        }
    }
};
