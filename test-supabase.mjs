import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
    envFile.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const url = env.SUPABASE_URL;
const key = env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing URL or KEY', url, key);
    process.exit(1);
}

const client = createClient(url, key);

async function run() {
    console.log('1. Testing Upsert s6...');
    const { data: upsertData, error: upsertError } = await client.from('students').upsert({
        id: 's6',
        name: 'koiii',
        sex: 'Male',
        dob: null,
        phone: null,
        enrollment_date: null,
        status: 'Active',
        tuition: { total: 0, paid: 0 }
    }).select();

    console.log('Upsert Error:', upsertError);
    console.log('Upsert Data:', upsertData);

    console.log('\n2. Testing Delete s5...');
    // Note: changing to 's5' because user said 'when delete the student and refrest it come back'. Maybe s5 doesn't delete?
    const { data: deleteData, error: deleteError } = await client.from('students').delete().eq('id', 's5').select();

    console.log('Delete Error:', deleteError);
    console.log('Delete Data:', deleteData);
}

run();
