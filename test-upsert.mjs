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
    console.log('Testing direct select from enrollments table...');
    const { data, error } = await client.from('enrollments').select('*').limit(1);
    console.log('Select enrollments Error:', error);
    console.log('Select enrollments Data:', data);

    console.log('\nTesting syncAll RPC existence without p_enrollments...');
    const { data: rpcData, error: rpcError } = await client.rpc('sync_school_data_v2', {
        p_students: [], p_staff: [], p_classes: [], p_grades: [], p_attendance: [], p_config: []
    });
    console.log('RPC without enrollments Error:', rpcError);
}

run();
