import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

async function testSync() {
    const rpcPayload = {
        p_students: [],
        p_staff: [{
            id: 't999',
            name: 'Test RPC',
            role: 'Teacher',
            subject: 'Math',
            contact: 'rpc@test.com',
            hire_date: '2026-03-01'
        }],
        p_classes: [],
        p_grades: [],
        p_attendance: [],
        p_config: []
    };

    const { data, error } = await supabase.rpc('sync_school_data_v2', rpcPayload);
    console.log('RPC Sync Error:', error);
    console.log('RPC Sync Data:', data);
}

testSync();
