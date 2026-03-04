import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const url = env.SUPABASE_URL;
const key = env.SUPABASE_ANON_KEY;
const client = createClient(url, key);

async function run() {
    console.log('Testing sync_school_data_v2 RPC for enrollments...');

    const rpcPayload = {
        p_students: [],
        p_staff: [],
        p_staff_permissions: [],
        p_daily_logs: [],
        p_incident_reports: [],
        p_room_statuses: [],
        p_classes: [{
            id: 'test_class',
            name: 'Test Room',
            teacher_id: null,
            schedule: 'Weekday 8:00-10:00 AM',
            level: 'K1'
        }],
        p_enrollments: [{
            id: 'enr_xyz',
            student_id: null,
            class_id: 'test_class',
            academic_year: '2026'
        }],
        p_grades: [],
        p_attendance: [],
        p_events: [],
        p_config: []
    };

    const { data, error } = await client.rpc('sync_school_data_v2', rpcPayload);

    console.log('RPC Error:', error);
    console.log('RPC Data:', data);
}

run();
