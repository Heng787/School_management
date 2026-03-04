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
    console.log('Testing sync_school_data_v2 RPC with full array payload...');

    const rpcPayload = {
        p_students: [{
            id: 's8',
            name: 'test_full_payload',
            sex: 'Male',
            dob: null,
            phone: null,
            enrollment_date: null,
            status: 'Active',
            tuition: { total: 0, paid: 0 }
        }],
        p_staff: [],
        p_classes: [],
        p_grades: [],
        p_attendance: [],
        p_config: [
            { key: 'subjects', value: ["Math", "Science"] },
            { key: 'levels', value: ["Grade 1"] },
            { key: 'time_slots', value: [] },
            { key: 'admin_password', value: "admin123" }
        ]
    };

    const { data, error } = await client.rpc('sync_school_data_v2', rpcPayload);

    console.log('RPC Error:', error);
    console.log('RPC Data:', data);
}

run();
